export class StyleCollector {
  private collected = new Map<string, string>()

  add(id: string, css: string): void {
    if (!this.collected.has(id)) {
      this.collected.set(id, css)
    }
  }

  collect(): string {
    return Array.from(this.collected.values()).join('\n')
  }

  getIds(): string[] {
    return Array.from(this.collected.keys())
  }

  clear(): void {
    this.collected.clear()
  }
}
