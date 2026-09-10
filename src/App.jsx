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
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans">
            <ToastContainer />
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
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
