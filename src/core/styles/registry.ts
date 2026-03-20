interface StyleEntry {
  css: string
  refCount: number
}

export class StyleRegistry {
  private entries = new Map<string, StyleEntry>()

  add(id: string, css: string): void {
    const existing = this.entries.get(id)
    if (existing) {
      existing.refCount++
      return
    }
    this.entries.set(id, { css, refCount: 1 })
  }

  remove(id: string): void {
    const entry = this.entries.get(id)
    if (!entry) return
    entry.refCount--
    if (entry.refCount <= 0) {
      this.entries.delete(id)
    }
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  refCount(id: string): number {
    return this.entries.get(id)?.refCount ?? 0
  }

  collectCSS(): string {
    return Array.from(this.entries.values()).map(e => e.css).join('\n')
  }
}
