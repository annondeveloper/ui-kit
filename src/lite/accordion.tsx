import { forwardRef } from 'react'
import { Accordion as StandardAccordion, type AccordionProps, type AccordionItem } from '../components/accordion'

export type LiteAccordionItem = AccordionItem

export type LiteAccordionProps = Omit<AccordionProps, 'motion'>

export const Accordion = forwardRef<HTMLDivElement, LiteAccordionProps>(
  (props, ref) => <StandardAccordion ref={ref} motion={0} {...props} />
)
Accordion.displayName = 'Accordion'
