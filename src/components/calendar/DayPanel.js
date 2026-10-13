import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SkipIcon from "@mui/icons-material/SkipNext";
import UndoIcon from "@mui/icons-material/Undo";
import ReplayIcon from "@mui/icons-material/Replay";
import DifficultyChip from "../DifficultyChip";
import { PLAN_TYPES } from "../../utils/constants";
import { formatLongDate, todayISO } from "../../utils/date";

function PlanItem({ plan, onEdit, onStatusChange, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  const type = PLAN_TYPES[plan.planType];
  const isOverdue = plan.status === "pending" && plan.planDate < todayISO();
  const close = (action) => () => {
    setAnchor(null);
    action();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, p: 1, borderRadius: 2, borderLeft: `4px solid ${type.color}`, bgcolor: `${type.color}0d` }}>
      <Checkbox
        size="small"
        color="success"
        checked={plan.status === "done"}
        onChange={() => onStatusChange(plan, plan.status === "done" ? "pending" : "done")}
        sx={{ p: 0.5, alignSelf: "flex-start" }}
        slotProps={{ input: { "aria-label": `Mark ${plan.title} as done` } }}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          fontWeight={600}
          sx={{
            textDecoration: plan.status === "done" ? "line-through" : "none",
            opacity: plan.status === "skipped" ? 0.6 : 1,
            wordBreak: "break-word",
          }}
        >
          {plan.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[plan.startTime, plan.durationMinutes && `${plan.durationMinutes} min`, type.label].filter(Boolean).join(" · ")}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
          {isOverdue && <Chip label="Overdue" size="small" color="warning" />}
          {plan.status === "skipped" && <Chip label="Skipped" size="small" />}
          {plan.topicTitle && <Chip label={plan.topicTitle} size="small" variant="outlined" />}
          {plan.problemId && (
            <Chip
              label={plan.problemTitle}
              size="small"
              variant="outlined"
              color="primary"
              component={RouterLink}
              to={`/sheet?focus=${plan.problemId}`}
              clickable
            />
          )}
        </Stack>
        {plan.notes && (
          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
            {plan.notes}
          </Typography>
        )}
      </Box>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Plan actions" sx={{ alignSelf: "flex-start" }}>
        <MoreIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={close(() => onEdit(plan))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit / reschedule
        </MenuItem>
        {plan.status === "skipped" ? (
          <MenuItem onClick={close(() => onStatusChange(plan, "pending"))}>
            <ListItemIcon>
              <UndoIcon fontSize="small" />
            </ListItemIcon>
            Mark as pending
          </MenuItem>
        ) : (
          <MenuItem onClick={close(() => onStatusChange(plan, "skipped"))}>
            <ListItemIcon>
              <SkipIcon fontSize="small" />
            </ListItemIcon>
            Mark as skipped
          </MenuItem>
        )}
        <MenuItem onClick={close(() => onDelete(plan))} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

const REVISION_OPTIONS = [3, 7, 30];

function SolvedItem({ problem, onScheduleRevision }) {
  const [anchor, setAnchor] = useState(null);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Link component={RouterLink} to={`/sheet?focus=${problem.problemId}`} fontWeight={600} underline="hover">
          {problem.title}
        </Link>
      </Box>
      <DifficultyChip difficulty={problem.difficulty} />
      <Button size="small" startIcon={<ReplayIcon />} onClick={(e) => setAnchor(e.currentTarget)}>
        Revise
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {REVISION_OPTIONS.map((days) => (
          <MenuItem
            key={days}
            onClick={() => {
              setAnchor(null);
              onScheduleRevision(problem, days);
            }}
          >
            Revise in {days} days
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}

function DayPanel({ date, plans, solved, onAdd, onEdit, onStatusChange, onDelete, onScheduleRevision }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">{formatLongDate(date)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {plans.length} plan{plans.length === 1 ? "" : "s"} · {solved.length} solved
            </Typography>
          </Box>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => onAdd(date)}>
            Add
          </Button>
        </Stack>

        {plans.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No study plans for this day.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {plans.map((plan) => (
              <PlanItem key={plan.id} plan={plan} onEdit={onEdit} onStatusChange={onStatusChange} onDelete={onDelete} />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Solved on this day
        </Typography>
        {solved.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No problems solved on this day.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {solved.map((problem) => (
              <SolvedItem key={problem.problemId} problem={problem} onScheduleRevision={onScheduleRevision} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default DayPanel;
