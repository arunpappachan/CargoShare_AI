import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';


import Profile from './pages/Profile';
import ExporterDashboard from './pages/ExporterDashboard';
import ShippingDashboard from './pages/ShippingDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Routes>
            <Route path="/dashboard/exporter" element={<ExporterDashboard />} />
            <Route path="/dashboard/carrier" element={<ShippingDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/*" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />


                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
