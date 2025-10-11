# Football Manager - React + Google Sheets

A comprehensive web application for managing a small football club using ReactJS and Google Sheets as the database.

## Features

- **Member Management**: Add, edit, and manage club members with skill levels and jersey numbers
- **Payment Dashboard**: Track monthly payments with automatic late payment handling
- **Tournament Management**: View fixtures and automatically calculated league tables
- **Real-time Updates**: Live data synchronization with Google Sheets

## Technology Stack

- **Frontend**: ReactJS with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Database**: Google Sheets API
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Google Sheets Setup

### 1. Create Google Sheets Document

Create a new Google Sheets document with the following structure:

#### Sheet 1: `Tournaments` (Mới)

| tournamentId | tournamentName | startDate | endDate | status | description |
|--------------|----------------|-----------|---------|--------|-------------|
| T001 | Giải đấu mùa hè 2024 | 2024-06-01 | 2024-08-31 | Active | Giải đấu chính thức |
| T002 | Giải đấu mùa đông 2024 | 2024-12-01 | 2025-02-28 | Upcoming | Giải đấu mùa đông |

#### Sheet 2: `Members`

| memberId | name | jerseyNumber | skillLevel | joinDate | status |
|----------|------|--------------|------------|----------|--------|
| 1 | John Doe | 10 | A | 2024-01-15 | Active |
| 2 | Jane Smith | 7 | B | 2024-02-01 | Active |

#### Sheet 3: `Payments`

| paymentId | memberId | monthYear | amount | status | paymentDate |
|-----------|----------|-----------|--------|--------|-------------|
| 1 | 1 | 1-2024 | 50000 | Paid | 2024-01-15 |
| 2 | 2 | 1-2024 | 50000 | Unpaid | |

#### Sheet 4: `Teams`

| teamId | teamName | tournamentId | registrationDate | status |
|--------|----------|--------------|------------------|--------|
| 1 | Team Alpha | T001 | 2024-05-15 | Active |
| 2 | Team Beta | T001 | 2024-05-16 | Active |
| 3 | Team Gamma | T002 | 2024-11-20 | Active |

#### Sheet 5: `Matches`

| matchId | tournamentId | homeTeamId | awayTeamId | homeScore | awayScore | matchDate | round | status |
|---------|--------------|------------|------------|-----------|-----------|-----------|-------|--------|
| M001 | T001 | 1 | 2 | 2 | 1 | 2024-06-15 | 1 | Completed |
| M002 | T001 | 3 | 4 | 0 | 3 | 2024-06-16 | 1 | Completed |
| M003 | T002 | 3 | 4 | | | 2024-12-15 | 1 | Scheduled |

### 2. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Copy the API Key and Spreadsheet ID

### 3. Configure the Application

1. Open `src/services/googleSheetsService.js`
2. Replace `YOUR_API_KEY_HERE` with your Google Sheets API key
3. Replace `YOUR_SPREADSHEET_ID_HERE` with your Google Sheets document ID

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── MemberForm.jsx      # Member add/edit form
├── context/
│   └── AppContext.jsx      # React Context for state management
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── MemberList.jsx      # Member management
│   ├── PaymentDashboard.jsx # Payment tracking
│   ├── LeagueTable.jsx     # League standings
│   └── MatchFixtures.jsx   # Match management
├── services/
│   └── googleSheetsService.js # Google Sheets API integration
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Key Features Explained

### Member Management

- Add new members with personal details and skill levels
- Edit existing member information
- Delete members from the system
- Skill levels: A (Professional), B (Advanced), C (Intermediate), D (Beginner)

### Payment Dashboard

- View current month payment status
- Mark payments as paid/unpaid
- Automatic late payment detection (adds 50,000 to amount)
- Payment history tracking

### Tournament Management

- View match fixtures for different tournaments
- Update match scores in real-time
- Automatic league table calculation
- Points system: Win=3, Draw=1, Loss=0

### League Table

- Real-time standings based on match results
- Goal difference calculation
- Tournament-specific tables
- Visual indicators for top positions

## API Functions

The `googleSheetsService.js` provides the following functions:

### Members API

- `getAllMembers()` - Get all members
- `addMember(memberData)` - Add new member
- `updateMember(memberId, memberData)` - Update member
- `deleteMember(memberId)` - Delete member

### Payments API

- `getAllPayments()` - Get all payments
- `getCurrentMonthPayments()` - Get current month payments
- `addPayment(paymentData)` - Add payment record
- `updatePaymentStatus(paymentId, status)` - Update payment status
- `markLatePayments(dueDay)` - Mark unpaid payments as late

### Teams API

- `getAllTeams()` - Get all teams
- `addTeam(teamData)` - Add new team

### Matches API

- `getAllMatches()` - Get all matches
- `getMatchesForTournament(tournamentId)` - Get tournament matches
- `addMatch(matchData)` - Add new match
- `updateMatchScore(matchId, homeScore, awayScore)` - Update scores
- `calculateLeagueTable(tournamentId)` - Calculate league standings

## Customization

### Styling

The application uses Tailwind CSS with custom color schemes. You can modify the colors in `tailwind.config.js` and `src/index.css`.

### Data Structure

To modify the Google Sheets structure, update the column names in the service functions and ensure your Google Sheets document matches the expected format.

### Features

Add new features by:

1. Creating new components in the `components/` directory
2. Adding new pages in the `pages/` directory
3. Extending the Google Sheets service with new API functions
4. Updating the navigation in `Layout.jsx`

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your Google Sheets API key is correct and has proper permissions
2. **Spreadsheet Access**: Make sure the spreadsheet is accessible and the API key has read/write permissions
3. **CORS Issues**: The Google Sheets API should handle CORS automatically, but ensure your domain is whitelisted if needed

### Error Handling

The application includes comprehensive error handling. Check the browser console for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.
