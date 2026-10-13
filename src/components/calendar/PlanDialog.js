import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { PLAN_STATUS, PLAN_TYPES } from "../../utils/constants";

const emptyForm = (date) => ({
  title: "",
  planDate: date,
  startTime: "",
  durationMinutes: "",
  planType: "practice",
  topicId: null,
  problemId: null,
  notes: "",
  status: "pending",
});

const fromPlan = (plan) => ({
  title: plan.title,
  planDate: plan.planDate,
  startTime: plan.startTime || "",
  durationMinutes: plan.durationMinutes ?? "",
  planType: plan.planType,
  topicId: plan.topicId,
  problemId: plan.problemId,
  notes: plan.notes || "",
  status: plan.status,
});

// Create or edit a study plan. `plan` is null when creating.
function PlanDialog({ plan, date, chapters, onClose, onSave }) {
  const [form, setForm] = useState(() => (plan ? fromPlan(plan) : emptyForm(date)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const topics = useMemo(
    () => chapters.flatMap((c) => c.topics.map((t) => ({ id: t.id, title: t.title, chapter: c.title }))),
    [chapters]
  );
  const problems = useMemo(
    () =>
      chapters.flatMap((c) =>
        c.topics.flatMap((t) => t.problems.map((p) => ({ id: p.id, title: p.title, topicId: t.id, topic: t.title })))
      ),
    [chapters]
  );

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const selectedTopic = topics.find((t) => t.id === form.topicId) || null;
  const selectedProblem = problems.find((p) => p.id === form.problemId) || null;
  const problemOptions = form.topicId ? problems.filter((p) => p.topicId === form.topicId) : problems;

  const onTopicChange = (_, topic) => {
    setForm((f) => ({
      ...f,
      topicId: topic?.id ?? null,
      // Drop the problem if it does not belong to the new topic.
      problemId: topic && selectedProblem?.topicId !== topic.id ? null : f.problemId,
      title: f.title || (topic ? `Study: ${topic.title}` : ""),
    }));
  };

  const onProblemChange = (_, problem) => {
    setForm((f) => ({
      ...f,
      problemId: problem?.id ?? null,
      topicId: problem ? problem.topicId : f.topicId,
      title: f.title || (problem ? `Solve: ${problem.title}` : ""),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.planDate) return setError("Date is required");

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: form.title.trim(),
        planDate: form.planDate,
        startTime: form.startTime || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        planType: form.planType,
        topicId: form.topicId,
        problemId: form.problemId,
        notes: form.notes.trim() || null,
        ...(plan && { status: form.status }),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { component: "form", onSubmit } }}>
      <DialogTitle>{plan ? "Edit study plan" : "New study plan"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Type"
            value={form.planType}
            onChange={(e) => set("planType", e.target.value)}
          >
            {Object.entries(PLAN_TYPES).map(([value, type]) => (
              <MenuItem key={value} value={value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={topics}
            value={selectedTopic}
            onChange={onTopicChange}
            groupBy={(t) => t.chapter}
            getOptionLabel={(t) => t.title}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => <TextField {...params} label="Topic (optional)" />}
          />
          <Autocomplete
            options={problemOptions}
            value={selectedProblem}
            onChange={onProblemChange}
            groupBy={(p) => p.topic}
            getOptionLabel={(p) => p.title}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Problem (optional)" helperText="Completing this plan ticks the problem in the sheet" />
            )}
          />
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date"
              type="date"
              value={form.planDate}
              onChange={(e) => set("planDate", e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Start time"
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Duration (min)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) => set("durationMinutes", e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 5, max: 720, step: 5 } }}
            />
          </Stack>
          {plan && (
            <TextField select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {Object.entries(PLAN_STATUS).map(([value, status]) => (
                <MenuItem key={value} value={value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : plan ? "Save changes" : "Add plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlanDialog;
