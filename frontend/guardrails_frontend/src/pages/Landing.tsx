import { ArrowRight, Shield, FileCheck, CheckCircle, X, Zap, Settings, BarChart3, ExternalLink } from 'lucide-react'
import Button from '../components/common/Button'
import { Link, useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  const handleRequestAccess = () => {
    navigate('/overview')
  }

  const handleSeeEnforcement = () => {
    navigate('/overview')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/overview" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Guardrails Platform</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Sign In
              </Link>
              <Button variant="primary" size="sm" onClick={handleRequestAccess}>
                Request Early Access
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1️⃣ ATTENTION — Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              AI Needs Guardrails.
              <br />
              <span className="text-primary-600">Not Hope.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              A policy enforcement and audit platform that controls how AI systems behave — across inputs, outputs, tools, and data access.
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
              Built for production AI. Designed for DPDP, GDPR, and SOC2.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />} onClick={handleRequestAccess}>
                Request Early Access
              </Button>
              <Button variant="secondary" size="lg" onClick={handleSeeEnforcement}>
                See how enforcement works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ INTEREST — Problem Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why AI Systems Become Risky Fast
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI systems don't fail loudly — they fail silently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              "Prompts live everywhere, enforcement lives nowhere",
              "Teams can't explain why AI allowed or blocked something",
              "PII and secrets leak before anyone notices",
              "Compliance teams have no audit trail",
              "Engineers don't know where guardrails actually apply",
            ].map((pain, idx) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-900 dark:text-white font-medium">{pain}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-8 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              Most teams add safety after something breaks.
              <br />
              <span className="text-danger-600">That's not governance — that's damage control.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3️⃣ INTEREST — Solution Introduction */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              A Control Plane for AI Systems
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Guardrails Platform sits between your applications and AI models to define policies, enforce them consistently, and make risk visible — in real time.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <Zap className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SDKs and gateways</h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <Shield className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">LLM inputs and outputs</h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <Settings className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tool calls and data access</h3>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              All with full auditability.
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400 italic">
              If cloud needs a control plane, AI needs one even more.
            </p>
          </div>
        </div>
      </section>

      {/* 4️⃣ DESIRE — How It Works */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                step: "1",
                title: "Define Policies",
                description: "Human-readable rules for AI behavior — written in YAML or built visually.",
                icon: FileCheck,
              },
              {
                step: "2",
                title: "Enforce Everywhere",
                description: "Policies are enforced at inputs, outputs, tools, and data boundaries — not just in prompts.",
                icon: Shield,
              },
              {
                step: "3",
                title: "See Risk Clearly",
                description: "Heat maps and enforcement maps show where guardrails trigger and where gaps exist.",
                icon: BarChart3,
              },
              {
                step: "4",
                title: "Prove Compliance",
                description: "Every AI decision is traceable, auditable, and exportable.",
                icon: CheckCircle,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full pt-12">
                  <item.icon className="w-8 h-8 text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              No hidden logic. No blind spots. No guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* 5️⃣ DESIRE — Capabilities */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What You Can Control
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                icon: "🧠",
                category: "AI Safety",
                items: [
                  "Prompt injection prevention",
                  "Toxic and unsafe output control",
                  "Hallucination and confidence checks",
                ],
              },
              {
                icon: "🔐",
                category: "Data & Secrets Protection",
                items: [
                  "PII detection and redaction",
                  "Secrets and credential scanning",
                  "Data minimization enforcement",
                ],
              },
              {
                icon: "⚙️",
                category: "Tool & Action Control",
                items: [
                  "Tool allowlists",
                  "High-risk action approvals",
                  "Human-in-the-loop enforcement",
                ],
              },
              {
                icon: "👁️",
                category: "Visibility & Audit",
                items: [
                  "Risk heat maps",
                  "Enforcement maps",
                  "Immutable audit trails",
                ],
              },
            ].map((capability, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">{capability.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {capability.category}
                </h3>
                <ul className="space-y-2">
                  {capability.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Policies aren't just written — they're enforced, observed, and proven.
            </p>
          </div>
        </div>
      </section>

      {/* 6️⃣ DESIRE — Differentiation */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Guardrails Platform Is Different
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Not Just Another AI Tool
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <X className="w-6 h-6 text-danger-600" />
                What It's Not
              </h3>
              <div className="space-y-4">
                {[
                  "Not prompt engineering",
                  "Not post-hoc moderation",
                  "Not scattered safety logic",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                    <X className="w-5 h-5 text-danger-600 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-success-600" />
                What Makes This Different
              </h3>
              <div className="space-y-4">
                {[
                  "Policy-driven, not hardcoded",
                  "Enforcement is architectural, not optional",
                  "Works across providers and entry points",
                  "Built with compliance in mind from day one",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              This isn't AI safety bolted on.
              <br />
              <span className="text-primary-600">This is AI governance built in.</span>
            </p>
          </div>
        </div>
      </section>

      {/* 7️⃣ DESIRE — Compliance */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Designed for Regulated AI
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Guardrails Platform is built to support:
              </h3>
              <div className="space-y-4">
                {[
                  { name: "DPDP (India)", icon: "🇮🇳" },
                  { name: "GDPR (Global)", icon: "🌍" },
                  { name: "SOC2-aligned controls", icon: "🔒" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                With:
              </h3>
              <div className="space-y-4">
                {[
                  "Data minimization",
                  "Traceable decisions",
                  "Configurable retention",
                  "Exportable evidence",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Compliance shouldn't slow AI down — it should make it safe to scale.
            </p>
          </div>
        </div>
      </section>

      {/* 8️⃣ ACTION — Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Take Control of Your AI Systems
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Whether you're deploying your first LLM or running AI at scale, Guardrails Platform gives you control, visibility, and confidence.
          </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button 
               variant="secondary" 
               size="lg" 
               icon={<ArrowRight className="w-5 h-5" />}
               className="bg-white text-primary-600 hover:bg-primary-50"
               onClick={handleRequestAccess}
             >
               Request Early Access
             </Button>
            <button 
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-lg border-2 border-white text-white hover:bg-white/10 transition-colors focus-ring"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Architecture Overview
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-primary-600" />
              <span className="text-white font-semibold">Guardrails Platform</span>
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} Guardrails Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
