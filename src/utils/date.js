// Calendar dates are handled as local "YYYY-MM-DD" strings.

const pad = (n) => String(n).padStart(2, "0");

export const toISODate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayISO = () => toISODate(new Date());

export const parseISODate = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (str, days) => {
  const date = parseISODate(str);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

// Minutes ahead of UTC (IST = 330); sent to the API so "today" matches the user.
export const tzOffset = () => -new Date().getTimezoneOffset();

// 6 weeks x 7 days, starting on the Sunday on/before the 1st of the month.
export const monthGrid = (year, month) => {
  const start = new Date(year, month, 1);
  start.setDate(1 - start.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const formatLongDate = (str) =>
  parseISODate(str).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

export const formatMonth = (year, month) =>
  new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
