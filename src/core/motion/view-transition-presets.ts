// ─── View Transition Presets ─────────────────────────────────────────────────
// CSS keyframes + ::view-transition-* rules for each transition preset.
// Injected as a temporary <style> during document.startViewTransition().

export type TransitionPreset =
  | 'morph'
  | 'crossfade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'zoom'

/**
 * Returns a CSS string with @keyframes and ::view-transition-* rules
 * for the given preset and duration.
 */
export function getTransitionCSS(preset: TransitionPreset, duration = 300): string {
  const d = `${duration}ms`
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'

  switch (preset) {
    case 'morph':
      return `
::view-transition-old(root) {
  animation: vt-morph-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-morph-in ${d} ${ease} both;
}
@keyframes vt-morph-out {
  to { opacity: 0; transform: scale(0.94); }
}
@keyframes vt-morph-in {
  from { opacity: 0; transform: scale(1.06); }
}`

    case 'crossfade':
      return `
::view-transition-old(root) {
  animation: vt-fade-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-fade-in ${d} ${ease} both;
}
@keyframes vt-fade-out {
  to { opacity: 0; }
}
@keyframes vt-fade-in {
  from { opacity: 0; }
}`

    case 'slide-left':
      return `
::view-transition-old(root) {
  animation: vt-slide-left-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-slide-left-in ${d} ${ease} both;
}
@keyframes vt-slide-left-out {
  to { opacity: 0; transform: translateX(-100%); }
}
@keyframes vt-slide-left-in {
  from { opacity: 0; transform: translateX(100%); }
}`

    case 'slide-right':
      return `
::view-transition-old(root) {
  animation: vt-slide-right-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-slide-right-in ${d} ${ease} both;
}
@keyframes vt-slide-right-out {
  to { opacity: 0; transform: translateX(100%); }
}
@keyframes vt-slide-right-in {
  from { opacity: 0; transform: translateX(-100%); }
}`

    case 'slide-up':
      return `
::view-transition-old(root) {
  animation: vt-slide-up-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-slide-up-in ${d} ${ease} both;
}
@keyframes vt-slide-up-out {
  to { opacity: 0; transform: translateY(-100%); }
}
@keyframes vt-slide-up-in {
  from { opacity: 0; transform: translateY(100%); }
}`

    case 'zoom':
      return `
::view-transition-old(root) {
  animation: vt-zoom-out ${d} ${ease} both;
}
::view-transition-new(root) {
  animation: vt-zoom-in ${d} ${ease} both;
}
@keyframes vt-zoom-out {
  to { opacity: 0; transform: scale(1.1); }
}
@keyframes vt-zoom-in {
  from { opacity: 0; transform: scale(0.95); }
}`
  }
}
