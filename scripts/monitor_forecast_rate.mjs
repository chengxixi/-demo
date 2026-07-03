#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import https from "node:https";
import path from "node:path";

const API_BASE = "https://pm-api.yolanda.hk";
const DEFAULT_SNAPSHOT_DIR = path.resolve(process.cwd(), "pm-forecast-snapshots");

const env = process.env;
const token = env.PM_TOKEN;
const webhook = env.WECOM_WEBHOOK || env.WECHAT_WEBHOOK || "";
const year = Number(env.YEAR || new Date().getFullYear());
const threshold = Number(env.THRESHOLD_POINTS || 5);
const snapshotDir = path.resolve(env.SNAPSHOT_DIR || DEFAULT_SNAPSHOT_DIR);
const today = env.SNAPSHOT_DATE || formatDate(new Date());
const dryRun = env.DRY_RUN === "1" || env.DRY_RUN === "true";
const sendEmpty = env.SEND_EMPTY === "1" || env.SEND_EMPTY === "true";

if (!token) {
  fail("Missing PM_TOKEN environment variable.");
}

const current = await fetchForecastListNew(year);
await mkdir(snapshotDir, { recursive: true });

const previousSnapshot = await loadPreviousSnapshot(snapshotDir, today);
const alerts = previousSnapshot
  ? buildAlerts(previousSnapshot.rows, current.rows, threshold)
  : [];

const snapshotPath = path.join(snapshotDir, `forecast-list-new-${today}.json`);
await writeFile(
  snapshotPath,
  JSON.stringify(
    {
      snapshot_date: today,
      api: "forecast_list_new",
      year,
      total: current.rows.length,
      rows: current.rows,
    },
    null,
    2,
  ),
  "utf8",
);

const report = {
  snapshot_date: today,
  previous_snapshot_date: previousSnapshot?.snapshot_date || null,
  threshold_points: threshold,
  total_projects: current.rows.length,
  alert_count: alerts.length,
  snapshot_path: snapshotPath,
  alerts,
};

if (alerts.length > 0 || sendEmpty) {
  const message = formatWeComMarkdown(report);
  if (dryRun) {
    console.log(message);
  } else {
    if (!webhook) {
      fail("Missing WECOM_WEBHOOK or WECHAT_WEBHOOK environment variable.");
    }
    await sendWeComMarkdown(webhook, message);
  }
}

console.log(JSON.stringify(report, null, 2));

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error("Request timeout"));
    });
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function fetchForecastListNew(targetYear) {
  const url = `${API_BASE}/v1/statistics/forecast_list_new?year=${targetYear}`;
  const json = await requestJson(url, {
    method: "GET",
    headers: {
      Token: token,
      Origin: "https://pm.yolanda.hk",
      Referer: "https://pm.yolanda.hk/",
      Accept: "application/json",
    },
  });
  if (json.code !== 200 || !Array.isArray(json.data?.rows)) {
    throw new Error("Unexpected forecast_list_new response shape.");
  }
  return { rows: json.data.rows };
}

async function loadPreviousSnapshot(dir, currentDate) {
  if (!existsSync(dir)) {
    return null;
  }
  const files = (await readdir(dir))
    .filter((file) => /^forecast-list-new-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => ({
      file,
      date: file.match(/^forecast-list-new-(\d{4}-\d{2}-\d{2})\.json$/)[1],
    }))
    .filter((item) => item.date < currentDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (files.length === 0) {
    return null;
  }

  const raw = await readFile(path.join(dir, files[0].file), "utf8");
  const snapshot = JSON.parse(raw.replace(/^\uFEFF/, ""));
  return {
    snapshot_date: snapshot.snapshot_date || files[0].date,
    rows: Array.isArray(snapshot.rows) ? snapshot.rows : [],
  };
}

function buildAlerts(previousRows, currentRows, thresholdPoints) {
  const previousByProject = new Map(
    previousRows.map((row) => [Number(row.project_id), row]),
  );
  return currentRows
    .map((todayRow) => {
      const yesterdayRow = previousByProject.get(Number(todayRow.project_id));
      if (!yesterdayRow) {
        return null;
      }
      const yesterdayRate = Number(yesterdayRow.rate);
      const todayRate = Number(todayRow.rate);
      const drop = round2(yesterdayRate - todayRate);
      if (!(drop > thresholdPoints)) {
        return null;
      }
      return {
        project_id: todayRow.project_id,
        project_name: cleanName(todayRow.project_name),
        yesterday_rate: yesterdayRate,
        today_rate: todayRate,
        drop_points: drop,
        reason: buildReason(yesterdayRow, todayRow),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.drop_points - a.drop_points);
}

function buildReason(previous, current) {
  const pieces = [];
  const previousDelay = numberOrNull(previous.delay_days);
  const currentDelay = numberOrNull(current.delay_days);
  const previousChange = numberOrNull(previous.change_days);
  const currentChange = numberOrNull(current.change_days);

  pieces.push(`核算任务：${current.account_task_name || "未返回"}`);
  pieces.push(`基准版本：${current.basic_version || "未返回"}`);

  if (previousDelay !== null && currentDelay !== null && previousDelay !== currentDelay) {
    pieces.push(`延期天数：${previousDelay} -> ${currentDelay}`);
  } else {
    pieces.push(`延期天数：${current.delay_days ?? "未返回"}`);
  }

  if (previousChange !== null && currentChange !== null && previousChange !== currentChange) {
    pieces.push(`变更天数：${previousChange} -> ${currentChange}`);
  } else {
    pieces.push(`变更天数：${current.change_days ?? "未返回"}`);
  }

  if (previous.account_task_name && previous.account_task_name !== current.account_task_name) {
    pieces.push(`核算任务变化：${previous.account_task_name} -> ${current.account_task_name}`);
  }
  if (previous.basic_version && previous.basic_version !== current.basic_version) {
    pieces.push(`基准版本变化：${previous.basic_version} -> ${current.basic_version}`);
  }

  return pieces.join("；");
}

function formatWeComMarkdown(report) {
  const title = `**PM预测完成率预警｜${report.snapshot_date}**`;
  const lines = [
    title,
    "",
    `触发规则：今天预测完成率比昨天下降超过 ${report.threshold_points} 个百分点`,
    `对比快照：${report.previous_snapshot_date || "无"} -> ${report.snapshot_date}`,
    "",
  ];

  if (report.alerts.length === 0) {
    lines.push("暂无触发项目。");
    return lines.join("\n");
  }

  report.alerts.forEach((alert, index) => {
    lines.push(`${index + 1}. ${alert.project_name}`);
    lines.push(`   昨天预测完成率：${formatPercent(alert.yesterday_rate)}`);
    lines.push(`   今天预测完成率：${formatPercent(alert.today_rate)}`);
    lines.push(`   下降：${alert.drop_points} 个百分点`);
    lines.push(`   变化原因：${alert.reason}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

async function sendWeComMarkdown(targetWebhook, content) {
  const body = JSON.stringify({
    msgtype: "markdown",
    markdown: { content },
  });
  const result = await requestJson(targetWebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
    body,
  });
  if (result.errcode !== 0) {
    throw new Error(`WeCom webhook failed: ${JSON.stringify(result)}`);
  }
}

function cleanName(value) {
  return String(value || "").trim();
}

function formatPercent(value) {
  return `${round2(value).toFixed(2).replace(/\.00$/, "")}%`;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
