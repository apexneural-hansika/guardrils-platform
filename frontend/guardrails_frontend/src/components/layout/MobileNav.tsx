import { NavLink } from 'react-router-dom'
import { X, Shield } from 'lucide-react'
import {
  LayoutDashboard,
  Shield as ShieldIcon,
  CheckCircle,
  GitBranch,
  Activity,
  AlertTriangle,
  FileCheck,
  Settings,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { ROUTES } from '../../utils/constants'

const navigation = [
  { name: 'Overview', href: ROUTES.overview, icon: LayoutDashboard },
  { name: 'Policies', href: ROUTES.policies, icon: ShieldIcon },
  { name: 'Checks & Providers', href: ROUTES.checks, icon: CheckCircle },
  { name: 'Enforcement Map', href: ROUTES.enforcementMap, icon: GitBranch },
  { name: 'Heat Maps', href: ROUTES.heatmaps, icon: Activity },
  { name: 'Violations & Audit', href: ROUTES.violations, icon: AlertTriangle },
  { name: 'Compliance', href: ROUTES.compliance, icon: FileCheck },
  { name: 'Settings', href: ROUTES.settings, icon: Settings },
]

export default function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()

  if (!mobileNavOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 lg:hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              Guardrails
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                transition-colors
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
