import { Box, ButtonBase, Stack, Tooltip, Typography } from "@mui/material";
import { PLAN_TYPES } from "../../utils/constants";
import { monthGrid, toISODate, todayISO } from "../../utils/date";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_TITLES = 2;

function PlanPill({ plan }) {
  const color = PLAN_TYPES[plan.planType].color;
  return (
    <Box
      sx={{
        fontSize: 11.5,
        lineHeight: 1.4,
        px: 0.5,
        mb: 0.25,
        borderRadius: 0.75,
        borderLeft: `3px solid ${color}`,
        bgcolor: `${color}14`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textDecoration: plan.status === "done" ? "line-through" : "none",
        opacity: plan.status === "pending" ? 1 : 0.6,
      }}
    >
      {plan.title}
    </Box>
  );
}

function DayCell({ date, inMonth, isToday, isSelected, plans, solvedCount, onSelect }) {
  return (
    <ButtonBase
      onClick={() => onSelect(date)}
      aria-label={`${date}: ${plans.length} plans, ${solvedCount} solved`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        textAlign: "left",
        minWidth: 0,
        minHeight: { xs: 56, md: 100 },
        p: 0.5,
        borderRadius: 1.5,
        border: 1,
        borderColor: isSelected ? "primary.main" : "divider",
        boxShadow: isSelected ? (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}` : "none",
        bgcolor: inMonth ? "background.paper" : "grey.50",
        "&:hover": { borderColor: "primary.light" },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 600,
            bgcolor: isToday ? "primary.main" : "transparent",
            color: isToday ? "#fff" : inMonth ? "text.primary" : "text.disabled",
          }}
        >
          {Number(date.slice(8))}
        </Box>
        {solvedCount > 0 && (
          <Tooltip title={`${solvedCount} problem${solvedCount > 1 ? "s" : ""} solved`}>
            <Typography component="span" sx={{ fontSize: 11, fontWeight: 700, color: "success.main", pr: 0.25 }}>
              ✓{solvedCount}
            </Typography>
          </Tooltip>
        )}
      </Stack>

      {/* Desktop: plan titles */}
      <Box sx={{ display: { xs: "none", md: "block" }, mt: 0.5, minWidth: 0 }}>
        {plans.slice(0, MAX_TITLES).map((plan) => (
          <PlanPill key={plan.id} plan={plan} />
        ))}
        {plans.length > MAX_TITLES && (
          <Typography variant="caption" color="text.secondary">
            +{plans.length - MAX_TITLES} more
          </Typography>
        )}
      </Box>

      {/* Mobile: coloured dots */}
      <Stack direction="row" spacing={0.25} sx={{ display: { xs: "flex", md: "none" }, mt: 0.5, flexWrap: "wrap" }}>
        {plans.slice(0, 4).map((plan) => (
          <Box
            key={plan.id}
            sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: PLAN_TYPES[plan.planType].color }}
          />
        ))}
      </Stack>
    </ButtonBase>
  );
}

function MonthGrid({ year, month, selected, onSelect, plansByDate, solvedByDate }) {
  const today = todayISO();

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0.5, mb: 0.5 }}>
        {WEEKDAYS.map((day) => (
          <Typography key={day} variant="caption" color="text.secondary" fontWeight={700} textAlign="center">
            {day}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0.5 }}>
        {monthGrid(year, month).map((day) => {
          const iso = toISODate(day);
          return (
            <DayCell
              key={iso}
              date={iso}
              inMonth={day.getMonth() === month}
              isToday={iso === today}
              isSelected={iso === selected}
              plans={plansByDate.get(iso) || []}
              solvedCount={(solvedByDate.get(iso) || []).length}
              onSelect={onSelect}
            />
          );
        })}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
        {Object.entries(PLAN_TYPES).map(([key, type]) => (
          <Stack key={key} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: type.color }} />
            <Typography variant="caption">{type.label}</Typography>
          </Stack>
        ))}
        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
          ✓n = problems solved that day
        </Typography>
      </Stack>
    </Box>
  );
}

export default MonthGrid;
