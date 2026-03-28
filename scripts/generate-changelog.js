#!/usr/bin/env node

/**
 * Generates CHANGELOG.md from conventional commits in the git history.
 *
 * Groups commits by version tag and by type:
 *   feat     -> Features
 *   fix      -> Bug Fixes
 *   docs     -> Documentation
 *   perf     -> Performance
 *   refactor -> Refactoring
 *   chore    -> Chores
 *   test     -> Tests
 *   style    -> Styles
 *   ci       -> CI
 *   build    -> Build
 *
 * Usage: node scripts/generate-changelog.js
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TYPE_LABELS = {
  feat: 'Features',
  fix: 'Bug Fixes',
  docs: 'Documentation',
  perf: 'Performance',
  refactor: 'Refactoring',
  chore: 'Chores',
  test: 'Tests',
  style: 'Styles',
  ci: 'CI',
  build: 'Build',
};

const TYPE_ORDER = Object.keys(TYPE_LABELS);

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf-8' }).trim();
}

function getTags() {
  try {
    const raw = git('tag', '--sort=-v:refname');
    if (!raw) return [];
    return raw.split('\n').filter((t) => /^v\d/.test(t));
  } catch {
    return [];
  }
}

function getTagDate(tag) {
  try {
    return git('log', '-1', '--format=%as', tag);
  } catch {
    return 'unknown';
  }
}

function getCommits(from, to) {
  const range = from ? `${from}..${to}` : to;
  try {
    const raw = git('log', '--oneline', '--format=%s|||%H|||%as', range);
    if (!raw) return [];
    return raw.split('\n').filter(Boolean).map((line) => {
      const [subject, hash, date] = line.split('|||');
      return { subject, hash, date };
    });
  } catch {
    return [];
  }
}

function parseCommit(commit) {
  // Match: type(scope): description  OR  type: description
  const match = commit.subject.match(/^(\w+)(?:\(([^)]*)\))?:\s*(.+)$/);
  if (!match) return null;
  const [, type, scope, description] = match;
  if (!TYPE_LABELS[type]) return null;
  return { type, scope: scope || null, description, hash: commit.hash, date: commit.date };
}

function groupByType(parsed) {
  const groups = {};
  for (const entry of parsed) {
    if (!groups[entry.type]) groups[entry.type] = [];
    groups[entry.type].push(entry);
  }
  return groups;
}

function formatSection(groups) {
  const lines = [];
  for (const type of TYPE_ORDER) {
    const entries = groups[type];
    if (!entries || entries.length === 0) continue;
    lines.push(`### ${TYPE_LABELS[type]}\n`);
    for (const e of entries) {
      const scope = e.scope ? `**${e.scope}:** ` : '';
      const shortHash = e.hash.slice(0, 7);
      lines.push(`- ${scope}${e.description} (\`${shortHash}\`)`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function generate() {
  const tags = getTags();
  const sections = [];

  sections.push('# Changelog\n');
  sections.push('All notable changes to this project will be documented in this file.\n');
  sections.push('This changelog is auto-generated from [conventional commits](https://www.conventionalcommits.org/).\n');

  // Unreleased: commits from latest tag to HEAD
  const latestTag = tags[0] || null;
  const unreleasedCommits = getCommits(latestTag, 'HEAD');
  const unreleasedParsed = unreleasedCommits.map(parseCommit).filter(Boolean);

  if (unreleasedParsed.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    sections.push(`## Unreleased (${today})\n`);
    sections.push(formatSection(groupByType(unreleasedParsed)));
  }

  // Each tagged version
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const prevTag = tags[i + 1] || null;
    const date = getTagDate(tag);
    const version = tag.replace(/^v/, '');

    const commits = getCommits(prevTag, tag);
    const parsed = commits.map(parseCommit).filter(Boolean);

    sections.push(`## ${version} (${date})\n`);

    if (parsed.length > 0) {
      sections.push(formatSection(groupByType(parsed)));
    } else {
      sections.push('No conventional commits in this release.\n');
    }
  }

  const content = sections.join('\n');
  const outPath = join(ROOT, 'CHANGELOG.md');
  writeFileSync(outPath, content, 'utf-8');
  console.log(`Changelog written to ${outPath}`);
}

generate();
