#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      continue;
    }
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function parseProjectId(project) {
  if (!project) {
    return null;
  }
  if (/^\d+$/.test(project)) {
    return project;
  }
  try {
    const url = new URL(project);
    return url.searchParams.get("id");
  } catch {
    return null;
  }
}

function buildHeaders(token) {
  return {
    Token: token,
    Origin: "https://pm.yolanda.hk",
    Referer: "https://pm.yolanda.hk/",
  };
}

async function getJson(url, token) {
  const res = await fetch(url, { headers: buildHeaders(token) });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

function resolveVersionRow(rows, versionText) {
  const normalized = String(versionText || "").replace(/^V/i, "");
  return rows.find((row) => String(row.version) === normalized) || null;
}

async function main() {
  const args = parseArgs(process.argv);
  const token = args.token;
  const project = args.project || args.project_id || args.url;
  const version = args.version;
  const outDir = args.out_dir || process.cwd();

  if (!token || !project || !version) {
    throw new Error("Usage: --token <token> --project <url-or-id> --version <V0|V1|V2> [--out_dir <dir>]");
  }

  const projectId = parseProjectId(project);
  if (!projectId) {
    throw new Error("Could not parse project id from input.");
  }

  const plans = await getJson(`https://pm-api.yolanda.hk/v1/project_initiation_plans?project_id=${projectId}`, token);
  const rows = plans?.data?.rows || [];
  const plan = resolveVersionRow(rows, version);
  if (!plan) {
    throw new Error(`Plan version ${version} not found for project ${projectId}.`);
  }

  const detail = await getJson(
    `https://pm-api.yolanda.hk/v1/project_initiation_plans/${plan.id}?detail_type%5B%5D=1&detail_type%5B%5D=2&detail_type%5B%5D=3`,
    token,
  );

  const taskRows = (detail?.data?.rows || []).filter((row) => Number(row.detail_type) === 3);
  const beginDates = taskRows.map((row) => row.begin_date).filter(Boolean).sort();
  const endDates = taskRows.map((row) => row.end_date).filter(Boolean).sort();
  const beginDate = beginDates[0];
  const endDate = endDates[endDates.length - 1];

  const holidays = await getJson(
    `https://pm-api.yolanda.hk/v1/holidays?begin_date=${beginDate}&end_date=${endDate}`,
    token,
  );

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "plans.json"), JSON.stringify(plans, null, 2));
  await fs.writeFile(path.join(outDir, "plan-detail.json"), JSON.stringify(detail, null, 2));
  await fs.writeFile(path.join(outDir, "holidays.json"), JSON.stringify(holidays, null, 2));

  const summary = {
    project_id: projectId,
    version: `V${plan.version}`,
    plan_id: plan.id,
    task_count: taskRows.length,
    critical_task_count: taskRows.filter((row) => Number(row.whether_critical_task) === 1).length,
    out_dir: outDir,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
