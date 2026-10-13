import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DifficultyChip from "../DifficultyChip";
import ResourceLinks from "../ResourceLinks";
import ProblemRow from "./ProblemRow";

function TopicSection({ topic, problems, lastProblemId, onToggle }) {
  const completed = topic.problems.filter((p) => p.completed).length;

  return (
    <Box sx={{ "& + &": { mt: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={700}>{topic.title}</Typography>
            <DifficultyChip difficulty={topic.difficulty} />
            <Typography variant="body2" color="text.secondary">
              {completed}/{topic.problems.length} done
            </Typography>
          </Stack>
          {topic.description && (
            <Typography variant="body2" color="text.secondary">
              {topic.description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Topic resources
          </Typography>
          <ResourceLinks youtubeUrl={topic.youtubeUrl} articleUrl={topic.articleUrl} />
        </Stack>
      </Stack>

      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", bgcolor: "grey.50" } }}>
              <TableCell padding="checkbox" align="center">
                Done
              </TableCell>
              <TableCell>Problem</TableCell>
              <TableCell sx={{ width: 110 }}>Difficulty</TableCell>
              <TableCell sx={{ width: 130 }}>Resources</TableCell>
              <TableCell sx={{ width: 90 }} align="center">
                Revision
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isLastVisited={problem.id === lastProblemId}
                onToggle={onToggle}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TopicSection;
