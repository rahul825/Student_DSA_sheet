import { Box, LinearProgress, Typography } from "@mui/material";

const percent = (completed, total) => (total ? Math.round((completed / total) * 100) : 0);

function ProgressBar({ label, completed, total, color = "primary", showCount = Boolean(label) }) {
  return (
    <Box>
      {showCount && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            {completed} / {total}
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percent(completed, total)}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}

export { percent };
export default ProgressBar;
