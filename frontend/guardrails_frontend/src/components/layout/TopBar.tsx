import { Menu, Sun, Moon, User, LogOut, Bell, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { ENVIRONMENTS } from '../../utils/constants'
import { useState } from 'react'

export default function TopBar() {
  const { toggleMobileNav, theme, setTheme } = useUIStore()
  const { user, environment, setEnvironment, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showEnvMenu, setShowEnvMenu] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={toggleMobileNav}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Right: Environment, Theme, Notifications, User */}
        <div className="flex items-center space-x-3">
          {/* Environment Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowEnvMenu(!showEnvMenu)}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium
                ${environment.color} text-white hover:opacity-90 transition-opacity
              `}
            >
              <span>{environment.name}</span>
            </button>
            {showEnvMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => {
                      setEnvironment(env)
                      setShowEnvMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${env.color}`} />
                    <span>{env.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'user@example.com'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                    {user?.role || 'admin'}
                  </p>
                </div>
                <Link
                  to="/landing"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setShowUserMenu(false)
                    navigate('/landing')
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Warning Banner */}
      {environment.slug === 'prod' && (
        <div className="bg-danger-500 text-white text-center py-1 text-xs font-medium">
          ⚠️ Production Environment - Read Only Mode
        </div>
      )}
    </header>
  )
}
