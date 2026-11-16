import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Marketplaces from './pages/Marketplaces';
import ShiftPlanner from './pages/ShiftPlanner';
import ExpenseManager from './pages/ExpenseManager';
import Chat from './pages/Chat';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Faqs from './pages/Faqs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';

function App() {
  const [showSplash, setShowSplash] = useState(false);

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          
          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1 bg-slate-50/60">
              <ErrorBoundary>
                <Routes>
                  {/* Public Browsing & Informational Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/marketplace" element={<Marketplaces />} />
                  <Route path="/marketplaces" element={<Marketplaces />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faqs" element={<Faqs />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  
                  {/* Authenticated Resident / Tenant Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <Dashboard initialTab="requests" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute allowedRoles={['USER']}>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shift-planner"
                    element={
                      <ProtectedRoute>
                        <ShiftPlanner />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <ExpenseManager />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />

                  {/* Provider & Landlord Protected Panel */}
                  <Route
                    path="/provider-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['PROVIDER', 'PROPERTY_OWNER', 'ADMIN']}>
                        <ProviderDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Administrator Protected Panel */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Role-Specific Direct Dashboards (Sections 8, 9, 10, 11, 12) */}
                  <Route
                    path="/owner/hostel"
                    element={
                      <ProtectedRoute allowedRoles={['PROPERTY_OWNER', 'HOSTEL_OWNER', 'ADMIN']}>
                        <ProviderDashboard initialTab="property" propertyType="Hostel" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/pg"
                    element={
                      <ProtectedRoute allowedRoles={['PROPERTY_OWNER', 'PG_OWNER', 'ADMIN']}>
                        <ProviderDashboard initialTab="property" propertyType="PG" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/room"
                    element={
                      <ProtectedRoute allowedRoles={['PROPERTY_OWNER', 'ROOM_OWNER', 'ADMIN']}>
                        <ProviderDashboard initialTab="property" propertyType="Room" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/provider/tiffin"
                    element={
                      <ProtectedRoute allowedRoles={['PROVIDER', 'TIFFIN_PROVIDER', 'ADMIN']}>
                        <ProviderDashboard initialTab="tiffin" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/provider/services"
                    element={
                      <ProtectedRoute allowedRoles={['PROVIDER', 'CLEANING_LAUNDRY_PROVIDER', 'ADMIN']}>
                        <ProviderDashboard initialTab="cleaning" />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
