import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { tournamentsAPI, teamsAPI, matchesAPI } from '../services/googleSheetsService';
import { Trophy, Plus, Calendar, Users, Target, Edit, Trash2 } from 'lucide-react';

const TournamentManagement = () => {
  const { state, dispatch } = useApp();
  const [tournaments, setTournaments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    tournamentName: '',
    startDate: '',
    endDate: '',
    status: 'Upcoming',
    description: ''
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tournamentsData = await tournamentsAPI.getAllTournaments();
      setTournaments(tournamentsData);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleAddTournament = () => {
    setEditingTournament(null);
    setFormData({
      tournamentName: '',
      startDate: '',
      endDate: '',
      status: 'Upcoming',
      description: ''
    });
    setShowForm(true);
  };

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    setFormData({
      tournamentName: tournament.tournamentName,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      status: tournament.status,
      description: tournament.description
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tournamentData = {
        ...formData,
        tournamentId: editingTournament ? editingTournament.tournamentId : Date.now().toString()
      };

      if (editingTournament) {
        await tournamentsAPI.updateTournamentStatus(tournamentData.tournamentId, tournamentData.status);
        setTournaments(tournaments.map(t => 
          t.tournamentId === tournamentData.tournamentId ? { ...t, ...tournamentData } : t
        ));
      } else {
        await tournamentsAPI.addTournament(tournamentData);
        setTournaments([...tournaments, tournamentData]);
      }

      setShowForm(false);
      setEditingTournament(null);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <Target className="h-4 w-4 text-green-600" />;
      case 'Upcoming': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'Completed': return <Trophy className="h-4 w-4 text-gray-600" />;
      case 'Cancelled': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Management</h1>
          <p className="mt-2 text-gray-600">Manage tournaments and competitions</p>
        </div>
        <button
          onClick={handleAddTournament}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tournament
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div key={tournament.tournamentId} className="card hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(tournament.status)}
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTournament(tournament)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tournament.tournamentName}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Start: {new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>End: {new Date(tournament.endDate).toLocaleDateString()}</span>
                </div>
                {tournament.description && (
                  <p className="text-gray-500 text-xs mt-2">{tournament.description}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teams:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Matches:</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tournament Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTournament ? 'Edit Tournament' : 'Add New Tournament'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={formData.tournamentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournamentName: e.target.value }))}
                  required
                  className="input mt-1"
                  placeholder="Enter tournament name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="input mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="input mt-1"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="input mt-1"
                  placeholder="Enter tournament description"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTournament ? 'Update Tournament' : 'Add Tournament'}
                </button>
              </div>
            </form>
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

export default TournamentManagement;
