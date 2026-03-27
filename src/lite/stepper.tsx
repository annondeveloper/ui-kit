import { forwardRef } from 'react'
import { Stepper as StandardStepper, type StepperProps, type StepperStep } from '../components/stepper'

export type { StepperStep as LiteStepperStep }
export type LiteStepperProps = Omit<StepperProps, 'motion'>

export const Stepper = forwardRef<HTMLDivElement, LiteStepperProps>(
  (props, ref) => <StandardStepper ref={ref} motion={0} {...props} />
)
Stepper.displayName = 'Stepper'
