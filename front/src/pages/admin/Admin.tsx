import { motion } from "framer-motion";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  QueueListIcon,
  UserCircleIcon,
  TicketIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";
import { useEffect } from "react";

export const Admin = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/admin/add-movie",
      label: t("add_movie"),
      icon: <PlusCircleIcon className="w-5 h-5" />,
      active:
        location.pathname === "/admin" ||
        location.pathname === "/admin/add-movie",
    },
    {
      to: "/admin/add-cinema",
      label: t("add_cinema"),
      icon: <PlusCircleIcon className="w-5 h-5" />,
      active: location.pathname === "/admin/add-cinema",
    },
    {
      to: "/admin/get-users",
      label: t("all_users"),
      icon: <UserCircleIcon className="w-5 h-5" />,
      active: location.pathname === "/admin/get-users",
    },
    {
      to: "/admin/list",
      label: t("movies_list"),
      icon: <QueueListIcon className="w-5 h-5" />,
      active: location.pathname === "/admin/list",
    },
    {
      to: "/admin/tickets",
      label: t("ticket_management"),
      icon: <TicketIcon className="w-5 h-5" />,
      active: location.pathname === "/admin/tickets",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-screen overflow-hidden font-sans transition-colors duration-700 bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-200"
    >
      <aside className="w-72 shrink-0 flex flex-col bg-white dark:bg-[#0a0f1e] border-r border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <Link to="/" className="group block mb-6">
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
              CINEMA
              <span className="text-red-600 group-hover:text-red-500 transition-colors">
                TIC
              </span>
            </h1>
          </Link>

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-red-600 text-white rounded-[20px] shadow-lg">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
              {t("admin_system")}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <AdminSidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2"
        >
          <div className="px-4 py-3 mb-2">
            <span className="text-[9px] font-black text-red-600 uppercase tracking-[2px]">
              {t("role_admin")}
            </span>
            <p className="text-xs font-black uppercase tracking-widest opacity-80 truncate mt-0.5">
              {user?.name || t("guest")}
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t("back_to_site")}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-600/10 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {t("logout")}
          </button>
        </motion.div>
      </aside>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="p-6 md:p-10 min-h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </motion.div>
  );
};

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const AdminSidebarLink = ({ to, label, icon, active }: SidebarLinkProps) => (
  <Link to={to} className="block relative">
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-[20px] transition-colors duration-300 z-10 ${
        active
          ? "text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="adminSidebarActive"
          className="absolute inset-0 bg-red-600 rounded-[20px] shadow-lg shadow-red-600/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  </Link>
);
