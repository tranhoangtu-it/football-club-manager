// Google Sheets API Service
// Replace these with your actual Google Sheets API credentials
const GOOGLE_SHEETS_API_KEY = '';
const SPREADSHEET_ID = '-zkq0';

// Base URL for Google Sheets API
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Helper function to get sheet data
const getSheetData = async (sheetName) => {
    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}?key=${GOOGLE_SHEETS_API_KEY}`;
    const data = await makeRequest(url);

    if (!data.values || data.values.length === 0) {
        return [];
    }

    // Convert array of arrays to array of objects
    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        return obj;
    });
};

// Helper function to append data to sheet
const appendToSheet = async (sheetName, values) => {
    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_API_KEY}`;

    const body = {
        values: [values]
    };

    return await makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

// Helper function to update specific cell
const updateCell = async (sheetName, cellRange, value) => {
    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}!${cellRange}?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_API_KEY}`;

    const body = {
        values: [[value]]
    };

    return await makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
};

// Helper function to find row by ID
const findRowByField = async (sheetName, fieldName, fieldValue) => {
    const data = await getSheetData(sheetName);
    return data.find(row => row[fieldName] === fieldValue);
};

// MEMBERS API
export const membersAPI = {
    // Get all members
    getAllMembers: async () => {
        return await getSheetData('Members');
    },

    // Add new member
    addMember: async (memberData) => {
        const { memberId, name, jerseyNumber, skillLevel, joinDate } = memberData;
        const values = [memberId, name, jerseyNumber, skillLevel, joinDate];
        return await appendToSheet('Members', values);
    },

    // Update member
    updateMember: async (memberId, memberData) => {
        // This would require finding the row and updating specific cells
        // For now, we'll implement a simple version
        const members = await getSheetData('Members');
        const memberIndex = members.findIndex(m => m.memberId === memberId);

        if (memberIndex === -1) {
            throw new Error('Member not found');
        }

        // Update logic would go here
        // This is a simplified version - in production, you'd want to update specific cells
        console.log('Update member:', memberId, memberData);
    },

    // Delete member
    deleteMember: async (memberId) => {
        // This would require finding the row and clearing it
        console.log('Delete member:', memberId);
    }
};

// PAYMENTS API
export const paymentsAPI = {
    // Get all payments
    getAllPayments: async () => {
        return await getSheetData('Payments');
    },

    // Get payments for current month
    getCurrentMonthPayments: async () => {
        const currentDate = new Date();
        const currentMonth = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
        const payments = await getSheetData('Payments');
        return payments.filter(payment => payment.monthYear === currentMonth);
    },

    // Add payment
    addPayment: async (paymentData) => {
        const { paymentId, memberId, monthYear, amount, status, paymentDate } = paymentData;
        const values = [paymentId, memberId, monthYear, amount, status, paymentDate];
        return await appendToSheet('Payments', values);
    },

    // Update payment status
    updatePaymentStatus: async (paymentId, status) => {
        const payments = await getSheetData('Payments');
        const payment = payments.find(p => p.paymentId === paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        // Find the row number (assuming paymentId is in column A)
        const rowIndex = payments.findIndex(p => p.paymentId === paymentId) + 2; // +2 because of header row and 0-based index
        const cellRange = `E${rowIndex}`; // Status is in column E

        return await updateCell('Payments', cellRange, status);
    },

    // Mark payments as late
    markLatePayments: async (dueDay) => {
        const currentDate = new Date();
        const currentMonth = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

        if (currentDate.getDate() > dueDay) {
            const payments = await getSheetData('Payments');
            const unpaidPayments = payments.filter(p =>
                p.monthYear === currentMonth &&
                p.status === 'Unpaid'
            );

            for (const payment of unpaidPayments) {
                // Update status to Late
                await paymentsAPI.updatePaymentStatus(payment.paymentId, 'Late');

                // Add 50,000 to amount
                const newAmount = parseInt(payment.amount) + 50000;
                const rowIndex = payments.findIndex(p => p.paymentId === payment.paymentId) + 2;
                const amountCellRange = `D${rowIndex}`; // Amount is in column D
                await updateCell('Payments', amountCellRange, newAmount.toString());
            }
        }
    }
};

// TOURNAMENTS API
export const tournamentsAPI = {
    // Get all tournaments
    getAllTournaments: async () => {
        return await getSheetData('Tournaments');
    },

    // Get active tournaments
    getActiveTournaments: async () => {
        const tournaments = await getSheetData('Tournaments');
        return tournaments.filter(t => t.status === 'Active');
    },

    // Add tournament
    addTournament: async (tournamentData) => {
        const { tournamentId, tournamentName, startDate, endDate, status, description } = tournamentData;
        const values = [tournamentId, tournamentName, startDate, endDate, status, description];
        return await appendToSheet('Tournaments', values);
    },

    // Update tournament status
    updateTournamentStatus: async (tournamentId, status) => {
        const tournaments = await getSheetData('Tournaments');
        const tournament = tournaments.find(t => t.tournamentId === tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        const rowIndex = tournaments.findIndex(t => t.tournamentId === tournamentId) + 2;
        const statusCellRange = `E${rowIndex}`; // Status is in column E

        return await updateCell('Tournaments', statusCellRange, status);
    }
};

// TEAMS API
export const teamsAPI = {
    // Get all teams
    getAllTeams: async () => {
        return await getSheetData('Teams');
    },

    // Get teams by tournament
    getTeamsByTournament: async (tournamentId) => {
        const teams = await getSheetData('Teams');
        return teams.filter(team => team.tournamentId === tournamentId);
    },

    // Get active teams by tournament
    getActiveTeamsByTournament: async (tournamentId) => {
        const teams = await getSheetData('Teams');
        return teams.filter(team => team.tournamentId === tournamentId && team.status === 'Active');
    },

    // Add team
    addTeam: async (teamData) => {
        const { teamId, teamName, tournamentId, registrationDate, status } = teamData;
        const values = [teamId, teamName, tournamentId, registrationDate, status];
        return await appendToSheet('Teams', values);
    },

    // Update team status
    updateTeamStatus: async (teamId, status) => {
        const teams = await getSheetData('Teams');
        const team = teams.find(t => t.teamId === teamId);

        if (!team) {
            throw new Error('Team not found');
        }

        const rowIndex = teams.findIndex(t => t.teamId === teamId) + 2;
        const statusCellRange = `E${rowIndex}`; // Status is in column E

        return await updateCell('Teams', statusCellRange, status);
    }
};

// MATCHES API
export const matchesAPI = {
    // Get all matches
    getAllMatches: async () => {
        return await getSheetData('Matches');
    },

    // Get matches for tournament
    getMatchesForTournament: async (tournamentId) => {
        const matches = await getSheetData('Matches');
        return matches.filter(match => match.tournamentId === tournamentId);
    },

    // Get matches by round
    getMatchesByRound: async (tournamentId, round) => {
        const matches = await getSheetData('Matches');
        return matches.filter(match =>
            match.tournamentId === tournamentId &&
            match.round === round.toString()
        );
    },

    // Get completed matches for tournament
    getCompletedMatches: async (tournamentId) => {
        const matches = await getSheetData('Matches');
        return matches.filter(match =>
            match.tournamentId === tournamentId &&
            match.status === 'Completed'
        );
    },

    // Get upcoming matches for tournament
    getUpcomingMatches: async (tournamentId) => {
        const matches = await getSheetData('Matches');
        return matches.filter(match =>
            match.tournamentId === tournamentId &&
            match.status === 'Scheduled'
        );
    },

    // Add match
    addMatch: async (matchData) => {
        const { matchId, tournamentId, homeTeamId, awayTeamId, homeScore, awayScore, matchDate, round, status } = matchData;
        const values = [matchId, tournamentId, homeTeamId, awayTeamId, homeScore, awayScore, matchDate, round, status];
        return await appendToSheet('Matches', values);
    },

    // Update match score
    updateMatchScore: async (matchId, homeScore, awayScore) => {
        const matches = await getSheetData('Matches');
        const match = matches.find(m => m.matchId === matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        const rowIndex = matches.findIndex(m => m.matchId === matchId) + 2;
        const homeScoreRange = `E${rowIndex}`; // Home score is in column E
        const awayScoreRange = `F${rowIndex}`; // Away score is in column F
        const statusRange = `I${rowIndex}`; // Status is in column I

        await updateCell('Matches', homeScoreRange, homeScore.toString());
        await updateCell('Matches', awayScoreRange, awayScore.toString());
        await updateCell('Matches', statusRange, 'Completed');
    },

    // Update match status
    updateMatchStatus: async (matchId, status) => {
        const matches = await getSheetData('Matches');
        const match = matches.find(m => m.matchId === matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        const rowIndex = matches.findIndex(m => m.matchId === matchId) + 2;
        const statusRange = `I${rowIndex}`; // Status is in column I

        return await updateCell('Matches', statusRange, status);
    },

    // Calculate league table
    calculateLeagueTable: async (tournamentId) => {
        const matches = await matchesAPI.getCompletedMatches(tournamentId);
        const teams = await teamsAPI.getActiveTeamsByTournament(tournamentId);

        // Initialize team stats
        const teamStats = {};
        teams.forEach(team => {
            teamStats[team.teamId] = {
                teamId: team.teamId,
                teamName: team.teamName,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            };
        });

        // Process matches
        matches.forEach(match => {
            const homeScore = parseInt(match.homeScore) || 0;
            const awayScore = parseInt(match.awayScore) || 0;

            if (teamStats[match.homeTeamId] && teamStats[match.awayTeamId]) {
                // Update home team stats
                teamStats[match.homeTeamId].played++;
                teamStats[match.homeTeamId].goalsFor += homeScore;
                teamStats[match.homeTeamId].goalsAgainst += awayScore;

                // Update away team stats
                teamStats[match.awayTeamId].played++;
                teamStats[match.awayTeamId].goalsFor += awayScore;
                teamStats[match.awayTeamId].goalsAgainst += homeScore;

                // Determine result
                if (homeScore > awayScore) {
                    teamStats[match.homeTeamId].won++;
                    teamStats[match.homeTeamId].points += 3;
                    teamStats[match.awayTeamId].lost++;
                } else if (homeScore < awayScore) {
                    teamStats[match.awayTeamId].won++;
                    teamStats[match.awayTeamId].points += 3;
                    teamStats[match.homeTeamId].lost++;
                } else {
                    teamStats[match.homeTeamId].drawn++;
                    teamStats[match.homeTeamId].points += 1;
                    teamStats[match.awayTeamId].drawn++;
                    teamStats[match.awayTeamId].points += 1;
                }
            }
        });

        // Convert to array and sort by points, then goal difference
        return Object.values(teamStats).sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            const aGoalDiff = a.goalsFor - a.goalsAgainst;
            const bGoalDiff = b.goalsFor - b.goalsAgainst;
            return bGoalDiff - aGoalDiff;
        });
    }
};

// Utility functions
export const utils = {
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Get current month-year
    getCurrentMonthYear: () => {
        const now = new Date();
        return `${now.getMonth() + 1}-${now.getFullYear()}`;
    }
};

