# vue-ui-tools

A lightweight Vue 3 runtime library for building UIs in pure TypeScript. Write components using typed element factories and `createVNode` — no templates, no JSX, no build step required.

## What it provides

- **Typed element factories** — `div`, `span`, `button`, `input`, `table` etc. that produce Vue VNodes with full TypeScript prop checking
- **`defineFn`** — stateless functional components with typed props and a render function
- **`defineTS`** — stateful components with `setup()`, reactive state, and lifecycle hooks
- **`h()`** — typed component instantiation with prop inference
- **`css()` / `staticCss()`** — atomic CSS-in-JS engine with pseudo-class and media query support, works isomorphically on server and client
- **`withMemo` / `createMemoCache`** — fine-grained memoisation for expensive render subtrees

## What it is not

- A full framework — it does not include a router, state manager, or data fetching layer
- A replacement for Vue's template compiler — it is an alternative authoring style for teams that prefer pure TypeScript
- SSR-specific — the CSS engine is isomorphic but rendering itself uses Vue's standard `renderToString` and hydration APIs

## Requirements

- Vue 3.3+
- Deno, Node, Bun, or a bundler that supports ES modules

## Compatibility

| Environment | Supported | Notes |
|---|---|---|
| Deno | ✓ | Native — recommended |
| Modern browsers | ✓ | Via import map or bundler |
| Vite | ✓ | Use path alias pointing to `mod.ts` |
| esbuild | ✓ | Use alias option pointing to `mod.ts` |
| Bun | ✓ | Works natively |
| Node 18+ | ✓ | Works with tsx or a bundler |

> `vue-ui-tools` only depends on Vue 3. It runs anywhere Vue 3 runs.

## Installation

### Deno

Add to your project's `deno.json`:
```json
{
  "imports": {
    "@vue-ui-tools": "https://raw.githubusercontent.com/jayobado/vue-ui-tools/v0.1.0/mod.ts",
    "vue":     "https://esm.sh/vue@3.5.13"
  }
}
```

Set your GitHub token for private repo access:
```bash
export DENO_AUTH_TOKENS="ghp_yourtoken@raw.githubusercontent.com"
```

> **Important:** Always declare `vue` in your own `deno.json` at the same URL used by `vue-ui-tools`. This ensures a single Vue instance is shared. Two Vue instances will break `inject`, `provide`, and reactivity across component boundaries.

For SSR also add:
```json
{
  "imports": {
    "@vue/server-renderer": "https://esm.sh/@vue/server-renderer@3.5.13?external=vue",
    "vue-router":           "https://esm.sh/vue-router@4.4.5?external=vue"
  }
}
```

The `?external=vue` flag prevents esm.sh from bundling a second copy of Vue inside these packages.

### Browser (import map, no bundler)
```html
<script type="importmap">
{
  "imports": {
    "vue":     "https://esm.sh/vue@3.5.13",
    "@vue-ui-tools": "https://raw.githubusercontent.com/jayobado/vue-ui-tools/v0.1.0/mod.ts"
  }
}
</script>
<script type="module" src="/main.ts"></script>
```

### Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@vue-ui-tools': '/path/to/vue-ui-tools/mod.ts',
    },
  },
})
```
```typescript
import { div, span, defineTS, css } from '@vue-ui-tools'
```

### esbuild
```typescript
import { build } from 'esbuild'

await build({
  entryPoints: ['src/main.ts'],
  bundle:      true,
  outfile:     'dist/app.js',
  alias: {
    '@vue-ui-tools': './path/to/vue-ui-tools/mod.ts',
  },
})
```

### Node (18+)
```bash
npm install vue
npm install ./path/to/vue-ui-tools   # local
# or if published to npm:
npm install @jayobado/vue-ui-tools
```
```typescript
import { div, defineTS } from '@jayobado/vue-ui-tools'
```

### Bun
```bash
bun add vue
bun add ./path/to/vue-ui-tools
```
```typescript
import { div, defineTS } from 'vue-ui-tools'
```

---

## Quick start
```typescript
import {
  defineTS, defineFn,
  div, h1, span, button, input,
  css, staticCss,
  h,
} from '@vue-ui-tools'
import { createApp, ref } from 'vue'

const Badge = defineFn({
  name: 'Badge',
  props: {
    label:   { type: String, required: true  as const },
    variant: { type: String, default: 'info' },
  },
  render({ label, variant }) {
    return span({
      class:  variant,
      styles: { padding: '2px 8px', borderRadius: 4, fontSize: 12 },
    }, label)
  },
})

const Counter = defineTS({
  name: 'Counter',
  props: {
    initial: { type: Number, default: 0 },
  },
  setup(props) {
    const count = ref(props.initial)

    return () => div(
      { styles: { display: 'flex', gap: 12, alignItems: 'center' } },
      button({ onClick: () => count.value-- }, '−'),
      span(null, String(count.value)),
      button({ onClick: () => count.value++ }, '+'),
      h(Badge, { label: `count: ${count.value}` }),
    )
  },
})

createApp(Counter, { initial: 5 }).mount('#app')
```

## Element factories

Every standard HTML element is available as a typed factory. All accept an optional props object as the first argument and children as subsequent arguments.
```typescript
import {
  div, section, article, aside, header, footer, main, nav,
  span, p, h1, h2, h3, h4, h5, h6, strong, em, small, code, pre,
  ul, ol, li,
  form, label, input, button, select, option, textarea, fieldset,
  img, a, hr, br,
  table, thead, tbody, tr, th, td,
} from '@vue-ui-tools'

div(null, 'Hello')
div({ class: 'container', id: 'main' }, 'Hello')
div({ styles: { display: 'flex', gap: 16 } }, 'Hello')
button({ onClick: (e) => console.log(e) }, 'Click me')
input({ type: 'email', placeholder: 'you@example.com', required: true })
a({ href: '/about', target: '_blank' }, 'About')

table(null,
  thead(null,
    tr(null, th(null, 'Name'), th(null, 'Role')),
  ),
  tbody(null,
    tr(null, td(null, 'Jane'), td(null, 'Admin')),
  ),
)
```

### Supported props

All element factories extend `ElProps`:

| Prop | Type | Description |
|---|---|---|
| `class` | `string` | CSS class string |
| `styles` | `StyleObject` | Atomic CSS (see CSS section) |
| `id` | `string` | Element ID |
| `role` | `string` | ARIA role |
| `tabIndex` | `number` | Tab order |
| `key` | `string \| number` | Vue key for list rendering |
| `aria-label` | `string` | ARIA label |
| `onClick` | `(e: MouseEvent) => void` | Click handler |
| `onInput` | `(e: InputEvent) => void` | Input handler |
| `onChange` | `(e: Event) => void` | Change handler |
| `onSubmit` | `(e: SubmitEvent) => void` | Submit handler |
| `onKeydown` | `(e: KeyboardEvent) => void` | Keydown handler |
| `onFocus` | `(e: FocusEvent) => void` | Focus handler |
| `onBlur` | `(e: FocusEvent) => void` | Blur handler |

## Components

### `defineFn` — functional component

Stateless and presentational. No reactive state, no lifecycle hooks.
```typescript
import { defineFn, span } from '@vue-ui-tools'
import type { PropType }   from 'vue'

type Variant = 'success' | 'warning' | 'danger' | 'info'

const StatusBadge = defineFn({
  name: 'StatusBadge',
  props: {
    label:   { type: String,                     required: true  as const },
    variant: { type: String as PropType<Variant>, default: 'info' },
  },
  render({ label, variant }) {
    return span({ class: `badge badge--${variant}` }, label)
  },
})

h(StatusBadge, { label: 'Active', variant: 'success' })
```

### `defineTS` — stateful component

Full Vue component with `setup()`, reactive state, and lifecycle hooks.
```typescript
import { defineTS, div, span, button } from '@vue-ui-tools'
import { ref, computed, onMounted }     from 'vue'

const DataTable = defineTS({
  name: 'DataTable',
  props: {
    title:    { type: String, required: true as const },
    pageSize: { type: Number, default: 10 },
  },
  setup(props) {
    const page    = ref(1)
    const loading = ref(false)
    const rows    = ref<string[]>([])

    const pageLabel = computed(() => `Page ${page.value}`)

    onMounted(async () => {
      loading.value = true
      // fetch data...
      loading.value = false
    })

    return () => div(null,
      div(null, props.title),
      loading.value
        ? span(null, 'Loading...')
        : div(null, ...rows.value.map(r => div(null, r))),
      div(null,
        button({ onClick: () => page.value-- }, 'Prev'),
        span(null, pageLabel.value),
        button({ onClick: () => page.value++ }, 'Next'),
      ),
    )
  },
})
```

### `h()` — typed component instantiation
```typescript
import { h } from '@vue-ui-tools'

h(StatusBadge, { label: 'OK', variant: 'success' })
h(DataTable,   { title: 'Users', pageSize: 20 })
h(Card,        { title: 'Details' }, div(null, 'Content'))
```

## CSS

Generates atomic class names from style objects and injects rules into a `<style>` tag. Identical property+value pairs always produce the same class.

### `css()` — dynamic styles
```typescript
import { css } from '@vue-ui-tools'

const className = css({
  display:      'flex',
  gap:          16,
  padding:      '12px 24px',
  background:   '#1a1a2e',
  borderRadius: 8,

  pseudo: {
    ':hover':    { background: '#2a2a3e' },
    ':focus':    { outline: '2px solid #4a9edd' },
    ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },

  media: {
    '(max-width: 768px)': { padding: '8px 16px' },
    '(prefers-color-scheme: light)': { background: '#ffffff' },
  },
})

div({ class: className }, 'Styled')
```

### `staticCss()` — module-level styles
```typescript
import { staticCss } from '@vue-ui-tools'

// Evaluated once on import
const card = staticCss({
  background:   '#161a22',
  border:       '1px solid #1f2433',
  borderRadius: 10,
  padding:      24,
})

div({ class: card }, 'Card content')
```

### SSR usage
```typescript
import { collectStyles, resetStyles } from '@vue-ui-tools'
import { renderToString }             from '@vue/server-renderer'

resetStyles() // isolate CSS per request
const html  = await renderToString(app)
const style = collectStyles() // returns <style> tag string

return `<!DOCTYPE html>
<html>
  <head>${style}</head>
  <body><div id="app">${html}</div></body>
</html>`
```

## Memoisation
```typescript
import { withMemo, createMemoCache, defineTS, div, span } from '@vue-ui-tools'

const cache = createMemoCache(1)

const ExpensiveList = defineTS({
  name: 'ExpensiveList',
  props: {
    items: { type: Array,  required: true as const },
    page:  { type: Number, default: 1 },
  },
  setup(props) {
    return () => div(null,
      withMemo(
        [props.items],
        () => div(null, ...(props.items as string[]).map(i => div(null, i))),
        cache,
        0,
      ),
      span(null, `Page ${props.page}`),
    )
  },
})
```

## Project structure
```
my-app/
├── server.ts
├── deno.json
└── src/
    ├── app/
    │   ├── App.ts
    │   ├── tokens.ts
    │   └── views/
    │       ├── HomeView.ts
    │       └── dashboard/
    │           └── DashboardView.ts
    └── runtime/
        └── index.ts
```

## Versioning
```bash
deno run --allow-read --allow-write scripts/bump.ts v0.2.0
```

## License

MIT
