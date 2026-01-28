import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import { POLICY_CATEGORIES, POLICY_SCOPES, ROUTES, DECISION_TYPES } from '../../utils/constants'
import { PolicyCreateRequest } from '../../types/policy'
import { useMutation } from '@tanstack/react-query'
import { policiesApi } from '../../api/policies'
import { useToast } from '../../hooks/useToast'

export default function PolicyBuilder() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<PolicyCreateRequest>>({
    name: '',
    description: '',
    category: undefined,
    scope: [],
    severity: 'medium',
    endpoints: [],
    checks: [],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [],
  })

  const createMutation = useMutation({
    mutationFn: (data: PolicyCreateRequest) => policiesApi.create(data),
    onSuccess: (data) => {
      toast.success('Policy created successfully!')
      navigate(ROUTES.policyDetail(data.id))
    },
    onError: (error: any) => {
      toast.error('Failed to create policy: ' + error.message)
    },
  })

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Policy details' },
    { number: 2, title: 'Category', description: 'Select category' },
    { number: 3, title: 'Scope', description: 'Define scope' },
    { number: 4, title: 'Checks', description: 'Configure checks' },
    { number: 5, title: 'Decision', description: 'Set decision logic' },
    { number: 6, title: 'Actions', description: 'Configure actions' },
    { number: 7, title: 'Review', description: 'Review & save' },
  ]

  const handleNext = () => {
    if (step < 7) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSave = () => {
    createMutation.mutate(formData as PolicyCreateRequest)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(ROUTES.policies)}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Policies
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Follow the steps below to create a new guardrail policy
        </p>
      </div>

      {/* Progress Stepper */}
      <Card>
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      step === s.number
                        ? 'bg-primary-600 text-white'
                        : step > s.number
                        ? 'bg-success-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}
                >
                  {s.number}
                </div>
                <div className="text-center mt-2 hidden md:block">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {s.description}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`
                    w-12 md:w-20 h-0.5 mx-2
                    ${step > s.number ? 'bg-success-600' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card>
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <Input
                label="Policy Name"
                placeholder="e.g., Prompt Injection Detection"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Describe what this policy does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POLICY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value as any })}
                    className={`
                      p-6 rounded-lg border-2 text-left transition-colors
                      ${
                        formData.category === cat.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {cat.label}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Define Scope
              </h2>
              <div className="space-y-4">
                {POLICY_SCOPES.map((scopeItem) => (
                  <label
                    key={scopeItem.value}
                    className="flex items-start p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-400 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.scope?.includes(scopeItem.value as any)}
                      onChange={(e) => {
                        const newScope = e.target.checked
                          ? [...(formData.scope || []), scopeItem.value]
                          : formData.scope?.filter((s) => s !== scopeItem.value)
                        setFormData({ ...formData, scope: newScope as any })
                      }}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {scopeItem.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scopeItem.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Configure Checks
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the checks to run for this policy. You can add checks later.
              </p>
              <div className="space-y-3">
                {['pii_detection', 'secrets_scan', 'toxicity', 'prompt_injection'].map((checkName) => (
                  <label
                    key={checkName}
                    className="flex items-start p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-400 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.checks?.some(c => c.check === checkName)}
                      onChange={(e) => {
                        const currentChecks = formData.checks || []
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            checks: [...currentChecks, {
                              provider: 'guardrails',
                              check: checkName,
                              version: '1.0.0',
                              config: {},
                            }],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            checks: currentChecks.filter(c => c.check !== checkName),
                          })
                        }
                      }}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {checkName.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {checkName === 'pii_detection' && 'Detects personally identifiable information'}
                        {checkName === 'secrets_scan' && 'Scans for exposed API keys and credentials'}
                        {checkName === 'toxicity' && 'Detects toxic or harmful content'}
                        {checkName === 'prompt_injection' && 'Detects prompt injection attempts'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Decision Logic
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    On Check Failure
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={formData.decision?.onFail || 'deny'}
                    onChange={(e) => setFormData({
                      ...formData,
                      decision: {
                        ...formData.decision!,
                        onFail: e.target.value as any,
                      },
                    })}
                  >
                    {DECISION_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value.toLowerCase()}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    On Check Pass
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={formData.decision?.onPass || 'allow'}
                    onChange={(e) => setFormData({
                      ...formData,
                      decision: {
                        ...formData.decision!,
                        onPass: e.target.value as any,
                      },
                    })}
                  >
                    {DECISION_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value.toLowerCase()}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Configure Actions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Optional: Configure actions to take when this policy is triggered. You can add actions later.
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actions can be configured after the policy is created. This step is optional.
                </p>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Review & Save
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Name</h3>
                  <p className="text-gray-900 dark:text-white">{formData.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Description</h3>
                  <p className="text-gray-900 dark:text-white">{formData.description}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Category</h3>
                  <Badge>{formData.category?.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Severity</h3>
                  <Badge variant="warning">{formData.severity}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={step === 1}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          {step < 7 ? (
            <Button
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              loading={createMutation.isPending}
              icon={<Save className="w-4 h-4" />}
            >
              Create Policy
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
