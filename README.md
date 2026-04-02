# FinTrackz - Finance Dashboard

A frontend-only finance dashboard built with React and Tailwind CSS. Made this as a uni assignment but ended up putting quite a bit of effort into it so figured I'd document it properly.

## What it does

A comprehensive expense tracking dashboard that provides a clean, responsive interface to manage and analyze your finances. It includes interactive charts, full transaction management (search, filter, sort), smart hover-based category insights, and a simulated role-based access control system (Admin vs Viewer).

## Tech used

- React (Vite)
- Tailwind CSS
- Recharts (for the charts)
- Lucide React (icons)
- localStorage for persistence

## How to run

```bash
npm install
npm run dev
```

Thats it. Opens at `http://localhost:5173`

## Features

**Dashboard**
- Summary cards showing total balance, income, and expenses
- Line chart for balance trend over time
- Pie chart for spending by category
- Recent transactions list

**Transactions**
- Full table with date, description, category, type, amount
- Search works across description, category, type, and even date
- Filter by income / expense / all
- Sort by any column
- Export to CSV or JSON (exports whatever is currently filtered/sorted)
- Admin can add and edit transactions

**Insights & Analytics**
- Top spending category and monthly average breakdown
- Monthly comparison bar chart (income vs expenses)
- Month-over-month spending trend
- **Smart Insights System**: Context-aware, hover-based taglines appear when interacting with category badges across the app

**Other Features**
- **Theming**: Full Light and Dark mode support that persists across sessions
- **Role-Based UI**: Switch between Admin (can add/edit data) and Viewer (read-only)
- Data persistence using `localStorage`
- Notification panel with smart alerts
- Fully responsive on desktop, tablet, and mobile

## Folder structure

```
src/
  components/     # reusable components
  pages/          # Dashboard, Transactions, Insights
  context/        # AppContext - handles all state
  data/           # mock data and category taglines
```

## Notes

- No backend, everything is mock data + localStorage
- Transactions persist across sessions (localStorage)
- If you want to reset data just clear localStorage
- All charts use live data from the transactions state, not hardcoded

## Role system

There's a toggle in the sidebar and also in the profile dropdown. Switch to Admin to see the add/edit buttons. Viewer mode hides all write actions. Its just frontend simulation, no actual auth.
