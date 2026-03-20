# Form Engine

UI Kit v2 includes a complete form state management system with zero external dependencies. It replaces the v1 `react-hook-form` wrappers with a built-in solution: `createForm()`, `useForm()`, composable validators, and auto-wiring via `<Form>` context.

## Quick Start

```tsx
import { createForm, useForm, v, Form } from '@annondeveloper/ui-kit/form'
import { FormInput, Button } from '@annondeveloper/ui-kit'

// 1. Define the form (can be at module scope, outside React)
const loginForm = createForm({
  fields: {
    email:    { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.pipe(v.required(), v.minLength(8)) },
  },
  onSubmit: async (values) => {
    await api.login(values.email, values.password)
  },
  onError: (errors) => {
    console.log('Validation failed:', errors)
  },
})

// 2. Use inside a component
function LoginPage() {
  const form = useForm(loginForm)

  return (
    <Form form={form}>
      <FormInput label="Email" type="email" {...form.getFieldProps('email')} />
      <FormInput label="Password" type="password" {...form.getFieldProps('password')} />
      <Button type="submit" loading={form.submitting} disabled={!form.valid}>
        Log In
      </Button>
    </Form>
  )
}
```

## createForm()

`createForm()` produces a plain configuration object. It can be called at module scope (outside React) since it has no side effects.

```tsx
const myForm = createForm({
  fields: { ... },
  onSubmit: (values) => { ... },
  onError: (errors) => { ... },     // optional
  validateOn: 'blur',                // 'blur' | 'change' | 'submit' (default: 'blur')
  revalidateOn: 'change',            // 'change' | 'blur' | 'submit' (default: 'change')
})
```

### Field configuration

Each field in `fields` has:

| Property | Type | Description |
|----------|------|-------------|
| `initial` | `unknown` | Initial value (string, number, boolean, array, object) |
| `validate` | `ValidatorFn` | Sync validator (optional) |
| `validateAsync` | `AsyncValidatorFn` | Async validator (optional) |

### Validation timing

| Option | When validation runs |
|--------|---------------------|
| `validateOn: 'blur'` | First validation on field blur (default) |
| `validateOn: 'change'` | Validate on every keystroke |
| `validateOn: 'submit'` | Only validate on form submission |
| `revalidateOn: 'change'` | After first validation, re-check on every change (default) |
| `revalidateOn: 'blur'` | After first validation, re-check on blur |

The default combination (`validateOn: 'blur'` + `revalidateOn: 'change'`) gives the best UX: no errors appear while the user is still typing, but once an error is shown, it clears immediately when corrected.

## useForm()

`useForm()` takes a `FormDefinition` and returns reactive form state.

```tsx
const form = useForm(myFormDefinition)
```

### Returned state

| Property | Type | Description |
|----------|------|-------------|
| `values` | `Record<string, unknown>` | Current field values |
| `errors` | `Record<string, string>` | Current validation errors |
| `touched` | `Record<string, boolean>` | Which fields have been blurred |
| `dirty` | `boolean` | Whether any value has changed from initial |
| `valid` | `boolean` | Whether all fields pass validation |
| `submitting` | `boolean` | Whether `onSubmit` is currently executing |
| `submitCount` | `number` | Number of submission attempts |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setValue` | `(name, value) => void` | Set a field value |
| `setError` | `(name, message?) => void` | Manually set/clear a field error |
| `setTouched` | `(name, touched?) => void` | Mark a field as touched |
| `validateField` | `(name) => string?` | Validate a single field, returns error |
| `validateAll` | `() => boolean` | Validate all fields, returns `true` if valid |
| `handleSubmit` | `() => Promise<void>` | Validate and submit the form |
| `reset` | `(name?) => void` | Reset one field or the entire form |
| `getFieldProps` | `(name) => FieldProps` | Get props to spread on an input |

### getFieldProps()

The `getFieldProps()` method returns an object that can be spread directly onto form components:

```tsx
const props = form.getFieldProps('email')
// Returns:
// {
//   value: 'user@example.com',
//   onChange: (value) => { ... },
//   onBlur: () => { ... },
//   error: 'Invalid email address',  // or undefined
//   touched: true,                     // or false
// }

<FormInput label="Email" {...props} />
```

## Validators

The `v` object provides 12 composable validators. All validators skip empty values by default (compose with `v.required()` to reject empty).

### v.required()

Rejects `null`, `undefined`, empty strings, and whitespace-only strings. Booleans (including `false`) are always valid, which is correct for checkbox fields.

```tsx
v.required()                           // "This field is required"
v.required('Please enter your name')   // Custom message
```

### v.email()

Validates email format (simplified RFC 5322).

```tsx
v.email()                              // "Invalid email address"
v.email('Please enter a valid email')
```

### v.url()

Validates URL format using the `URL` constructor.

```tsx
v.url()                                // "Invalid URL"
```

### v.minLength() / v.maxLength()

String length constraints.

```tsx
v.minLength(3)                         // "Must be at least 3 characters"
v.maxLength(100)                       // "Must be at most 100 characters"
v.minLength(8, 'Password too short')   // Custom message
```

### v.min() / v.max()

Numeric value constraints. Accepts numbers and numeric strings.

```tsx
v.min(0)                               // "Must be at least 0"
v.max(100)                             // "Must be at most 100"
v.min(1, 'Must be positive')
```

### v.pattern()

Regex pattern match.

```tsx
v.pattern(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
v.pattern(/^\d{3}-\d{4}$/, 'Format: 123-4567')
```

### v.match()

Cross-field validation (e.g., confirm password). Compares against another field's value.

```tsx
v.match('password', 'Passwords do not match')
```

### v.oneOf()

Value must be one of a set of options.

```tsx
v.oneOf(['admin', 'editor', 'viewer'], 'Invalid role')
```

### v.custom()

Custom synchronous validator. Return `true`/`undefined` for valid, or an error string.

```tsx
v.custom((value) => {
  if (typeof value === 'string' && value.includes('admin')) {
    return 'Username cannot contain "admin"'
  }
  return true
})

// With cross-field access
v.custom((value, allValues) => {
  if (allValues?.startDate && value < allValues.startDate) {
    return 'End date must be after start date'
  }
  return true
})
```

### v.async()

Asynchronous validator with built-in debounce. Useful for server-side validation (e.g., checking username availability).

```tsx
v.async(
  async (value) => {
    const taken = await api.checkUsername(value as string)
    if (taken) return 'Username is already taken'
    return undefined
  },
  { debounce: 300 }  // default: 300ms
)
```

Rapid calls within the debounce window cancel previous pending validations, preventing race conditions.

### v.pipe()

Compose multiple validators. Runs in order and returns the first error (short-circuit).

```tsx
v.pipe(
  v.required(),
  v.minLength(3),
  v.maxLength(20),
  v.pattern(/^[a-z0-9]+$/, 'Lowercase alphanumeric only'),
)
```

## Form Component

The `<Form>` component wraps a native `<form>` element and provides form context to child components.

```tsx
import { Form } from '@annondeveloper/ui-kit/form'

<Form form={form} className="space-y-4">
  {/* Child components can auto-wire via useFormContext() */}
</Form>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `form` | `FormState` | required | Form state from `useForm()` |
| `children` | `ReactNode` | required | Form contents |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles |
| `noValidate` | `boolean` | `true` | Disable native browser validation |
| `onSubmit` | `() => void` | -- | Called after successful submission |

The `<Form>` component:
- Prevents default form submission
- Validates all fields before calling `onSubmit`
- Provides form context for auto-wiring

## Field Arrays

`<FieldArray>` manages dynamic form fields (tags, line items, invoice rows) using a render prop pattern.

```tsx
import { createForm, useForm, v, Form, FieldArray } from '@annondeveloper/ui-kit/form'
import { FormInput, Button } from '@annondeveloper/ui-kit'

const invoiceForm = createForm({
  fields: {
    customer: { initial: '', validate: v.required() },
    items: { initial: [{ name: '', amount: 0 }] },
  },
  onSubmit: (values) => console.log(values),
})

function InvoiceForm() {
  const form = useForm(invoiceForm)

  return (
    <Form form={form}>
      <FormInput label="Customer" {...form.getFieldProps('customer')} />

      <FieldArray name="items">
        {({ fields, append, remove, move, insert }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key} style={{ display: 'flex', gap: '0.5rem' }}>
                <FormInput
                  label={`Item ${index + 1}`}
                  {...form.getFieldProps(`items.${index}.name`)}
                />
                <Button variant="ghost" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => append({ name: '', amount: 0 })}>
              Add Item
            </Button>
          </>
        )}
      </FieldArray>

      <Button type="submit">Submit Invoice</Button>
    </Form>
  )
}
```

### FieldArray render props

| Prop | Type | Description |
|------|------|-------------|
| `fields` | `{ key: string }[]` | Array items with stable React keys |
| `append` | `(defaults?) => void` | Add an item to the end |
| `remove` | `(index) => void` | Remove item at index |
| `move` | `(from, to) => void` | Reorder an item |
| `insert` | `(index, defaults?) => void` | Insert at a specific position |

The `key` property on each field item is a stable identifier that persists across reorders and removals, ensuring correct React reconciliation.

## Form Context Auto-Wiring

When components are rendered inside a `<Form>`, they can access the form state via `useFormContext()`:

```tsx
import { useFormContext } from '@annondeveloper/ui-kit/form'

function SubmitButton() {
  const form = useFormContext()
  return (
    <Button
      type="submit"
      loading={form.submitting}
      disabled={!form.dirty || !form.valid}
    >
      Save Changes
    </Button>
  )
}
```

This allows building reusable form components that automatically connect to the nearest `<Form>` ancestor without prop drilling.

## Complete Example

```tsx
import { createForm, useForm, v, Form, FieldArray } from '@annondeveloper/ui-kit/form'
import { FormInput, Select, Checkbox, Button } from '@annondeveloper/ui-kit'

const registrationForm = createForm({
  fields: {
    name:            { initial: '', validate: v.pipe(v.required(), v.minLength(2)) },
    email:           { initial: '', validate: v.pipe(v.required(), v.email()) },
    password:        { initial: '', validate: v.pipe(v.required(), v.minLength(8)) },
    confirmPassword: { initial: '', validate: v.pipe(v.required(), v.match('password', 'Passwords must match')) },
    role:            { initial: '', validate: v.required() },
    acceptTerms:     { initial: false, validate: v.custom((v) => v === true ? true : 'You must accept the terms') },
  },
  onSubmit: async (values) => {
    await api.register(values)
  },
  onError: (errors) => {
    // Focus first field with error
    const firstErrorField = Object.keys(errors)[0]
    document.querySelector(`[name="${firstErrorField}"]`)?.focus()
  },
  validateOn: 'blur',
  revalidateOn: 'change',
})

function RegistrationPage() {
  const form = useForm(registrationForm)

  return (
    <Form form={form}>
      <FormInput label="Full Name" {...form.getFieldProps('name')} />
      <FormInput label="Email" type="email" {...form.getFieldProps('email')} />
      <FormInput label="Password" type="password" {...form.getFieldProps('password')} />
      <FormInput label="Confirm Password" type="password" {...form.getFieldProps('confirmPassword')} />
      <Select
        label="Role"
        options={[
          { value: 'developer', label: 'Developer' },
          { value: 'designer', label: 'Designer' },
          { value: 'manager', label: 'Manager' },
        ]}
        {...form.getFieldProps('role')}
      />
      <Checkbox label="I accept the terms of service" {...form.getFieldProps('acceptTerms')} />
      <Button type="submit" loading={form.submitting}>
        Create Account
      </Button>

      {form.submitCount > 0 && !form.valid && (
        <p>Please fix the errors above before submitting.</p>
      )}
    </Form>
  )
}
```
