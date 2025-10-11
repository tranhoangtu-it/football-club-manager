import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { matchesAPI, teamsAPI } from '../services/googleSheetsService';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';

const LeagueTable = () => {
  const { state, dispatch } = useApp();
  const [leagueTable, setLeagueTable] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadLeagueTable(selectedTournament);
    }
  }, [selectedTournament]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matches, teams] = await Promise.all([
        matchesAPI.getAllMatches(),
        teamsAPI.getAllTeams()
      ]);

      dispatch({ type: 'SET_MATCHES', payload: matches });
      dispatch({ type: 'SET_TEAMS', payload: teams });

      // Extract unique tournaments
      const uniqueTournaments = [...new Set(matches.map(match => match.tournamentId))];
      setTournaments(uniqueTournaments);
      
      if (uniqueTournaments.length > 0) {
        setSelectedTournament(uniqueTournaments[0]);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadLeagueTable = async (tournamentId) => {
    try {
      setLoading(true);
      const table = await matchesAPI.calculateLeagueTable(tournamentId);
      setLeagueTable(table);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    if (position === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (position === 3) {
      return <Medal className="h-5 w-5 text-amber-600" />;
    }
    return <span className="text-sm font-medium text-gray-500">#{position}</span>;
  };

  const getFormColor = (points) => {
    if (points >= 9) return 'text-green-600';
    if (points >= 6) return 'text-yellow-600';
    if (points >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">League Table</h1>
        <p className="mt-2 text-gray-600">Current standings and team performance</p>
      </div>

      {/* Tournament Selector */}
      {tournaments.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Tournament:</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="input w-64"
              >
                {tournaments.map((tournament) => (
                  <option key={tournament} value={tournament}>
                    {tournament}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* League Table */}
      {leagueTable.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              League Table - {selectedTournament}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12">Pos</th>
                  <th>Team</th>
                  <th className="text-center">P</th>
                  <th className="text-center">W</th>
                  <th className="text-center">D</th>
                  <th className="text-center">L</th>
                  <th className="text-center">GF</th>
                  <th className="text-center">GA</th>
                  <th className="text-center">GD</th>
                  <th className="text-center font-bold">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leagueTable.map((team, index) => (
                  <tr key={team.teamId} className="hover:bg-gray-50">
                    <td className="flex items-center justify-center">
                      {getPositionIcon(index + 1)}
                    </td>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {team.teamName}
                      </div>
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.played}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.won}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.drawn}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.lost}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.goalsFor}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      {team.goalsAgainst}
                    </td>
                    <td className="text-center text-sm text-gray-900">
                      <span className={getFormColor(team.goalsFor - team.goalsAgainst)}>
                        {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}
                        {team.goalsFor - team.goalsAgainst}
                      </span>
                    </td>
                    <td className="text-center text-sm font-bold text-gray-900">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No League Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTournament 
                ? 'No matches found for this tournament.' 
                : 'Select a tournament to view the league table.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <div className="card-body">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              P = Played
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              W = Won
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              D = Drawn
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              L = Lost
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              GF = Goals For
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              GA = Goals Against
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
              GD = Goal Difference
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
              Pts = Points
            </div>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueTable;

