import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PipelineStage } from '../../domain/pipeline-stage'
import type { Stage } from '../../domain/pipeline-stage'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const stages: Stage[] = [
  { id: 'build', label: 'Build', status: 'success', duration: 45 },
  { id: 'test', label: 'Test', status: 'success', duration: 120 },
  { id: 'deploy', label: 'Deploy', status: 'running', duration: 30 },
  { id: 'verify', label: 'Verify', status: 'pending' },
]

describe('PipelineStage', () => {
  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<PipelineStage stages={stages} />)
      expect(container.querySelector('.ui-pipeline-stage')).toBeInTheDocument()
    })

    it('renders all stages', () => {
      render(<PipelineStage stages={stages} />)
      expect(screen.getByText('Build')).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Deploy')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
    })

    it('renders empty stages', () => {
      const { container } = render(<PipelineStage stages={[]} />)
      expect(container.querySelector('.ui-pipeline-stage')).toBeInTheDocument()
    })

    it('renders status indicators', () => {
      const { container } = render(<PipelineStage stages={stages} />)
      expect(container.querySelector('[data-status="success"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="running"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="pending"]')).toBeInTheDocument()
    })

    it('renders all status types', () => {
      const allStatuses: Stage[] = [
        { id: '1', label: 'A', status: 'pending' },
        { id: '2', label: 'B', status: 'running' },
        { id: '3', label: 'C', status: 'success' },
        { id: '4', label: 'D', status: 'failed' },
        { id: '5', label: 'E', status: 'skipped' },
      ]
      const { container } = render(<PipelineStage stages={allStatuses} />)
      expect(container.querySelector('[data-status="pending"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="running"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="success"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="failed"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="skipped"]')).toBeInTheDocument()
    })
  })

  describe('connectors', () => {
    it('renders connectors between stages', () => {
      const { container } = render(<PipelineStage stages={stages} />)
      const connectors = container.querySelectorAll('.ui-pipeline-stage__connector')
      expect(connectors.length).toBe(stages.length - 1)
    })

    it('no connectors for single stage', () => {
      const { container } = render(
        <PipelineStage stages={[{ id: '1', label: 'Build', status: 'success' }]} />
      )
      expect(container.querySelector('.ui-pipeline-stage__connector')).not.toBeInTheDocument()
    })
  })

  describe('orientation', () => {
    it('renders horizontal by default', () => {
      const { container } = render(<PipelineStage stages={stages} />)
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    })

    it('renders vertical', () => {
      const { container } = render(<PipelineStage stages={stages} orientation="vertical" />)
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })
  })

  describe('duration', () => {
    it('shows duration when available', () => {
      render(<PipelineStage stages={stages} />)
      expect(screen.getByText(/45s/)).toBeInTheDocument()
    })
  })

  describe('click handler', () => {
    it('calls onStageClick with stage id', () => {
      const onClick = vi.fn()
      render(<PipelineStage stages={stages} onStageClick={onClick} />)
      fireEvent.click(screen.getByText('Build'))
      expect(onClick).toHaveBeenCalledWith('build')
    })
  })

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<PipelineStage stages={stages} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<PipelineStage stages={stages} className="custom" />)
      expect(container.querySelector('.ui-pipeline-stage.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<PipelineStage stages={stages} data-testid="pipeline" />)
      expect(screen.getByTestId('pipeline')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(PipelineStage.displayName).toBe('PipelineStage')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<PipelineStage stages={stages} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with click handler', async () => {
      const { container } = render(<PipelineStage stages={stages} onStageClick={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses list semantics', () => {
      const { container } = render(<PipelineStage stages={stages} />)
      expect(container.querySelector('ol')).toBeInTheDocument()
    })
  })
})
