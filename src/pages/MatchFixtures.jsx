import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { matchesAPI, teamsAPI } from '../services/googleSheetsService';
import { Calendar, Edit, Save, X } from 'lucide-react';

const MatchFixtures = () => {
  const { state, dispatch } = useApp();
  const [editingMatch, setEditingMatch] = useState(null);
  const [scoreData, setScoreData] = useState({ homeScore: '', awayScore: '' });
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadMatches(selectedTournament);
    }
  }, [selectedTournament]);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
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
    }
  };

  const loadMatches = async (tournamentId) => {
    try {
      const matches = await matchesAPI.getMatchesForTournament(tournamentId);
      // Update the matches in state for this tournament
      const updatedMatches = state.matches.map(match => 
        match.tournamentId === tournamentId ? match : match
      );
      dispatch({ type: 'SET_MATCHES', payload: updatedMatches });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getTeamName = (teamId) => {
    const team = state.teams.find(t => t.teamId === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const handleEditScore = (match) => {
    setEditingMatch(match);
    setScoreData({
      homeScore: match.homeScore || '',
      awayScore: match.awayScore || ''
    });
  };

  const handleSaveScore = async () => {
    if (!editingMatch) return;

    try {
      await matchesAPI.updateMatchScore(
        editingMatch.matchId,
        parseInt(scoreData.homeScore) || 0,
        parseInt(scoreData.awayScore) || 0
      );

      dispatch({
        type: 'UPDATE_MATCH_SCORE',
        payload: {
          matchId: editingMatch.matchId,
          homeScore: scoreData.homeScore,
          awayScore: scoreData.awayScore
        }
      });

      setEditingMatch(null);
      setScoreData({ homeScore: '', awayScore: '' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    setScoreData({ homeScore: '', awayScore: '' });
  };

  const getMatchResult = (homeScore, awayScore) => {
    if (homeScore === '' || awayScore === '') return 'TBD';
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    
    if (home > away) return 'Home Win';
    if (away > home) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Home Win': return 'text-green-600';
      case 'Away Win': return 'text-blue-600';
      case 'Draw': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const currentMatches = state.matches.filter(match => match.tournamentId === selectedTournament);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Match Fixtures</h1>
        <p className="mt-2 text-gray-600">View and update match scores</p>
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

      {/* Matches List */}
      {currentMatches.length > 0 ? (
        <div className="space-y-4">
          {currentMatches.map((match) => (
            <div key={match.matchId} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-lg font-medium text-gray-900">
                          {getTeamName(match.homeTeamId)}
                        </div>
                        <div className="text-sm text-gray-500">Home</div>
                      </div>
                      
                      <div className="mx-6 text-center">
                        {editingMatch?.matchId === match.matchId ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={scoreData.homeScore}
                              onChange={(e) => setScoreData(prev => ({ ...prev, homeScore: e.target.value }))}
                              className="input w-16 text-center"
                              min="0"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="number"
                              value={scoreData.awayScore}
                              onChange={(e) => setScoreData(prev => ({ ...prev, awayScore: e.target.value }))}
                              className="input w-16 text-center"
                              min="0"
                            />
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gray-900">
                            {match.homeScore || '0'} - {match.awayScore || '0'}
                          </div>
                        )}
                        <div className={`text-sm font-medium ${getResultColor(getMatchResult(match.homeScore, match.awayScore))}`}>
                          {getMatchResult(match.homeScore, match.awayScore)}
                        </div>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="text-lg font-medium text-gray-900">
                          {getTeamName(match.awayTeamId)}
                        </div>
                        <div className="text-sm text-gray-500">Away</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    {editingMatch?.matchId === match.matchId ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveScore}
                          className="btn btn-success text-sm"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-secondary text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditScore(match)}
                        className="btn btn-primary text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Score
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Matches Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTournament 
                ? 'No matches found for this tournament.' 
                : 'Select a tournament to view matches.'
              }
            </p>
          </div>
        </div>
      )}

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

export default MatchFixtures;

