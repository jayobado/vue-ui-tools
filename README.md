# vue-toolkit

A lightweight Vue 3 runtime library for building UIs in pure TypeScript. Write components using typed element factories and `createVNode` — no templates, no JSX, no build step required.

## What it provides

- **Typed element factories** — `div`, `span`, `button`, `input`, `table` etc. that produce Vue VNodes with full TypeScript prop checking
- **`defineFn`** — stateless functional components with typed props and a render function
- **`defineTS`** — stateful components with `setup()`, reactive state, and lifecycle hooks
- **`h()`** — typed component instantiation with prop inference
- **`css()` / `staticCss()`** — atomic CSS-in-JS engine with pseudo-class and media query support, works isomorphically on server and client
- **`withMemo` / `createMemoCache`** — fine-grained memoisation for expensive render subtrees
- **Form handling** — submission and validation composables using any Standard Schema library (`@jayobado/vue-toolkit/form`)
- **Data fetching** — `useQuery` and `useMutation` composables with reactive re-fetching and retry (`@jayobado/vue-toolkit/query`)
- **Components** — unstyled `FormField`, `FormGroup`, and `DataTable` helpers (`@jayobado/vue-toolkit/components`)
- **Interactive components** — unstyled `useModal`, `createToaster`, `useTooltip`, `useDropdown` (`@jayobado/vue-toolkit/components`)
- **Primitives** — `useMediaQuery`, `useLocalStorage`, `useDebounce`, `useInterval`, `useEventListener`, `usePagination`, `useSelection`, `useClipboard`, `createPortal`, `useClickOutside`, `useEscapeKey`, `useFocusTrap`, `useScrollLock`, `computePosition` (`@jayobado/vue-toolkit/primitives`)

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

> `vue-toolkit` only depends on Vue 3. It runs anywhere Vue 3 runs.

## Installation

### Deno

Add to your project's `deno.json`:
```json
{
  "imports": {
    "@vue-toolkit": "https://raw.githubusercontent.com/jayobado/vue-toolkit/v0.1.0/mod.ts",
    "vue":     "https://esm.sh/vue@3.5.13"
  }
}
```

Set your GitHub token for private repo access:
```bash
export DENO_AUTH_TOKENS="ghp_yourtoken@raw.githubusercontent.com"
```

> **Important:** Always declare `vue` in your own `deno.json` at the same URL used by `vue-toolkit`. This ensures a single Vue instance is shared. Two Vue instances will break `inject`, `provide`, and reactivity across component boundaries.

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
    "@vue-toolkit": "https://raw.githubusercontent.com/jayobado/vue-toolkit/v0.1.0/mod.ts"
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
      '@vue-toolkit': '/path/to/vue-toolkit/mod.ts',
    },
  },
})
```
```typescript
import { div, span, defineTS, css } from '@vue-toolkit'
```

### esbuild
```typescript
import { build } from 'esbuild'

await build({
  entryPoints: ['src/main.ts'],
  bundle:      true,
  outfile:     'dist/app.js',
  alias: {
    '@vue-toolkit': './path/to/vue-toolkit/mod.ts',
  },
})
```

### Node (18+)
```bash
npm install vue
npm install ./path/to/vue-toolkit   # local
# or if published to npm:
npm install @jayobado/vue-toolkit
```
```typescript
import { div, defineTS } from '@jayobado/vue-toolkit'
```

### Bun
```bash
bun add vue
bun add ./path/to/vue-toolkit
```
```typescript
import { div, defineTS } from 'vue-toolkit'
```

---

## Quick start
```typescript
import {
  defineTS, defineFn,
  div, h1, span, button, input,
  css, staticCss,
  h,
} from '@vue-toolkit'
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
} from '@vue-toolkit'

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
import { defineFn, span } from '@vue-toolkit'
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
import { defineTS, div, span, button } from '@vue-toolkit'
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
import { h } from '@vue-toolkit'

h(StatusBadge, { label: 'OK', variant: 'success' })
h(DataTable,   { title: 'Users', pageSize: 20 })
h(Card,        { title: 'Details' }, div(null, 'Content'))
```

## CSS

Generates atomic class names from style objects and injects rules into a `<style>` tag. Identical property+value pairs always produce the same class.

### `css()` — dynamic styles
```typescript
import { css } from '@vue-toolkit'

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
import { staticCss } from '@vue-toolkit'

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
import { collectStyles, resetStyles } from '@vue-toolkit'
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
import { withMemo, createMemoCache, defineTS, div, span } from '@vue-toolkit'

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

## Form handling

The `@jayobado/vue-toolkit/form` subpath provides composables for form submission and validation using any [Standard Schema](https://github.com/standard-schema/standard-schema) compatible library (Valibot, Zod, ArkType, etc.).

```typescript
import { useSubmit, useParse, flatten } from '@jayobado/vue-toolkit/form'
```

### `useSubmit` — form submission

Handles HTML5 validation, schema validation, submission state, and error formatting. The submit callback is always the second argument.

#### With Valibot

```typescript
import { useSubmit } from '@jayobado/vue-toolkit/form'
import { reactive } from 'vue'
import * as v from 'valibot'

const fields = reactive({ name: '', email: '' })

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
})

const { form, submit, submitting, submitted, errors } = useSubmit(
  { input: fields, schema },
  async (validated) => {
    // validated is typed as { name: string; email: string }
    await api.createUser(validated)
  },
)
```

#### With Zod

```typescript
import { useSubmit } from '@jayobado/vue-toolkit/form'
import { reactive } from 'vue'
import * as z from 'zod'

const fields = reactive({ name: '', email: '' })

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
})

const { form, submit, submitting, submitted, errors } = useSubmit(
  { input: fields, schema },
  async (validated) => {
    // validated is typed as { name: string; email: string }
    await api.createUser(validated)
  },
)
```

#### Full component example

```typescript
import { defineTS, div, input, button, span } from '@jayobado/vue-toolkit'
import { useSubmit, flatten } from '@jayobado/vue-toolkit/form'
import { reactive, ref } from 'vue'
import * as v from 'valibot'

const LoginForm = defineTS({
  name: 'LoginForm',
  props: {},
  setup() {
    const fields = reactive({ email: '', password: '' })

    const schema = v.object({
      email: v.pipe(v.string(), v.email('Invalid email')),
      password: v.pipe(v.string(), v.minLength(8, 'Min 8 characters')),
    })

    const { form, submit, submitting, errors } = useSubmit(
      { input: fields, schema, formatErrors: flatten },
      async (validated) => {
        await api.login(validated)
      },
    )

    return () => div(null,
      input({
        type: 'email',
        value: fields.email,
        onInput: (e) => { fields.email = (e.target as HTMLInputElement).value },
        placeholder: 'Email',
      }),
      errors.value?.nested?.email
        ? span({ class: 'error' }, errors.value.nested.email[0])
        : null,
      input({
        type: 'password',
        value: fields.password,
        onInput: (e) => { fields.password = (e.target as HTMLInputElement).value },
        placeholder: 'Password',
      }),
      errors.value?.nested?.password
        ? span({ class: 'error' }, errors.value.nested.password[0])
        : null,
      button(
        { type: 'submit', onClick: submit, disabled: submitting.value },
        submitting.value ? 'Signing in...' : 'Sign in',
      ),
    )
  },
})
```

#### Options

| Option | Type | Description |
|---|---|---|
| `input` | `MaybeRefOrGetter<T>` | Form data — plain value, ref, or getter |
| `schema` | `MaybeRefOrGetter<StandardSchemaV1>` | Standard Schema for validation |
| `formatErrors` | `(issues) => TErrors` | Custom error formatter (default: raw issues array) |
| `onErrors` | `(errors) => void` | Called when validation fails or submit sets errors |
| `form` | `Ref<HTMLFormElement>` | Injectable ref — enables HTML5 validation |
| `submitting` | `Ref<boolean>` | Injectable ref — share across composables |
| `submitted` | `Ref<boolean>` | Injectable ref |
| `errors` | `Ref<TErrors>` | Injectable ref |

#### Without schema

```typescript
const { submit, submitting } = useSubmit(
  { input: fields },
  async (data) => {
    await api.save(data)
  },
)
```

#### Without input

```typescript
const { submit, submitting } = useSubmit(
  {},
  async () => {
    await api.refresh()
  },
)
```

#### Shared state

```typescript
import { ref } from 'vue'

const submitting = ref(false)

// Both forms share the same submitting ref — only one can submit at a time
const formA = useSubmit({ submitting, input: fieldsA, schema: schemaA }, onSubmitA)
const formB = useSubmit({ submitting, input: fieldsB, schema: schemaB }, onSubmitB)
```

### `useParse` — reactive validation

Continuously validates input against a schema using `watchEffect`. Useful for pre-submit validation or real-time feedback.

#### With Valibot

```typescript
import { useParse, flatten } from '@jayobado/vue-toolkit/form'
import { reactive } from 'vue'
import * as v from 'valibot'

const fields = reactive({ age: '' as string | number })

const { output, errors } = useParse({
  input: fields,
  schema: v.object({ age: v.number() }),
  formatErrors: flatten,
})
```

#### With Zod

```typescript
import { useParse, flatten } from '@jayobado/vue-toolkit/form'
import { reactive } from 'vue'
import * as z from 'zod'

const fields = reactive({ age: '' as string | number })

const { output, errors } = useParse({
  input: fields,
  schema: z.object({ age: z.number() }),
  formatErrors: flatten,
})
```

#### Return values

| Property | Type | Description |
|---|---|---|
| `result` | `Ref<StandardSchemaV1.Result>` | Raw validation result |
| `output` | `Ref<T \| undefined>` | Validated output (undefined if invalid) |
| `errors` | `Ref<TErrors \| undefined>` | Formatted errors (undefined if valid) |

### `flatten` — error formatter

Converts Standard Schema issues into a flat structure with `root` and `nested` errors. Compatible with both Valibot's and Zod's issue format.

```typescript
import { flatten } from '@jayobado/vue-toolkit/form'
import type { FlatErrors } from '@jayobado/vue-toolkit/form'

const { errors } = useSubmit(
  { input: fields, schema, formatErrors: flatten },
  async (validated) => { ... },
)

// errors.value?.root     → string[] | undefined
// errors.value?.nested   → { [dotPath: string]: string[] } | undefined
```

## Data fetching

The `@jayobado/vue-toolkit/query` subpath provides composables for data fetching and mutations.

```typescript
import { useQuery, useMutation } from '@jayobado/vue-toolkit/query'
```

### `useQuery` — reactive data fetching

Fetches data and re-fetches automatically when reactive dependencies change. Any refs read inside the query function are tracked — no query keys needed.

```typescript
import { useQuery } from '@jayobado/vue-toolkit/query'

const { data, error, loading, refetch } = useQuery(
  () => api.users.list({ page: 1 }),
)
```

#### Reactive dependencies

When a ref changes inside the query function, the query re-fetches automatically:

```typescript
import { ref } from 'vue'
import { useQuery } from '@jayobado/vue-toolkit/query'

const page = ref(1)

const { data, loading } = useQuery(
  () => api.users.list({ page: page.value }),
)

// Changing page triggers a re-fetch
page.value = 2
```

#### Conditional fetching

Use `enabled` to control when the query runs:

```typescript
import { ref } from 'vue'
import { useQuery } from '@jayobado/vue-toolkit/query'

const userId = ref<string | null>(null)

const { data, loading } = useQuery(
  () => api.users.getById({ id: userId.value! }),
  { enabled: () => !!userId.value },
)

// Query runs only after userId is set
userId.value = '123'
```

#### Retry

```typescript
const { data, error } = useQuery(
  () => api.users.list({ page: 1 }),
  { retry: 3, retryDelay: 2000 },
)
```

#### With vue-toolkit components

```typescript
import { defineTS, div, span, button } from '@jayobado/vue-toolkit'
import { useQuery } from '@jayobado/vue-toolkit/query'
import { ref } from 'vue'

const UserList = defineTS({
  name: 'UserList',
  props: {},
  setup() {
    const page = ref(1)

    const { data, loading, error } = useQuery(
      () => api.users.list({ page: page.value }),
    )

    return () => {
      if (loading.value) return span(null, 'Loading...')
      if (error.value) return span(null, error.value.message)

      return div(null,
        ...data.value!.data.map(u => div(null, u.name)),
        div(null,
          button({ onClick: () => page.value--, disabled: page.value <= 1 }, 'Prev'),
          span(null, `Page ${page.value}`),
          button({ onClick: () => page.value++ }, 'Next'),
        ),
      )
    }
  },
})
```

#### Options

| Option | Type | Description |
|---|---|---|
| `enabled` | `MaybeRefOrGetter<boolean>` | Controls whether the query runs (default: `true`) |
| `retry` | `number` | Number of retry attempts on failure (default: `0`) |
| `retryDelay` | `number` | Milliseconds between retries (default: `1000`) |
| `onError` | `(err: Error) => void` | Called when all retries are exhausted |

#### Return values

| Property | Type | Description |
|---|---|---|
| `data` | `Ref<T \| undefined>` | Last successful result |
| `error` | `Ref<Error \| undefined>` | Last error (cleared on next fetch) |
| `loading` | `Ref<boolean>` | Whether a fetch is in progress |
| `refetch` | `() => Promise<void>` | Manually trigger a re-fetch |

### `useMutation` — imperative async operations

Wraps any async function with loading, error, and result state. Use for operations triggered by user actions that aren't form submissions — deletes, toggles, reordering, etc.

```typescript
import { useMutation } from '@jayobado/vue-toolkit/query'

const { mutate, loading, error, data } = useMutation(
  (id: string) => api.users.delete({ id }),
  {
    onSuccess: () => { navigateTo('/users') },
    onError: (err) => { toast.show(err.message) },
  },
)
```

#### Usage in a component

```typescript
import { defineTS, div, button, span } from '@jayobado/vue-toolkit'
import { useMutation } from '@jayobado/vue-toolkit/query'

const DeleteButton = defineTS({
  name: 'DeleteButton',
  props: {
    userId: { type: String, required: true as const },
  },
  setup(props) {
    const { mutate, loading } = useMutation(
      (id: string) => api.users.delete({ id }),
      {
        onSuccess: () => { window.location.href = '/users' },
      },
    )

    return () => button(
      { onClick: () => mutate(props.userId), disabled: loading.value },
      loading.value ? 'Deleting...' : 'Delete user',
    )
  },
})
```

#### Toggling state

```typescript
const { mutate: toggleArchive, loading } = useMutation(
  (id: string) => api.projects.toggleArchive({ id }),
  {
    onSuccess: (result) => { project.value = result },
  },
)

button({ onClick: () => toggleArchive(project.value.id), disabled: loading.value },
  'Archive',
)
```

#### Options

| Option | Type | Description |
|---|---|---|
| `retry` | `number` | Number of retry attempts on failure (default: `0`) |
| `retryDelay` | `number` | Milliseconds between retries (default: `1000`) |
| `onSuccess` | `(result: T) => void` | Called after successful execution |
| `onError` | `(err: Error) => void` | Called after all retries are exhausted |
| `onSettled` | `() => void` | Called after completion, regardless of outcome |

#### Return values

| Property | Type | Description |
|---|---|---|
| `mutate` | `(...args) => Promise<T \| undefined>` | Trigger the mutation |
| `data` | `Ref<T \| undefined>` | Last successful result |
| `error` | `Ref<Error \| undefined>` | Last error |
| `loading` | `Ref<boolean>` | Whether the mutation is in progress |
| `reset` | `() => void` | Clear data, error, and loading state |

### When to use what

| Scenario | Hook |
|---|---|
| Fetch data on mount or when dependencies change | `useQuery` |
| Submit a form with validation | `useSubmit` (from `@jayobado/vue-toolkit/form`) |
| Delete, toggle, or any non-form write operation | `useMutation` |
| Real-time input validation | `useParse` (from `@jayobado/vue-toolkit/form`) |

## Components

The `@jayobado/vue-toolkit/components` subpath provides low-level helpers that reduce DOM boilerplate without imposing any styling or layout opinions. All components are unstyled by default — use `styles`, `class`, or both to control appearance.

```typescript
import { FormField, FormGroup, DataTable } from '@jayobado/vue-toolkit/components'
```

### `FormField` — label + input + error

Wraps a label, input (passed as children), and optional error message into a `div`. The label is linked to the input via the `for` attribute, and errors use `role="alert"` for accessibility.

```typescript
import { FormField } from '@jayobado/vue-toolkit/components'
import { input } from '@jayobado/vue-toolkit'

FormField(
  { label: 'Email', name: 'email', required: true },
  input({ name: 'email', type: 'email', placeholder: 'you@example.com' }),
)
```

#### With error display

```typescript
FormField(
  {
    label: 'Email',
    name: 'email',
    error: errors.value?.nested?.email?.[0],
    required: true,
  },
  input({ name: 'email', type: 'email' }),
)
```

#### Styled

```typescript
FormField(
  {
    label: 'Email',
    name: 'email',
    error: errors.value?.nested?.email?.[0],
    required: true,
    styles: { display: 'flex', flexDirection: 'column', gap: 4 },
    labelStyles: { fontSize: 14, fontWeight: 600, color: '#ccc' },
    errorStyles: { fontSize: 12, color: '#ef4444' },
  },
  input({
    name: 'email',
    type: 'email',
    styles: { padding: '8px 12px', borderRadius: 4, border: '1px solid #333' },
  }),
)
```

#### With CSS classes

```typescript
FormField(
  { label: 'Email', name: 'email', class: 'form-field' },
  input({ name: 'email', type: 'email', class: 'form-input' }),
)
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Label text (required) |
| `name` | `string` | Links label `for` attribute to input |
| `error` | `string` | Error message to display |
| `required` | `boolean` | Appends ` *` to label text |
| `class` | `string` | CSS class on wrapper div |
| `styles` | `StyleObject` | Atomic CSS on wrapper div |
| `labelStyles` | `StyleObject` | Atomic CSS on label |
| `errorStyles` | `StyleObject` | Atomic CSS on error span |

### `FormGroup` — fieldset + legend

Groups related fields inside a `fieldset` with an optional `legend`.

```typescript
import { FormGroup, FormField } from '@jayobado/vue-toolkit/components'
import { input } from '@jayobado/vue-toolkit'

FormGroup(
  { legend: 'Billing address', styles: { border: '1px solid #333', padding: 16, borderRadius: 8 } },
  FormField({ label: 'Street', name: 'street' }, input({ name: 'street' })),
  FormField({ label: 'City', name: 'city' }, input({ name: 'city' })),
  FormField({ label: 'Zip', name: 'zip' }, input({ name: 'zip' })),
)
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `legend` | `string` | Legend text |
| `class` | `string` | CSS class on fieldset |
| `styles` | `StyleObject` | Atomic CSS on fieldset |
| `legendStyles` | `StyleObject` | Atomic CSS on legend |

### `DataTable` — column-driven table

Takes a column definition and rows array, handles `thead`/`tbody`/`tr`/`td` boilerplate. No built-in sorting or pagination — use refs and `useQuery` for that.

```typescript
import { DataTable } from '@jayobado/vue-toolkit/components'
import { button } from '@jayobado/vue-toolkit'
import type { Column } from '@jayobado/vue-toolkit/components'

interface User { id: string; name: string; role: string }

const columns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  {
    key: 'actions',
    header: '',
    render: (row) => button({ onClick: () => edit(row.id) }, 'Edit'),
  },
]

DataTable({
  columns,
  rows: users.value,
  onRowClick: (row) => navigateTo(`/users/${row.id}`),
  emptyText: 'No users found',
})
```

#### Styled

```typescript
DataTable({
  columns: [
    {
      key: 'name',
      header: 'Name',
      headerStyles: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #333' },
      cellStyles: { padding: '8px 12px' },
    },
    {
      key: 'role',
      header: 'Role',
      headerStyles: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #333' },
      cellStyles: { padding: '8px 12px', color: '#888' },
    },
  ],
  rows: users.value,
  styles: { width: '100%', borderCollapse: 'collapse' },
  headerStyles: { background: '#1a1a2e' },
  rowStyles: (row, i) => ({
    background: i % 2 === 0 ? '#161622' : '#1a1a2e',
    pseudo: { ':hover': { background: '#222238' } },
  }),
})
```

#### Column definition

| Property | Type | Description |
|---|---|---|
| `key` | `string` | Property name to read from row (used when no `render`) |
| `header` | `string` | Column header text |
| `render` | `(row, index) => VNode \| string` | Custom cell renderer |
| `headerStyles` | `StyleObject` | Atomic CSS on `th` |
| `cellStyles` | `StyleObject` | Atomic CSS on `td` |

#### Table props

| Prop | Type | Description |
|---|---|---|
| `columns` | `Column<T>[]` | Column definitions (required) |
| `rows` | `T[]` | Data rows (required) |
| `class` | `string` | CSS class on `table` |
| `styles` | `StyleObject` | Atomic CSS on `table` |
| `headerStyles` | `StyleObject` | Atomic CSS on header `tr` |
| `rowStyles` | `StyleObject \| (row, index) => StyleObject` | Static or per-row styles |
| `emptyText` | `string` | Text when rows is empty (default: `'No data'`) |
| `rowKey` | `(row, index) => string \| number` | Key extraction for list rendering |
| `onRowClick` | `(row, index) => void` | Row click handler |

## Primitives

The `@jayobado/vue-toolkit/primitives` subpath provides low-level building blocks for interactive UI patterns. Use them directly or combine them to build custom components.

```typescript
import {
  createPortal, useClickOutside, useEscapeKey,
  useFocusTrap, useScrollLock, computePosition,
  useMediaQuery, useLocalStorage, useDebounce, useDebounceFn,
  useInterval, useEventListener, usePagination, useSelection, useClipboard,
} from '@jayobado/vue-toolkit/primitives'
```

### `createPortal` — render outside the component tree

Renders a VNode into a detached container appended to a target element (defaults to `document.body`).

```typescript
import { createPortal } from '@jayobado/vue-toolkit/primitives'
import { createVNode } from 'vue'

const { container, remove } = createPortal(
  createVNode('div', null, 'I am portaled'),
)

// Later
remove()
```

### `useClickOutside` — detect clicks outside an element

```typescript
import { useClickOutside } from '@jayobado/vue-toolkit/primitives'
import { ref } from 'vue'

const menuEl = ref<HTMLElement | null>(null)

const dispose = useClickOutside(menuEl, () => {
  console.log('clicked outside')
})
```

Automatically cleaned up when the Vue scope is disposed. Returns a manual `dispose` function for standalone use.

### `useEscapeKey` — listen for escape key

```typescript
import { useEscapeKey } from '@jayobado/vue-toolkit/primitives'

const dispose = useEscapeKey(() => {
  console.log('escape pressed')
})
```

### `useFocusTrap` — trap focus within a container

Traps tab navigation within the container element. Focus moves to the first focusable element on activation and returns to the previously focused element on disposal.

```typescript
import { useFocusTrap } from '@jayobado/vue-toolkit/primitives'
import { ref } from 'vue'

const dialogEl = ref<HTMLElement | null>(null)

const release = useFocusTrap(dialogEl)

// Later
release()
```

### `useScrollLock` — prevent body scrolling

```typescript
import { useScrollLock } from '@jayobado/vue-toolkit/primitives'

const unlock = useScrollLock()

// Later
unlock()
```

### `computePosition` — position a floating element

Calculates `top` and `left` for a floating element relative to a trigger. Automatically flips placement when there isn't enough viewport space.

```typescript
import { computePosition } from '@jayobado/vue-toolkit/primitives'

const { top, left, placement } = computePosition(triggerEl, floatingEl, {
  placement: 'bottom',
  offset: 8,
})

floatingEl.style.top = `${top}px`
floatingEl.style.left = `${left}px`
```

#### Placement options

`'top'` | `'bottom'` | `'left'` | `'right'` — defaults to `'bottom'`. If the preferred placement doesn't fit, it tries the opposite side, then the remaining two.

### `useMediaQuery` — reactive media query

```typescript
import { useMediaQuery } from '@jayobado/vue-toolkit/primitives'

const { matches } = useMediaQuery('(max-width: 768px)')

// In a render function
matches.value ? mobileLayout() : desktopLayout()
```

### `useLocalStorage` — persistent reactive state

Reads and writes to localStorage with JSON serialization. Syncs across tabs via the `storage` event.

```typescript
import { useLocalStorage } from '@jayobado/vue-toolkit/primitives'

const { value: theme, remove } = useLocalStorage('theme', 'dark')

// Reads from localStorage on init, writes on change
theme.value = 'light' // persisted automatically

// Clear from storage and reset to initial
remove()
```

### `useDebounce` — debounce a reactive value

```typescript
import { useDebounce } from '@jayobado/vue-toolkit/primitives'
import { ref } from 'vue'

const search = ref('')
const { value: debouncedSearch } = useDebounce(search, 300)

// debouncedSearch.value updates 300ms after the last change to search.value
```

### `useDebounceFn` — debounce a callback

```typescript
import { useDebounceFn } from '@jayobado/vue-toolkit/primitives'

const { call: debouncedFetch, cancel } = useDebounceFn(
  (query: string) => api.search({ query }),
  300,
)

// In an input handler
input({ onInput: (e) => debouncedFetch((e.target as HTMLInputElement).value) })
```

### `useInterval` — auto-disposing interval

```typescript
import { useInterval } from '@jayobado/vue-toolkit/primitives'

const { stop, restart } = useInterval(
  () => api.notifications.poll(),
  30_000,
  { immediate: true },
)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `immediate` | `boolean` | `false` | Run `fn` immediately before first interval tick |

### `useEventListener` — type-safe event listener

```typescript
import { useEventListener } from '@jayobado/vue-toolkit/primitives'

// Window
useEventListener(window, 'resize', (e) => {
  console.log(window.innerWidth)
})

// Element
useEventListener(myElement, 'click', (e) => {
  console.log(e.clientX)
})

// With options
useEventListener(document, 'scroll', handler, { passive: true })
```

### `usePagination` — page state management

Manages pagination state and derived values. Combine with `useQuery` and `DataTable`.

```typescript
import { usePagination } from '@jayobado/vue-toolkit/primitives'
import { useQuery } from '@jayobado/vue-toolkit/query'

const pager = usePagination({ page: 1, pageSize: 20 })

const { data } = useQuery(() =>
  api.users.list({ page: pager.page.value, perPage: pager.pageSize.value }),
)

// Update total when data arrives
watch(data, (d) => { if (d) pager.total.value = d.total })
```

#### Return values

| Property | Type | Description |
|---|---|---|
| `page` | `Ref<number>` | Current page |
| `pageSize` | `Ref<number>` | Items per page |
| `total` | `Ref<number>` | Total item count |
| `totalPages` | `ComputedRef<number>` | Calculated total pages |
| `hasNext` | `ComputedRef<boolean>` | Whether next page exists |
| `hasPrev` | `ComputedRef<boolean>` | Whether previous page exists |
| `next()` | `() => void` | Go to next page |
| `prev()` | `() => void` | Go to previous page |
| `goTo(n)` | `(page: number) => void` | Jump to specific page (clamped) |
| `reset()` | `() => void` | Reset to initial page |

### `useSelection` — track selected items

```typescript
import { useSelection } from '@jayobado/vue-toolkit/primitives'

const { isSelected, toggle, selectAll, clear, count, toArray } = useSelection<string>()

// Toggle a row
toggle(user.id)

// Check box column
input({
  type: 'checkbox',
  checked: isSelected(user.id),
  onChange: () => toggle(user.id),
})

// Select all / clear all
button({ onClick: () => selectAll(users.value.map(u => u.id)) }, 'Select all')
button({ onClick: clear }, `Clear (${count.value})`)

// Get selected IDs for a bulk action
const ids = toArray()
```

#### Return values

| Property | Type | Description |
|---|---|---|
| `selected` | `Ref<Set<T>>` | The selected items set |
| `isSelected(item)` | `(item: T) => boolean` | Check if item is selected |
| `toggle(item)` | `(item: T) => void` | Toggle selection |
| `select(item)` | `(item: T) => void` | Add to selection |
| `deselect(item)` | `(item: T) => void` | Remove from selection |
| `selectAll(items)` | `(items: T[]) => void` | Replace selection with items |
| `clear()` | `() => void` | Clear all selections |
| `count` | `ComputedRef<number>` | Number of selected items |
| `toArray()` | `() => T[]` | Selected items as array |

### `useClipboard` — copy to clipboard

```typescript
import { useClipboard } from '@jayobado/vue-toolkit/primitives'

const { copy, copied } = useClipboard({ resetDelay: 2000 })

button(
  { onClick: () => copy(user.email) },
  copied.value ? 'Copied!' : 'Copy email',
)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `resetDelay` | `number` | `2000` | Ms before `copied` resets to `false` |

## Interactive components

The `@jayobado/vue-toolkit/components` subpath also provides unstyled interactive components built on top of the primitives. All are controlled via composables and styled entirely by you.

### `useModal` — dialog with focus trapping and scroll lock

```typescript
import { useModal } from '@jayobado/vue-toolkit/components'

const { open, close, isOpen, contentEl } = useModal({
  backdropStyles: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  styles: {
    background: '#1a1a2e', borderRadius: 8, padding: 24,
    minWidth: 400, maxWidth: '90vw',
  },
})
```

#### Adding content

The modal creates a backdrop and content wrapper. Append your content to `contentEl` after opening:

```typescript
import { defineTS, div, h2, p, button } from '@jayobado/vue-toolkit'
import { useModal } from '@jayobado/vue-toolkit/components'

const ConfirmDialog = defineTS({
  name: 'ConfirmDialog',
  props: {},
  setup() {
    const { open, close, isOpen, contentEl } = useModal({
      backdropStyles: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      },
      styles: {
        background: '#1a1a2e', borderRadius: 8, padding: 24, minWidth: 400,
      },
      onOpen: () => {
        if (contentEl.value) {
          contentEl.value.append(
            h2(null, 'Are you sure?'),
            p(null, 'This action cannot be undone.'),
            div({ styles: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
              button({ onClick: close }, 'Cancel'),
              button({ onClick: () => { handleDelete(); close() } }, 'Delete'),
            ),
          )
        }
      },
    })

    return () => button({ onClick: open }, 'Delete item')
  },
})
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | — | CSS class on content wrapper |
| `styles` | `StyleObject` | — | Atomic CSS on content wrapper |
| `backdropClass` | `string` | — | CSS class on backdrop |
| `backdropStyles` | `StyleObject` | — | Atomic CSS on backdrop |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on escape key |
| `trapFocus` | `boolean` | `true` | Trap tab navigation inside modal |
| `lockScroll` | `boolean` | `true` | Prevent body scrolling |
| `onOpen` | `() => void` | — | Called after modal opens |
| `onClose` | `() => void` | — | Called after modal closes |

#### Return values

| Property | Type | Description |
|---|---|---|
| `open` | `() => void` | Open the modal |
| `close` | `() => void` | Close the modal |
| `isOpen` | `Ref<boolean>` | Whether modal is open |
| `backdropEl` | `Ref<HTMLElement \| null>` | Backdrop element ref |
| `contentEl` | `Ref<HTMLElement \| null>` | Content wrapper ref |

### `createToaster` — toast notifications

Creates a global toast container. Call `show()` from anywhere — no component context needed.

```typescript
import { createToaster } from '@jayobado/vue-toolkit/components'

const toast = createToaster({
  containerStyles: {
    position: 'fixed', top: 16, right: 16, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  variantStyles: {
    success: { background: '#065f46', color: '#fff', padding: '12px 16px', borderRadius: 6 },
    error: { background: '#991b1b', color: '#fff', padding: '12px 16px', borderRadius: 6 },
    info: { background: '#1e3a5f', color: '#fff', padding: '12px 16px', borderRadius: 6 },
    warning: { background: '#92400e', color: '#fff', padding: '12px 16px', borderRadius: 6 },
  },
})

// Use anywhere
toast.show('User created', { variant: 'success' })
toast.show('Something went wrong', { variant: 'error', duration: 5000 })
toast.show('Persistent message', { duration: 0 }) // 0 = no auto-dismiss
```

#### With mutations

```typescript
import { useMutation } from '@jayobado/vue-toolkit/query'

const { mutate } = useMutation(
  (id: string) => api.users.delete({ id }),
  {
    onSuccess: () => toast.show('User deleted', { variant: 'success' }),
    onError: (err) => toast.show(err.message, { variant: 'error' }),
  },
)
```

#### Toast options

| Option | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | `3000` | Auto-dismiss delay in ms (`0` = persistent) |
| `variant` | `ToastVariant` | `'info'` | `'info'` \| `'success'` \| `'warning'` \| `'error'` |
| `class` | `string` | — | CSS class on toast element |
| `styles` | `StyleObject` | — | Atomic CSS on toast element |
| `dismissible` | `boolean` | `true` | Click to dismiss |

#### Toaster options

| Option | Type | Description |
|---|---|---|
| `containerClass` | `string` | CSS class on container |
| `containerStyles` | `StyleObject` | Atomic CSS on container |
| `variantStyles` | `Record<ToastVariant, StyleObject>` | Default styles per variant |

### `useTooltip` — hover/focus tooltip

Attaches a tooltip to a trigger element. Positioned automatically with viewport flipping.

```typescript
import { useTooltip } from '@jayobado/vue-toolkit/components'

const btn = document.createElement('button')
btn.textContent = 'Hover me'

useTooltip(btn, {
  text: 'This is a tooltip',
  placement: 'top',
  styles: {
    background: '#333', color: '#fff', padding: '4px 8px',
    borderRadius: 4, fontSize: 12,
  },
})
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Tooltip text (required) |
| `placement` | `Placement` | `'top'` | Preferred position |
| `offset` | `number` | `8` | Gap between trigger and tooltip in px |
| `showDelay` | `number` | `200` | Delay before showing in ms |
| `hideDelay` | `number` | `100` | Delay before hiding in ms |
| `class` | `string` | — | CSS class on tooltip |
| `styles` | `StyleObject` | — | Atomic CSS on tooltip |

### `useDropdown` — accessible dropdown menu

Attaches a dropdown menu to a trigger element with keyboard navigation (arrow keys, enter, escape).

```typescript
import { useDropdown } from '@jayobado/vue-toolkit/components'

const btn = document.createElement('button')
btn.textContent = 'Actions'

const { toggle, isOpen } = useDropdown(btn, {
  items: [
    { label: 'Edit', onSelect: () => edit() },
    { label: 'Duplicate', onSelect: () => duplicate() },
    { label: 'Archive', disabled: true },
    { label: 'Delete', onSelect: () => remove() },
  ],
  placement: 'bottom',
  styles: {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: 6,
    minWidth: 160, overflow: 'hidden',
  },
  itemStyles: { padding: '8px 12px' },
  activeItemStyles: { background: '#2a2a3e' },
  disabledItemStyles: { opacity: 0.4, cursor: 'not-allowed' },
})

btn.addEventListener('click', toggle)
```

#### With a callback

```typescript
const { toggle } = useDropdown(triggerEl, {
  items: [
    { label: 'CSV', value: 'csv' },
    { label: 'JSON', value: 'json' },
    { label: 'Excel', value: 'xlsx' },
  ],
  onSelect: (item) => {
    exportData(item.value!)
  },
  styles: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 6 },
  itemStyles: { padding: '8px 12px' },
  activeItemStyles: { background: '#2a2a3e' },
})
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | `DropdownItem[]` | — | Menu items (required) |
| `placement` | `Placement` | `'bottom'` | Preferred position |
| `offset` | `number` | `4` | Gap between trigger and menu in px |
| `class` | `string` | — | CSS class on menu container |
| `styles` | `StyleObject` | — | Atomic CSS on menu container |
| `itemClass` | `string` | — | CSS class on each item |
| `itemStyles` | `StyleObject` | — | Atomic CSS on each item |
| `activeItemStyles` | `StyleObject` | — | Styles for keyboard/hover active item |
| `disabledItemStyles` | `StyleObject` | — | Styles for disabled items |
| `onSelect` | `(item) => void` | — | Called when any item is selected |

#### DropdownItem

| Property | Type | Description |
|---|---|---|
| `label` | `string` | Display text |
| `value` | `string` | Optional value for `onSelect` |
| `disabled` | `boolean` | Prevents selection |
| `onSelect` | `() => void` | Per-item callback |

#### Return values

| Property | Type | Description |
|---|---|---|
| `open` | `() => void` | Open the dropdown |
| `close` | `() => void` | Close the dropdown |
| `toggle` | `() => void` | Toggle open/close |
| `isOpen` | `Ref<boolean>` | Whether dropdown is open |
| `dispose` | `() => void` | Clean up listeners |

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