import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Shield,
  CheckCircle,
  GitBranch,
  Activity,
  AlertTriangle,
  FileCheck,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { ROUTES } from '../../utils/constants'

const navigation = [
  { name: 'Overview', href: ROUTES.overview, icon: LayoutDashboard },
  { name: 'Policies', href: ROUTES.policies, icon: Shield },
  { name: 'Checks & Providers', href: ROUTES.checks, icon: CheckCircle },
  { name: 'Enforcement Map', href: ROUTES.enforcementMap, icon: GitBranch },
  { name: 'Heat Maps', href: ROUTES.heatmaps, icon: Activity },
  { name: 'Violations & Audit', href: ROUTES.violations, icon: AlertTriangle },
  { name: 'Compliance', href: ROUTES.compliance, icon: FileCheck },
  { name: 'Settings', href: ROUTES.settings, icon: Settings },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()

  return (
    <div
      className={`
        hidden lg:flex lg:flex-col fixed inset-y-0 z-40
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!sidebarCollapsed && (
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              Guardrails
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebarCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-gray-500 transition-transform ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `
              flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
              transition-colors group
              ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {!sidebarCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold">Guardrails Platform</p>
            <p>v0.1.0</p>
          </div>
        )}
      </div>
    </div>
  )
}
