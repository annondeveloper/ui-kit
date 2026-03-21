import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react'

export interface LiteCopyBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export const CopyBlock = forwardRef<HTMLDivElement, LiteCopyBlockProps>(
  ({ code, language, showLineNumbers, className, ...rest }, ref) => {
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
