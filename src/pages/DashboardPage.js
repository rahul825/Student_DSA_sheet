import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import FireIcon from "@mui/icons-material/LocalFireDepartment";
import StarIcon from "@mui/icons-material/Star";
import PlayIcon from "@mui/icons-material/PlayArrow";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import { plansApi, progressApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { ErrorState, Loader } from "../components/PageState";
import DifficultyChip from "../components/DifficultyChip";
import ProgressBar, { percent } from "../components/ProgressBar";
import { DIFFICULTIES, DIFFICULTY_COLOR, PLAN_TYPES } from "../utils/constants";
import { todayISO } from "../utils/date";

function StatCard({ icon, value, label, action }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        {action}
      </CardContent>
    </Card>
  );
}

function ProblemLink({ heading, problem }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2, flex: 1, minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary">
        {heading}
      </Typography>
      <Typography fontWeight={700} noWrap>
        {problem.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
        {problem.chapterTitle} › {problem.topicTitle}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <DifficultyChip difficulty={problem.difficulty} />
        <Button size="small" component={RouterLink} to={`/sheet?focus=${problem.id}`}>
          Open in sheet
        </Button>
        {problem.practiceUrl && (
          <Button size="small" href={problem.practiceUrl} target="_blank" rel="noopener noreferrer">
            Solve
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [todayPlans, setTodayPlans] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const today = todayISO();
      const [summaryData, planData] = await Promise.all([progressApi.summary(), plansApi.list(today, today)]);
      setSummary(summaryData);
      setTodayPlans(planData.plans);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setPlan = (plan) => setTodayPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));

  // Optimistic toggle; restore the old plan if the API call fails.
  const togglePlan = async (plan) => {
    setPlan({ ...plan, status: plan.status === "done" ? "pending" : "done" });
    try {
      const updated = await plansApi.update(plan.id, { status: plan.status === "done" ? "pending" : "done" });
      setPlan(updated);
      if (updated.problemId) setSummary(await progressApi.summary()); // the linked problem may now be solved
    } catch (err) {
      setPlan(plan);
      setError(err.message);
    }
  };

  if (error && !summary) return <ErrorState message={error} onRetry={load} />;
  if (!summary) return <Loader />;

  const overall = percent(summary.completed, summary.total);

  return (
    <Box>
      <Typography variant="h5">Welcome back, {user.name.split(" ")[0]}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here is where your DSA preparation stands today.
      </Typography>
      {error && <ErrorState message={error} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress variant="determinate" value={100} size={96} thickness={5} sx={{ color: "grey.200" }} />
                <CircularProgress
                  variant="determinate"
                  value={overall}
                  size={96}
                  thickness={5}
                  sx={{ position: "absolute", left: 0 }}
                />
                <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <Typography variant="h6">{overall}%</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h5">
                  {summary.completed}/{summary.total}
                </Typography>
                <Typography color="text.secondary">problems solved</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1.5}>
                {DIFFICULTIES.map((level) => (
                  <ProgressBar
                    key={level}
                    label={level}
                    completed={summary.difficulty[level].completed}
                    total={summary.difficulty[level].total}
                    color={DIFFICULTY_COLOR[level]}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <StatCard
              icon={<FireIcon sx={{ fontSize: 40, color: "#f97316" }} />}
              value={`${summary.streak} day${summary.streak === 1 ? "" : "s"}`}
              label="Current solving streak"
            />
            <StatCard
              icon={<StarIcon sx={{ fontSize: 40, color: "#d97706" }} />}
              value={summary.revisionCount}
              label="Marked for revision"
              action={
                <Button size="small" component={RouterLink} to="/sheet?status=revision">
                  Review
                </Button>
              }
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Continue your journey
              </Typography>
              {summary.lastProblem || summary.nextProblem ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  {summary.lastProblem && <ProblemLink heading="Where you left off" problem={summary.lastProblem} />}
                  {summary.nextProblem && <ProblemLink heading="Up next" problem={summary.nextProblem} />}
                </Stack>
              ) : (
                <Typography color="text.secondary">You have solved every problem in the sheet. Amazing work!</Typography>
              )}
              {!summary.lastProblem && (
                <Button variant="contained" startIcon={<PlayIcon />} component={RouterLink} to="/sheet" sx={{ mt: 2 }}>
                  Start the sheet
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Today's plan</Typography>
                <Button size="small" startIcon={<CalendarIcon />} component={RouterLink} to="/calendar">
                  Calendar
                </Button>
              </Stack>
              {todayPlans.length === 0 ? (
                <Box sx={{ py: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Nothing planned for today yet.
                  </Typography>
                  <Button variant="outlined" component={RouterLink} to="/calendar">
                    Plan your day
                  </Button>
                </Box>
              ) : (
                <List dense disablePadding>
                  {todayPlans.map((plan) => (
                    <ListItem key={plan.id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          color="success"
                          checked={plan.status === "done"}
                          onChange={() => togglePlan(plan)}
                          slotProps={{ input: { "aria-label": `Mark ${plan.title} as done` } }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={plan.title}
                        secondary={[plan.startTime, PLAN_TYPES[plan.planType].label].filter(Boolean).join(" · ")}
                        sx={{ textDecoration: plan.status === "done" ? "line-through" : "none" }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Progress by chapter
              </Typography>
              <Grid container spacing={2}>
                {summary.chapters.map((chapter) => (
                  <Grid key={chapter.id} size={{ xs: 12, sm: 6 }}>
                    <ProgressBar
                      label={chapter.title}
                      completed={chapter.completed}
                      total={chapter.total}
                      color={chapter.completed === chapter.total ? "success" : "primary"}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
