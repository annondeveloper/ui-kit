import { useState, useCallback } from 'react'
import { ComponentShowcase } from '../components/ComponentShowcase'
import type { PropDef } from '../components/PropsTable'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { Combobox } from '@ui/components/combobox'
import { SearchInput } from '@ui/components/search-input'
import { Rating } from '@ui/components/rating'
import { OtpInput } from '@ui/components/otp-input'
import { TagInput } from '@ui/components/tag-input'
import { DatePicker } from '@ui/components/date-picker'
import { Checkbox } from '@ui/components/checkbox'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Divider } from '@ui/components/divider'
import { CopyBlock } from '@ui/domain/copy-block'
import { createForm } from '@ui/core/forms/create-form'
import { useForm } from '@ui/core/forms/use-form'
import { Form } from '@ui/core/forms/form-component'
import { v } from '@ui/core/forms/validators'
import { Icon } from '@ui/core/icons/icon'

// ─── Form Engine Demo ────────────────────────────────────────────────────────

const registrationForm = createForm({
  fields: {
    name: { initial: '', validate: v.pipe(v.required(), v.minLength(2)) },
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.pipe(v.required(), v.minLength(8)) },
  },
  onSubmit: async (values) => alert(JSON.stringify(values, null, 2)),
})

// ─── Option Data ─────────────────────────────────────────────────────────────

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'pm', label: 'Project Manager' },
]

const countryOptions = [
  { value: 'us', label: 'United States', description: 'North America' },
  { value: 'uk', label: 'United Kingdom', description: 'Europe' },
  { value: 'de', label: 'Germany', description: 'Europe' },
  { value: 'jp', label: 'Japan', description: 'Asia' },
  { value: 'au', label: 'Australia', description: 'Oceania' },
  { value: 'br', label: 'Brazil', description: 'South America' },
  { value: 'ca', label: 'Canada', description: 'North America' },
  { value: 'fr', label: 'France', description: 'Europe' },
]

const frameworkOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' },
]

// ─── Props Definitions ───────────────────────────────────────────────────────

const formInputProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Field name, used for form context integration' },
  { name: 'label', type: 'ReactNode', description: 'Label displayed above the input' },
  { name: 'description', type: 'string', description: 'Helper text below the input' },
  { name: 'error', type: 'string', description: 'Error message shown in red below the input' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input size variant' },
  { name: 'variant', type: "'default' | 'filled'", default: "'default'", description: 'Visual style variant' },
  { name: 'icon', type: 'ReactNode', description: 'Icon rendered at the start of the input' },
  { name: 'iconEnd', type: 'ReactNode', description: 'Icon rendered at the end of the input' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

const selectProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Field name for form integration' },
  { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of { value, label, disabled?, icon?, group? }' },
  { name: 'value', type: 'string | string[]', description: 'Controlled selected value(s)' },
  { name: 'onChange', type: '(value: string | string[]) => void', description: 'Called when selection changes' },
  { name: 'placeholder', type: 'string', description: 'Placeholder when no value selected' },
  { name: 'label', type: 'ReactNode', description: 'Label above the select' },
  { name: 'error', type: 'string', description: 'Error message' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable type-ahead filtering' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow selecting multiple options' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Show a clear button' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size variant' },
]

const comboboxProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Field name for form integration' },
  { name: 'options', type: 'ComboboxOption[]', required: true, description: 'Array of { value, label, disabled?, icon?, description? }' },
  { name: 'value', type: 'string', description: 'Controlled selected value' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called when selection changes' },
  { name: 'onSearch', type: '(query: string) => void', description: 'Called on search input change for async filtering' },
  { name: 'placeholder', type: 'string', description: 'Input placeholder text' },
  { name: 'label', type: 'ReactNode', description: 'Label above the combobox' },
  { name: 'allowCreate', type: 'boolean', default: 'false', description: 'Allow creating new options from typed input' },
  { name: 'onCreate', type: '(value: string) => void', description: 'Called when a new value is created' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading indicator while fetching' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size variant' },
]

const searchInputProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled search value' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called with the current input value' },
  { name: 'onSearch', type: '(value: string) => void', description: 'Called after debounce with the final search term' },
  { name: 'onClear', type: '() => void', description: 'Called when the clear button is clicked' },
  { name: 'debounce', type: 'number', default: '300', description: 'Debounce delay in milliseconds' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner in the input' },
  { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button when value is non-empty' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input size variant' },
]

const ratingProps: PropDef[] = [
  { name: 'value', type: 'number', description: 'Controlled rating value' },
  { name: 'defaultValue', type: 'number', description: 'Initial uncontrolled value' },
  { name: 'onChange', type: '(value: number) => void', description: 'Called when rating changes' },
  { name: 'max', type: 'number', default: '5', description: 'Maximum number of stars' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Star size' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevent user interaction' },
  { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allow half-star increments' },
  { name: 'icon', type: 'ReactNode', description: 'Custom filled star icon' },
  { name: 'emptyIcon', type: 'ReactNode', description: 'Custom empty star icon' },
  { name: 'color', type: 'string', description: 'Star color (CSS value)' },
]

const otpInputProps: PropDef[] = [
  { name: 'length', type: 'number', default: '6', description: 'Number of OTP digits' },
  { name: 'value', type: 'string', description: 'Controlled OTP value' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called on each digit change' },
  { name: 'onComplete', type: '(value: string) => void', description: 'Called when all digits are filled' },
  { name: 'type', type: "'number' | 'text'", default: "'number'", description: 'Input type for each digit' },
  { name: 'error', type: 'string', description: 'Error message shown below' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all inputs' },
  { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus first digit on mount' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Digit box size' },
]

const tagInputProps: PropDef[] = [
  { name: 'tags', type: 'string[]', required: true, description: 'Current array of tags' },
  { name: 'onChange', type: '(tags: string[]) => void', required: true, description: 'Called when tags change' },
  { name: 'placeholder', type: 'string', description: 'Input placeholder text' },
  { name: 'maxTags', type: 'number', description: 'Maximum number of allowed tags' },
  { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Allow duplicate tag values' },
  { name: 'validate', type: '(tag: string) => boolean', description: 'Custom validation function for new tags' },
  { name: 'error', type: 'string', description: 'Error message shown below' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input size variant' },
]

const datePickerProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled date value (ISO format YYYY-MM-DD)' },
  { name: 'onChange', type: '(date: string) => void', description: 'Called with selected date in ISO format' },
  { name: 'min', type: 'string', description: 'Minimum selectable date (ISO format)' },
  { name: 'max', type: 'string', description: 'Maximum selectable date (ISO format)' },
  { name: 'placeholder', type: 'string', description: 'Input placeholder' },
  { name: 'label', type: 'ReactNode', description: 'Label above the picker' },
  { name: 'error', type: 'string', description: 'Error message' },
  { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Show week numbers column' },
  { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: '0 = Sunday, 1 = Monday' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input size variant' },
]

// ─── Full Form Example Code ──────────────────────────────────────────────────

const formEngineCode = `import { createForm, useForm, Form, v } from '@annondeveloper/ui-kit/form'
import { FormInput } from '@annondeveloper/ui-kit'

const registrationForm = createForm({
  fields: {
    name: { initial: '', validate: v.pipe(v.required(), v.minLength(2)) },
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.pipe(v.required(), v.minLength(8)) },
  },
  onSubmit: async (values) => alert(JSON.stringify(values, null, 2)),
})

function RegistrationForm() {
  const form = useForm(registrationForm)

  return (
    <Form form={form}>
      <FormInput
        name="name" label="Full Name" placeholder="Jane Doe"
        value={form.values.name} onChange={e => form.setValue('name', e.target.value)}
        onBlur={() => form.setTouched('name')}
        error={form.touched.name ? form.errors.name : undefined}
      />
      <FormInput
        name="email" label="Email" type="email" placeholder="you@example.com"
        value={form.values.email} onChange={e => form.setValue('email', e.target.value)}
        onBlur={() => form.setTouched('email')}
        error={form.touched.email ? form.errors.email : undefined}
      />
      <FormInput
        name="password" label="Password" type="password"
        value={form.values.password} onChange={e => form.setValue('password', e.target.value)}
        onBlur={() => form.setTouched('password')}
        error={form.touched.password ? form.errors.password : undefined}
      />
      <Button type="submit" variant="primary" loading={form.submitting}>
        Create Account
      </Button>
    </Form>
  )
}`

// ─── Page Component ──────────────────────────────────────────────────────────

export default function FormsPage() {
  const form = useForm(registrationForm)

  // Select state
  const [role, setRole] = useState('')
  const [multiRoles, setMultiRoles] = useState<string[]>([])

  // Combobox state
  const [country, setCountry] = useState('')

  // Search state
  const [searchValue, setSearchValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  // Rating state
  const [rating, setRating] = useState(0)
  const [halfRating, setHalfRating] = useState(3.5)

  // OTP state
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  // Tag state
  const [tags, setTags] = useState(['react', 'typescript', 'ui-kit'])

  // DatePicker state
  const [date, setDate] = useState('')

  const handleSearch = useCallback((value: string) => {
    setSearchLoading(true)
    setTimeout(() => setSearchLoading(false), 800)
  }, [])

  const handleOtpComplete = useCallback((value: string) => {
    if (value === '123456') {
      setOtpError('')
      alert('Verification successful!')
    } else {
      setOtpError('Invalid code. Try 123456.')
    }
  }, [])

  return (
    <div style={{ maxInlineSize: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBlockEnd: 'var(--space-xl, 2rem)' }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBlockEnd: 'var(--space-xs, 0.25rem)',
          color: 'var(--text-primary)',
        }}>
          Forms
        </h1>
        <p style={{
          fontSize: 'var(--text-base, 1rem)',
          color: 'var(--text-secondary)',
          maxInlineSize: '65ch',
          lineHeight: 1.6,
        }}>
          A complete form toolkit: from individual input components to a zero-dependency
          form engine with validation, state management, and submission handling.
        </p>
      </div>

      {/* ─── Form Engine Section ─────────────────────────────────── */}
      <section style={{ marginBlockEnd: 'var(--space-2xl, 3rem)' }}>
        <h2 style={{
          fontSize: 'var(--text-xl, 1.25rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBlockEnd: 'var(--space-sm, 0.5rem)',
        }}>
          Form Engine
        </h2>
        <p style={{
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--text-secondary)',
          marginBlockEnd: 'var(--space-lg, 1.5rem)',
          maxInlineSize: '65ch',
          lineHeight: 1.6,
        }}>
          Define forms declaratively with <code style={{ fontFamily: 'monospace', background: 'oklch(100% 0 0 / 0.06)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>createForm()</code>,
          bind them with <code style={{ fontFamily: 'monospace', background: 'oklch(100% 0 0 / 0.06)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>useForm()</code>,
          and use composable validators from the built-in <code style={{ fontFamily: 'monospace', background: 'oklch(100% 0 0 / 0.06)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>v</code> namespace.
          Zero external dependencies.
        </p>

        <Card variant="outlined" padding="none" style={{ overflow: 'hidden' }}>
          {/* Live Preview */}
          <div style={{
            padding: 'var(--space-lg, 1.5rem)',
            background: 'var(--bg-base, oklch(15% 0.01 270))',
            borderBlockEnd: '1px solid var(--border-subtle, oklch(100% 0 0 / 0.06))',
          }}>
            <Form form={form} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxInlineSize: 400 }}>
              <FormInput
                name="name"
                label="Full Name"
                placeholder="Jane Doe"
                icon={<Icon name="edit" size="sm" />}
                value={form.values.name as string}
                onChange={(e) => form.setValue('name', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setTouched('name')}
                error={form.touched.name ? form.errors.name : undefined}
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Icon name="edit" size="sm" />}
                value={form.values.email as string}
                onChange={(e) => form.setValue('email', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setTouched('email')}
                error={form.touched.email ? form.errors.email : undefined}
              />
              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                icon={<Icon name="eye-off" size="sm" />}
                value={form.values.password as string}
                onChange={(e) => form.setValue('password', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setTouched('password')}
                error={form.touched.password ? form.errors.password : undefined}
              />
              <Button type="submit" variant="primary" loading={form.submitting} style={{ marginBlockStart: 'var(--space-xs)' }}>
                Create Account
              </Button>
            </Form>
          </div>

          {/* Code */}
          <CopyBlock code={formEngineCode} language="typescript" showLineNumbers />
        </Card>
      </section>

      <Divider spacing="lg" />

      {/* ─── Individual Components ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl, 3rem)' }}>

        {/* FormInput */}
        <ComponentShowcase
          name="FormInput"
          description="A text input with integrated label, description, error message, and optional icons. Connects to the form engine via name prop."
          examples={[
            {
              title: 'Basic with label and placeholder',
              description: 'The simplest usage with a label and placeholder text.',
              code: `<FormInput
  name="username"
  label="Username"
  placeholder="Enter your username"
/>`,
              render: () => (
                <FormInput name="demo-username" label="Username" placeholder="Enter your username" />
              ),
            },
            {
              title: 'With icons and description',
              description: 'Leading and trailing icons provide visual context.',
              code: `<FormInput
  name="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  description="We will never share your email."
  icon={<Icon name="edit" size="sm" />}
/>`,
              render: () => (
                <FormInput
                  name="demo-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  description="We will never share your email."
                  icon={<Icon name="edit" size="sm" />}
                />
              ),
            },
            {
              title: 'Error state',
              description: 'Validation errors appear below the input with red styling.',
              code: `<FormInput
  name="password"
  label="Password"
  type="password"
  value="abc"
  error="Password must be at least 8 characters"
/>`,
              render: () => (
                <FormInput
                  name="demo-password"
                  label="Password"
                  type="password"
                  defaultValue="abc"
                  error="Password must be at least 8 characters"
                />
              ),
            },
          ]}
          props={formInputProps}
          sizes
          sizeComponent={(size) => (
            <FormInput
              name={`size-${size}`}
              placeholder={size}
              size={size as any}
            />
          )}
          accessibility={`Uses native <input> element with associated <label> via htmlFor.
Error messages linked via aria-describedby for screen reader announcements.
Supports all standard input keyboard interactions.
Focus ring visible with 2px offset for keyboard navigation.`}
        />

        {/* Select */}
        <ComponentShowcase
          name="Select"
          description="A dropdown select with keyboard navigation, searchable filtering, multi-select support, and CSS Anchor Positioning with JS fallback."
          examples={[
            {
              title: 'Single select',
              description: 'Choose one option from a dropdown list.',
              code: `<Select
  name="role"
  label="Role"
  placeholder="Choose a role..."
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ]}
  value={role}
  onChange={setRole}
/>`,
              render: () => (
                <div style={{ minInlineSize: 240 }}>
                  <Select
                    name="demo-role"
                    label="Role"
                    placeholder="Choose a role..."
                    options={roleOptions}
                    value={role}
                    onChange={(v) => setRole(v as string)}
                  />
                </div>
              ),
            },
            {
              title: 'Searchable select',
              description: 'Type to filter options with keyboard navigation.',
              code: `<Select
  name="framework"
  label="Framework"
  placeholder="Search frameworks..."
  options={frameworks}
  searchable
  clearable
/>`,
              render: () => (
                <div style={{ minInlineSize: 240 }}>
                  <Select
                    name="demo-framework"
                    label="Framework"
                    placeholder="Search frameworks..."
                    options={frameworkOptions}
                    searchable
                    clearable
                  />
                </div>
              ),
            },
            {
              title: 'Multi-select',
              description: 'Select multiple values with badge display.',
              code: `<Select
  name="roles"
  label="Assign Roles"
  placeholder="Select roles..."
  options={roleOptions}
  multiple
  value={selected}
  onChange={setSelected}
/>`,
              render: () => (
                <div style={{ minInlineSize: 280 }}>
                  <Select
                    name="demo-multi-role"
                    label="Assign Roles"
                    placeholder="Select roles..."
                    options={roleOptions}
                    multiple
                    value={multiRoles}
                    onChange={(v) => setMultiRoles(v as string[])}
                  />
                </div>
              ),
            },
          ]}
          props={selectProps}
          sizes
          sizeComponent={(size) => (
            <Select
              name={`size-${size}`}
              placeholder={size}
              options={roleOptions.slice(0, 3)}
              size={size as any}
            />
          )}
          accessibility={`Uses ARIA listbox pattern with role="combobox" on trigger.
Arrow keys navigate options, Enter selects, Escape closes.
Selected state announced via aria-selected.
Supports type-ahead search when searchable.`}
        />

        {/* Combobox */}
        <ComponentShowcase
          name="Combobox"
          description="A searchable combo box that filters options as you type. Supports async search, option descriptions, and creating new values on the fly."
          examples={[
            {
              title: 'Basic searchable',
              description: 'Type to filter the country list by name.',
              code: `<Combobox
  name="country"
  label="Country"
  placeholder="Search countries..."
  options={countryOptions}
  value={country}
  onChange={setCountry}
/>`,
              render: () => (
                <div style={{ minInlineSize: 260 }}>
                  <Combobox
                    name="demo-country"
                    label="Country"
                    placeholder="Search countries..."
                    options={countryOptions}
                    value={country}
                    onChange={setCountry}
                  />
                </div>
              ),
            },
            {
              title: 'With create-new',
              description: 'Type a value not in the list to see the "Create" option.',
              code: `<Combobox
  name="tag"
  label="Category"
  placeholder="Search or create..."
  options={options}
  allowCreate
  onCreate={(val) => console.log('Created:', val)}
/>`,
              render: () => (
                <div style={{ minInlineSize: 260 }}>
                  <Combobox
                    name="demo-create"
                    label="Category"
                    placeholder="Search or create..."
                    options={[
                      { value: 'bug', label: 'Bug' },
                      { value: 'feature', label: 'Feature' },
                      { value: 'docs', label: 'Documentation' },
                    ]}
                    allowCreate
                    onCreate={(val) => console.log('Created:', val)}
                  />
                </div>
              ),
            },
          ]}
          props={comboboxProps}
          accessibility={`Uses ARIA combobox pattern with role="combobox" and aria-expanded.
Listbox options receive role="option" with aria-selected state.
Keyboard: Arrow keys navigate, Enter selects, Escape closes.
Live region announces filtered count to screen readers.`}
        />

        {/* SearchInput */}
        <ComponentShowcase
          name="SearchInput"
          description="A debounced search input with built-in search icon, loading spinner, clear button, and configurable debounce delay."
          examples={[
            {
              title: 'Basic search with debounce',
              description: 'Debounces input by 300ms before triggering onSearch.',
              code: `<SearchInput
  placeholder="Search components..."
  onSearch={(query) => console.log('Search:', query)}
  clearable
/>`,
              render: () => (
                <div style={{ minInlineSize: 280 }}>
                  <SearchInput
                    placeholder="Search components..."
                    value={searchValue}
                    onChange={setSearchValue}
                    onSearch={handleSearch}
                    loading={searchLoading}
                    clearable
                  />
                </div>
              ),
            },
            {
              title: 'With loading state',
              description: 'Shows a spinner while fetching results.',
              code: `<SearchInput
  placeholder="Searching..."
  loading={true}
/>`,
              render: () => (
                <div style={{ minInlineSize: 280 }}>
                  <SearchInput
                    placeholder="Searching..."
                    loading
                  />
                </div>
              ),
            },
          ]}
          props={searchInputProps}
          sizes
          sizeComponent={(size) => (
            <SearchInput placeholder={size} size={size as any} />
          )}
          accessibility={`Uses role="searchbox" with type="search" for semantic meaning.
Clear button has aria-label="Clear search" for screen readers.
Loading state communicated via aria-busy attribute.
Escape key clears the input.`}
        />

        {/* Rating */}
        <ComponentShowcase
          name="Rating"
          description="An interactive star rating component with full and half-star increments, customizable icons, and read-only display mode."
          examples={[
            {
              title: 'Interactive rating',
              description: 'Click stars to set a rating value.',
              code: `<Rating value={rating} onChange={setRating} />`,
              render: () => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <Rating value={rating} onChange={setRating} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {rating > 0 ? `${rating} / 5` : 'No rating'}
                  </span>
                </div>
              ),
            },
            {
              title: 'Half-star support',
              description: 'Enable half-star increments for finer granularity.',
              code: `<Rating value={3.5} allowHalf onChange={setRating} />`,
              render: () => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <Rating value={halfRating} allowHalf onChange={setHalfRating} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {halfRating} / 5
                  </span>
                </div>
              ),
            },
            {
              title: 'Read-only display',
              description: 'Display a rating without interaction, useful for product reviews.',
              code: `<Rating value={4} readOnly size="lg" />`,
              render: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <Rating value={4} readOnly size="lg" />
                  <Rating value={2.5} readOnly allowHalf />
                </div>
              ),
            },
          ]}
          props={ratingProps}
          sizes
          sizeComponent={(size) => (
            <Rating value={3} readOnly size={size as any} />
          )}
          accessibility={`Uses role="radiogroup" with individual stars as role="radio".
Arrow keys change the rating value.
Current value announced as "N out of M stars".
Respects prefers-reduced-motion for hover animations.`}
        />

        {/* OtpInput */}
        <ComponentShowcase
          name="OtpInput"
          description="A verification code input that auto-advances between digit boxes, supports paste, backspace navigation, and completion callbacks."
          examples={[
            {
              title: 'Basic 6-digit code',
              description: 'Enter digits to auto-advance. Try typing 123456.',
              code: `<OtpInput
  length={6}
  value={otp}
  onChange={setOtp}
  onComplete={(code) => verify(code)}
/>`,
              render: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleOtpComplete}
                    error={otpError || undefined}
                  />
                  {otp.length === 6 && !otpError && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--status-ok)' }}>
                      Code verified!
                    </span>
                  )}
                </div>
              ),
            },
            {
              title: '4-digit numeric PIN',
              description: 'A shorter code for PIN entry.',
              code: `<OtpInput length={4} type="number" />`,
              render: () => (
                <OtpInput length={4} type="number" />
              ),
            },
          ]}
          props={otpInputProps}
          sizes
          sizeComponent={(size) => (
            <OtpInput length={4} size={size as any} />
          )}
          accessibility={`Each digit input has aria-label="Digit N of M".
Auto-focus advances to next input on entry.
Backspace returns to previous digit.
Paste support fills all digits from clipboard.`}
        />

        {/* TagInput */}
        <ComponentShowcase
          name="TagInput"
          description="A tag creation input where users type and press Enter to add tags. Supports max tag limits, duplicate prevention, and custom validation."
          examples={[
            {
              title: 'Basic tag input',
              description: 'Type a value and press Enter to add tags. Click X to remove.',
              code: `<TagInput
  tags={tags}
  onChange={setTags}
  placeholder="Add a tag..."
/>`,
              render: () => (
                <div style={{ minInlineSize: 300 }}>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Add a tag..."
                  />
                </div>
              ),
            },
            {
              title: 'With max limit',
              description: 'Limits the number of tags to 5.',
              code: `<TagInput
  tags={tags}
  onChange={setTags}
  placeholder="Max 5 tags..."
  maxTags={5}
/>`,
              render: () => {
                const [limitTags, setLimitTags] = useState(['react', 'vue'])
                return (
                  <div style={{ minInlineSize: 300 }}>
                    <TagInput
                      tags={limitTags}
                      onChange={setLimitTags}
                      placeholder="Max 5 tags..."
                      maxTags={5}
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockStart: 'var(--space-xs)' }}>
                      {limitTags.length} / 5 tags
                    </span>
                  </div>
                )
              },
            },
            {
              title: 'With validation',
              description: 'Only accepts tags that are at least 2 characters long.',
              code: `<TagInput
  tags={tags}
  onChange={setTags}
  validate={(tag) => tag.length >= 2}
  placeholder="Min 2 chars..."
/>`,
              render: () => {
                const [valTags, setValTags] = useState<string[]>(['ok'])
                return (
                  <div style={{ minInlineSize: 300 }}>
                    <TagInput
                      tags={valTags}
                      onChange={setValTags}
                      validate={(tag) => tag.length >= 2}
                      placeholder="Min 2 chars..."
                    />
                  </div>
                )
              },
            },
          ]}
          props={tagInputProps}
          sizes
          sizeComponent={(size) => (
            <TagInput
              tags={['tag']}
              onChange={() => {}}
              size={size as any}
            />
          )}
          accessibility={`Tag list uses role="list" with each tag as role="listitem".
Remove buttons have aria-label="Remove tag: {name}".
Enter and comma keys add new tags.
Backspace on empty input removes the last tag.`}
        />

        {/* DatePicker */}
        <ComponentShowcase
          name="DatePicker"
          description="A calendar popup for date selection with month/year navigation, min/max constraints, week numbers, and configurable first day of week."
          examples={[
            {
              title: 'Basic date picker',
              description: 'Click the input to open the calendar popup.',
              code: `<DatePicker
  name="date"
  label="Start Date"
  placeholder="Select a date..."
  value={date}
  onChange={setDate}
/>`,
              render: () => (
                <div style={{ minInlineSize: 260 }}>
                  <DatePicker
                    name="demo-date"
                    label="Start Date"
                    placeholder="Select a date..."
                    value={date}
                    onChange={setDate}
                  />
                </div>
              ),
            },
            {
              title: 'With constraints and week numbers',
              description: 'Restrict selectable range and show ISO week numbers.',
              code: `<DatePicker
  name="deadline"
  label="Deadline"
  min="2026-01-01"
  max="2026-12-31"
  showWeekNumbers
  firstDayOfWeek={1}
/>`,
              render: () => (
                <div style={{ minInlineSize: 260 }}>
                  <DatePicker
                    name="demo-deadline"
                    label="Deadline"
                    placeholder="2026 only..."
                    min="2026-01-01"
                    max="2026-12-31"
                    showWeekNumbers
                    firstDayOfWeek={1}
                  />
                </div>
              ),
            },
          ]}
          props={datePickerProps}
          accessibility={`Calendar grid uses role="grid" with aria-label for month/year.
Arrow keys navigate days, Page Up/Down for months.
Selected date announced via aria-selected.
Disabled dates marked with aria-disabled.
Escape key closes the calendar popup.`}
        />
      </div>
    </div>
  )
}
