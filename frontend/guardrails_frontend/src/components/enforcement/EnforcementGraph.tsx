import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Badge from '../common/Badge'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface NodeData {
  label: string
  policies: number
  violations: number
  coverage: number
  status: 'healthy' | 'warning' | 'critical'
  description: string
}

const CustomNode = ({ data }: { data: NodeData }) => {
  const statusColors = {
    healthy: 'border-success-500 bg-success-50 dark:bg-success-900/20',
    warning: 'border-warning-500 bg-warning-50 dark:bg-warning-900/20',
    critical: 'border-danger-500 bg-danger-50 dark:bg-danger-900/20',
  }

  const statusIcons = {
    healthy: <CheckCircle className="w-5 h-5 text-success-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-600" />,
    critical: <AlertTriangle className="w-5 h-5 text-danger-600" />,
  }

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg bg-white dark:bg-gray-800 min-w-[200px] ${statusColors[data.status]}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {data.label}
        </h3>
        {statusIcons[data.status]}
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {data.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Active Policies:</span>
          <Badge variant="info" size="sm">{data.policies}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Violations (24h):</span>
          <Badge 
            variant={data.violations > 100 ? 'danger' : data.violations > 50 ? 'warning' : 'success'} 
            size="sm"
          >
            {data.violations}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
          <Badge 
            variant={data.coverage >= 90 ? 'success' : data.coverage >= 70 ? 'warning' : 'danger'} 
            size="sm"
          >
            {data.coverage}%
          </Badge>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

interface EnforcementGraphProps {
  onNodeClick?: (event: React.MouseEvent, node: Node<NodeData>) => void
}

export default function EnforcementGraph({ onNodeClick }: EnforcementGraphProps) {
  const nodes: Node<NodeData>[] = useMemo(() => [
    {
      id: 'client',
      type: 'custom',
      position: { x: 250, y: 0 },
      data: {
        label: 'Client',
        policies: 0,
        violations: 0,
        coverage: 0,
        status: 'healthy',
        description: 'User requests enter here',
      },
    },
    {
      id: 'intercept',
      type: 'custom',
      position: { x: 250, y: 150 },
      data: {
        label: 'Gateway: Intercept',
        policies: 5,
        violations: 789,
        coverage: 95,
        status: 'warning',
        description: 'Input validation & blocking',
      },
    },
    {
      id: 'evaluate',
      type: 'custom',
      position: { x: 250, y: 300 },
      data: {
        label: 'Gateway: Evaluate',
        policies: 3,
        violations: 458,
        coverage: 88,
        status: 'healthy',
        description: 'Output validation & redaction',
      },
    },
    {
      id: 'llm',
      type: 'custom',
      position: { x: 50, y: 450 },
      data: {
        label: 'LLM Provider',
        policies: 0,
        violations: 0,
        coverage: 0,
        status: 'healthy',
        description: 'AI model processing',
      },
    },
    {
      id: 'tools',
      type: 'custom',
      position: { x: 450, y: 450 },
      data: {
        label: 'Tools & Functions',
        policies: 1,
        violations: 87,
        coverage: 75,
        status: 'warning',
        description: 'External tool calls',
      },
    },
  ], [])

  const edges: Edge[] = useMemo(() => [
    {
      id: 'client-intercept',
      source: 'client',
      target: 'intercept',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
    {
      id: 'intercept-evaluate',
      source: 'intercept',
      target: 'evaluate',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
    {
      id: 'evaluate-llm',
      source: 'evaluate',
      target: 'llm',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#22c55e', strokeWidth: 2 },
    },
    {
      id: 'evaluate-tools',
      source: 'evaluate',
      target: 'tools',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#22c55e', strokeWidth: 2 },
    },
  ], [])

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    onNodeClick?.(event, node)
  }, [onNodeClick])

  return (
    <div className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const status = (node.data as NodeData).status
            return status === 'healthy' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}
