/**
 * @module @annondeveloper/ui-kit
 *
 * Zero-dependency React component library with 147 components across 3 weight
 * tiers (Lite/Standard/Premium). Features physics-based animations, OKLCH color
 * system, Aurora Fluid design identity, built-in form engine, and MCP server
 * for AI-assisted development.
 *
 * @example
 * ```tsx
 * import { UIProvider, Button, Card, MetricCard } from '@annondeveloper/ui-kit'
 *
 * function App() {
 *   return (
 *     <UIProvider>
 *       <Card>
 *         <Button variant="primary">Deploy</Button>
 *         <MetricCard title="CPU" value="87.4%" trend="up" />
 *       </Card>
 *     </UIProvider>
 *   )
 * }
 * ```
 */

// Core engines
export * from './core/styles'
// Motion — re-export everything except Timeline (name conflict with component)
export { solveSpring, springToLinearEasing, springDuration } from './core/motion/spring'
export type { SpringConfig } from './core/motion/spring'
export { animate, spring } from './core/motion/animate'
export type { AnimateOptions, AnimationResult } from './core/motion/animate'
export { solveDecay, solveGravity } from './core/motion/physics'
export type { DecayConfig } from './core/motion/physics'
export { Timeline as AnimationTimeline, timeline } from './core/motion/timeline'
export { computeStaggerDelays } from './core/motion/stagger'
export type { StaggerConfig, StaggerFrom } from './core/motion/stagger'
export { useScrollReveal, supportsScrollDrivenAnimations } from './core/motion/scroll'
export type { ScrollRevealOptions } from './core/motion/scroll'
export { flip } from './core/motion/flip'
export { TextSplitter } from './core/motion/text-splitter'
export type { TextSplitterProps } from './core/motion/text-splitter'
export { interpolatePath } from './core/motion/morph'
export { motion } from './core/motion/controller'
export { MotionContext, MotionProvider } from './core/motion/motion-context'
export { useMotionLevel } from './core/motion/use-motion-level'
export { useEntrance } from './core/motion/use-entrance'
export type { EntranceAnimation } from './core/motion/use-entrance'
export { useSkeletonTransition } from './core/motion/use-skeleton-transition'
export type { SkeletonTransitionResult } from './core/motion/use-skeleton-transition'
export { useScrollScene } from './core/motion/scroll-scene'
export type { ScrollSceneConfig } from './core/motion/scroll-scene'
export { useViewTransition } from './core/motion/use-view-transition'
export type { ViewTransitionOptions, ViewTransitionResult } from './core/motion/use-view-transition'
export { getTransitionCSS } from './core/motion/view-transition-presets'
export type { TransitionPreset } from './core/motion/view-transition-presets'
export { Choreography, choreography } from './core/motion/choreography'
export type { ChoreographyStep, ChoreographyConfig } from './core/motion/choreography'
export { getChoreographyPreset } from './core/motion/choreography-presets'
export type { ChoreographyPreset } from './core/motion/choreography-presets'
export { useScrollChoreography } from './core/motion/scroll-choreography'
export type { ScrollChoreographyConfig } from './core/motion/scroll-choreography'
export * from './core/tokens'
export * from './core/icons'
export * from './core/a11y'
export * from './core/input'
export * from './core/utils'
export * from './core/forms'
export * from './core/perf'

// Components
export * from './components'

// Domain
export * from './domain'

// Graph layout engine (for advanced users)
export { computeLayout, forceDirectedLayout, dagreLayout, circularLayout, gridLayout, Quadtree } from './core/graph'
export type { GraphNode, GraphEdge, LayoutOptions, LayoutResult, QuadtreeNode } from './core/graph'
