import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const copyBlockStyles = css`
  @layer components {
    @scope (.ui-lite-copy-block) {
      :scope {
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-md, 0.5rem);
        overflow: hidden;
      }
      .ui-lite-copy-block__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.375rem 0.75rem;
        background: oklch(100% 0 0 / 0.02);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      .ui-lite-copy-block__lang {
        font-size: 0.6875rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-copy-block__btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.6875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        font-family: inherit;
      }
      .ui-lite-copy-block__btn:hover { color: var(--text-primary, oklch(97% 0 0)); }
      .ui-lite-copy-block__btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      pre {
        margin: 0;
        padding: 0.75rem;
        overflow-x: auto;
      }
      code {
        font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
        font-size: var(--text-sm, 0.8125rem);
        line-height: 1.6;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export interface LiteCopyBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export const CopyBlock = forwardRef<HTMLDivElement, LiteCopyBlockProps>(
  ({ code, language, showLineNumbers, className, ...rest }, ref) => {
    useStyles('lite-copy-block', copyBlockStyles)
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }, [code])

    return (
      <div ref={ref} className={`ui-lite-copy-block${className ? ` ${className}` : ''}`} {...rest}>
        <div className="ui-lite-copy-block__header">
          {language && <span className="ui-lite-copy-block__lang">{language}</span>}
          <button type="button" className="ui-lite-copy-block__btn" onClick={handleCopy} aria-label="Copy code">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre><code>{showLineNumbers
          ? code.split('\n').map((line, i) => `${String(i + 1).padStart(3)} ${line}`).join('\n')
          : code
        }</code></pre>
      </div>
    )
  }
)
CopyBlock.displayName = 'CopyBlock'
