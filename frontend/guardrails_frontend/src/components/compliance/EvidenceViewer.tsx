import Modal from '../common/Modal'
import Card, { CardHeader, CardTitle, CardContent } from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { Download, ExternalLink, Shield, AlertTriangle, FileText } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

interface EvidenceItem {
  id: string
  type: 'violation' | 'policy' | 'audit'
  title: string
  description: string
  timestamp: string
  policyId?: string
  violationId?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status: 'compliant' | 'non_compliant' | 'partial'
}

interface ComplianceControl {
  framework: string
  control: string
  description: string
  status: 'compliant' | 'partial' | 'non_compliant'
  linkedPolicies: string[]
  evidence: EvidenceItem[]
}

interface EvidenceViewerProps {
  control: ComplianceControl | null
  isOpen: boolean
  onClose: () => void
}

export default function EvidenceViewer({ control, isOpen, onClose }: EvidenceViewerProps) {
  if (!control) return null

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'violation':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />
      case 'policy':
        return <Shield className="w-5 h-5 text-primary-600" />
      case 'audit':
        return <FileText className="w-5 h-5 text-blue-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success'
      case 'non_compliant':
        return 'danger'
      case 'partial':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Evidence: ${control.control}`} size="xl">
      <div className="space-y-6">
        {/* Control Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{control.control}</CardTitle>
              <Badge variant={getStatusColor(control.status) as any}>
                {control.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {control.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Framework:</span>
              <Badge variant="info">{control.framework}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Linked Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Linked Policies ({control.linkedPolicies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {control.linkedPolicies.map((policyId) => (
                <Link
                  key={policyId}
                  to={ROUTES.policyDetail(policyId)}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Policy {policyId}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evidence Timeline ({control.evidence.length} items)</CardTitle>
              <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                Export Evidence
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {control.evidence.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {getEvidenceIcon(item.type)}
                    </div>
                    {idx < control.evidence.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(item.status) as any} size="sm">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDateTime(item.timestamp)}</span>
                      {item.type === 'violation' && item.violationId && (
                        <Link
                          to={ROUTES.violations}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          View Violation <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {item.type === 'policy' && item.policyId && (
                        <Link
                          to={ROUTES.policyDetail(item.policyId)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          View Policy <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {item.severity && (
                        <Badge
                          variant={
                            item.severity === 'critical' || item.severity === 'high'
                              ? 'danger'
                              : item.severity === 'medium'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Evidence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {control.evidence.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliant Items</p>
                <p className="text-2xl font-bold text-success-600 mt-1">
                  {control.evidence.filter((e) => e.status === 'compliant').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Non-Compliant</p>
                <p className="text-2xl font-bold text-danger-600 mt-1">
                  {control.evidence.filter((e) => e.status === 'non_compliant').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}
