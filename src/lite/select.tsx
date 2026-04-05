'use client'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import type { SelectProps, SelectOption } from '../components/select'

export type { SelectOption as LiteSelectOption }
export type LiteSelectProps = SelectProps

export const Select = forwardRef<HTMLDivElement, SelectProps>(({
  name, options, value: controlledValue, defaultValue, onChange,
  placeholder = 'Select...', label, error, disabled, size = 'md', className,
  searchable: _s, clearable: _c, multiple: _m, motion: _mo, ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string>((defaultValue as string) ?? '')
  const rootRef = useRef<HTMLDivElement>(null)
  const val = controlledValue !== undefined ? (controlledValue as string) : internalValue
  const selected = options.find((o) => o.value === val)
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
  }, [ref])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => { if (!disabled) setIsOpen((o) => !o) }, [disabled])
  const pick = useCallback((opt: SelectOption) => {
    if (opt.disabled) return
    setInternalValue(opt.value); onChange?.(opt.value); setIsOpen(false)
  }, [onChange])
  useEffect(() => {
    if (!isOpen) return
    const onMouse = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const t = setTimeout(() => document.addEventListener('mousedown', onMouse), 0)
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey) }
  }, [isOpen, close])
  const lid = name ? `lite-select-${name}-listbox` : undefined
  const labId = name ? `lite-select-${name}-label` : undefined
  const errId = name ? `lite-select-${name}-error` : undefined
  return (
    <div ref={setRootRef} className={`ui-lite-select${className ? ` ${className}` : ''}`}
      data-size={size} {...(isOpen ? { 'data-open': '' } : {})}
      {...(error ? { 'data-invalid': '' } : {})} {...(disabled ? { 'data-disabled': '' } : {})}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} {...rest}>
      {label && <label className="ui-lite-select__label" id={labId}>{label}</label>}
      <input type="hidden" name={name} value={val} />
      <button type="button" className="ui-lite-select__trigger" role="combobox"
        aria-expanded={isOpen} aria-haspopup="listbox" aria-controls={isOpen ? lid : undefined}
        aria-labelledby={label ? labId : undefined} aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined} disabled={disabled} onClick={toggle}
        style={{ all: 'unset', display: 'flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', boxSizing: 'border-box', padding: '0.375rem 0.75rem', border: '1px solid var(--border-default, oklch(100% 0 0 / 0.12))', borderRadius: '0.375rem', background: 'var(--bg-elevated, transparent)', color: 'var(--text-primary, inherit)', fontSize: '0.875rem' }}>
        <span className="ui-lite-select__value" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'start' }}>
          {selected ? selected.label : <span className="ui-lite-select__placeholder" style={{ color: 'var(--text-tertiary, #888)' }}>{placeholder}</span>}
        </span>
        <span className="ui-lite-select__chevron" style={{ marginInlineStart: '0.5rem', fontSize: '0.6em' }}>{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {isOpen && (
        <div className="ui-lite-select__dropdown" role="listbox" id={lid}
          aria-labelledby={label ? labId : undefined} tabIndex={-1}
          style={{ position: 'absolute', top: '100%', insetInlineStart: 0, insetInlineEnd: 0, marginBlockStart: '0.25rem', maxBlockSize: '15rem', overflow: 'auto', border: '1px solid var(--border-default, oklch(100% 0 0 / 0.12))', borderRadius: '0.5rem', background: 'var(--surface-elevated, #222)', zIndex: 50, paddingBlock: '0.25rem' }}>
          {options.map((opt) => (
            <div key={opt.value} role="option" aria-selected={opt.value === val}
              aria-disabled={opt.disabled || undefined} className="ui-lite-select__option"
              {...(opt.value === val ? { 'data-selected': '' } : {})}
              {...(opt.disabled ? { 'data-disabled': '' } : {})} onClick={() => pick(opt)}
              style={{ padding: '0.375rem 0.75rem', cursor: opt.disabled ? 'not-allowed' : 'pointer', opacity: opt.disabled ? 0.4 : 1, fontWeight: opt.value === val ? 500 : 'normal', fontSize: '0.875rem' }}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {error && <div className="ui-lite-select__error" id={errId} role="alert" style={{ fontSize: '0.75rem', color: 'var(--status-critical, #e55)' }}>{error}</div>}
    </div>
  )
})
Select.displayName = 'Select'
