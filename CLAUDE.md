# Contexts Plugin — Claude Instructions

## Project

Obsidian community plugin: **Contexts Plugin** (`id: contexts`).
Author: Pau Garcia. TypeScript → `main.js` via esbuild.

## What this plugin does

Users with a single vault spanning multiple life areas (work, personal, medical…) need a way to focus on a subset of notes without touching the native file explorer.

The plugin adds a **Contexts panel** — a custom sidebar view with a filtered file tree — driven by the currently active context. The native file explorer is never modified.

### Key behaviours

- **Contexts are session-only**: they are not persisted between Obsidian sessions. The active context resets on restart.
- **Context definitions are persisted** in plugin settings (`loadData`/`saveData`): name + filter conditions.
- **Switching contexts**: via a hotkey that opens a quick-select dialog (`FuzzySuggestModal`), or directly from the panel.
- **Filters** (combined with AND logic): directory path, tag, frontmatter field presence, frontmatter field value.

### Data model (to be implemented)

```typescript
interface ContextFilter {
  type: 'directory' | 'tag' | 'frontmatter-key' | 'frontmatter-value';
  value: string;       // path, tag name, key name, or "key=value"
}

interface Context {
  id: string;
  name: string;
  filters: ContextFilter[];
}

// Persisted in settings:
interface PluginSettings {
  contexts: Context[];
}

// Session-only (not saved):
// activeContextId: string | null
```

### View architecture

- Register a custom `ItemView` (e.g. `ContextsView`, `VIEW_TYPE = 'contexts-panel'`).
- Add a ribbon icon to reveal the view.
- The view renders a file tree filtered by the active context's rules.
- Re-render the tree when: active context changes, vault files change.

## Tooling

- Package manager: **npm**
- Bundler: **esbuild** (`esbuild.config.mjs`)
- TypeScript with `"strict": true`

```bash
npm install       # install dependencies
npm run dev       # watch mode (development)
npm run build     # production build (type-checks + bundle)
npm run lint      # eslint
```

## Source layout

```
src/
  main.ts            # Plugin entry point — lifecycle only (onload/onunload)
  settings.ts        # PluginSettings interface, defaults, settings tab
  types.ts           # Context, ContextFilter interfaces
  context-manager.ts # Session state: active context, switch logic
  context-filter.ts  # Filter evaluation logic (file matches context?)
  views/
    contexts-view.ts # ItemView — sidebar panel with filtered file tree
  commands/
    switch-context.ts # FuzzySuggestModal for hotkey-based switching
```

Keep `main.ts` minimal. Delegate all logic to modules under `src/`.

## Key rules

- Never commit `node_modules/`, `main.js`, or other build artifacts.
- Never change the plugin `id` (`contexts`) after release.
- Use `this.register*` helpers for all listeners/intervals so they clean up on unload.
- Default to offline/local operation; no hidden network calls.
- `isDesktopOnly: false` — avoid Node/Electron-only APIs.
- Active context lives only in memory — never write it to `saveData`.

## Extended guidance

See `AGENTS.md` for detailed conventions on commands, settings, UI, security, performance, versioning, and common code patterns.
