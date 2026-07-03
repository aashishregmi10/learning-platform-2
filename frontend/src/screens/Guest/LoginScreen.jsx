import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { Box, Button, Divider, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { setUser } from "../../store/authSlice";
import {
  useGoogleLoginMutation,
  useStaffLoginMutation,
} from "../../store/services/authApi";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [googleLogin, { isLoading: gLoading }] = useGoogleLoginMutation();
  const [staffLogin, { isLoading: sLoading }] = useStaffLoginMutation();

  const onSuccess = (user) => {
    dispatch(setUser(user));
    navigate(`/app/${user.role}`);
  };

  const handleGoogle = async (cred) => {
    try {
      const res = await googleLogin(cred.credential).unwrap();
      onSuccess(res.data.user);
      toast.success("Welcome!");
    } catch (e) {
      toast.error(e?.data?.message || "Google sign-in failed");
    }
  };

  const handleStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await staffLogin(form).unwrap();
      onSuccess(res.data.user);
      toast.success("Logged in");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  const devLogin = async (email) => {
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());
      if (!res.data?.user) throw new Error(res.message);
      onSuccess(res.data.user);
    } catch (err) {
      toast.error(err.message || "Dev login failed — run `npm run seed`");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f5f5f5", p: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, width: 380, maxWidth: "100%" }}>
        <Link to="/" style={{ color: "var(--primary)", fontSize: 14, textDecoration: "none" }}>← Back to home</Link>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d3", mb: 0.5, mt: 1.5 }}>
          B.Sc Nepal
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          Sign in to continue
        </Typography>

        <Typography variant="overline" sx={{ color: "#6b7280" }}>
          Students
        </Typography>
        <Box sx={{ mb: 2, mt: 1 }}>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error("Google error")} />
          ) : (
            <Typography variant="caption" color="error">
              Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.
            </Typography>
          )}
          {gLoading && <Typography variant="caption">Signing in…</Typography>}
        </Box>

        <Divider sx={{ my: 2 }}>staff</Divider>

        <form onSubmit={handleStaff}>
          <TextField
            fullWidth size="small" label="Email" type="email" sx={{ mb: 2 }}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            fullWidth size="small" label="Password" type={showPassword ? "text" : "password"} sx={{ mb: 2 }}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button fullWidth type="submit" variant="contained" disabled={sLoading}
            sx={{ bgcolor: "#1976d3", "&:hover": { bgcolor: "#1565c0" } }}>
            {sLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <>
            <Divider sx={{ my: 2 }}>dev</Divider>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button fullWidth size="small" variant="outlined" onClick={() => devLogin("student@bsc.np")}>
                Dev: login as Ram (no purchases)
              </Button>
              <Button fullWidth size="small" variant="outlined" onClick={() => devLogin("student2@bsc.np")}>
                Dev: login as Priya (enrolled in 1st Year)
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default LoginScreen;
