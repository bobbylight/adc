import { useEffect, useState, type ReactElement } from "react";
import { CssBaseline } from "@mui/material";
import { LoginPage } from "./login-page";
import { MainApp } from "./main-app";
import type { User } from "./types";

export function App(): ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res): Promise<User | null> => {
        if (res.ok) {
          return res.json() as Promise<User>;
        }
        return Promise.resolve(null);
      })
      .then((fetchedUser) => {
        setUser(fetchedUser);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (isLoading) {
    return <CssBaseline />;
  }
  if (!user) {
    return <LoginPage />;
  }
  return (
    <>
      <CssBaseline />
      <MainApp onLogout={handleLogout} user={user} />
    </>
  );
}
