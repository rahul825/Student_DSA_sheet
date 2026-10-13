import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import ChecklistIcon from "@mui/icons-material/Checklist";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import CodeIcon from "@mui/icons-material/Code";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" />, end: true },
  { to: "/sheet", label: "DSA Sheet", icon: <ChecklistIcon fontSize="small" /> },
  { to: "/calendar", label: "Calendar", icon: <CalendarIcon fontSize="small" /> },
];

function Layout() {
  const { user, logout } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1 }}>
          <CodeIcon color="primary" />
          <Typography variant="h6" sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>
            DSA Sheet
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                startIcon={item.icon}
                color="inherit"
                sx={{
                  color: "text.secondary",
                  minWidth: 0,
                  "& .MuiButton-startIcon": { mr: { xs: 0, md: 1 } },
                  "&.active": { color: "primary.main", bgcolor: "action.selected" },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                  {item.label}
                </Box>
              </Button>
            ))}
          </Box>

          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 16 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={600}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Layout;
