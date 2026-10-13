import { IconButton, Stack, Tooltip } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import CodeIcon from "@mui/icons-material/Code";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";

function ResourceLink({ href, title, children }) {
  if (!href) return null;
  return (
    <Tooltip title={title}>
      <IconButton size="small" component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={title}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

// YouTube tutorial, LeetCode/Codeforces practice and theory article links.
function ResourceLinks({ youtubeUrl, practiceUrl, practicePlatform, articleUrl }) {
  return (
    <Stack direction="row" spacing={0.25}>
      <ResourceLink href={youtubeUrl} title="Watch video explanation">
        <YouTubeIcon fontSize="small" sx={{ color: "#ff0000" }} />
      </ResourceLink>
      <ResourceLink href={practiceUrl} title={`Practice on ${practicePlatform || "LeetCode"}`}>
        <CodeIcon fontSize="small" color="primary" />
      </ResourceLink>
      <ResourceLink href={articleUrl} title="Read theory article">
        <ArticleIcon fontSize="small" color="action" />
      </ResourceLink>
    </Stack>
  );
}

export default ResourceLinks;
