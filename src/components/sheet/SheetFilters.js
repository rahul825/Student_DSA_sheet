import { InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DIFFICULTIES } from "../../utils/constants";

export const STATUS_FILTERS = {
  all: "All problems",
  unsolved: "Unsolved",
  solved: "Solved",
  revision: "Marked for revision",
};

function SheetFilters({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField
        size="small"
        placeholder="Search problems..."
        value={filters.search}
        onChange={set("search")}
        sx={{ flexGrow: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField select size="small" label="Difficulty" value={filters.difficulty} onChange={set("difficulty")} sx={{ minWidth: 150 }}>
        <MenuItem value="all">All levels</MenuItem>
        {DIFFICULTIES.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </TextField>
      <TextField select size="small" label="Status" value={filters.status} onChange={set("status")} sx={{ minWidth: 190 }}>
        {Object.entries(STATUS_FILTERS).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

export default SheetFilters;
