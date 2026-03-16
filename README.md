# football-club-manager

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

Web app for managing small football clubs — members, payments, and tournaments — with Google Sheets as the backend database.

## Features

- Member registration and profile management
- Payment tracking and reminders
- Tournament bracket and match scheduling
- Team formation and player positions
- Google Sheets integration (no separate database needed)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **State**: React Context
- **Backend**: Google Sheets API
- **Auth**: Google OAuth 2.0

## Getting Started

```bash
npm install
npm run dev
```

### Google Sheets Setup

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Copy `.env.example` to `.env` and fill in credentials

## License

See [LICENSE](./LICENSE) for details.
