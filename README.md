# Talia Connectors

Declarative connector presets and generic local/remote MCP templates for Talia.
Packages contain configuration metadata only; they never start an MCP process
or configure an instance during discovery or installation. Users explicitly
configure an installed preset on their device.

## ArtCraft MCP references

`packages/` contains one reusable connector package for each ArtCraft MCP preset
supported by the Talia desktop. `connector.json` uses the desktop's current
`ArtcraftMcpPreset` shape under `{ "schemaVersion": 1, "preset": ... }`.
Presets contain generic executable hints and optional path-field definitions;
they contain no user paths, tokens, environment values, or server instance
configuration. Install adds a preset and receipt only. The user supplies a
command path and any optional path fields when they choose **Configure**.

The authoritative preset data is mirrored from:
`Talia/desktop/src/main/features/connectors/catalog-artcraft-mcp.ts`.
Before release, compare package data against that source and update both in the
same change when the app contract changes.

## Generic templates and examples

`templates/generic-local-mcp/` and `templates/generic-remote-mcp/` are installable
source package templates for new local stdio and remote Streamable HTTP
connectors. Copy one to `packages/`, update both IDs and metadata, then build a
v3 catalog. Their JSON shape is specified by
`schemas/connector-template.schema.json` and validated by the public catalog
packer without a core code change. They contain command/URL hints only, no
credentials, environment values, private paths, or MCP instance configuration.

`examples/stdio.example.json`, `examples/http-local.example.json`, and
`examples/http-remote.example.json` remain form-entry examples. Replace
placeholders only in a local configuration. Never commit credentials, private
URLs, or machine-specific paths.

## Package shape

Each package directory has `talia-extension.json` metadata and `connector.json`.
Connector package payloads are declarative and have no install-time execution.

Repository: https://github.com/Talia-Orchestrator/talia-connectors

Run npm test to validate ArtCraft packages, generic templates, and credential-free examples. Pull requests use the same secrets-free check.
