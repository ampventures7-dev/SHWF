import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DonationSection from './components/DonationSection';
import Pillars from './components/Pillars';
import Gallery from './components/Gallery';
import StudentPortal from './components/StudentPortal';

import OtpModal from './components/OtpModal';
import UserLoginModal from './components/UserLoginModal';
import AdminLoginModal from './components/AdminLoginModal';
import HealthDashboard from './components/HealthDashboard';
import GrowthCalculator from './components/GrowthCalculator';
import AdminPortal from './components/AdminPortal';
import EnquiryForm from './components/EnquiryForm';
import Footer from './components/Footer';
import Toast from './components/Toast';


export default function App() {
  // Authentication & Session States
  const [adminToken, setAdminToken] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [isUserLoginOpen, setIsUserLoginOpen] = useState(false);
  const [initialStudentId, setInitialStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [skipInitialOtpDispatch, setSkipInitialOtpDispatch] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [activeDashboardStudent, setActiveDashboardStudent] = useState(null);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  // Auto-detect deep-link QR scans (?student_id=...) or Direct Staff /admin routes
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStudentId = urlParams.get('student_id');
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute = pathname.includes('/admin') || urlParams.has('admin') || hash === '#admin';

      if (urlStudentId) {
        setInitialStudentId(urlStudentId.trim().toUpperCase());
        setSelectedStudent({ student_id: urlStudentId.trim().toUpperCase() });
        setIsUserLoginOpen(true);
        addToast(`Scanned Health Card for Student: ${urlStudentId}`, 'info');
      } else if (isAdminRoute) {
        if (adminToken) {
          setIsAdminOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    } catch (e) {
      console.warn('Could not parse URL parameters:', e);
    }
  }, [adminToken]);


  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Admin Flow Handlers ---
  const handleOpenAdmin = () => {
    if (adminToken) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (token) => {
    setAdminToken(token);
    setIsAdminOpen(true);
  };

  const handleAdminSignOut = () => {
    setAdminToken(null);
    setIsAdminOpen(false);
    addToast('Admin signed out successfully. Access locked.', 'info');
  };

  // --- User / Parent Flow Handlers ---
  const handleOpenUserLogin = () => {
    setIsUserLoginOpen(true);
  };

  const handleUserOtpRequested = (studentData) => {
    setSelectedStudent(studentData);
    setSkipInitialOtpDispatch(true); // OTP already sent by UserLoginModal
    setIsOtpModalOpen(true);
  };

  const handleDiscoverySelectStudent = (student) => {
    setSelectedStudent(student);
    setSkipInitialOtpDispatch(false); // Let OtpModal dispatch on mount
    setIsOtpModalOpen(true);
  };

  const handleOtpSuccess = (token, studentObj) => {
    const activeStudent = studentObj || selectedStudent;
    setAuthToken(token);
    setIsOtpModalOpen(false);
    setActiveDashboardStudent(activeStudent);
    addToast(`Authenticated for ${activeStudent?.full_name || 'student'}!`, 'success');

    // Smooth scroll down to dashboard
    setTimeout(() => {
      const el = document.getElementById('dashboard-view');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBackToSearch = () => {
    setActiveDashboardStudent(null);
    setAuthToken(null);
    setSelectedStudent(null);
    addToast('Session closed. Returned to Search Portal.', 'info');
    const el = document.getElementById('portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Banner Notice with Official Registration & Helpline */}
      <TopBar />

      {/* Main Sticky Navbar */}
      <Navbar
        onOpenAdmin={handleOpenAdmin}
        onOpenUserLogin={handleOpenUserLogin}
        isAdminLoggedIn={!!adminToken}
        isUserLoggedIn={!!authToken}
      />

      {/* 1. Hero Section */}
      <Hero onOpenUserLogin={handleOpenUserLogin} />

      {/* 2. Student Health Portal OR Active Digital Health Dashboard */}
      {activeDashboardStudent && authToken ? (
        <div id="dashboard-view">
          <HealthDashboard
            student={activeDashboardStudent}
            token={authToken}
            onBack={handleBackToSearch}
            onToast={addToast}
          />
        </div>
      ) : (
        <StudentPortal
          onSelectStudent={handleDiscoverySelectStudent}
          onToast={addToast}
        />
      )}

      {/* 3. WHO Child Growth Sandbox Calculator */}
      <GrowthCalculator onToast={addToast} />

      {/* 4. Core Transformation Pillars (Reliance Foundation Style) */}
      <Pillars />

      {/* 5. School Health Camp Photo Gallery */}
      <Gallery />

      {/* 6. Prominent Donation & Bank Details Section */}
      <DonationSection onToast={addToast} />

      {/* 7. Follow-Up & School Camp Enquiry Form */}
      <EnquiryForm onToast={addToast} />

      {/* 8. Official Noble NGO Footer (Strictly NO EMAIL) */}
      <Footer onOpenAdmin={handleOpenAdmin} isAdminLoggedIn={!!adminToken} />




      {/* 1. Admin Password Sign-In Modal (Protected Barrier) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        onToast={addToast}
      />

      {/* 2. Admin Data Ingestion & Registration Portal (Only after password verification) */}
      <AdminPortal
        isOpen={isAdminOpen}
        adminToken={adminToken}
        onSignOut={handleAdminSignOut}
        onClose={() => setIsAdminOpen(false)}
        onToast={addToast}
      />

      {/* 3. Parent / User OTP Registration & Sign-In Modal */}
      <UserLoginModal
        isOpen={isUserLoginOpen}
        initialStudentId={initialStudentId}
        onClose={() => setIsUserLoginOpen(false)}
        onOtpRequested={handleUserOtpRequested}
        onToast={addToast}
      />


      {/* 4. OTP Verification Modal Popup */}
      {isOtpModalOpen && selectedStudent && (
        <OtpModal
          student={selectedStudent}
          skipInitialDispatch={skipInitialOtpDispatch}
          onClose={() => setIsOtpModalOpen(false)}
          onSuccess={handleOtpSuccess}
          onToast={addToast}
        />
      )}
    </div>
  );
}
