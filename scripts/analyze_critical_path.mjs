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

function addDays(dateText, offset) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildWorkdaySet(holidayRows) {
  const set = new Set();
  for (const row of holidayRows) {
    const daytype = Number(row.daytype);
    if (daytype === 0 || daytype === 3) {
      set.add(row.date);
    }
  }
  return set;
}

function countWorkdays(start, end, workdaySet) {
  if (!start || !end || end < start) {
    return 0;
  }
  let count = 0;
  for (let day = start; ; day = addDays(day, 1)) {
    if (workdaySet.has(day)) {
      count += 1;
    }
    if (day === end) {
      break;
    }
  }
  return count;
}

function chooseEnd(task) {
  return task.actual_end_date || task.change_end_date || task.end_date;
}

function pathToText(pathRows) {
  return pathRows.map((row) => `${row.name}（${row.duration_days}天${row.used_actual ? "，实际" : ""}）`).join("→");
}

async function readJson(filePath) {
  const text = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
  return JSON.parse(text);
}

async function main() {
  const args = parseArgs(process.argv);
  const inDir = args.in_dir || process.cwd();
  const detail = await readJson(path.join(inDir, "plan-detail.json"));
  const plans = await readJson(path.join(inDir, "plans.json"));
  const holidays = await readJson(path.join(inDir, "holidays.json"));

  const tasks = (detail?.data?.rows || []).filter((row) => Number(row.detail_type) === 3);
  const criticalTasks = tasks.filter((row) => Number(row.whether_critical_task) === 1);
  const workdaySet = buildWorkdaySet(holidays?.data?.rows || []);
  const planRows = plans?.data?.rows || [];
  const detailPlanId = detail?.data?.id;
  const plan = planRows.find((row) => Number(row.id) === Number(detailPlanId)) || planRows[0];
  const links = plan?.links || [];

  const bySerial = new Map();
  for (const task of criticalTasks) {
    const end = chooseEnd(task);
    bySerial.set(String(task.serial_number), {
      serial_number: String(task.serial_number),
      name: task.name,
      begin_date: task.begin_date,
      chosen_end_date: end,
      used_actual: Boolean(task.actual_end_date),
      duration_days: countWorkdays(task.begin_date, end, workdaySet),
      order: Number(task.order) || 0,
    });
  }

  const graph = new Map();
  const indegree = new Map();
  for (const key of bySerial.keys()) {
    graph.set(key, []);
    indegree.set(key, 0);
  }

  for (const link of links) {
    const source = String(link.front_end_source);
    const target = String(link.front_end_target);
    if (!bySerial.has(source) || !bySerial.has(target)) {
      continue;
    }
    graph.get(source).push(target);
    indegree.set(target, (indegree.get(target) || 0) + 1);
  }

  for (const [key, values] of graph.entries()) {
    values.sort((a, b) => bySerial.get(a).order - bySerial.get(b).order);
    graph.set(key, values);
  }

  const starts = [...graph.keys()].filter((key) => (indegree.get(key) || 0) === 0);
  const paths = [];

  function dfs(node, current) {
    const next = graph.get(node) || [];
    if (next.length === 0) {
      paths.push([...current]);
      return;
    }
    for (const item of next) {
      current.push(item);
      dfs(item, current);
      current.pop();
    }
  }

  for (const start of starts) {
    dfs(start, [start]);
  }

  const resolvedPaths = paths
    .map((items) => {
      const rows = items.map((serial) => bySerial.get(serial));
      return {
        total_days: rows.reduce((sum, row) => sum + row.duration_days, 0),
        rows,
        text: pathToText(rows),
      };
    })
    .sort((a, b) => b.total_days - a.total_days || a.rows.length - b.rows.length);

  const payload = {
    path_count: resolvedPaths.length,
    paths: resolvedPaths,
  };

  await fs.writeFile(path.join(inDir, "critical-paths.json"), JSON.stringify(payload, null, 2));
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
