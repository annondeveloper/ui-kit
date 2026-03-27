export { solveSpring, springToLinearEasing, springDuration } from './spring'
export type { SpringConfig } from './spring'

export { animate, spring } from './animate'
export type { AnimateOptions, AnimationResult } from './animate'

export { solveDecay, solveGravity } from './physics'
export type { DecayConfig } from './physics'

export { Timeline, timeline } from './timeline'

export { computeStaggerDelays } from './stagger'
export type { StaggerConfig, StaggerFrom } from './stagger'

export { useScrollReveal, supportsScrollDrivenAnimations } from './scroll'
export type { ScrollRevealOptions } from './scroll'

export { flip } from './flip'

export { TextSplitter } from './text-splitter'
export type { TextSplitterProps } from './text-splitter'

export { interpolatePath } from './morph'

export { motion } from './controller'

export { MotionContext, MotionProvider } from './motion-context'

export { useMotionLevel } from './use-motion-level'

export { useEntrance } from './use-entrance'
export type { EntranceAnimation } from './use-entrance'

export { useSkeletonTransition } from './use-skeleton-transition'
export type { SkeletonTransitionResult } from './use-skeleton-transition'

export { useScrollScene } from './scroll-scene'
export type { ScrollSceneConfig } from './scroll-scene'

export { useViewTransition } from './use-view-transition'
export type { ViewTransitionOptions, ViewTransitionResult } from './use-view-transition'

export { getTransitionCSS } from './view-transition-presets'
export type { TransitionPreset } from './view-transition-presets'

export { Choreography, choreography } from './choreography'
export type { ChoreographyStep, ChoreographyConfig } from './choreography'

export { getChoreographyPreset } from './choreography-presets'
export type { ChoreographyPreset } from './choreography-presets'
