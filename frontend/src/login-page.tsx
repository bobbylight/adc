import type { ReactElement } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Typography,
} from "@mui/material";

export function LoginPage(): ReactElement {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ padding: 4 }}>
            <Typography gutterBottom variant="h4">
              DarWars
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ marginBottom: 3 }}
              variant="body2"
            >
              Sign in to continue
            </Typography>
            <Button
              fullWidth
              href="/api/auth/google"
              size="large"
              variant="outlined"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
