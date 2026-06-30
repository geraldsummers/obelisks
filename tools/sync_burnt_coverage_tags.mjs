#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const GENERATED_DIR = path.join(REPO_ROOT, 'generated', 'runtime-dumps');
const DEFAULT_RECOMMENDATIONS = path.join(
  GENERATED_DIR,
  'burnt-coverage-recommended-tags-high-confidence.json'
);
const DEFAULT_EVIDENCE = path.join(
  GENERATED_DIR,
  'burnt-coverage-missing-high-confidence.tsv'
);
const DEFAULT_CURRENT_COVERED = path.join(
  GENERATED_DIR,
  'burnt-coverage-current-covered.tsv'
);
const DEFAULT_BLOCK_EXCLUSIONS = path.join(REPO_ROOT, 'tools', 'burnt_coverage_block_tag_exclusions.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    recommendations: DEFAULT_RECOMMENDATIONS,
    evidence: DEFAULT_EVIDENCE,
    blockExclusions: DEFAULT_BLOCK_EXCLUSIONS,
    write: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--recommendations') {
      options.recommendations = path.resolve(REPO_ROOT, argv[i + 1] ?? '');
      i += 1;
      continue;
    }
    if (arg === '--evidence') {
      options.evidence = path.resolve(REPO_ROOT, argv[i + 1] ?? '');
      i += 1;
      continue;
    }
    if (arg === '--block-exclusions') {
      options.blockExclusions = path.resolve(REPO_ROOT, argv[i + 1] ?? '');
      i += 1;
      continue;
    }
    if (arg === '--check') {
      options.write = false;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function tagToFilePath(tagId) {
  const [namespace, tagPath] = tagId.split(':');
  if (!namespace || !tagPath) {
    fail(`Invalid tag id: ${tagId}`);
  }
  return path.join(REPO_ROOT, 'kubejs', 'data', namespace, 'tags', 'blocks', `${tagPath}.json`);
}

function loadTagFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { replace: false, values: [] };
  }

  const parsed = readJson(filePath);
  const values = Array.isArray(parsed.values) ? parsed.values.filter((value) => typeof value === 'string') : [];
  return {
    replace: parsed.replace === true,
    values,
  };
}

function sortUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function collectKnownModBlockIds() {
  const blockIds = new Set();
  const modDirs = [
    path.join(REPO_ROOT, 'generated', 'cache', 'packwiz-downloads', 'mods'),
    path.join(REPO_ROOT, 'mods'),
  ];

  for (const modDir of modDirs) {
    if (!fs.existsSync(modDir)) {
      continue;
    }
    for (const entry of fs.readdirSync(modDir)) {
      if (!entry.endsWith('.jar')) {
        continue;
      }
      const jarPath = path.join(modDir, entry);
      const result = spawnSync('jar', ['tf', jarPath], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
      if (result.status !== 0) {
        fail(`Could not list jar contents for ${jarPath}: ${result.stderr || result.stdout}`);
      }
      for (const fileName of result.stdout.split('\n')) {
        const match = fileName.match(/^assets\/([^/]+)\/blockstates\/(.+)\.json$/);
        if (!match) {
          continue;
        }
        blockIds.add(`${match[1]}:${match[2]}`);
      }
    }
  }

  const kubejsAssets = path.join(REPO_ROOT, 'kubejs', 'assets');
  if (fs.existsSync(kubejsAssets)) {
    const stack = [kubejsAssets];
    while (stack.length > 0) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        const relative = path.relative(kubejsAssets, fullPath).replaceAll(path.sep, '/');
        const match = relative.match(/^([^/]+)\/blockstates\/(.+)\.json$/);
        if (match) {
          blockIds.add(`${match[1]}:${match[2]}`);
        }
      }
    }
  }

  return blockIds;
}

function readStringSet(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }
  const values = readJson(filePath);
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
    fail(`Expected string array in ${filePath}`);
  }
  return new Set(values);
}

function filterBlockTagValues(tagId, values, knownModBlockIds, excludedBlockIds, filteredOut) {
  const kept = [];
  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }
    if (excludedBlockIds.has(value)) {
      filteredOut.push({ tagId, value, reason: 'excluded' });
      continue;
    }
    if (value.startsWith('#') || value.startsWith('minecraft:') || knownModBlockIds.has(value)) {
      kept.push(value);
      continue;
    }
    filteredOut.push({ tagId, value, reason: 'unknown_block' });
  }
  return kept;
}

function mergeRecommendations(recommendations, knownModBlockIds, excludedBlockIds) {
  const tagEntries = [];
  const filteredOut = [];

  for (const [tagId, recommendedValues] of Object.entries(recommendations)) {
    const filePath = tagToFilePath(tagId);
    const current = loadTagFile(filePath);
    const mergedValues = sortUnique(
      filterBlockTagValues(tagId, [...current.values, ...recommendedValues], knownModBlockIds, excludedBlockIds, filteredOut)
    );

    tagEntries.push({
      tagId,
      filePath,
      beforeCount: current.values.length,
      afterCount: mergedValues.length,
      addedCount: mergedValues.length - current.values.length,
      payload: {
        replace: false,
        values: mergedValues,
      },
      covered: new Set(mergedValues),
    });
  }

  return {
    tagEntries: tagEntries.sort((a, b) => a.tagId.localeCompare(b.tagId)),
    filteredOut,
  };
}

function parseEvidence(tsvPath) {
  if (!fs.existsSync(tsvPath)) {
    return [];
  }

  const content = fs.readFileSync(tsvPath, 'utf8').trim();
  if (!content) {
    return [];
  }

  const lines = content.split('\n');
  const header = lines.shift();
  const expectedHeaders = new Set([
    'block_id\tcategory\trecommended_tags\tnamespace\tsources',
    'block_id\tcategory\trecommended_tags\tmatched_tags\tnamespace\tsources',
    'block_id\tcategory\tmatched_tags\tnamespace\tsources',
  ]);
  if (!expectedHeaders.has(header)) {
    fail(`Unexpected evidence header in ${tsvPath}: ${header}`);
  }

  return lines
    .filter(Boolean)
    .map((line) => {
      const fields = line.split('\t');
      if (header === 'block_id\tcategory\trecommended_tags\tmatched_tags\tnamespace\tsources') {
        const [blockId, category, recommendedTags, matchedTags, namespace, sources] = fields;
        return {
          blockId,
          category,
          recommendedTags,
          matchedTags,
          namespace,
          sources,
        };
      }
      if (header === 'block_id\tcategory\tmatched_tags\tnamespace\tsources') {
        const [blockId, category, matchedTags, namespace, sources] = fields;
        return {
          blockId,
          category,
          recommendedTags: matchedTags,
          matchedTags,
          namespace,
          sources,
        };
      }
      const [blockId, category, recommendedTags, namespace, sources] = fields;
      return {
        blockId,
        category,
        recommendedTags,
        matchedTags: '',
        namespace,
        sources,
      };
    });
}

function collectEvidenceRows(primaryPath) {
  const evidenceRows = [];
  const byBlockId = new Map();

  for (const row of [...parseEvidence(DEFAULT_CURRENT_COVERED), ...parseEvidence(primaryPath)]) {
    if (!row.blockId || byBlockId.has(row.blockId)) {
      continue;
    }
    byBlockId.set(row.blockId, row);
    evidenceRows.push(row);
  }

  return evidenceRows;
}

function buildCoverageRows(evidenceRows, coverageByTag) {
  const currentCovered = [];
  const remainingMissing = [];

  for (const row of evidenceRows) {
    const matchedTags = row.recommendedTags
      .split(',')
      .filter((tagId) => coverageByTag.get(tagId)?.has(row.blockId));

    if (matchedTags.length > 0) {
      currentCovered.push({
        blockId: row.blockId,
        category: row.category,
        recommendedTags: row.recommendedTags,
        matchedTags: matchedTags.join(','),
        namespace: row.namespace,
        sources: row.sources,
      });
      continue;
    }

    remainingMissing.push(row);
  }

  currentCovered.sort((a, b) => a.blockId.localeCompare(b.blockId));
  remainingMissing.sort((a, b) => a.blockId.localeCompare(b.blockId));

  return { currentCovered, remainingMissing };
}

function writeTsv(filePath, header, rows, projector) {
  const body = rows.map(projector).join('\n');
  const content = body ? `${header}\n${body}\n` : `${header}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function writeAuditSummary(filePath, tagEntries, currentCovered, remainingMissing) {
  const lines = [
    '# Burnt Coverage Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Recommended evidence rows: ${currentCovered.length + remainingMissing.length}`,
    `Covered rows: ${currentCovered.length}`,
    `Missing rows: ${remainingMissing.length}`,
    '',
    '| Tag | Existing | Added | Final |',
    '| --- | ---: | ---: | ---: |',
    ...tagEntries.map((entry) => `| ${entry.tagId} | ${entry.beforeCount} | ${entry.addedCount} | ${entry.afterCount} |`),
    '',
  ];

  if (remainingMissing.length > 0) {
    lines.push('## Remaining Missing');
    lines.push('');
    lines.push(...remainingMissing.slice(0, 50).map((row) => `- ${row.blockId} -> ${row.recommendedTags}`));
    if (remainingMissing.length > 50) {
      lines.push(`- ...and ${remainingMissing.length - 50} more`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.recommendations)) {
    fail(`Recommendations file not found: ${options.recommendations}`);
  }
  if (!fs.existsSync(options.evidence)) {
    fail(`Evidence file not found: ${options.evidence}`);
  }

  const recommendations = readJson(options.recommendations);
  const knownModBlockIds = collectKnownModBlockIds();
  const excludedBlockIds = readStringSet(options.blockExclusions);
  const { tagEntries, filteredOut } = mergeRecommendations(recommendations, knownModBlockIds, excludedBlockIds);
  const coverageByTag = new Map(tagEntries.map((entry) => [entry.tagId, entry.covered]));
  const evidenceRows = collectEvidenceRows(options.evidence);
  const { currentCovered, remainingMissing } = buildCoverageRows(evidenceRows, coverageByTag);

  if (options.write) {
    for (const entry of tagEntries) {
      writeJson(entry.filePath, entry.payload);
    }

    writeTsv(
      path.join(GENERATED_DIR, 'burnt-coverage-current-covered.tsv'),
      'block_id\tcategory\trecommended_tags\tmatched_tags\tnamespace\tsources',
      currentCovered,
      (row) => [row.blockId, row.category, row.recommendedTags, row.matchedTags, row.namespace, row.sources].join('\t')
    );
    writeTsv(
      path.join(GENERATED_DIR, 'burnt-coverage-missing-high-confidence.tsv'),
      'block_id\tcategory\trecommended_tags\tnamespace\tsources',
      remainingMissing,
      (row) => [row.blockId, row.category, row.recommendedTags, row.namespace, row.sources].join('\t')
    );
    writeAuditSummary(
      path.join(GENERATED_DIR, 'burnt-coverage-audit.md'),
      tagEntries,
      currentCovered,
      remainingMissing
    );
  }

  const changedTags = tagEntries.filter((entry) => entry.addedCount > 0);
  for (const entry of changedTags) {
    console.log(`${entry.tagId}\t+${entry.addedCount}\t${path.relative(REPO_ROOT, entry.filePath)}`);
  }
  for (const entry of filteredOut) {
    console.log(`filtered_non_block\t${entry.reason}\t${entry.tagId}\t${entry.value}`);
  }
  console.log(`covered_rows\t${currentCovered.length}`);
  console.log(`missing_rows\t${remainingMissing.length}`);

  if (!options.write && changedTags.length > 0) {
    process.exitCode = 1;
  }
}

main();
