class MotionControllerClass {
  private animations = new Set<Animation>()
  private _playbackRate = 1
  private _paused = false

  register(animation: Animation): void {
    this.animations.add(animation)
    animation.onfinish = () => this.animations.delete(animation)
    animation.oncancel = () => this.animations.delete(animation)
    if (this._paused) animation.pause()
    animation.playbackRate = this._playbackRate
  }

  pause(): void {
    this._paused = true
    for (const a of this.animations) a.pause()
  }

  resume(): void {
    this._paused = false
    for (const a of this.animations) a.play()
  }

  clear(): void {
    for (const a of this.animations) a.cancel()
    this.animations.clear()
  }

  get playbackRate(): number {
    return this._playbackRate
  }
  set playbackRate(rate: number) {
    this._playbackRate = rate
    for (const a of this.animations) a.playbackRate = rate
  }

  get count(): number {
    return this.animations.size
  }
}

export const motion = new MotionControllerClass()
