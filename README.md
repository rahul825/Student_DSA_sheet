# DSA Sheet - Frontend

React 19 + Material UI app for the DSA Sheet. 
Students can:
- **Sign up / log in** (JWT session that survives a page reload)
- Work through a **structured sheet** of Chapters, Topics and Problems
- Open the **YouTube, LeetCode/Codeforces and article links** for each topic and problem
- See **Easy / Medium / Hard** tags, search and filter problems
- **Tick problems as solved**. Progress is saved to the server, and on the next login the app reopens where the student left off
- Star problems **for revision**
- Use a dedicated **Study Calendar**: plan days, auto-schedule problems, mark plans done (which ticks the problem), see what was solved each day and schedule revisions
- See a **dashboard** with overall and per-difficulty progress, streak, "where you left off", "up next" and today's plan


## Run locally

```bash
npm install
cp .env.example .env     # REACT_APP_API_URL=http://localhost:5000/api
npm start                # http://localhost:3000
```

## Build for production



## Structure

```
src/
├─ index.js, App.js, theme.js   # bootstrap, routes, MUI theme
├─ api/                         # client.js (fetch + token), index.js (endpoint functions)
├─ context/AuthContext.js       # logged-in user, login/register/logout
├─ components/                  # Layout, route guards, shared UI
│  ├─ sheet/                    # filters, chapter accordion, topic table, problem row
│  └─ calendar/                 # month grid, day panel, plan + auto-plan dialogs
├─ pages/                       # Login, Register, Dashboard, Sheet, Calendar
└─ utils/                       # date helpers, constants
```
