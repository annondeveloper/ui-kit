'use client'

import { forwardRef } from 'react'
import { RichTextEditor as BaseRichTextEditor, type RichTextEditorProps } from '../domain/rich-text-editor'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumRichTextEditorStyles = css`
  @layer premium {
    @scope (.ui-premium-rich-text-editor) {
      :scope {
        position: relative;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-rich-text-editor__wrapper:focus-within {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 24px -4px oklch(65% 0.2 270 / 0.15),
          0 0 48px -8px oklch(65% 0.2 270 / 0.08);
        transition: box-shadow 0.3s ease-out;
      }

      /* Toolbar button spring on press */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-rich-text-editor__toolbar-btn:active:not(:disabled) {
        transform: scale(0.88);
        transition: transform 0.08s ease-out;
      }

      /* Toolbar active button aurora glow */
      :scope:not([data-motion="0"]) .ui-rich-text-editor__toolbar-btn[data-active] {
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        transition: box-shadow 0.2s ease-out, background 0.2s ease-out;
      }

      /* Heading dropdown spring entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-rich-text-editor__heading-menu[data-open] {
        animation: ui-premium-rte-menu 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-rte-menu {
        from {
          opacity: 0;
          transform: translateY(-6px) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Error shake */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-rich-text-editor__error {
        animation: ui-premium-rte-shake 0.3s ease-out;
      }

      @keyframes ui-premium-rte-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-rich-text-editor__wrapper { transition: none; box-shadow: none; }
      :scope[data-motion="0"] .ui-rich-text-editor__toolbar-btn { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-rich-text-editor__wrapper { transition: none; }
        :scope .ui-rich-text-editor__toolbar-btn { transition: none; }
        :scope .ui-rich-text-editor__heading-menu { animation: none; }
        :scope .ui-rich-text-editor__error { animation: none; }
      }
    }
  }
`

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-rich-text-editor', premiumRichTextEditorStyles)

    return (
      <div ref={ref} className="ui-premium-rich-text-editor" data-motion={motionLevel}>
        <BaseRichTextEditor motion={motionProp} {...rest} />
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'
