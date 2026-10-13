import { Checkbox, Chip, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DifficultyChip from "../DifficultyChip";
import ResourceLinks from "../ResourceLinks";

function ProblemRow({ problem, isLastVisited, onToggle }) {
  return (
    <TableRow
      id={`problem-${problem.id}`}
      hover
      sx={{
        bgcolor: isLastVisited ? "rgba(79, 70, 229, 0.06)" : problem.completed ? "rgba(46, 125, 50, 0.04)" : undefined,
        scrollMarginTop: 96,
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          color="success"
          checked={problem.completed}
          onChange={() => onToggle(problem, "completed")}
          slotProps={{ input: { "aria-label": `Mark ${problem.title} as completed` } }}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" fontWeight={500}>
            {problem.title}
          </Typography>
          {isLastVisited && <Chip label="Last visited" size="small" color="primary" />}
        </Stack>
      </TableCell>
      <TableCell>
        <DifficultyChip difficulty={problem.difficulty} />
      </TableCell>
      <TableCell>
        <ResourceLinks
          youtubeUrl={problem.youtubeUrl}
          practiceUrl={problem.practiceUrl}
          practicePlatform={problem.practicePlatform}
          articleUrl={problem.articleUrl}
        />
      </TableCell>
      <TableCell align="center">
        <Tooltip title={problem.revision ? "Remove from revision list" : "Mark for revision"}>
          <IconButton size="small" onClick={() => onToggle(problem, "revision")}>
            {problem.revision ? <StarIcon fontSize="small" sx={{ color: "#d97706" }} /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default ProblemRow;
