import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue your DSA preparation.">
      <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          required
          autoFocus
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
        <Typography variant="body2" textAlign="center">
          New here?{" "}
          <Link component={RouterLink} to="/register">
            Create an account
          </Link>
        </Typography>
      </Stack>
    </AuthCard>
  );
}

export default LoginPage;
