import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './components/Home';
import Upload from './components/Upload';
import SignalGenerator from './components/SignalGenerator';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import AnalysisList from './components/AnalysisList';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import AnalysisDetail from './components/AnalysisDetail';
import ShareOptions from './components/ShareOptions';
import AnalysisSharePassword from './components/AnalysisSharePassword';
import SharedAnalysisView from './components/SharedAnalysisView';
import GeneratorResults from './components/GeneratorResults';
import Results from './components/Results';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout messages={[]}>  {/* Messages can be fetched from API later */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/signal-generator" element={<SignalGenerator />} />
            <Route path="/generator-results" element={<GeneratorResults />} />
            <Route path="/results" element={<Results />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/analyses" element={<AnalysisList />} />
            <Route path="/analysis/:analysisId" element={<AnalysisDetail />} />
            <Route path="/analysis/:analysisId/share/options" element={<ShareOptions />} />
            <Route path="/analysis/:analysisId/share/password" element={<AnalysisSharePassword />} />
            <Route path="/share/:analysisId" element={<SharedAnalysisView />} />
          </Routes>
        </Layout>
     </Router>
   </AuthProvider>
  );
}

export default App;
