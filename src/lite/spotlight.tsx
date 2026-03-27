import { Spotlight as StandardSpotlight, type SpotlightProps, type SpotlightAction } from '../components/spotlight'

export type { SpotlightAction as LiteSpotlightAction }
export type LiteSpotlightProps = Omit<SpotlightProps, 'motion'>

export function Spotlight(props: LiteSpotlightProps) {
  return <StandardSpotlight motion={0} {...props} />
}
Spotlight.displayName = 'Spotlight'
