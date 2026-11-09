'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const packageRoot = path.join(root, 'packages');
const expected = [
  'cadcraft', 'craft-anything', 'deckcraft', 'designcraft', 'effectcraft', 'figcraft', 'filmcraft', 'gridcraft',
  'lightcraft', 'materialcraft', 'pdfcraft', 'photocraft', 'soundcraft', 'texturecraft', 'vectorcraft', 'wordcraft',
];

test('all 16 ArtCraft references use the declarative connector package shape', () => {
  const directories = fs.readdirSync(packageRoot).sort();
  assert.deepEqual(directories, expected);
  for (const directory of directories) {
    const dir = path.join(packageRoot, directory);
    const metadata = JSON.parse(fs.readFileSync(path.join(dir, 'talia-extension.json'), 'utf8'));
    const connector = JSON.parse(fs.readFileSync(path.join(dir, 'connector.json'), 'utf8'));
    assert.equal(metadata.id, `artcraft/${directory}`);
    assert.equal(metadata.kind, 'connector');
    assert.equal(connector.schemaVersion, 1);
    assert.equal(connector.preset.id, directory);
    assert.equal(connector.preset.category, 'productivity');
    assert.ok(Array.isArray(connector.preset.base_args));
    assert.ok(Array.isArray(connector.preset.path_fields));
    for (const file of ['README.md', 'LICENSE', 'NOTICE']) assert.ok(fs.statSync(path.join(dir, file)).isFile());
    assert.doesNotMatch(JSON.stringify(connector), /\/Users\/|\/home\/[^/]+\//i);
    assert.doesNotMatch(JSON.stringify(connector), /(?:token|secret|api[_-]?key)\s*[:=]\s*[^"\s]{8,}/i);
  }
});

test('generic stdio and local/remote HTTP examples remain placeholders, not installable packages', () => {
  for (const name of ['stdio.example.json', 'http-local.example.json', 'http-remote.example.json']) {
    const example = JSON.parse(fs.readFileSync(path.join(root, 'examples', name), 'utf8'));
    assert.ok(example.transport || example.transport === undefined);
    assert.match(JSON.stringify(example), /INSERIRE_SOLO_NELLA_PROPRIA_CONFIGURAZIONE|placeholder|example|example\.com|loopback|127\.0\.0\.1/i);
  }
  assert.equal(fs.existsSync(path.join(root, 'examples', 'talia-extension.json')), false);
});

test('generic connector templates pack as installable v2 artifacts without core-specific data', () => {
  const templates = path.join(root, 'templates');
  const packerPath = process.env.TALIA_CATALOG_PACKER
    || path.resolve(root, '..', 'talia-store', 'tools', 'talia-catalog-pack.cjs');
  const packer = require(packerPath);
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'connector-template.schema.json'), 'utf8'));
  assert.deepEqual(schema.required, ['schemaVersion', 'template']);
  assert.equal(schema.additionalProperties, false);
  const local = path.join(templates, 'generic-local-mcp');
  const remote = path.join(templates, 'generic-remote-mcp');
  const built = packer.buildCatalogV3([local, remote]);
  const index = JSON.parse(built.catalogBytes.toString('utf8'));
  assert.equal(index.packages.length, 2);
  for (const artifact of built.artifacts) {
    const pkg = JSON.parse(artifact.bytes.toString('utf8')).packages[0];
    const connector = JSON.parse(pkg.files['connector.json']);
    assert.equal(connector.schemaVersion, 1);
    assert.ok(connector.template);
    assert.equal(connector.template.id, pkg.id);
    assert.ok(connector.template.documentation_url.startsWith('https://'));
    assert.equal(Object.hasOwn(connector.template, 'env'), false);
    assert.equal(Object.hasOwn(connector.template, 'headers'), false);
    assert.ok(pkg.files.LICENSE && pkg.files.NOTICE && pkg.files['README.md']);
  }
});
