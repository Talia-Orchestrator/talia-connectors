#!/usr/bin/env node
'use strict';
// Risoluzione unica del packer pubblico dello store, condivisa da validate e test.
// Funziona sia dal checkout `talia-ecosystem/talia-connectors` sia da un git worktree
// annidato (`talia-ecosystem/worktrees/<nome>`), dove il percorso relativo cambia.
const fs = require('node:fs');
const path = require('node:path');

const RELATIVE = ['talia-store', 'tools', 'talia-catalog-pack.cjs'];

// Worktree affiancati: `worktrees/<feature>-connectors` accompagna `worktrees/<feature>-store`.
// Si preferisce il worktree con il prefisso di nome più lungo in comune, così la feature in
// corso valida contro il proprio packer e non contro il checkout principale.
function siblingWorktreePackers(repoRoot) {
  const parent = path.dirname(repoRoot);
  if (path.basename(parent) !== 'worktrees') return [];
  const own = path.basename(repoRoot);
  const shared = (name) => {
    let count = 0;
    while (count < name.length && count < own.length && name[count] === own[count]) count += 1;
    return count;
  };
  let entries;
  try { entries = fs.readdirSync(parent); } catch (_) { return []; }
  return entries
    .filter(name => name !== own)
    .sort((a, b) => shared(b) - shared(a))
    .map(name => path.join(parent, name, 'tools', 'talia-catalog-pack.cjs'));
}

function candidates(repoRoot) {
  if (process.env.TALIA_CATALOG_PACKER) return [path.resolve(process.env.TALIA_CATALOG_PACKER)];
  const resolved = path.resolve(repoRoot);
  const roots = [];
  if (process.env.TALIA_SOURCE_ROOT) roots.push(path.resolve(process.env.TALIA_SOURCE_ROOT));
  let current = resolved;
  for (let depth = 0; depth < 4; depth += 1) {
    current = path.dirname(current);
    roots.push(current);
  }
  return [
    ...(process.env.TALIA_SOURCE_ROOT ? [] : siblingWorktreePackers(resolved)),
    ...roots.map(root => path.join(root, ...RELATIVE)),
  ];
}

function resolvePackerPath(repoRoot) {
  const tried = candidates(repoRoot);
  const found = tried.find(candidate => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Set TALIA_CATALOG_PACKER to the public talia-store packer path. Tried:\n${tried.join('\n')}`);
  }
  return found;
}

module.exports = { resolvePackerPath, loadPacker: repoRoot => require(resolvePackerPath(repoRoot)) };
