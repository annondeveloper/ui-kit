import { forwardRef } from 'react'
import { Breadcrumbs as StandardBreadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from '../components/breadcrumbs'

export type LiteBreadcrumbItem = BreadcrumbItem

export type LiteBreadcrumbsProps = BreadcrumbsProps

export const Breadcrumbs = forwardRef<HTMLElement, LiteBreadcrumbsProps>(
  (props, ref) => <StandardBreadcrumbs ref={ref} {...props} />
)
Breadcrumbs.displayName = 'Breadcrumbs'
