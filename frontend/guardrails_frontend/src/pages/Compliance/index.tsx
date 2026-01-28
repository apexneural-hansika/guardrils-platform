import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { FileCheck, Download, ExternalLink } from 'lucide-react'
import { COMPLIANCE_FRAMEWORKS } from '../../utils/constants'
import EvidenceViewer from '../../components/compliance/EvidenceViewer'
import { complianceApi } from '../../api/compliance'
import { useToast } from '../../hooks/useToast'

export default function Compliance() {
  const [selectedControl, setSelectedControl] = useState<string | null>(null)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)
  const toast = useToast()

  // Fetch compliance frameworks
  const { data: frameworks, isLoading, error } = useQuery({
    queryKey: ['compliance', 'frameworks'],
    queryFn: () => complianceApi.listFrameworks(),
    retry: 1,
    onError: (err) => {
      console.error('Error fetching compliance frameworks:', err)
    },
  })

  const handleViewEvidence = (controlId: string) => {
    setSelectedControl(controlId)
    setIsEvidenceOpen(true)
  }

  const handleExportReport = async (frameworkId: string) => {
    try {
      const blob = await complianceApi.generateReport(frameworkId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compliance-report-${frameworkId}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report downloaded successfully')
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report: ' + (error.message || 'Unknown error'))
    }
  }

  // Fetch control details when selected
  const { data: control } = useQuery({
    queryKey: ['compliance', 'control', selectedControl],
    queryFn: () => complianceApi.getControl(selectedControl!),
    enabled: !!selectedControl,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-danger-600 dark:text-danger-400">
          <p className="font-medium">Failed to load compliance data</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </Card>
    )
  }

  // Flatten controls from all frameworks
  const allControls = frameworks?.flatMap(framework =>
    framework.controls.map(control => ({
      ...control,
      frameworkName: framework.name,
      frameworkId: framework.id,
    }))
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Compliance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Framework compliance status and evidence
          </p>
        </div>
        <Button variant="primary" icon={<Download className="w-4 h-4" />}>
          Export Report
        </Button>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPLIANCE_FRAMEWORKS.map((framework) => {
          const frameworkData = frameworks?.find(f => f.id === framework.id)
          const controls = frameworkData?.controls || []
          const compliantCount = controls.filter(c => c.status === 'compliant').length
          const totalCount = controls.length
          
          return (
            <Card key={framework.id} hover>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {framework.name}
                </h3>
                <Badge variant={compliantCount === totalCount ? 'success' : 'warning'}>
                  {totalCount > 0 ? `${compliantCount}/${totalCount}` : 'N/A'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {framework.fullName}
              </p>
              {totalCount > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => handleExportReport(framework.id)}
                >
                  Export Report
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Compliance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {allControls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Framework
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Control
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Linked Policies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {allControls.map((control) => (
                    <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {control.frameworkName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {control.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {control.linkedPolicies?.length || 0} policies
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            control.status === 'compliant'
                              ? 'success'
                              : control.status === 'partial'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {control.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewEvidence(control.id)}
                          className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                        >
                          View Evidence <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No compliance data available</p>
              <p className="text-sm mt-1">Compliance frameworks will appear here once configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <div className="flex items-start space-x-4">
          <FileCheck className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Compliance Evidence
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All audit events are linked to compliance controls. Export time-scoped
              reports for auditors or regulators.
            </p>
          </div>
        </div>
      </Card>

      {/* Evidence Viewer Modal */}
      <EvidenceViewer
        control={control || undefined}
        isOpen={isEvidenceOpen}
        onClose={() => {
          setIsEvidenceOpen(false)
          setSelectedControl(null)
        }}
      />
    </div>
  )
}
