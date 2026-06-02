import React, { useState, type ReactElement } from "react";
import { fetchApi } from "./api";
import {
  AppBar as MuiAppBar,
  Avatar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import type { User } from "./types";

interface MainAppProps {
  onLogout: () => Promise<void>;
  user: User;
}

export function MainApp({ user, onLogout }: MainAppProps): ReactElement {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const res = await fetchApi(`/api/hello?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = (await res.json()) as { message: string };
      setMessage(data.message);
    } else if (res.status !== 401) {
      setError("Something went wrong.");
    }
  }

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">
            DarWars
          </Typography>
          {user.avatarUrl && (
            <Avatar
              alt={user.displayName ?? ""}
              src={user.avatarUrl}
              sx={{ marginRight: 1 }}
            />
          )}
          <Typography sx={{ marginRight: 2 }} variant="body1">
            {user.displayName}
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Sign out
          </Button>
        </Toolbar>
      </MuiAppBar>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 400,
          padding: 4,
        }}
      >
        <Typography variant="h5">Hello API Demo</Typography>
        <TextField
          label="Name"
          onChange={(event) => {
            setName(event.target.value);
          }}
          size="small"
          value={name}
        />
        <Button type="submit" variant="contained">
          Say Hello
        </Button>
        {message && <Typography color="success.main">{message}</Typography>}
        {error && <Typography color="error">{error}</Typography>}
      </Box>
    </>
  );
}
