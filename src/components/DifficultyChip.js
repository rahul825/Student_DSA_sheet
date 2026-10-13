import { Chip } from "@mui/material";
import { DIFFICULTY_COLOR } from "../utils/constants";

function DifficultyChip({ difficulty, size = "small" }) {
  return <Chip label={difficulty} color={DIFFICULTY_COLOR[difficulty]} size={size} variant="outlined" />;
}

export default DifficultyChip;
