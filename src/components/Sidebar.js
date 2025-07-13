import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  BookOpen, 
  QrCode, 
  Calendar, 
  BarChart3, 
  Mail,
  Menu, 
  X,
  User,
  LogOut,
  ChevronDown,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, roles: ['admin', 'teacher'] },
    { name: 'Enrollment', href: '/enrollment-management', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { name: 'Scanner', href: '/scanner', icon: QrCode, roles: ['admin', 'teacher'] },
    { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['admin', 'teacher', 'viewer'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'teacher', 'viewer'] },
    { name: 'Email Management', href: '/email-management', icon: Mail, roles: ['admin', 'teacher'] },
    { name: 'User Management', href: '/user-management', icon: Users, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.roles || hasRole(item.roles)
  );

  const isActive = (path) => location.pathname === path;

  const HamburgerButton = (
    <button
      className="lg:hidden p-2 m-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none z-50"
      aria-label="Open sidebar"
      onClick={() => setIsMobileOpen(true)}
    >
      <Menu className="h-6 w-6" />
    </button>
  );

  const Backdrop = (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
      onClick={() => setIsMobileOpen(false)}
      aria-label="Close sidebar"
      tabIndex={0}
      role="button"
    />
  );

  const SidebarContent = (
    <div
      className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'fixed z-50 inset-y-0 left-0' : 'hidden'}
        lg:static lg:flex lg:z-auto lg:inset-auto lg:left-auto
        lg:${isCollapsed ? 'w-16' : 'w-64'}
        lg:h-auto
      `}
      style={{ minHeight: '100vh' }}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <Link to="/" className="flex items-center">
            <QrCode className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Attendance Checker
            </span>
          </Link>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none hidden lg:inline-flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 group ${
                  isActive(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.name : ''}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        <div className="px-3 py-4">
          {!isCollapsed ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none"
              >
                <User className="h-5 w-5" />
                <span className="ml-3 truncate">{user?.username}</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.username}</div>
                    <div className="text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 focus:outline-none"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 z-50">
        {HamburgerButton}
      </div>
      {isMobileOpen && Backdrop}
      <div className="hidden lg:flex h-full">
        {SidebarContent}
      </div>
      <div className={isMobileOpen ? 'fixed inset-0 z-50 flex lg:hidden' : 'hidden'}>
        {SidebarContent}
      </div>
    </>
  );
};

export default Sidebar; 