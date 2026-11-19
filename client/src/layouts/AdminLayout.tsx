import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useGetAdminProfileQuery, useAdminLogoutMutation } from '../redux/api/adminApi';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setAdmin, adminLogoutSuccess } from '../redux/slices/adminAuthSlice';
import { Toaster, toast } from 'sonner';

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const admin = useAppSelector((state) => state.adminAuth.admin);
  const { data: profileData, isError, isLoading } = useGetAdminProfileQuery();
  const [adminLogout] = useAdminLogoutMutation();

  useEffect(() => {
    if (profileData?.admin) {
      dispatch(setAdmin(profileData.admin));
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    if (isError && !isLoading && pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [isError, isLoading, pathname, navigate]);

  const handleLogout = async () => {
    try {
      await adminLogout().unwrap();
      dispatch(adminLogoutSuccess());
      toast.success('Admin session ended');
      navigate('/admin/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors antialiased">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        admin={admin}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Full width, expands naturally */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          admin={admin}
          onLogout={handleLogout}
        />

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-x-clip">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default AdminLayout;
