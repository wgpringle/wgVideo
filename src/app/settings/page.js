"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";
import { Button, Card, EmptyState, Input } from "../components/ui";
import { useAuth } from "../../lib/auth";
import { useUserSettings } from "../../lib/hooks/userSettings";

const TABS = [
  { id: "general", label: "General" },
  { id: "api", label: "API Keys" },
];

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 4) return key;
  return `****${key.slice(-4)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const userId = user?.uid;
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    saveKlingKey,
    deleteKlingKey,
    deleteAccount,
  } = useUserSettings(userId);

  const [activeTab, setActiveTab] = useState("general");
  const [klingAccessKey, setKlingAccessKey] = useState("");
  const [klingSecretKey, setKlingSecretKey] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [actionError, setActionError] = useState(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const maskedKlingSecret = useMemo(
    () => maskKey(settings?.apiKeys?.kling?.secretKey || ""),
    [settings]
  );
  const klingAccessValue = settings?.apiKeys?.kling?.accessKey || "";

  const handleSaveKey = async (event) => {
    event.preventDefault();
    if (!klingAccessKey.trim() || !klingSecretKey.trim()) return;
    setIsSavingKey(true);
    setActionError(null);
    try {
      await saveKlingKey({
        accessKey: klingAccessKey.trim(),
        secretKey: klingSecretKey.trim(),
      });
      setKlingAccessKey("");
      setKlingSecretKey("");
    } catch (err) {
      setActionError(err?.message || "Failed to save API key");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteKey = async () => {
    setIsDeletingKey(true);
    setActionError(null);
    try {
      await deleteKlingKey();
    } catch (err) {
      setActionError(err?.message || "Failed to delete API key");
    } finally {
      setIsDeletingKey(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") return;
    const confirmed = window.confirm(
      "This will permanently delete your account, projects, and characters. Continue?"
    );
    if (!confirmed) return;
    setIsDeletingAccount(true);
    setActionError(null);
    try {
      await deleteAccount();
      router.replace("/login");
    } catch (err) {
      setActionError(
        err?.code === "auth/requires-recent-login"
          ? "Please reauthenticate, then try deleting your account again."
          : err?.message || "Failed to delete account"
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card title="Loading">
            <EmptyState message="Checking authentication..." />
          </Card>
        </main>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card title="Sign in required">
            <div className={styles.stack}>
              <div>
                Sign in with Google to manage your settings and API keys.
              </div>
              {authError ? <EmptyState message={`Auth error: ${authError}`} /> : null}
              <Button onClick={() => router.push("/login")}>Go to login</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Settings</div>
            <div className={styles.subtitle}>
              Manage your account and API keys.
            </div>
          </div>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "general" ? (
          <div className={styles.grid}>
            <Card title="Login information">
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Display name</span>
                  <span className={styles.infoValue}>
                    {user.displayName || "Not provided"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{user.email || "Unknown"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>User ID</span>
                  <span className={styles.infoValue}>{user.uid}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Provider</span>
                  <span className={styles.infoValue}>
                    {user.providerData?.[0]?.providerId || "Unknown"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created</span>
                  <span className={styles.infoValue}>
                    {user.metadata?.creationTime || "Unknown"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Last sign-in</span>
                  <span className={styles.infoValue}>
                    {user.metadata?.lastSignInTime || "Unknown"}
                  </span>
                </div>
              </div>
              <div className={styles.row}>
                <Button variant="secondary" onClick={signOut}>
                  Log Out
                </Button>
              </div>
            </Card>

            <Card title="Danger zone" className={styles.dangerCard}>
              <div className={styles.stack}>
                <div className={styles.warningText}>
                  Deleting your account removes all projects and characters from
                  Firebase Storage and Firestore.
                </div>
                <Input
                  label='Type "DELETE" to confirm'
                  placeholder="DELETE"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                />
                <Button
                  variant="danger"
                  disabled={confirmDelete !== "DELETE" || isDeletingAccount}
                  onClick={handleDeleteAccount}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </Button>
                {actionError ? <EmptyState message={actionError} /> : null}
              </div>
            </Card>
          </div>
        ) : (
          <div className={styles.grid}>
            <Card title="Kling AI">
              <div className={styles.stack}>
                <div className={styles.muted}>
                  Store your Kling AI API key securely in your Firebase profile.
                </div>
                {settingsLoading ? (
                  <EmptyState message="Loading API keys..." />
                ) : klingAccessValue || maskedKlingSecret ? (
                  <div className={styles.keyRow}>
                    <div>
                      <div className={styles.infoLabel}>Access key</div>
                      <div className={styles.keyValue}>{klingAccessValue || "—"}</div>
                      <div className={styles.infoLabel}>Secret key</div>
                      <div className={styles.keyValue}>
                        {maskedKlingSecret || "—"}
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteKey}
                      disabled={isDeletingKey}
                    >
                      {isDeletingKey ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ) : (
                  <EmptyState message="No Kling AI key saved." />
                )}

                <form className={styles.formRow} onSubmit={handleSaveKey}>
                  <Input
                    label="Access key"
                    placeholder="Enter Kling AI access key"
                    value={klingAccessKey}
                    onChange={(e) => setKlingAccessKey(e.target.value)}
                  />
                  <Input
                    label="Secret key"
                    type="password"
                    placeholder="Enter Kling AI secret key"
                    value={klingSecretKey}
                    onChange={(e) => setKlingSecretKey(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={
                      !klingAccessKey.trim() ||
                      !klingSecretKey.trim() ||
                      isSavingKey
                    }
                  >
                    {isSavingKey ? "Saving..." : "Save Key"}
                  </Button>
                </form>
                {settingsError ? <EmptyState message={settingsError} /> : null}
                {actionError ? <EmptyState message={actionError} /> : null}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
