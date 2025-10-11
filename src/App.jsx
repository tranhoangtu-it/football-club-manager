import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import PaymentDashboard from './pages/PaymentDashboard';
import LeagueTable from './pages/LeagueTable';
import MatchFixtures from './pages/MatchFixtures';
import TournamentManagement from './pages/TournamentManagement';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<MemberList />} />
              <Route path="/payments" element={<PaymentDashboard />} />
              <Route path="/tournaments" element={<TournamentManagement />} />
              <Route path="/league" element={<LeagueTable />} />
              <Route path="/fixtures" element={<MatchFixtures />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

