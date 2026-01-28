import { useState, useCallback } from 'react'
import { Node } from 'reactflow'
import Card from '../../components/common/Card'
import EnforcementGraph from '../../components/enforcement/EnforcementGraph'
import NodeDetail from '../../components/enforcement/NodeDetail'
import Alert from '../../components/common/Alert'

interface NodeData {
  label: string
  policies: number
  violations: number
  coverage: number
  status: 'healthy' | 'warning' | 'critical'
  description: string
}

export default function EnforcementMap() {
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node)
    setIsDetailOpen(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Enforcement Map
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visual flow of policy enforcement through your system
        </p>
      </div>

      {/* Info Alert */}
      <Alert variant="info" title="How to Use">
        <p className="text-sm">
          Click on any node to see detailed information about policies, violations, and coverage.
          The flow shows: <strong>Client</strong> → <strong>Intercept Gateway</strong> → <strong>Evaluate Gateway</strong> → <strong>LLM/Tools</strong>
        </p>
      </Alert>

      {/* React Flow Graph */}
      <Card padding="none">
        <div className="p-4">
          <EnforcementGraph onNodeClick={handleNodeClick} />
        </div>
      </Card>

      {/* Legend */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-success-500 bg-success-50" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Healthy (Coverage ≥ 88%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-warning-500 bg-warning-50" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Warning (Coverage 70-87%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-danger-500 bg-danger-50" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Critical (Coverage &lt; 70%)</span>
          </div>
        </div>
      </Card>

      {/* Node Detail Modal */}
      <NodeDetail
        node={selectedNode}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}
