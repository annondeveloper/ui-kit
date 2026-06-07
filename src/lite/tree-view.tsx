import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const treeViewStyles = css`
  @layer components {
    @scope (.ui-lite-tree-view) {
      :scope {
        font-size: 0.8125rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-tree-view__node {
        margin-inline-start: 0;
      }
      .ui-lite-tree-view__node summary {
        cursor: pointer;
        padding-block: 0.25rem;
        padding-inline: 0.375rem;
        border-radius: var(--radius-sm, 6px);
        list-style: none;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .ui-lite-tree-view__node summary::-webkit-details-marker {
        display: none;
      }
      .ui-lite-tree-view__node summary::before {
        content: '\\25B6';
        font-size: 0.5rem;
      }
      .ui-lite-tree-view__node[open] > summary::before {
        transform: rotate(90deg);
      }
      .ui-lite-tree-view__node summary:hover {
        background: oklch(100% 0 0 / 0.04);
      }
      .ui-lite-tree-view__children {
        margin-inline-start: 1.25rem;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        padding-inline-start: 0.5rem;
      }
      .ui-lite-tree-view__leaf {
        padding-block: 0.25rem;
        padding-inline-start: 1rem;
        padding-inline-end: 0.375rem;
      }
    }
  }
`

export interface LiteTreeNode {
  id: string
  label: ReactNode
  children?: LiteTreeNode[]
}

export interface LiteTreeViewProps extends HTMLAttributes<HTMLDivElement> {
  nodes: LiteTreeNode[]
}

function TreeNodeItem({ node }: { node: LiteTreeNode }) {
  if (node.children?.length) {
    return (
      <details className="ui-lite-tree-view__node">
        <summary>{node.label}</summary>
        <div className="ui-lite-tree-view__children">
          {node.children.map(child => <TreeNodeItem key={child.id} node={child} />)}
        </div>
      </details>
    )
  }
  return <div className="ui-lite-tree-view__leaf">{node.label}</div>
}

export const TreeView = forwardRef<HTMLDivElement, LiteTreeViewProps>(
  ({ nodes, className, ...rest }, ref) => {
    useStyles('lite-tree-view', treeViewStyles)
    return (
      <div ref={ref} className={`ui-lite-tree-view${className ? ` ${className}` : ''}`} role="tree" {...rest}>
        {nodes.map(node => <TreeNodeItem key={node.id} node={node} />)}
      </div>
    )
  }
)
TreeView.displayName = 'TreeView'
