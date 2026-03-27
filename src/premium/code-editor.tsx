'use client'

import { CodeEditor as BaseCodeEditor, type CodeEditorProps } from '../domain/code-editor'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCodeEditorStyles = css`
  @layer premium {
    @scope (.ui-premium-code-editor) {
      :scope {
        position: relative;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-code-editor:focus-within {
        box-shadow:
          0 0 0 1px var(--brand, oklch(65% 0.2 270)),
          0 0 16px -4px oklch(65% 0.2 270 / 0.25),
          0 0 32px -8px oklch(65% 0.2 270 / 0.1);
        transition: box-shadow 0.3s ease-out;
      }

      /* Active line aurora glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-code-editor__line[data-active] {
        box-shadow: inset 0 0 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.05);
        transition: box-shadow 0.2s ease-out;
      }

      /* Gutter line number spring on active */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-code-editor__line-number[data-active] {
        transform: scale(1.1);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
      }

      /* Subtle shimmer on token hover */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-code-editor__token--keyword {
        text-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-code-editor { transition: none; box-shadow: none; }
      :scope[data-motion="0"] .ui-code-editor__line-number { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-code-editor { transition: none; }
        :scope .ui-code-editor__line-number { transition: none; }
      }
    }
  }
`

export function CodeEditor({ motion: motionProp, ...rest }: CodeEditorProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-code-editor', premiumCodeEditorStyles)

  return (
    <div className="ui-premium-code-editor" data-motion={motionLevel}>
      <BaseCodeEditor motion={motionProp} {...rest} />
    </div>
  )
}

CodeEditor.displayName = 'CodeEditor'
