import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import PrevIcon from "@mui/icons-material/ChevronLeft";
import NextIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import AutoIcon from "@mui/icons-material/AutoAwesome";
import { plansApi, sheetApi } from "../api";
import { ErrorState, Loader } from "../components/PageState";
import MonthGrid from "../components/calendar/MonthGrid";
import DayPanel from "../components/calendar/DayPanel";
import PlanDialog from "../components/calendar/PlanDialog";
import AutoPlanDialog from "../components/calendar/AutoPlanDialog";
import { addDays, formatLongDate, formatMonth, monthGrid, parseISODate, toISODate, todayISO } from "../utils/date";

const groupByDate = (items, key) => {
  const map = new Map();
  items.forEach((item) => map.set(item[key], [...(map.get(item[key]) || []), item]));
  return map;
};

function CalendarPage() {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [selected, setSelected] = useState(today);
  const [data, setData] = useState({ plans: [], solved: [] });
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [planDialog, setPlanDialog] = useState(null); // { plan, date } while open
  const [autoPlanOpen, setAutoPlanOpen] = useState(false);

  // The grid shows 6 full weeks, so fetch the whole visible range.
  const range = useMemo(() => {
    const days = monthGrid(cursor.year, cursor.month);
    return { from: toISODate(days[0]), to: toISODate(days[days.length - 1]) };
  }, [cursor]);

  const load = useCallback(async () => {
    try {
      setData(await plansApi.list(range.from, range.to));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  // Sheet content is used to link plans to topics/problems.
  useEffect(() => {
    sheetApi
      .get()
      .then((sheet) => setChapters(sheet.chapters))
      .catch(() => {});
  }, []);

  const plansByDate = useMemo(() => groupByDate(data.plans, "planDate"), [data.plans]);
  const solvedByDate = useMemo(() => groupByDate(data.solved, "date"), [data.solved]);

  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`;
  const monthPlans = data.plans.filter((p) => p.planDate.startsWith(monthPrefix));
  const stats = {
    planned: monthPlans.length,
    done: monthPlans.filter((p) => p.status === "done").length,
    overdue: monthPlans.filter((p) => p.status === "pending" && p.planDate < today).length,
    solved: data.solved.filter((s) => s.date.startsWith(monthPrefix)).length,
  };

  const shiftMonth = (delta) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  // Select a date, switching month if needed (which reloads), otherwise reload in place.
  const goToDate = (dateStr) => {
    const d = parseISODate(dateStr);
    setSelected(dateStr);
    if (d.getFullYear() !== cursor.year || d.getMonth() !== cursor.month) {
      setCursor({ year: d.getFullYear(), month: d.getMonth() });
    } else {
      load();
    }
  };

  // Run an API action, show feedback, then refresh from the server (also reverts optimistic edits on failure).
  const run = async (action, message) => {
    try {
      await action();
      if (message) setToast(message);
    } catch (err) {
      setToast(err.message);
    }
    load();
  };

  const savePlan = async (payload) => {
    if (planDialog.plan) await plansApi.update(planDialog.plan.id, payload);
    else await plansApi.create(payload);
    setPlanDialog(null);
    setToast(planDialog.plan ? "Plan updated" : "Plan added");
    goToDate(payload.planDate);
  };

  const changeStatus = (plan, status) => {
    setData((d) => ({ ...d, plans: d.plans.map((p) => (p.id === plan.id ? { ...p, status } : p)) }));
    run(
      () => plansApi.update(plan.id, { status }),
      status === "done" && plan.problemId ? `"${plan.problemTitle}" marked as solved in your sheet` : null
    );
  };

  const deletePlan = (plan) => {
    if (window.confirm(`Delete "${plan.title}"?`)) run(() => plansApi.remove(plan.id), "Plan deleted");
  };

  const scheduleRevision = (problem, days) => {
    const planDate = addDays(today, days);
    run(
      () => plansApi.create({ title: `Revise: ${problem.title}`, planDate, planType: "revision", problemId: problem.problemId }),
      `Revision scheduled for ${formatLongDate(planDate)}`
    );
  };

  const autoPlan = async (options) => {
    const result = await plansApi.autoPlan(options);
    setAutoPlanOpen(false);
    if (!result.created) {
      setToast("No unsolved, unplanned problems left to schedule");
      return;
    }
    setToast(`Scheduled ${result.created} problems from ${formatLongDate(result.from)} to ${formatLongDate(result.to)}`);
    goToDate(result.from);
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">Study Calendar</Typography>
          <Typography color="text.secondary">Plan your schedule, track what you did and revisit what you solved.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<AutoIcon />} onClick={() => setAutoPlanOpen(true)}>
            Auto-plan
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPlanDialog({ plan: null, date: selected })}>
            Add plan
          </Button>
        </Stack>
      </Stack>

      {error && <ErrorState message={error} onRetry={load} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton onClick={() => shiftMonth(-1)} aria-label="Previous month">
                    <PrevIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 160, textAlign: "center" }}>
                    {formatMonth(cursor.year, cursor.month)}
                  </Typography>
                  <IconButton onClick={() => shiftMonth(1)} aria-label="Next month">
                    <NextIcon />
                  </IconButton>
                  <Button size="small" onClick={() => goToDate(today)}>
                    Today
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`${stats.done}/${stats.planned} plans done`} color="primary" variant="outlined" />
                  <Chip size="small" label={`${stats.solved} solved`} color="success" variant="outlined" />
                  {stats.overdue > 0 && <Chip size="small" label={`${stats.overdue} overdue`} color="warning" />}
                </Stack>
              </Stack>

              <MonthGrid
                year={cursor.year}
                month={cursor.month}
                selected={selected}
                onSelect={setSelected}
                plansByDate={plansByDate}
                solvedByDate={solvedByDate}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DayPanel
            date={selected}
            plans={plansByDate.get(selected) || []}
            solved={solvedByDate.get(selected) || []}
            onAdd={(date) => setPlanDialog({ plan: null, date })}
            onEdit={(plan) => setPlanDialog({ plan, date: plan.planDate })}
            onStatusChange={changeStatus}
            onDelete={deletePlan}
            onScheduleRevision={scheduleRevision}
          />
        </Grid>
      </Grid>

      {planDialog && (
        <PlanDialog
          plan={planDialog.plan}
          date={planDialog.date}
          chapters={chapters}
          onClose={() => setPlanDialog(null)}
          onSave={savePlan}
        />
      )}
      {autoPlanOpen && (
        <AutoPlanDialog chapters={chapters} onClose={() => setAutoPlanOpen(false)} onSubmit={autoPlan} />
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default CalendarPage;
