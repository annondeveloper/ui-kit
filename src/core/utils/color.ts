export interface OklchColor {
  l: number  // Lightness 0-1
  c: number  // Chroma 0-0.4
  h: number  // Hue 0-360
}

// --- hex ↔ sRGB ---

function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function srgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    const byte = Math.round(clamped * 255)
    return byte.toString(16).padStart(2, '0')
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// --- sRGB ↔ linear RGB ---

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// --- linear RGB ↔ XYZ (D65) ---

function linearRgbToXyz(r: number, g: number, b: number): [number, number, number] {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
    0.0193339 * r + 0.1191920 * g + 0.9503041 * b,
  ]
}

function xyzToLinearRgb(x: number, y: number, z: number): [number, number, number] {
  return [
     3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.9692660 * x + 1.8760108 * y + 0.0415560 * z,
     0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ]
}

// --- XYZ ↔ OKLAB (Björn Ottosson) ---

function xyzToOklab(x: number, y: number, z: number): [number, number, number] {
  const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
  const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
  const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z

  const l_c = Math.cbrt(l_)
  const m_c = Math.cbrt(m_)
  const s_c = Math.cbrt(s_)

  return [
    0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c,
    1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c,
    0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c,
  ]
}

function oklabToXyz(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l_c = l_ * l_ * l_
  const m_c = m_ * m_ * m_
  const s_c = s_ * s_ * s_

  return [
     1.2270138511 * l_c - 0.5577999807 * m_c + 0.2812561490 * s_c,
    -0.0405801784 * l_c + 1.1122568696 * m_c - 0.0716766787 * s_c,
    -0.0763812845 * l_c - 0.4214819784 * m_c + 1.5861632204 * s_c,
  ]
}

// --- OKLAB ↔ OKLCH ---

function oklabToOklch(L: number, a: number, b: number): OklchColor {
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h: c < 1e-8 ? 0 : h }
}

function oklchToOklab(color: OklchColor): [number, number, number] {
  const hRad = (color.h * Math.PI) / 180
  return [color.l, color.c * Math.cos(hRad), color.c * Math.sin(hRad)]
}

// --- Public API ---

export function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToSrgb(hex)
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]
  const [x, y, z] = linearRgbToXyz(lr, lg, lb)
  const [L, a, ob] = xyzToOklab(x, y, z)
  return oklabToOklch(L, a, ob)
}

export function oklchToHex(color: OklchColor): string {
  const [L, a, b] = oklchToOklab(color)
  const [x, y, z] = oklabToXyz(L, a, b)
  const [lr, lg, lb] = xyzToLinearRgb(x, y, z)
  return srgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb))
}

export function getContrastRatio(fg: OklchColor, bg: OklchColor): number {
  // Convert to relative luminance via XYZ Y channel
  function toLuminance(color: OklchColor): number {
    const [L, a, b] = oklchToOklab(color)
    const [, y] = oklabToXyz(L, a, b)
    const [, ly] = [0, y] // Y channel is relative luminance
    return ly
  }

  const l1 = toLuminance(fg)
  const l2 = toLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function adjustLightness(color: OklchColor, delta: number): OklchColor {
  return {
    l: Math.max(0, Math.min(1, color.l + delta)),
    c: color.c,
    h: color.h,
  }
}
