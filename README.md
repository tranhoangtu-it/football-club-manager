# Football Club Manager

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

A full-featured web application for managing small football clubs. Track members, monitor payments, and run tournaments — all backed by Google Sheets as a lightweight database.

## Features

- **Member Management** — Add, edit, and remove players with skill levels (A-D) and jersey numbers
- **Payment Dashboard** — Track monthly dues, mark payments, and auto-detect late fees
- **Tournament Management** — Create tournaments, schedule matches, and record scores
- **League Tables** — Auto-calculated standings with points, goal difference, and rankings
- **Match Fixtures** — View and manage fixtures by tournament and round
- **Google Sheets Backend** — No dedicated database server required; data lives in a spreadsheet

## Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Framework        | React 18                  |
| Build Tool       | Vite 4                    |
| Styling          | Tailwind CSS 3            |
| Routing          | React Router DOM 6        |
| State Management | React Context API         |
| Icons            | Lucide React              |
| Date Utilities   | date-fns                  |
| Database         | Google Sheets API v4      |

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- A Google Cloud project with the Sheets API enabled

### Installation

```bash
git clone https://github.com/tranhoangtu-it/football-club-manager.git
cd football-club-manager
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
npm run preview
```

## Google Sheets Setup

1. **Create a Google Cloud project** at [console.cloud.google.com](https://console.cloud.google.com/) and enable the **Google Sheets API**.
2. **Generate an API key** under APIs & Services > Credentials.
3. **Create a spreadsheet** with five sheets named exactly:

   | Sheet Name    | Columns                                                                                       |
   | ------------- | --------------------------------------------------------------------------------------------- |
   | `Tournaments` | tournamentId, tournamentName, startDate, endDate, status, description                         |
   | `Members`     | memberId, name, jerseyNumber, skillLevel, joinDate, status                                    |
   | `Payments`    | paymentId, memberId, monthYear, amount, status, paymentDate                                   |
   | `Teams`       | teamId, teamName, tournamentId, registrationDate, status                                      |
   | `Matches`     | matchId, tournamentId, homeTeamId, awayTeamId, homeScore, awayScore, matchDate, round, status |

4. **Configure credentials** in `src/services/googleSheetsService.js`:

   ```js
   const GOOGLE_SHEETS_API_KEY = 'your-api-key';
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   ```

> **Tip:** Use environment variables or a `.env` file in production to avoid committing secrets.

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx              # App shell with navigation
│   └── MemberForm.jsx          # Member add/edit form
├── context/
│   └── AppContext.jsx           # Global state via React Context
├── pages/
│   ├── Dashboard.jsx            # Overview dashboard
│   ├── MemberList.jsx           # Member management
│   ├── PaymentDashboard.jsx     # Payment tracking
│   ├── TournamentManagement.jsx # Tournament CRUD
│   ├── MatchFixtures.jsx        # Fixture scheduling
│   └── LeagueTable.jsx          # Standings table
├── services/
│   └── googleSheetsService.js   # Google Sheets API integration
├── App.jsx                      # Router and app entry
├── main.jsx                     # React DOM render
└── index.css                    # Tailwind imports and global styles
```

## Screenshots

<!-- Replace the placeholders below with actual screenshots of your running application -->

| Dashboard | Members | Payments |
|-----------|---------|----------|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Tournaments | Fixtures | League Table |
|-------------|----------|--------------|
| _screenshot_ | _screenshot_ | _screenshot_ |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is available under the [MIT License](LICENSE).
