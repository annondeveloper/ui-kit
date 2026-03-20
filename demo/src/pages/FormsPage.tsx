import { useState } from 'react'
import { Preview } from '../components/Preview'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { Combobox } from '@ui/components/combobox'
import { ColorInput } from '@ui/components/color-input'
import { FileUpload } from '@ui/components/file-upload'
import { InlineEdit } from '@ui/components/inline-edit'
import { FilterPill, FilterPillGroup } from '@ui/components/filter-pill'
import { Checkbox } from '@ui/components/checkbox'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { createForm } from '@ui/core/forms/create-form'
import { useForm } from '@ui/core/forms/use-form'
import { Form } from '@ui/core/forms/form-component'
import { v } from '@ui/core/forms/validators'
import { Icon } from '@ui/core/icons/icon'

/* Registration form definition using createForm */
const registrationForm = createForm({
  fields: {
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.pipe(v.required(), v.minLength(8, 'At least 8 characters')) },
    confirmPassword: {
      initial: '',
      validate: (value, allValues) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return 'Required'
        if (value !== allValues?.password) return 'Passwords must match'
        return undefined
      },
    },
    terms: { initial: false, validate: v.required('You must accept the terms') },
  },
  onSubmit: (values) => {
    alert(`Registered: ${JSON.stringify(values, null, 2)}`)
  },
})

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1rem',
}

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

export default function FormsPage() {
  const form = useForm(registrationForm)

  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [inlineVal, setInlineVal] = useState('Click to edit this text')
  const [inlineTitle, setInlineTitle] = useState('Project Alpha')
  const [filters, setFilters] = useState<Record<string, boolean>>({
    status: true,
    priority: true,
    assignee: false,
    label: false,
    date: true,
  })

  const toggleFilter = (key: string) => {
    setFilters(f => ({ ...f, [key]: !f[key] }))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Forms</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Form components and the built-in form engine</p>
      </div>

      <div style={grid}>
        {/* Registration Form */}
        <Preview label="Registration Form" description="Built with createForm + useForm + validators" wide>
          <Card variant="outlined" padding="md">
            <Form form={form} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
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
                value={form.values.password as string}
                onChange={(e) => form.setValue('password', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setTouched('password')}
                error={form.touched.password ? form.errors.password : undefined}
              />
              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={form.values.confirmPassword as string}
                onChange={(e) => form.setValue('confirmPassword', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setTouched('confirmPassword')}
                error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
              />
              <Checkbox
                label="I accept the terms and conditions"
                checked={form.values.terms as boolean}
                onChange={() => form.setValue('terms', !(form.values.terms as boolean))}
              />
              {form.touched.terms && form.errors.terms && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--status-critical)' }}>
                  {form.errors.terms}
                </div>
              )}
              <Button type="submit" variant="primary" loading={form.submitting}>
                Create Account
              </Button>
            </Form>
          </Card>
        </Preview>

        {/* Select */}
        <Preview label="Select" description="Dropdown with 6 role options">
          <Select
            name="role"
            label="Role"
            placeholder="Choose a role..."
            options={roleOptions}
            value={role}
            onChange={setRole}
          />
        </Preview>

        {/* Combobox */}
        <Preview label="Combobox" description="Searchable country selector">
          <Combobox
            name="country"
            label="Country"
            placeholder="Search countries..."
            options={countryOptions}
            value={country}
            onChange={setCountry}
          />
        </Preview>

        {/* ColorInput */}
        <Preview label="ColorInput" description="Color picker with swatches">
          <ColorInput
            name="brand-color"
            label="Brand Color"
            value={color}
            onChange={setColor}
            swatches={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6']}
            showInput
          />
        </Preview>

        {/* FileUpload */}
        <Preview label="FileUpload" description="Drag and drop zone">
          <FileUpload
            name="avatar"
            label="Upload Avatar"
            description="PNG, JPG, or GIF up to 5MB"
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            onChange={(files) => console.log('Files:', files)}
          />
        </Preview>

        {/* InlineEdit */}
        <Preview label="InlineEdit" description="Click to edit in place">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <InlineEdit
              value={inlineTitle}
              onChange={setInlineTitle}
              size="lg"
            />
            <InlineEdit
              value={inlineVal}
              onChange={setInlineVal}
              size="md"
              placeholder="Click to add text..."
            />
          </div>
        </Preview>

        {/* FilterPill */}
        <Preview label="FilterPill" description="Active/inactive pill group" wide>
          <FilterPillGroup onClearAll={() => setFilters(Object.fromEntries(Object.keys(filters).map(k => [k, false])))}>
            {Object.entries(filters).map(([key, active]) => (
              <FilterPill
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                active={active}
                onClick={() => toggleFilter(key)}
                onRemove={active ? () => toggleFilter(key) : undefined}
                count={active ? Math.floor(Math.random() * 20) + 1 : undefined}
              />
            ))}
          </FilterPillGroup>
        </Preview>
      </div>
    </div>
  )
}
