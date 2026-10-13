import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ProgressBar from "../ProgressBar";
import TopicSection from "./TopicSection";

// `chapter.visibleTopics` holds only the topics/problems that match the current filters.
function ChapterAccordion({ index, chapter, expanded, onExpand, lastProblemId, onToggle }) {
  const all = chapter.topics.flatMap((t) => t.problems);
  const completed = all.filter((p) => p.completed).length;
  const isDone = all.length > 0 && completed === all.length;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpand(chapter.id, isExpanded)}
      disableGutters
      variant="outlined"
      sx={{ borderRadius: 2, "&:before": { display: "none" }, "& + &": { mt: 1.5 } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", pr: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: isDone ? "success.main" : "primary.main",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {isDone ? <CheckCircleIcon fontSize="small" /> : index + 1}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography fontWeight={700}>{chapter.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {chapter.description}
            </Typography>
          </Box>
          <Box sx={{ width: { xs: 90, sm: 180 }, flexShrink: 0 }}>
            <ProgressBar showCount completed={completed} total={all.length} color={isDone ? "success" : "primary"} />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
        {chapter.visibleTopics.map(({ topic, problems }) => (
          <TopicSection
            key={topic.id}
            topic={topic}
            problems={problems}
            lastProblemId={lastProblemId}
            onToggle={onToggle}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default ChapterAccordion;
