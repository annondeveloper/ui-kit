'use client'

import { useRef } from 'react'
import { EncryptedText as BaseEncryptedText, type EncryptedTextProps } from '../domain/encrypted-text'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumEncryptedTextStyles = css`
  @layer premium {
    @scope (.ui-premium-encrypted-text) {
      :scope {
        display: inline-flex;
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced scramble glow during animation */
      :scope:not([data-motion="0"]) .ui-encrypted-text[data-scrambling="true"] {
        text-shadow:
          0 0 8px oklch(65% 0.2 270 / 0.4),
          0 0 16px oklch(70% 0.15 300 / 0.2);
        transition: text-shadow 0.15s ease-out;
      }

      /* Aurora text color — gradient on resolved text */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-encrypted-text:not([data-scrambling="true"]) {
        background: linear-gradient(
          135deg,
          oklch(80% 0.12 270),
          oklch(85% 0.1 300),
          oklch(80% 0.12 240)
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      /* Spring-reveal entrance */
      :scope:not([data-motion="0"]) .ui-encrypted-text {
        animation: ui-premium-encrypt-reveal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-encrypt-reveal {
        from {
          opacity: 0;
          transform: scale(0.92);
          filter: blur(4px);
        }
        70% {
          transform: scale(1.03);
          filter: blur(0);
        }
        to {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
      }

      /* Scramble character shimmer */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-encrypted-text[data-scrambling="true"] {
        background: linear-gradient(
          110deg,
          oklch(75% 0.1 270 / 0.8) 30%,
          oklch(90% 0.15 300 / 1) 50%,
          oklch(75% 0.1 270 / 0.8) 70%
        );
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation:
          ui-premium-encrypt-reveal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both,
          ui-premium-encrypt-shimmer 0.8s linear infinite;
      }
      @keyframes ui-premium-encrypt-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-encrypted-text {
        animation: none;
        text-shadow: none;
        -webkit-text-fill-color: unset;
        background: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-encrypted-text {
          animation: none !important;
          text-shadow: none;
        }
      }
    }
  }
`

export function EncryptedText({
  motion: motionProp,
  ...rest
}: EncryptedTextProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-encrypted-text', premiumEncryptedTextStyles)

  return (
    <span
      ref={wrapperRef}
      className="ui-premium-encrypted-text"
      data-motion={motionLevel}
    >
      <BaseEncryptedText motion={motionProp} {...rest} />
    </span>
  )
}

EncryptedText.displayName = 'EncryptedText'
