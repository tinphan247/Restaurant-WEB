import { Link, useLocation } from 'react-router-dom';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const navItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: '📊',
      exact: true,
    },
    {
      path: '/admin/modifiers',
      label: 'Modifiers',
      icon: '🍔',
    },
    {
      path: '/admin/modifiers/attach',
      label: 'Attach Modifiers',
      icon: '🔗',
    },
    {
      path: '/admin/categories',
      label: 'Categories',
      icon: '📁',
    },
    {
      path: '/admin/items',
      label: 'Menu Items',
      icon: '🍕',
    },
    {
      path: '/admin/photos',
      label: 'Photos',
      icon: '📸',
    },
    {
      path: '/orders',
      label: 'Orders History',
      icon: '🧾',
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-screen">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-700">
            Restaurant Admin
          </h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link
            to="/guest-menu"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">👁️</span>
            <span>View Guest Menu</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
}
