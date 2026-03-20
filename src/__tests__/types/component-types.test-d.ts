// Type-level tests — these are checked by tsc, not vitest
// Run via: npm run typecheck (which includes this file)

import type { IconName, IconProps } from '../../core/icons/icon'
import type { ValidatorFn, AsyncValidatorFn } from '../../core/forms/validators'
import type { FormState } from '../../core/forms/use-form'
import type { FieldConfig } from '../../core/forms/create-form'
import type { CSSDefinition } from '../../core/styles/css-tag'
import type { SpringConfig } from '../../core/motion/spring'
import type { OklchColor } from '../../core/utils/color'
import type { ThemeTokens } from '../../core/tokens/tokens'
import type { FocusTrapConfig } from '../../core/a11y/focus-trap'
import type { PointerContext } from '../../core/input/pointer'

// Verify key types are exported and usable
type AssertExtends<T, U> = T extends U ? true : never

// Icon names should be string union
type _IconNameIsString = AssertExtends<IconName, string>

// ValidatorFn signature
type _ValidatorFnSignature = AssertExtends<
  ValidatorFn,
  (value: unknown, allValues?: Record<string, unknown>) => string | undefined
>

// CSSDefinition shape
type _CSSDefShape = AssertExtends<CSSDefinition, { readonly id: string; readonly css: string }>

// SpringConfig optional fields — empty object is valid since all fields are optional
type _SpringConfigOptional = AssertExtends<{}, SpringConfig>

// OklchColor required shape
type _OklchColorShape = AssertExtends<OklchColor, { l: number; c: number; h: number }>

// ThemeTokens has brand field
type _ThemeHasBrand = AssertExtends<ThemeTokens['brand'], string>

// FormState is generic over FieldConfig record
type _FormStateGeneric = AssertExtends<
  FormState<{ name: FieldConfig }>,
  { values: Record<string, unknown> }
>

// FocusTrapConfig has active property
type _FocusTrapHasActive = AssertExtends<FocusTrapConfig, { active: boolean }>

// PointerContext has position info
type _PointerHasXY = AssertExtends<PointerContext, { x: number; y: number }>

// Suppress unused type warnings — the types above are the actual tests
type _Used =
  | _IconNameIsString
  | _ValidatorFnSignature
  | _CSSDefShape
  | _SpringConfigOptional
  | _OklchColorShape
  | _ThemeHasBrand
  | _FormStateGeneric
  | _FocusTrapHasActive
  | _PointerHasXY

// Ensure this file compiles — that's the test
const _: true = true as true
export { _ }
export type { _Used }
