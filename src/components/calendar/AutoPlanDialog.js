import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { todayISO } from "../../utils/date";

// Spread the next unsolved problems across the coming days.
function AutoPlanDialog({ chapters, onClose, onSubmit }) {
  const [form, setForm] = useState({ startDate: todayISO(), perDay: 2, days: 14, chapterId: "", includeWeekends: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        startDate: form.startDate,
        perDay: Number(form.perDay),
        days: Number(form.days),
        chapterId: form.chapterId || null,
        includeWeekends: form.includeWeekends,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { component: "form", onSubmit: submit } }}>
      <DialogTitle>Auto-plan my schedule</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Schedules your next unsolved problems in sheet order. Problems that are already planned are skipped.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={set("startDate")}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Problems per day"
              type="number"
              value={form.perDay}
              onChange={set("perDay")}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 10 } }}
            />
            <TextField
              label="Study days"
              type="number"
              value={form.days}
              onChange={set("days")}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 60 } }}
            />
          </Stack>
          <TextField select label="Chapter" value={form.chapterId} onChange={set("chapterId")}>
            <MenuItem value="">Whole sheet</MenuItem>
            {chapters.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.title}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Switch checked={form.includeWeekends} onChange={set("includeWeekends")} />}
            label="Include weekends"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Planning..." : "Create plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AutoPlanDialog;
