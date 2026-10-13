import { Box, Card, CardContent, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";

// Centered card used by the login and register pages.
function AuthCard({ title, subtitle, children }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, bgcolor: "background.default" }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6">DSA Sheet</Typography>
          </Box>
          <Typography variant="h5">{title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AuthCard;
