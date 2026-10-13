import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setError("");
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Track progress and plan your study schedule.">
      <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Full name" name="name" value={form.name} onChange={onChange} required autoFocus />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          helperText="At least 8 characters"
          value={form.password}
          onChange={onChange}
          required
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={onChange}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </Button>
        <Typography variant="body2" textAlign="center">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Log in
          </Link>
        </Typography>
      </Stack>
    </AuthCard>
  );
}

export default RegisterPage;
