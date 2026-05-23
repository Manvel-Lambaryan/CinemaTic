import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChartBarIcon,
  FilmIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { Axios } from "../../../config/axios";

interface UserAnalytics {
  totalSpent: number;
  totalDeposited: number;
  totalBookings: number;
  totalTransactions: number;
  currentBalance: number;
  memberSince: string;
}

export const ProfileAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await Axios.get("/auth/analytics");
        setAnalytics(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center py-20"
      >
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (!analytics) {
    return (
      <p className="text-center py-20 opacity-40 uppercase tracking-widest text-xs">
        {t("failed_to_load_data")}
      </p>
    );
  }

  const stats = [
    {
      label: t("total_spent"),
      value: `${analytics.totalSpent.toLocaleString()} ${t("currency_amd")}`,
      icon: <FilmIcon className="w-6 h-6" />,
      color: "text-red-500",
    },
    {
      label: t("total_deposited"),
      value: `${analytics.totalDeposited.toLocaleString()} ${t("currency_amd")}`,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      color: "text-green-500",
    },
    {
      label: t("total_bookings"),
      value: analytics.totalBookings.toString(),
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: "text-blue-500",
    },
    {
      label: t("total_transactions"),
      value: analytics.totalTransactions.toString(),
      icon: <WalletIcon className="w-6 h-6" />,
      color: "text-purple-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-[28px] border border-zinc-100 dark:border-white/5"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`mb-3 ${stat.color}`}
            >
              {stat.icon}
            </motion.div>
            <p className="text-[9px] font-black uppercase tracking-[2px] opacity-40 mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-black italic text-zinc-900 dark:text-white">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-[28px] border border-zinc-100 dark:border-white/5"
      >
        <CalendarDaysIcon className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-[2px] opacity-40 mb-1">
            {t("member_since")}
          </p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {new Date(analytics.memberSince).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
