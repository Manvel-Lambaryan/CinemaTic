import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/useAuthStore";
import { API_URL } from "../../config/axios";
import { ProfileAnalytics } from "./profile/ProfileAnalytics";
import { ProfileHistoryTab } from "./profile/ProfileHistoryTab";
import { ProfileSettings } from "./profile/ProfileSettings";

type ProfileTab = "analytics" | "history" | "settings";

const getAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const UserProfile = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [activeTab, setActiveTab] = useState<ProfileTab>("analytics");

  const userName = user?.name || t("guest");
  const balance = user?.balance ?? 0;
  const avatarUrl = getAvatarUrl(user?.avatarUrl);

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "analytics", label: t("analytics"), icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: "history", label: t("history"), icon: <ClockIcon className="w-5 h-5" /> },
    { id: "settings", label: t("settings"), icon: <Cog6ToothIcon className="w-5 h-5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-6 min-h-[calc(100vh-12rem)] -mx-1"
    >
      <aside className="w-64 shrink-0 flex flex-col bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-xl dark:shadow-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 border-b border-zinc-200 dark:border-white/5"
        >
          <span className="text-red-600 font-black uppercase tracking-[4px] text-[10px]">
            {t("my_account")}
          </span>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white mt-2">
            {t("user_profile")}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 border-b border-zinc-200 dark:border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] overflow-hidden bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-white uppercase">
                  {userName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black text-red-600 uppercase tracking-[2px]">
                {isAdmin ? t("role_admin") : t("role_user")}
              </span>
              <p className="text-sm font-black italic uppercase truncate text-zinc-900 dark:text-white">
                {userName}
              </p>
              <p className="text-[10px] opacity-50 mt-0.5">
                {balance.toLocaleString()} {t("currency_amd")}
              </p>
            </div>
          </div>
        </motion.div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <ProfileSidebarLink
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 border-t border-zinc-200 dark:border-white/5"
          >
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-zinc-500 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <ShieldCheckIcon className="w-5 h-5" />
              {t("admin_panel")}
            </Link>
          </motion.div>
        )}
      </aside>

      <main className="flex-1 min-w-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-[40px] p-6 md:p-8 shadow-xl dark:shadow-none min-h-full"
        >
          {activeTab === "analytics" && <ProfileAnalytics />}
          {activeTab === "history" && <ProfileHistoryTab />}
          {activeTab === "settings" && <ProfileSettings />}
        </motion.div>
      </main>
    </motion.div>
  );
};

interface SidebarLinkProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const ProfileSidebarLink = ({
  label,
  icon,
  active,
  onClick,
}: SidebarLinkProps) => (
  <button type="button" onClick={onClick} className="block relative w-full text-left">
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-[20px] transition-colors duration-300 z-10 ${
        active
          ? "text-white"
          : "text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="profileSidebarActive"
          className="absolute inset-0 bg-red-600 rounded-[20px] shadow-lg shadow-red-600/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  </button>
);
