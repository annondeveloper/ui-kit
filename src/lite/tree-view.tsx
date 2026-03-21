import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ nodes, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-tree-view${className ? ` ${className}` : ''}`} role="tree" {...rest}>
      {nodes.map(node => <TreeNodeItem key={node.id} node={node} />)}
    </div>
  )
)
TreeView.displayName = 'TreeView'
