import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { membersAPI } from '../services/googleSheetsService';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import MemberForm from '../components/MemberForm';

const MemberList = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const members = await membersAPI.getAllMembers();
      dispatch({ type: 'SET_MEMBERS', payload: members });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await membersAPI.deleteMember(memberId);
        dispatch({ type: 'DELETE_MEMBER', payload: memberId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };

  const handleFormSubmit = async (memberData) => {
    try {
      if (editingMember) {
        await membersAPI.updateMember(editingMember.memberId, memberData);
        dispatch({ type: 'UPDATE_MEMBER', payload: { ...memberData, memberId: editingMember.memberId } });
      } else {
        const newMember = { ...memberData, memberId: Date.now().toString() };
        await membersAPI.addMember(newMember);
        dispatch({ type: 'ADD_MEMBER', payload: newMember });
      }
      setShowForm(false);
      setEditingMember(null);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getSkillLevelColor = (skillLevel) => {
    switch (skillLevel) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="mt-2 text-gray-600">Manage your club members</p>
        </div>
        <button
          onClick={handleAddMember}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Members Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Jersey Number</th>
                <th>Skill Level</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {state.members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No members found. Add your first member!
                  </td>
                </tr>
              ) : (
                state.members.map((member) => (
                  <tr key={member.memberId} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {member.memberId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        #{member.jerseyNumber}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(member.skillLevel)}`}>
                        {member.skillLevel}
                      </span>
                    </td>
                    <td className="text-sm text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.memberId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Form Modal */}
      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
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

export default MemberList;

