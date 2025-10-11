import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: '',
    skillLevel: 'C',
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        jerseyNumber: member.jerseyNumber || '',
        skillLevel: member.skillLevel || 'C',
        joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {member ? 'Edit Member' : 'Add New Member'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input mt-1"
              placeholder="Enter member's full name"
            />
          </div>

          <div>
            <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700">
              Jersey Number
            </label>
            <input
              type="number"
              id="jerseyNumber"
              name="jerseyNumber"
              value={formData.jerseyNumber}
              onChange={handleChange}
              required
              min="1"
              max="99"
              className="input mt-1"
              placeholder="Enter jersey number"
            />
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
              Skill Level
            </label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="input mt-1"
            >
              <option value="A">A - Professional</option>
              <option value="B">B - Advanced</option>
              <option value="C">C - Intermediate</option>
              <option value="D">D - Beginner</option>
            </select>
          </div>

          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
              Join Date
            </label>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              required
              className="input mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {member ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;

