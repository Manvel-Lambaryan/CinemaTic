import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CameraIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Axios, API_URL } from "../../../config/axios";
import { useAuthStore } from "../../../store/useAuthStore";

const getAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const ProfileSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchUserData = useAuthStore((state) => state.fetchUserData);
  const logout = useAuthStore((state) => state.logout);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const avatarUrl = getAvatarUrl(user?.avatarUrl);
  const userName = user?.name || t("guest");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await Axios.post("/auth/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchUserData();
      setMessage(t("avatar_updated"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await Axios.put("/auth/profile/email", {
        email,
        currentPassword: emailPassword,
      });
      await fetchUserData();
      setEmailPassword("");
      setMessage(t("email_updated"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await Axios.put("/auth/profile/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage(t("password_updated"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("delete_account_confirm"))) return;

    setLoading(true);
    setError("");

    try {
      await Axios.delete("/auth/account", { data: { password: deletePassword } });
      logout();
      navigate("/login");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || t("error"));
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {(message || error) && (
        <div
          className={`p-4 rounded-[20px] text-xs font-bold uppercase tracking-widest ${
            error
              ? "bg-red-600/10 text-red-600 border border-red-600/20"
              : "bg-green-500/10 text-green-600 border border-green-500/20"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[3px] opacity-40">
          {t("change_avatar")}
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-[28px] overflow-hidden bg-red-600 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-white uppercase">
                {userName.charAt(0)}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:border-red-600/50 transition-colors disabled:opacity-50"
          >
            <CameraIcon className="w-5 h-5" />
            {t("upload_avatar")}
          </button>
        </div>
      </section>

      <SettingsForm
        title={t("change_email")}
        icon={<EnvelopeIcon className="w-5 h-5" />}
        onSubmit={handleEmailSubmit}
        loading={loading}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder={t("email")}
        />
        <input
          type="password"
          value={emailPassword}
          onChange={(e) => setEmailPassword(e.target.value)}
          className={inputClass}
          placeholder={t("current_password")}
        />
      </SettingsForm>

      <SettingsForm
        title={t("change_password")}
        icon={<KeyIcon className="w-5 h-5" />}
        onSubmit={handlePasswordSubmit}
        loading={loading}
      >
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className={inputClass}
          placeholder={t("current_password")}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className={inputClass}
          placeholder={t("new_password")}
        />
      </SettingsForm>

      <section className="p-6 border border-red-600/20 bg-red-600/5 rounded-[28px] space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <TrashIcon className="w-5 h-5" />
          <h3 className="text-[10px] font-black uppercase tracking-[3px]">
            {t("delete_account")}
          </h3>
        </div>
        <p className="text-xs opacity-60">{t("delete_account_warning")}</p>
        <input
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className={inputClass}
          placeholder={t("confirm_password")}
        />
        <button
          type="button"
          disabled={loading}
          onClick={handleDeleteAccount}
          className="px-6 py-3 bg-red-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {t("delete_account")}
        </button>
      </section>
    </motion.div>
  );
};

const inputClass =
  "w-full px-5 py-3.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-[20px] text-sm font-medium text-zinc-900 dark:text-white outline-none focus:border-red-600/50 transition-colors";

interface SettingsFormProps {
  title: string;
  icon: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  children: React.ReactNode;
}

const SettingsForm = ({
  title,
  icon,
  onSubmit,
  loading,
  children,
}: SettingsFormProps) => (
  <form
    onSubmit={onSubmit}
    className="p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-[28px] border border-zinc-100 dark:border-white/5 space-y-4"
  >
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 opacity-60"
    >
      {icon}
      <h3 className="text-[10px] font-black uppercase tracking-[3px]">{title}</h3>
    </motion.div>
    {children}
    <button
      type="submit"
      disabled={loading}
      className="px-6 py-3 bg-red-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50"
    >
      {title}
    </button>
  </form>
);
