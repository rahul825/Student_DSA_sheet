import { Alert, Box, Button, CircularProgress } from "@mui/material";

export function Loader({ fullScreen = false }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: fullScreen ? "100vh" : 240 }}>
      <CircularProgress />
    </Box>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Alert
      severity="error"
      sx={{ my: 2 }}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}
