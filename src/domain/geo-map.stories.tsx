import type { Meta, StoryObj } from '@storybook/react'
import { GeoMap, type GeoPoint, type GeoConnection } from './geo-map'

const meta: Meta<typeof GeoMap> = {
  title: 'Domain/GeoMap',
  component: GeoMap,
  argTypes: {
    showLabels: { control: 'boolean' },
    interactive: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof GeoMap>

const cities: GeoPoint[] = [
  { id: 'nyc', lat: 40.7, lng: -74, label: 'New York', status: 'ok', value: 90 },
  { id: 'lon', lat: 51.5, lng: -0.1, label: 'London', status: 'ok', value: 75 },
  { id: 'tok', lat: 35.7, lng: 139.7, label: 'Tokyo', status: 'warning', value: 60 },
  { id: 'syd', lat: -33.9, lng: 151.2, label: 'Sydney', status: 'ok', value: 40 },
  { id: 'sao', lat: -23.5, lng: -46.6, label: 'Sao Paulo', status: 'critical', value: 30 },
]

const connections: GeoConnection[] = [
  { from: 'nyc', to: 'lon', status: 'ok' },
  { from: 'lon', to: 'tok', status: 'warning' },
  { from: 'tok', to: 'syd', status: 'ok' },
  { from: 'nyc', to: 'sao', status: 'critical' },
]

export const Default: Story = {
  args: { points: cities, showLabels: true, height: 400 },
}

export const WithConnections: Story = {
  args: { points: cities, connections, showLabels: true, height: 400 },
}

export const Interactive: Story = {
  args: {
    points: cities,
    connections,
    showLabels: true,
    interactive: true,
    height: 400,
    onPointClick: (p) => alert(`Clicked: ${p.label}`),
  },
}

export const Minimal: Story = {
  args: {
    points: [
      { id: 'a', lat: 48.9, lng: 2.3, status: 'ok' },
      { id: 'b', lat: 34, lng: -118, status: 'critical' },
    ],
    height: 300,
  },
}
