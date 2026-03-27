'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CropResult {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zoom: number
}

export interface CropperProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  onCrop?: (result: CropResult) => void
  showGrid?: boolean
  showZoom?: boolean
  showRotate?: boolean
  rounded?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLE_POSITIONS: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cropperStyles = css`
  @layer components {
    @scope (.ui-cropper) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        position: relative;
        font-family: inherit;
        user-select: none;
        touch-action: none;
      }

      /* ── Container ── */
      .ui-cropper__container {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-md, 0.375rem);
        background: oklch(10% 0 0);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
      }

      /* ── Image ── */
      .ui-cropper__image {
        display: block;
        max-inline-size: 100%;
        block-size: auto;
        pointer-events: none;
        transform-origin: center center;
      }

      /* ── Overlay (dims outside crop area) ── */
      .ui-cropper__overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      }

      .ui-cropper__overlay-top,
      .ui-cropper__overlay-bottom,
      .ui-cropper__overlay-left,
      .ui-cropper__overlay-right {
        position: absolute;
        background: oklch(0% 0 0 / 0.55);
      }

      .ui-cropper__overlay-top {
        inset-block-start: 0;
        inset-inline: 0;
      }
      .ui-cropper__overlay-bottom {
        inset-block-end: 0;
        inset-inline: 0;
      }
      .ui-cropper__overlay-left {
        inset-inline-start: 0;
      }
      .ui-cropper__overlay-right {
        inset-inline-end: 0;
      }

      /* ── Crop area ── */
      .ui-cropper__crop-area {
        position: absolute;
        z-index: 2;
        border: 2px solid oklch(100% 0 0 / 0.9);
        cursor: move;
        box-shadow: 0 0 0 9999px oklch(0% 0 0 / 0);
      }

      :scope[data-rounded] .ui-cropper__crop-area {
        border-radius: 50%;
        clip-path: circle(50%);
      }

      /* ── Grid lines ── */
      .ui-cropper__grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .ui-cropper__grid-line {
        position: absolute;
        background: oklch(100% 0 0 / 0.3);
      }

      .ui-cropper__grid-line--h1 {
        inset-block-start: 33.33%;
        inset-inline: 0;
        block-size: 1px;
      }
      .ui-cropper__grid-line--h2 {
        inset-block-start: 66.66%;
        inset-inline: 0;
        block-size: 1px;
      }
      .ui-cropper__grid-line--v1 {
        inset-inline-start: 33.33%;
        inset-block: 0;
        inline-size: 1px;
      }
      .ui-cropper__grid-line--v2 {
        inset-inline-start: 66.66%;
        inset-block: 0;
        inline-size: 1px;
      }

      /* ── Resize handles ── */
      .ui-cropper__handle {
        position: absolute;
        inline-size: 10px;
        block-size: 10px;
        background: oklch(100% 0 0);
        border: 1px solid oklch(0% 0 0 / 0.3);
        border-radius: 1px;
        z-index: 3;
        transition: transform 0.15s, box-shadow 0.15s;
      }

      .ui-cropper__handle:hover {
        transform: scale(1.3);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.5), 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      .ui-cropper__handle--nw { inset-block-start: -5px; inset-inline-start: -5px; cursor: nwse-resize; }
      .ui-cropper__handle--n  { inset-block-start: -5px; inset-inline-start: calc(50% - 5px); cursor: ns-resize; }
      .ui-cropper__handle--ne { inset-block-start: -5px; inset-inline-end: -5px; cursor: nesw-resize; }
      .ui-cropper__handle--e  { inset-block-start: calc(50% - 5px); inset-inline-end: -5px; cursor: ew-resize; }
      .ui-cropper__handle--se { inset-block-end: -5px; inset-inline-end: -5px; cursor: nwse-resize; }
      .ui-cropper__handle--s  { inset-block-end: -5px; inset-inline-start: calc(50% - 5px); cursor: ns-resize; }
      .ui-cropper__handle--sw { inset-block-end: -5px; inset-inline-start: -5px; cursor: nesw-resize; }
      .ui-cropper__handle--w  { inset-block-start: calc(50% - 5px); inset-inline-start: -5px; cursor: ew-resize; }

      /* ── Controls toolbar ── */
      .ui-cropper__controls {
        display: flex;
        align-items: center;
        gap: var(--space-md, 0.75rem);
        padding-block: 0.375rem;
        padding-inline: 0.5rem;
        flex-wrap: wrap;
      }

      .ui-cropper__control-group {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-cropper__control-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        user-select: none;
        white-space: nowrap;
      }

      .ui-cropper__slider {
        -webkit-appearance: none;
        appearance: none;
        inline-size: 100px;
        block-size: 4px;
        border-radius: 2px;
        background: var(--border-default, oklch(100% 0 0 / 0.12));
        outline: none;
        cursor: pointer;
      }

      .ui-cropper__slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        inline-size: 14px;
        block-size: 14px;
        border-radius: 50%;
        background: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        border: 2px solid oklch(100% 0 0);
        box-shadow: 0 1px 4px oklch(0% 0 0 / 0.3);
      }

      .ui-cropper__slider::-moz-range-thumb {
        inline-size: 14px;
        block-size: 14px;
        border-radius: 50%;
        background: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        border: 2px solid oklch(100% 0 0);
        box-shadow: 0 1px 4px oklch(0% 0 0 / 0.3);
      }

      .ui-cropper__slider:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-cropper__rotate-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        border-radius: var(--radius-sm, 0.25rem);
        cursor: pointer;
        min-inline-size: 1.75rem;
        min-block-size: 1.75rem;
        padding: 0.25rem;
        font-family: inherit;
        font-size: var(--text-xs, 0.75rem);
        transition: background 0.1s ease-out, color 0.1s ease-out;
      }

      .ui-cropper__rotate-btn:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-cropper__rotate-btn:hover:not(:disabled) {
        transform: scale(1.06);
        box-shadow: 0 2px 6px oklch(0% 0 0 / 0.2);
      }

      .ui-cropper__rotate-btn:active:not(:disabled) {
        transform: scale(0.92);
        transition: transform 0.06s ease-out;
      }

      .ui-cropper__rotate-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        .ui-cropper__container {
          border: 2px solid ButtonText;
        }
        .ui-cropper__crop-area {
          border-color: Highlight;
        }
        .ui-cropper__handle {
          background: Highlight;
          border-color: HighlightText;
        }
        .ui-cropper__rotate-btn {
          border-color: ButtonText;
        }
      }

      /* ── Print ── */
      @media print {
        .ui-cropper__controls {
          display: none;
        }
        .ui-cropper__handle {
          display: none;
        }
        .ui-cropper__overlay-top,
        .ui-cropper__overlay-bottom,
        .ui-cropper__overlay-left,
        .ui-cropper__overlay-right {
          display: none;
        }
        .ui-cropper__container {
          border: 1px solid;
        }
      }

      /* ── Touch targets ── */
      @media (pointer: coarse) {
        .ui-cropper__handle {
          inline-size: 20px;
          block-size: 20px;
        }
        .ui-cropper__handle--nw { inset-block-start: -10px; inset-inline-start: -10px; }
        .ui-cropper__handle--n  { inset-block-start: -10px; inset-inline-start: calc(50% - 10px); }
        .ui-cropper__handle--ne { inset-block-start: -10px; inset-inline-end: -10px; }
        .ui-cropper__handle--e  { inset-block-start: calc(50% - 10px); inset-inline-end: -10px; }
        .ui-cropper__handle--se { inset-block-end: -10px; inset-inline-end: -10px; }
        .ui-cropper__handle--s  { inset-block-end: -10px; inset-inline-start: calc(50% - 10px); }
        .ui-cropper__handle--sw { inset-block-end: -10px; inset-inline-start: -10px; }
        .ui-cropper__handle--w  { inset-block-start: calc(50% - 10px); inset-inline-start: -10px; }

        .ui-cropper__rotate-btn {
          min-inline-size: 2.75rem;
          min-block-size: 2.75rem;
        }
      }
    }
  }
`

// ─── Icons ───────────────────────────────────────────────────────────────────

const rotateLeftIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10a6 6 0 1 1 1.5 4M4 10V6M4 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const rotateRightIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 10a6 6 0 1 0-1.5 4M16 10V6M16 10h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// ─── Component ───────────────────────────────────────────────────────────────

export const Cropper = forwardRef<HTMLDivElement, CropperProps>(
  (
    {
      src,
      aspectRatio,
      minWidth = 20,
      minHeight = 20,
      maxWidth,
      maxHeight,
      onCrop,
      showGrid = true,
      showZoom = true,
      showRotate = true,
      rounded = false,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('cropper', cropperStyles)
    const motionLevel = useMotionLevel(motionProp)

    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    // ── State ──────────────────────────────────────────────────────────
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 })

    // Drag state refs (don't need re-renders)
    const dragRef = useRef<{
      type: 'move' | 'resize'
      handle?: HandlePosition
      startX: number
      startY: number
      startCrop: { x: number; y: number; width: number; height: number }
    } | null>(null)

    // ── Image load ────────────────────────────────────────────────────
    const handleImageLoad = useCallback(() => {
      if (!imageRef.current || !containerRef.current) return
      const img = imageRef.current
      const container = containerRef.current
      const cW = container.clientWidth
      const cH = container.clientHeight || cW * 0.75 // fallback aspect
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
      setContainerSize({ width: cW, height: cH })

      // Initialize crop to center, covering 80% of visible area
      const initW = cW * 0.8
      const initH = aspectRatio ? initW / aspectRatio : cH * 0.8
      const finalW = Math.min(initW, cW)
      const finalH = Math.min(initH, cH)
      const x = (cW - finalW) / 2
      const y = (cH - finalH) / 2

      const initialCrop = { x, y, width: finalW, height: finalH }
      setCrop(initialCrop)
      setImageLoaded(true)

      // Emit initial crop so parent knows default state
      // Use setTimeout to ensure state is settled
      setTimeout(() => {
        if (!containerRef.current) return
        const contW = containerRef.current.clientWidth
        const contH = containerRef.current.clientHeight
        if (contW === 0 || contH === 0) return
        const sx = img.naturalWidth / contW
        const sy = img.naturalHeight / contH
        onCrop?.({
          x: Math.round(initialCrop.x * sx),
          y: Math.round(initialCrop.y * sy),
          width: Math.round(initialCrop.width * sx),
          height: Math.round(initialCrop.height * sy),
          rotation: 0,
          zoom: 1,
        })
      }, 0)
    }, [aspectRatio, onCrop])

    // ── Compute container height from image ───────────────────────────
    useEffect(() => {
      if (!imageLoaded || !containerRef.current) return
      const container = containerRef.current
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    }, [imageLoaded, zoom, rotation])

    // ── Emit crop result ──────────────────────────────────────────────
    const emitCrop = useCallback(
      (c: { x: number; y: number; width: number; height: number }) => {
        if (!imageLoaded || !containerRef.current) return
        const cW = containerRef.current.clientWidth
        const cH = containerRef.current.clientHeight
        if (cW === 0 || cH === 0) return

        // Convert crop coordinates from container space to original image space
        // Divide by zoom so coordinates map back to unzoomed image
        const scaleX = imageSize.width / cW
        const scaleY = imageSize.height / cH

        onCrop?.({
          x: Math.round((c.x / zoom) * scaleX),
          y: Math.round((c.y / zoom) * scaleY),
          width: Math.round((c.width / zoom) * scaleX),
          height: Math.round((c.height / zoom) * scaleY),
          rotation,
          zoom,
        })
      },
      [imageLoaded, imageSize, zoom, rotation, onCrop]
    )

    // ── Constrain crop to bounds ──────────────────────────────────────
    const constrainCrop = useCallback(
      (c: { x: number; y: number; width: number; height: number }) => {
        const cW = containerSize.width || 1
        const cH = containerSize.height || 1
        const mxW = maxWidth ? Math.min(maxWidth, cW) : cW
        const mxH = maxHeight ? Math.min(maxHeight, cH) : cH

        let { x, y, width, height } = c
        width = clamp(width, minWidth, mxW)
        height = clamp(height, minHeight, mxH)

        if (aspectRatio) {
          // Adjust height to match aspect ratio
          height = width / aspectRatio
          if (height > mxH) {
            height = mxH
            width = height * aspectRatio
          }
          if (height < minHeight) {
            height = minHeight
            width = height * aspectRatio
          }
        }

        x = clamp(x, 0, cW - width)
        y = clamp(y, 0, cH - height)

        return { x, y, width, height }
      },
      [containerSize, aspectRatio, minWidth, minHeight, maxWidth, maxHeight]
    )

    // ── Mouse/touch drag handlers ─────────────────────────────────────
    const handlePointerDown = useCallback(
      (e: React.PointerEvent, type: 'move' | 'resize', handle?: HandlePosition) => {
        e.preventDefault()
        e.stopPropagation()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

        dragRef.current = {
          type,
          handle,
          startX: e.clientX,
          startY: e.clientY,
          startCrop: { ...crop },
        }
      },
      [crop]
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragRef.current) return
        const { type, handle, startX, startY, startCrop } = dragRef.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY

        if (type === 'move') {
          const newCrop = constrainCrop({
            x: startCrop.x + dx,
            y: startCrop.y + dy,
            width: startCrop.width,
            height: startCrop.height,
          })
          setCrop(newCrop)
        } else if (type === 'resize' && handle) {
          let newX = startCrop.x
          let newY = startCrop.y
          let newW = startCrop.width
          let newH = startCrop.height

          // Adjust based on handle position
          if (handle.includes('e')) {
            newW = startCrop.width + dx
          }
          if (handle.includes('w')) {
            newW = startCrop.width - dx
            newX = startCrop.x + dx
          }
          if (handle.includes('s')) {
            newH = startCrop.height + dy
          }
          if (handle.includes('n')) {
            newH = startCrop.height - dy
            newY = startCrop.y + dy
          }

          // Enforce aspect ratio during resize
          if (aspectRatio) {
            if (handle === 'n' || handle === 's') {
              newW = newH * aspectRatio
            } else {
              newH = newW / aspectRatio
            }
          }

          const constrained = constrainCrop({
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          })
          setCrop(constrained)
        }
      },
      [constrainCrop, aspectRatio]
    )

    const handlePointerUp = useCallback(() => {
      if (dragRef.current) {
        dragRef.current = null
        emitCrop(crop)
      }
    }, [crop, emitCrop])

    // ── Mouse wheel zoom ──────────────────────────────────────────────
    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.05 : 0.05
        setZoom(prev => {
          const next = clamp(prev + delta, 0.5, 3)
          return next
        })
      },
      []
    )

    // Emit crop when zoom/rotation changes
    useEffect(() => {
      if (imageLoaded) {
        emitCrop(crop)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, rotation])

    // ── Image transform ───────────────────────────────────────────────
    const imageTransform = `scale(${zoom}) rotate(${rotation}deg)`

    // ── Overlay positions ─────────────────────────────────────────────
    const overlayStyles = {
      top: { height: `${crop.y}px` },
      bottom: { height: `${Math.max(0, containerSize.height - crop.y - crop.height)}px` },
      left: {
        top: `${crop.y}px`,
        height: `${crop.height}px`,
        width: `${crop.x}px`,
      },
      right: {
        top: `${crop.y}px`,
        height: `${crop.height}px`,
        width: `${Math.max(0, containerSize.width - crop.x - crop.width)}px`,
      },
    }

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-motion={motionLevel}
        {...(rounded ? { 'data-rounded': '' } : {})}
        {...rest}
      >
        <div
          ref={containerRef}
          className="ui-cropper__container"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          role="application"
          aria-label="Image cropper"
          aria-roledescription="cropper"
        >
          <img
            ref={imageRef}
            src={src}
            alt="Image to crop"
            className="ui-cropper__image"
            onLoad={handleImageLoad}
            style={{ transform: imageTransform, pointerEvents: rotation !== 0 ? 'none' : undefined }}
            draggable={false}
          />

          {imageLoaded && (
            <>
              {/* Overlay */}
              <div className="ui-cropper__overlay" aria-hidden="true">
                <div className="ui-cropper__overlay-top" style={overlayStyles.top} />
                <div className="ui-cropper__overlay-bottom" style={overlayStyles.bottom} />
                <div className="ui-cropper__overlay-left" style={overlayStyles.left} />
                <div className="ui-cropper__overlay-right" style={overlayStyles.right} />
              </div>

              {/* Crop area */}
              <div
                className="ui-cropper__crop-area"
                style={{
                  insetBlockStart: `${crop.y}px`,
                  insetInlineStart: `${crop.x}px`,
                  inlineSize: `${crop.width}px`,
                  blockSize: `${crop.height}px`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                role="slider"
                aria-label="Crop region"
                aria-valuetext={`Position ${Math.round(crop.x)}, ${Math.round(crop.y)}, size ${Math.round(crop.width)} by ${Math.round(crop.height)}`}
                tabIndex={0}
              >
                {/* Grid */}
                {showGrid && (
                  <div className="ui-cropper__grid" aria-hidden="true">
                    <div className="ui-cropper__grid-line ui-cropper__grid-line--h1" />
                    <div className="ui-cropper__grid-line ui-cropper__grid-line--h2" />
                    <div className="ui-cropper__grid-line ui-cropper__grid-line--v1" />
                    <div className="ui-cropper__grid-line ui-cropper__grid-line--v2" />
                  </div>
                )}

                {/* Resize handles */}
                {HANDLE_POSITIONS.map(pos => (
                  <div
                    key={pos}
                    className={`ui-cropper__handle ui-cropper__handle--${pos}`}
                    style={{ cursor: HANDLE_CURSORS[pos] }}
                    onPointerDown={(e) => handlePointerDown(e, 'resize', pos)}
                    role="separator"
                    aria-orientation={pos === 'n' || pos === 's' ? 'horizontal' : 'vertical'}
                    aria-label={`Resize ${pos}`}
                    tabIndex={0}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        {(showZoom || showRotate) && (
          <div className="ui-cropper__controls">
            {showZoom && (
              <div className="ui-cropper__control-group">
                <span className="ui-cropper__control-label">Zoom</span>
                <input
                  type="range"
                  className="ui-cropper__slider"
                  min="0.5"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label="Zoom level"
                />
                <span className="ui-cropper__control-label">{Math.round(zoom * 100)}%</span>
              </div>
            )}

            {showRotate && (
              <div className="ui-cropper__control-group">
                <span className="ui-cropper__control-label">Rotate</span>
                <button
                  type="button"
                  className="ui-cropper__rotate-btn"
                  onClick={() => setRotation(prev => prev - 90)}
                  aria-label="Rotate left 90 degrees"
                  title="Rotate -90°"
                >
                  <span dangerouslySetInnerHTML={{ __html: rotateLeftIcon }} />
                </button>
                <button
                  type="button"
                  className="ui-cropper__rotate-btn"
                  onClick={() => setRotation(prev => prev + 90)}
                  aria-label="Rotate right 90 degrees"
                  title="Rotate +90°"
                >
                  <span dangerouslySetInnerHTML={{ __html: rotateRightIcon }} />
                </button>
                <input
                  type="range"
                  className="ui-cropper__slider"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  aria-label="Rotation angle"
                />
                <span className="ui-cropper__control-label">{rotation}°</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)
Cropper.displayName = 'Cropper'
