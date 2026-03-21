import { useState, type ReactNode } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from './PropsTable'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShowcaseExample {
  title: string
  description?: string
  code: string
  render: () => ReactNode
}

export interface ComponentShowcaseProps {
  name: string
  description: string
  examples: ShowcaseExample[]
  props: PropDef[]
  accessibility?: string
  sizes?: boolean
  sizeComponent?: (size: string) => ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const showcaseStyles = css`
  @layer components {
    @scope (.ui-showcase) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xl, 2rem);
        max-inline-size: 960px;
        container-type: inline-size;
      }

      /* ── Header ─────────────────────────────────────── */

      .ui-showcase__header {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-showcase__title {
        font-size: clamp(1.5rem, 4cqi, 2.25rem);
        font-weight: 800;
        color: var(--text-primary, oklch(90% 0 0));
        letter-spacing: -0.02em;
        line-height: 1.2;
        text-wrap: balance;
        margin: 0;
      }

      .ui-showcase__description {
        font-size: var(--text-base, 1rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.6;
        text-wrap: pretty;
        max-inline-size: 65ch;
        margin: 0;
      }

      /* ── Section ────────────────────────────────────── */

      .ui-showcase__section {
        display: flex;
        flex-direction: column;
        gap: var(--space-md, 1rem);
      }

      .ui-showcase__section-heading {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
        scroll-margin-block-start: 2rem;
      }

      .ui-showcase__section-heading a {
        color: inherit;
        text-decoration: none;
      }
      .ui-showcase__section-heading a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ui-showcase__section-icon {
        color: var(--brand, oklch(65% 0.2 270));
        flex-shrink: 0;
      }

      /* ── Example ────────────────────────────────────── */

      .ui-showcase__example {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow: hidden;
      }

      .ui-showcase__example-header {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-md, 1rem);
        padding-block-end: var(--space-sm, 0.5rem);
      }

      .ui-showcase__example-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
      }

      .ui-showcase__example-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.5;
        margin: 0;
      }

      /* ── Preview area ───────────────────────────────── */

      .ui-showcase__preview {
        padding: var(--space-lg, 1.5rem);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-md, 1rem);
        min-block-size: 80px;
        background: var(--bg-base, oklch(15% 0.01 270));
        border-block: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      /* ── Code toggle ────────────────────────────────── */

      .ui-showcase__code-toggle {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: color 0.15s;
        align-self: flex-start;
      }
      .ui-showcase__code-toggle:hover {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-showcase__code-toggle svg {
        inline-size: 0.875rem;
        block-size: 0.875rem;
        transition: transform 0.2s var(--ease-out, ease-out);
      }
      .ui-showcase__code-toggle[data-open="true"] svg {
        transform: rotate(180deg);
      }

      /* ── Code section ───────────────────────────────── */

      .ui-showcase__code-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        overflow: hidden;
        transition: grid-template-rows 0.25s var(--ease-out, ease-out);
      }
      .ui-showcase__code-wrapper[data-open="true"] {
        grid-template-rows: 1fr;
      }
      .ui-showcase__code-inner {
        min-block-size: 0;
        overflow: hidden;
      }

      /* ── Sizes section ──────────────────────────────── */

      .ui-showcase__sizes {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: var(--space-md, 1rem);
        padding: var(--space-lg, 1.5rem);
      }

      .ui-showcase__size-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-showcase__size-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Accessibility section ──────────────────────── */

      .ui-showcase__a11y {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.7;
        text-wrap: pretty;
        white-space: pre-line;
      }

      /* ── Responsive ─────────────────────────────────── */

      @container (max-width: 480px) {
        .ui-showcase__preview {
          padding: var(--space-md, 1rem);
        }
        .ui-showcase__sizes {
          padding: var(--space-md, 1rem);
        }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({
  id,
  icon,
  children,
}: {
  id: string
  icon: string
  children: ReactNode
}) {
  return (
    <h3 className="ui-showcase__section-heading" id={id}>
      <span className="ui-showcase__section-icon">
        <Icon name={icon as any} size="sm" />
      </span>
      <a href={`#${id}`}>{children}</a>
    </h3>
  )
}

function ExampleBlock({ example }: { example: ShowcaseExample }) {
  const [codeOpen, setCodeOpen] = useState(false)

  return (
    <Card variant="default" padding="none" className="ui-showcase__example">
      <div className="ui-showcase__example-header">
        <h4 className="ui-showcase__example-title">{example.title}</h4>
        {example.description && (
          <p className="ui-showcase__example-desc">{example.description}</p>
        )}
      </div>

      <div className="ui-showcase__preview">
        {example.render()}
      </div>

      <button
        className="ui-showcase__code-toggle"
        data-open={codeOpen || undefined}
        onClick={() => setCodeOpen((v) => !v)}
        type="button"
      >
        <Icon name="code" size="sm" />
        {codeOpen ? 'Hide code' : 'Show code'}
      </button>

      <div
        className="ui-showcase__code-wrapper"
        data-open={codeOpen || undefined}
      >
        <div className="ui-showcase__code-inner">
          <CopyBlock
            code={example.code}
            language="typescript"
            showLineNumbers
          />
        </div>
      </div>
    </Card>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ComponentShowcase({
  name,
  description,
  examples,
  props,
  accessibility,
  sizes,
  sizeComponent,
}: ComponentShowcaseProps) {
  useStyles('showcase', showcaseStyles)

  const nameSlug = slugify(name)

  return (
    <div className="ui-showcase">
      {/* Header */}
      <div className="ui-showcase__header">
        <h2 className="ui-showcase__title">{name}</h2>
        <p className="ui-showcase__description">{description}</p>
      </div>

      <Divider spacing="sm" />

      {/* Examples */}
      <div className="ui-showcase__section">
        <SectionHeading id={`${nameSlug}-examples`} icon="eye">
          Examples
        </SectionHeading>

        {examples.map((example, i) => (
          <ExampleBlock key={i} example={example} />
        ))}
      </div>

      {/* Sizes */}
      {sizes && sizeComponent && (
        <>
          <Divider spacing="sm" />
          <div className="ui-showcase__section">
            <SectionHeading id={`${nameSlug}-sizes`} icon="bar-chart">
              Sizes
            </SectionHeading>
            <Card variant="default" padding="none">
              <div className="ui-showcase__sizes">
                {SIZES.map((size) => (
                  <div key={size} className="ui-showcase__size-item">
                    {sizeComponent(size)}
                    <span className="ui-showcase__size-label">{size}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Props API */}
      <Divider spacing="sm" />
      <div className="ui-showcase__section">
        <SectionHeading id={`${nameSlug}-props`} icon="settings">
          Props API
        </SectionHeading>
        <Card variant="default" padding="md">
          <PropsTable props={props} />
        </Card>
      </div>

      {/* Accessibility */}
      {accessibility && (
        <>
          <Divider spacing="sm" />
          <div className="ui-showcase__section">
            <SectionHeading id={`${nameSlug}-accessibility`} icon="check-circle">
              Accessibility
            </SectionHeading>
            <Card variant="default" padding="md">
              <div className="ui-showcase__a11y">{accessibility}</div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
