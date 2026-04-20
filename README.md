# vue-toolkit

A lightweight Vue 3 runtime library for building UIs in pure TypeScript. Write components using typed element factories and `createVNode` — no templates, no JSX, no build step required.

## What it provides

- **Typed element factories** — `div`, `span`, `button`, `input`, `table` etc. that produce Vue VNodes with full TypeScript prop checking
- **`defineFn`** — stateless functional components with typed props and a render function
- **`defineTS`** — stateful components with `setup()`, reactive state, and lifecycle hooks
- **`h()`** — typed component instantiation with prop inference
- **`withMemo` / `createMemoCache`** — fine-grained memoisation for expensive render subtrees
- **Form handling** — submission and validation composables using any Standard Schema library (`@jayobado/vue-toolkit/form`)
- **Data fetching** — `useQuery` (with optional caching) and `useMutation` composables with reactive re-fetching and retry (`@jayobado/vue-toolkit/query`)
- **Components** — unstyled `formField`, `formGroup`, and `dataTable` helpers (`@jayobado/vue-toolkit/components`)
- **Interactive components** — unstyled `useModal`, `useToaster`, `useTooltip`, `useDropdown` with transition support (`@jayobado/vue-toolkit/components`)
- **Primitives** — `useMediaQuery`, `useLocalStorage`, `useDebounce`, `useInterval`, `useEventListener`, `usePagination`, `useSelection`, `useClipboard`, `createPortal`, `useClickOutside`, `useEscapeKey`, `useFocusTrap`, `useScrollLock`, `computePosition`, `enter`, `leave` (`@jayobado/vue-toolkit/primitives`)

## Styling

vue-toolkit is style-agnostic. It does not include a CSS engine — use any styling approach you prefer: Tailwind, vanilla CSS, CSS modules, or [`@jayobado/lolo-css`](https://github.com/jayobado/lolo-css) for atomic CSS-in-JS. All components accept `class` strings; the consumer is responsible for generating them.

```typescript
// Example with @jayobado/lolo-css
import { css } from '@jayobado/lolo-css'
import { div } from '@jayobado/vue-toolkit'

div({ class: css({ display: 'flex', gap: 16 }) }, 'Hello')

// Example with Tailwind
div({ class: 'flex gap-4' }, 'Hello')

// Example with plain CSS
div({ class: 'container' }, 'Hello')
```

## What it is not

- A full framework — it does not include a router, state manager, or CSS engine
- A replacement for Vue's template compiler — it is an alternative authoring style for teams that prefer pure TypeScript
- SSR-specific — rendering uses Vue's standard `renderToString` and hydration APIs

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

### Deno (JSR)

```bash
deno add @jayobado/vue-toolkit
```

Or add to your `deno.json`:
```json
{
  "imports": {
    "@jayobado/vue-toolkit": "jsr:@jayobado/vue-toolkit@^0.2.0",
    "vue": "npm:vue@^3.5.13"
  }
}
```

> **Important:** Always declare `vue` in your own `deno.json`. This ensures a single Vue instance is shared. Two Vue instances will break `inject`, `provide`, and reactivity across component boundaries.

### Node / Bun / npm

```bash
npm install @jayobado/vue-toolkit vue
```

```typescript
import { div, defineTS } from '@jayobado/vue-toolkit'
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

---

## Quick start

```typescript
import {
  defineTS, defineFn,
  div, h1, span, button, input,
  h,
} from '@jayobado/vue-toolkit'
import { createApp, ref } from 'vue'

const Badge = defineFn({
  name: 'Badge',
  props: {
    label:   { type: String, required: true  as const },
    variant: { type: String, default: 'info' },
  },
  render({ label, variant }) {
    return span({ class: `badge badge--${variant}` }, label)
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
      { class: 'counter' },
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
} from '@jayobado/vue-toolkit'

div(null, 'Hello')
div({ class: 'container', id: 'main' }, 'Hello')
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
| `id` | `string` | Element ID |
| `role` | `string` | ARIA role |
| `tabIndex` | `number` | Tab order |
| `key` | `string \| number` | Vue key for list rendering |
| `aria-label` | `string` | ARIA label |
| `onClick` | `(e: MouseEvent) => void` | Click handler |
| `onInput` | `(e: Event) => void` | Input handler |
| `onChange` | `(e: Event) => void` | Change handler |
| `onSubmit` | `(e: Event) => void` | Submit handler |
| `onKeydown` | `(e: KeyboardEvent) => void` | Keydown handler |
| `onFocus` | `(e: FocusEvent) => void` | Focus handler |
| `onBlur` | `(e: FocusEvent) => void` | Blur handler |

Specialised prop interfaces are available for `input` (`InputElProps`), `button` (`ButtonElProps`), and `a` (`AnchorElProps`).

## Components

### `defineFn` — functional component

Stateless and presentational. No reactive state, no lifecycle hooks.

```typescript
import { defineFn, span } from '@jayobado/vue-toolkit'
import type { PropType } from 'vue'

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
import { defineTS, div, span, button } from '@jayobado/vue-toolkit'
import { ref, computed, onMounted } from 'vue'

const UserList = defineTS({
  name: 'UserList',
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
import { h } from '@jayobado/vue-toolkit'

h(StatusBadge, { label: 'OK', variant: 'success' })
h(UserList,    { title: 'Users', pageSize: 20 })
h(Card,        { title: 'Details' }, div(null, 'Content'))
```

## Memoisation

```typescript
import { withMemo, createMemoCache, defineTS, div, span } from '@jayobado/vue-toolkit'

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
    await api.createUser(validated)
  },
)
```

#### Full component example

```typescript
import { defineTS, div, input, button, span } from '@jayobado/vue-toolkit'
import { useSubmit, flatten } from '@jayobado/vue-toolkit/form'
import { reactive } from 'vue'
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

#### Return values

| Property | Type | Description |
|---|---|---|
| `result` | `Ref<StandardSchemaV1.Result>` | Raw validation result |
| `output` | `Ref<T \| undefined>` | Validated output (undefined if invalid) |
| `errors` | `Ref<TErrors \| undefined>` | Formatted errors (undefined if valid) |

### `flatten` — error formatter

Converts Standard Schema issues into a flat structure with `root` and `nested` errors.

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
import { useQuery, useMutation, invalidate, invalidatePrefix } from '@jayobado/vue-toolkit/query'
```

### `useQuery` — reactive data fetching

Fetches data and re-fetches automatically when reactive dependencies change. Supports optional cache key for request deduplication and stale-while-revalidate.

#### Basic usage

```typescript
import { useQuery } from '@jayobado/vue-toolkit/query'

const { data, error, loading, refetch } = useQuery(
  () => api.users.list({ page: 1 }),
)
```

#### With caching

When a `key` is provided, queries with the same key share state and deduplicate in-flight requests. Multiple components calling `useQuery` with the same key make one request.

```typescript
import { ref } from 'vue'
import { useQuery } from '@jayobado/vue-toolkit/query'

const page = ref(1)

const { data, loading } = useQuery(
  () => api.users.list({ page: page.value }),
  {
    key: () => ['users', page.value],
    staleTime: 30_000,  // consider data fresh for 30s
    gcTime: 300_000,    // keep unused entries for 5 min
  },
)
```

#### Reactive dependencies (uncached)

When no `key` is provided, any refs read inside the query function are tracked and the query re-fetches automatically:

```typescript
const page = ref(1)

const { data, loading } = useQuery(
  () => api.users.list({ page: page.value }),
)

// Changing page triggers a re-fetch
page.value = 2
```

#### Conditional fetching

```typescript
const userId = ref<string | null>(null)

const { data, loading } = useQuery(
  () => api.users.getById({ id: userId.value! }),
  { enabled: () => !!userId.value },
)
```

#### Cache invalidation

```typescript
import { useMutation, invalidate, invalidatePrefix } from '@jayobado/vue-toolkit/query'

const { mutate } = useMutation(
  (input) => api.users.create(input),
  {
    onSuccess: () => {
      invalidate(['users'])           // invalidate exact key
      invalidatePrefix(['users'])     // invalidate all keys starting with ['users', ...]
    },
  },
)
```

#### Options

| Option | Type | Description |
|---|---|---|
| `key` | `MaybeRefOrGetter<unknown[]>` | Cache key — enables deduplication and stale-while-revalidate |
| `staleTime` | `number` | Ms before cached data is considered stale (default: `0` = always stale) |
| `gcTime` | `number` | Ms to keep unused cache entries (default: `300000` = 5 min) |
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
| `refetch` | `() => void \| Promise<void>` | Manually trigger a re-fetch |
| `invalidate` | `() => void` | Mark this query's cache entry as stale |

### `useMutation` — imperative async operations

Wraps any async function with loading, error, and result state.

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
| Fetch with deduplication and caching | `useQuery` with `key` |
| Submit a form with validation | `useSubmit` (from `@jayobado/vue-toolkit/form`) |
| Delete, toggle, or any non-form write operation | `useMutation` |
| Real-time input validation | `useParse` (from `@jayobado/vue-toolkit/form`) |

## Components

The `@jayobado/vue-toolkit/components` subpath provides render helpers and interactive composables. All are unstyled — pass `class` strings to control appearance.

```typescript
import { formField, formGroup, dataTable } from '@jayobado/vue-toolkit/components'
```

### `formField` — label + input + error

Wraps a label, input (passed as children), and optional error message into a `div`. The label is linked to the input via the `for` attribute, and errors use `role="alert"` for accessibility.

```typescript
import { formField } from '@jayobado/vue-toolkit/components'
import { input } from '@jayobado/vue-toolkit'

formField(
  { label: 'Email', name: 'email', required: true },
  input({ name: 'email', type: 'email', placeholder: 'you@example.com' }),
)
```

#### With error display

```typescript
formField(
  {
    label: 'Email',
    name: 'email',
    error: errors.value?.nested?.email?.[0],
    required: true,
    class: 'form-field',
    labelClass: 'form-label',
    errorClass: 'form-error',
  },
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
| `labelClass` | `string` | CSS class on label |
| `errorClass` | `string` | CSS class on error span |

### `formGroup` — fieldset + legend

Groups related fields inside a `fieldset` with an optional `legend`.

```typescript
import { formGroup, formField } from '@jayobado/vue-toolkit/components'
import { input } from '@jayobado/vue-toolkit'

formGroup(
  { legend: 'Billing address', class: 'field-group' },
  formField({ label: 'Street', name: 'street' }, input({ name: 'street' })),
  formField({ label: 'City', name: 'city' }, input({ name: 'city' })),
  formField({ label: 'Zip', name: 'zip' }, input({ name: 'zip' })),
)
```

#### Props

| Prop | Type | Description |
|---|---|---|
| `legend` | `string` | Legend text |
| `class` | `string` | CSS class on fieldset |
| `legendClass` | `string` | CSS class on legend |

### `dataTable` — column-driven table

Takes a column definition and rows array, handles `thead`/`tbody`/`tr`/`td` boilerplate. No built-in sorting or pagination — use refs and `useQuery` for that.

```typescript
import { dataTable } from '@jayobado/vue-toolkit/components'
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

dataTable({
  columns,
  rows: users.value,
  class: 'data-table',
  onRowClick: (row) => navigateTo(`/users/${row.id}`),
  emptyText: 'No users found',
})
```

#### Column definition

| Property | Type | Description |
|---|---|---|
| `key` | `string` | Property name to read from row (used when no `render`) |
| `header` | `string` | Column header text |
| `render` | `(row, index) => VNode \| string` | Custom cell renderer |
| `headerClass` | `string` | CSS class on `th` |
| `cellClass` | `string` | CSS class on `td` |

#### Table props

| Prop | Type | Description |
|---|---|---|
| `columns` | `Column<T>[]` | Column definitions (required) |
| `rows` | `T[]` | Data rows (required) |
| `class` | `string` | CSS class on `table` |
| `headerClass` | `string` | CSS class on header `tr` |
| `rowClass` | `string \| (row, index) => string` | Static or per-row class |
| `emptyText` | `string` | Text when rows is empty (default: `'No data'`) |
| `rowKey` | `(row, index) => string \| number` | Key extraction for list rendering |
| `onRowClick` | `(row, index) => void` | Row click handler |

## Interactive components

The `@jayobado/vue-toolkit/components` subpath also provides unstyled interactive components built on top of the primitives. All support CSS transitions via `TransitionClasses`.

### `useModal` — dialog with focus trapping and scroll lock

Creates a backdrop and content wrapper. Supports enter/leave transitions, escape key, focus trapping, and scroll locking.

```typescript
import { useModal } from '@jayobado/vue-toolkit/components'

const { open, close, isOpen, contentEl } = useModal({
  class: 'modal-content',
  backdropClass: 'modal-backdrop',
})
```

#### Adding content

Append your content to `contentEl` after opening:

```typescript
import { defineTS, div, h2, p, button } from '@jayobado/vue-toolkit'
import { useModal } from '@jayobado/vue-toolkit/components'

const ConfirmDialog = defineTS({
  name: 'ConfirmDialog',
  props: {},
  setup() {
    const { open, close, isOpen, contentEl } = useModal({
      class: 'modal-content',
      backdropClass: 'modal-backdrop',
      onOpen: () => {
        if (contentEl.value) {
          contentEl.value.append(
            h2(null, 'Are you sure?'),
            p(null, 'This action cannot be undone.'),
            div({ class: 'modal-actions' },
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

#### With transitions

```typescript
const { open, close } = useModal({
  class: 'modal-content',
  backdropClass: 'modal-backdrop',
  transition: {
    enterFrom: 'modal-enter-from',
    enterActive: 'modal-enter-active',
    enterTo: 'modal-enter-to',
    leaveFrom: 'modal-leave-from',
    leaveActive: 'modal-leave-active',
    leaveTo: 'modal-leave-to',
  },
  backdropTransition: {
    enterFrom: 'backdrop-enter-from',
    enterActive: 'backdrop-enter-active',
    enterTo: 'backdrop-enter-to',
    leaveFrom: 'backdrop-leave-from',
    leaveActive: 'backdrop-leave-active',
    leaveTo: 'backdrop-leave-to',
  },
})
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | — | CSS class on content wrapper |
| `backdropClass` | `string` | — | CSS class on backdrop |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on escape key |
| `trapFocus` | `boolean` | `true` | Trap tab navigation inside modal |
| `lockScroll` | `boolean` | `true` | Prevent body scrolling |
| `transition` | `TransitionClasses` | — | Enter/leave transition on content |
| `backdropTransition` | `TransitionClasses` | — | Enter/leave transition on backdrop |
| `onOpen` | `() => void` | — | Called after modal opens |
| `onClose` | `() => void` | — | Called after modal closes |

#### Return values

| Property | Type | Description |
|---|---|---|
| `open` | `() => void` | Open the modal |
| `close` | `() => Promise<void>` | Close the modal (awaits leave transition) |
| `isOpen` | `Ref<boolean>` | Whether modal is open |
| `backdropEl` | `Ref<HTMLElement \| null>` | Backdrop element ref |
| `contentEl` | `Ref<HTMLElement \| null>` | Content wrapper ref |

### `useToaster` — toast notifications

Creates a global toast container. Call `show()` from anywhere — no component context needed.

```typescript
import { useToaster } from '@jayobado/vue-toolkit/components'

const toast = useToaster({
  containerClass: 'toast-container',
  variantClass: {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
    warning: 'toast-warning',
  },
})

// Use anywhere
toast.show('User created', { variant: 'success' })
toast.show('Something went wrong', { variant: 'error', duration: 5000 })
toast.show('Persistent message', { duration: 0 }) // 0 = no auto-dismiss
```

#### With transitions

```typescript
const toast = useToaster({
  containerClass: 'toast-container',
  transition: {
    enterFrom: 'toast-enter-from',
    enterActive: 'toast-enter-active',
    enterTo: 'toast-enter-to',
    leaveFrom: 'toast-leave-from',
    leaveActive: 'toast-leave-active',
    leaveTo: 'toast-leave-to',
  },
})
```

#### Toast options

| Option | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | `3000` | Auto-dismiss delay in ms (`0` = persistent) |
| `variant` | `ToastVariant` | `'info'` | `'info'` \| `'success'` \| `'warning'` \| `'error'` |
| `class` | `string` | — | CSS class on toast element |
| `dismissible` | `boolean` | `true` | Click to dismiss |
| `transition` | `TransitionClasses` | — | Per-toast transition override |

#### Toaster options

| Option | Type | Description |
|---|---|---|
| `containerClass` | `string` | CSS class on container |
| `variantClass` | `Record<ToastVariant, string>` | CSS class per variant |
| `transition` | `TransitionClasses` | Default transition for all toasts |

### `useTooltip` — hover/focus tooltip

Attaches a tooltip to a trigger element. Positioned automatically with viewport flipping.

```typescript
import { useTooltip } from '@jayobado/vue-toolkit/components'

const btn = document.createElement('button')
btn.textContent = 'Hover me'

useTooltip(btn, {
  text: 'This is a tooltip',
  placement: 'top',
  class: 'tooltip',
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

### `useDropdown` — accessible dropdown menu

Attaches a dropdown menu to a trigger element with keyboard navigation (arrow keys, enter, escape). The trigger element is automatically excluded from click-outside detection.

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
  class: 'dropdown-menu',
  itemClass: 'dropdown-item',
  activeItemClass: 'dropdown-item--active',
  disabledItemClass: 'dropdown-item--disabled',
})

btn.addEventListener('click', toggle)
```

#### With transitions

```typescript
const { toggle } = useDropdown(btn, {
  items: [...],
  class: 'dropdown-menu',
  transition: {
    enterFrom: 'dropdown-enter-from',
    enterActive: 'dropdown-enter-active',
    enterTo: 'dropdown-enter-to',
    leaveFrom: 'dropdown-leave-from',
    leaveActive: 'dropdown-leave-active',
    leaveTo: 'dropdown-leave-to',
  },
})
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | `DropdownItem[]` | — | Menu items (required) |
| `placement` | `Placement` | `'bottom'` | Preferred position |
| `offset` | `number` | `4` | Gap between trigger and menu in px |
| `class` | `string` | — | CSS class on menu container |
| `itemClass` | `string` | — | CSS class on each item |
| `activeItemClass` | `string` | — | CSS class for keyboard/hover active item |
| `disabledItemClass` | `string` | — | CSS class for disabled items |
| `transition` | `TransitionClasses` | — | Enter/leave transition on menu |
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
| `close` | `() => Promise<void>` | Close the dropdown (awaits leave transition) |
| `toggle` | `() => void` | Toggle open/close |
| `isOpen` | `Ref<boolean>` | Whether dropdown is open |
| `dispose` | `() => void` | Clean up listeners |

## Primitives

The `@jayobado/vue-toolkit/primitives` subpath provides low-level building blocks for interactive UI patterns.

```typescript
import {
  createPortal, useClickOutside, useEscapeKey,
  useFocusTrap, useScrollLock, computePosition,
  enter, leave,
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

Uses two-phase detection (pointerdown + click) with `composedPath()` for shadow DOM support. Listens in capture phase for reliability. Supports an `ignore` list of refs or CSS selectors.

```typescript
import { useClickOutside } from '@jayobado/vue-toolkit/primitives'
import { ref } from 'vue'

const menuEl = ref<HTMLElement | null>(null)

const dispose = useClickOutside(menuEl, () => {
  console.log('clicked outside')
})

// With ignore list
const triggerEl = ref<HTMLElement | null>(null)

useClickOutside(menuEl, () => close(), [
  triggerEl,          // ignore clicks on this ref
  '.ignore-clicks',   // ignore clicks matching this CSS selector
])
```

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

Placement options: `'top'` | `'bottom'` | `'left'` | `'right'` — defaults to `'bottom'`.

### `enter` / `leave` — CSS transition helpers

Apply enter/leave transitions using CSS classes. Works with any class source — Tailwind, CSS modules, `@jayobado/lolo-css`, or plain CSS.

```typescript
import { enter, leave } from '@jayobado/vue-toolkit/primitives'

// Enter transition
await enter(element, {
  enterFrom: 'opacity-0 scale-95',
  enterActive: 'transition-all duration-150 ease-out',
  enterTo: 'opacity-100 scale-100',
})

// Leave transition
await leave(element, {
  leaveFrom: 'opacity-100 scale-100',
  leaveActive: 'transition-all duration-100 ease-in',
  leaveTo: 'opacity-0 scale-95',
})
```

Both functions return a `Promise` that resolves when the transition completes. If no CSS transition or animation is defined, they resolve immediately.

#### TransitionClasses

| Property | Type | Description |
|---|---|---|
| `enterFrom` | `string` | Class applied before enter starts |
| `enterActive` | `string` | Class applied during enter |
| `enterTo` | `string` | Class applied after enter starts |
| `leaveFrom` | `string` | Class applied before leave starts |
| `leaveActive` | `string` | Class applied during leave |
| `leaveTo` | `string` | Class applied after leave starts |

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

useEventListener(window, 'resize', (e) => {
  console.log(window.innerWidth)
})

useEventListener(document, 'scroll', handler, { passive: true })
```

### `usePagination` — page state management

Manages pagination state and derived values. Combine with `useQuery` and `dataTable`.

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

toggle(user.id)

input({
  type: 'checkbox',
  checked: isSelected(user.id),
  onChange: () => toggle(user.id),
})

button({ onClick: () => selectAll(users.value.map(u => u.id)) }, 'Select all')
button({ onClick: clear }, `Clear (${count.value})`)
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

## License

MIT