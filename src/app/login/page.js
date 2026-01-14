"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { Card, Button, EmptyState } from "../components/ui";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, error, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Card title="Sign in with Google">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              Use your Google account to access your projects. Data is scoped to
              your account in Firebase.
            </div>
            {error ? <EmptyState message={`Auth error: ${error}`} /> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={signInWithGoogle} disabled={loading}>
                {loading ? "Loading..." : "Continue with Google"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/")}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
