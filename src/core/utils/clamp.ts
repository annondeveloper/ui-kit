export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function stripCidr(ip: string): string {
  return ip.split('/')[0]
}
