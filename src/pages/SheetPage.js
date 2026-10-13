import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, Snackbar, Stack, Typography } from "@mui/material";
import { progressApi, sheetApi } from "../api";
import { ErrorState, Loader } from "../components/PageState";
import ProgressBar from "../components/ProgressBar";
import SheetFilters, { STATUS_FILTERS } from "../components/sheet/SheetFilters";
import ChapterAccordion from "../components/sheet/ChapterAccordion";
import { DIFFICULTIES, DIFFICULTY_COLOR } from "../utils/constants";

const EXPANDED_KEY = "dsa_sheet_expanded";

const readExpanded = () => {
  try {
    return JSON.parse(localStorage.getItem(EXPANDED_KEY));
  } catch {
    return null;
  }
};

const saveExpanded = (ids) => {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(ids));
  } catch {}
};

const matchesFilters = ({ search, difficulty, status }) => {
  const query = search.trim().toLowerCase();
  return (p) =>
    (!query || p.title.toLowerCase().includes(query)) &&
    (difficulty === "all" || p.difficulty === difficulty) &&
    (status === "all" ||
      (status === "solved" && p.completed) ||
      (status === "unsolved" && !p.completed) ||
      (status === "revision" && p.revision));
};

const findChapterId = (chapters, problemId) =>
  chapters.find((c) => c.topics.some((t) => t.problems.some((p) => p.id === problemId)))?.id;

const scrollToProblem = (problemId) => {
  // Wait for the accordion expand animation before scrolling.
  setTimeout(() => {
    document.getElementById(`problem-${problemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 350);
};

function SheetPage() {
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState([]);
  const [lastProblemId, setLastProblemId] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [filters, setFilters] = useState(() => ({
    search: "",
    difficulty: "all",
    status: STATUS_FILTERS[searchParams.get("status")] ? searchParams.get("status") : "all",
  }));
  const didScroll = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await sheetApi.get();
      const focusId = Number(searchParams.get("focus")) || data.lastProblemId;
      const focusChapter = findChapterId(data.chapters, focusId);
      const initial = new Set(readExpanded() ?? [data.chapters[0]?.id]);
      if (focusChapter) initial.add(focusChapter);

      setChapters(data.chapters);
      setLastProblemId(data.lastProblemId);
      setExpanded([...initial]);
      if (focusId && !didScroll.current) {
        didScroll.current = true;
        scrollToProblem(focusId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const allProblems = useMemo(() => chapters.flatMap((c) => c.topics.flatMap((t) => t.problems)), [chapters]);

  const isFiltering = filters.search || filters.difficulty !== "all" || filters.status !== "all";

  const visibleChapters = useMemo(() => {
    const matches = matchesFilters(filters);
    return chapters
      .map((chapter) => ({
        ...chapter,
        visibleTopics: chapter.topics
          .map((topic) => ({ topic, problems: topic.problems.filter(matches) }))
          .filter((t) => t.problems.length),
      }))
      .filter((c) => c.visibleTopics.length);
  }, [chapters, filters]);

  const onExpand = (chapterId, isExpanded) => {
    const next = isExpanded ? [...expanded, chapterId] : expanded.filter((id) => id !== chapterId);
    setExpanded(next);
    saveExpanded(next);
  };

  const updateProblem = (problemId, patch) =>
    setChapters((prev) =>
      prev.map((c) => ({
        ...c,
        topics: c.topics.map((t) => ({
          ...t,
          problems: t.problems.map((p) => (p.id === problemId ? { ...p, ...patch } : p)),
        })),
      }))
    );

  // Optimistic update: flip the checkbox now, roll back if the API call fails.
  const onToggle = async (problem, field) => {
    const value = !problem[field];
    updateProblem(problem.id, { [field]: value });
    setLastProblemId(problem.id);
    try {
      await progressApi.update(problem.id, { [field]: value });
    } catch (err) {
      updateProblem(problem.id, { [field]: !value });
      setToast(err.message);
    }
  };

  const jumpToLast = () => {
    const chapterId = findChapterId(chapters, lastProblemId);
    if (chapterId && !expanded.includes(chapterId)) onExpand(chapterId, true);
    scrollToProblem(lastProblemId);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const completed = allProblems.filter((p) => p.completed).length;
  const lastProblem = allProblems.find((p) => p.id === lastProblemId);

  return (
    <Box>
      <Typography variant="h5">DSA Sheet</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Work through each chapter topic by topic. Your progress is saved automatically.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <ProgressBar label="Overall progress" completed={completed} total={allProblems.length} />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            {DIFFICULTIES.map((level) => {
              const list = allProblems.filter((p) => p.difficulty === level);
              return (
                <Chip
                  key={level}
                  size="small"
                  variant="outlined"
                  color={DIFFICULTY_COLOR[level]}
                  label={`${level}: ${list.filter((p) => p.completed).length}/${list.length}`}
                />
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {lastProblem && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={jumpToLast}>
              Jump to it
            </Button>
          }
        >
          Continue where you left off: <strong>{lastProblem.title}</strong>
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <SheetFilters filters={filters} onChange={setFilters} />
      </Box>

      {visibleChapters.length === 0 ? (
        <Alert severity="warning">No problems match these filters.</Alert>
      ) : (
        visibleChapters.map((chapter) => (
          <ChapterAccordion
            key={chapter.id}
            index={chapters.findIndex((c) => c.id === chapter.id)}
            chapter={chapter}
            expanded={isFiltering || expanded.includes(chapter.id)}
            onExpand={onExpand}
            lastProblemId={lastProblemId}
            onToggle={onToggle}
          />
        ))
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

export default SheetPage;
