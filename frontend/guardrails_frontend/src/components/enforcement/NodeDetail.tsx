import { Node } from 'reactflow'
import Modal from '../common/Modal'
import Badge from '../common/Badge'
import Card, { CardHeader, CardTitle, CardContent } from '../common/Card'

interface NodeData {
  label: string
  policies: number
  violations: number
  coverage: number
  status: 'healthy' | 'warning' | 'critical'
  description: string
}

interface NodeDetailProps {
  node: Node<NodeData> | null
  isOpen: boolean
  onClose: () => void
}

export default function NodeDetail({ node, isOpen, onClose }: NodeDetailProps) {
  if (!node) return null

  const { data } = node

  // Mock policy list for the node
  const nodePolicies = [
    { id: 'pol-001', name: 'Prompt Injection Detection', violations: 145 },
    { id: 'pol-003', name: 'Secrets Scanner', violations: 289 },
    { id: 'pol-006', name: 'Rate Limit Guardian', violations: 234 },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${data.label} - Details`} size="lg">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Node Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{data.description}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <Badge 
                    variant={data.status === 'healthy' ? 'success' : data.status === 'warning' ? 'warning' : 'danger'}
                  >
                    {data.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.policies}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Violations (24h)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.violations}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coverage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.coverage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.policies > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodePolicies.slice(0, data.policies).map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {policy.name}
                    </span>
                    <Badge variant="default" size="sm">
                      {policy.violations} violations
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  )
}
