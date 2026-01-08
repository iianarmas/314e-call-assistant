import { useNavigate, useLocation } from 'react-router-dom'

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Don't show navigation on call page
  if (location.pathname.startsWith('/call/')) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/companies')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/companies')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => navigate('/contacts')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/contacts')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => navigate('/scripts')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/scripts')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Scripts
            </button>
            <button
              onClick={() => navigate('/objections')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/objections')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Objections
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/settings')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
