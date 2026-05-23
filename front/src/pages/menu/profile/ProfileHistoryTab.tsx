import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import { Axios } from "../../../config/axios";
import { PaymentItem } from "../movie/Payment";

export const ProfileHistoryTab = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}") as {
          _id?: string;
          id?: string;
        };
        const userId = user._id || user.id;
        if (userId) {
          const res = await Axios.get(`/payments/history/${userId}`);
          const raw = res.data?.data ?? res.data;
          setHistory(Array.isArray(raw) ? raw : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="text-red-600" size={20} />
        <h2 className="text-xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
          {t("history_title")}
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-[40px] opacity-40 uppercase tracking-[5px] text-xs text-zinc-900 dark:text-white">
          {t("no_records")}
        </div>
      ) : (
        history.map((tx, index) => (
          <PaymentItem key={String(tx._id)} tx={tx} index={index} />
        ))
      )}
    </motion.div>
  );
};
