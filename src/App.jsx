import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import OnboardingModal from './components/OnboardingModal';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const SongDetail = lazy(() => import('./pages/SongDetail'));
const Discover = lazy(() => import('./pages/Discover'));
const Profile = lazy(() => import('./pages/Profile'));
const Lists = lazy(() => import('./pages/Lists'));
const ListDetail = lazy(() => import('./pages/ListDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Community = lazy(() => import('./pages/Community'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const GoldMembership = lazy(() => import('./pages/GoldMembership'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement'));
const PlaylistsManagement = lazy(() => import('./pages/admin/PlaylistsManagement'));
const SettingsManagement = lazy(() => import('./pages/admin/SettingsManagement'));
const SubscriptionsManagement = lazy(() => import('./pages/admin/SubscriptionsManagement'));
const ReportsManagement = lazy(() => import('./pages/admin/ReportsManagement'));
const NotificationsManagement = lazy(() => import('./pages/admin/NotificationsManagement'));
const AuditLogManagement = lazy(() => import('./pages/admin/AuditLogManagement'));
const SEOManagement = lazy(() => import('./pages/admin/SEOManagement'));
const EmailManagement = lazy(() => import('./pages/admin/EmailManagement'));

// Loading fallback component
function PageLoader() {
    return (
        <div className="page-loader">
            <div className="loader-vinyl">
                <div className="vinyl-disc spinning">
                    <div className="vinyl-label"></div>
                </div>
            </div>
            <p className="loader-text">Yükleniyor...</p>
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <UserProvider>
                    <ModalProvider>
                        <ToastProvider>
                            <div className="app">
                                {/* SVG Definitions for gradients */}
                                <svg width="0" height="0" style={{ position: 'absolute' }}>
                                    <defs>
                                        <linearGradient id="vinylGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00d4ff" />
                                            <stop offset="100%" stopColor="#ff6b9d" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <Routes>
                                    {/* Admin Routes (without header/footer) */}
                                    <Route path="/admin" element={
                                        <Suspense fallback={<PageLoader />}>
                                            <AdminLayout />
                                        </Suspense>
                                    }>
                                        <Route index element={<AdminDashboard />} />
                                        <Route path="users" element={<UsersManagement />} />
                                        <Route path="subscriptions" element={<SubscriptionsManagement />} />
                                        <Route path="reports" element={<ReportsManagement />} />
                                        <Route path="notifications" element={<NotificationsManagement />} />
                                        <Route path="reviews" element={<ReviewsManagement />} />
                                        <Route path="playlists" element={<PlaylistsManagement />} />
                                        <Route path="audit" element={<AuditLogManagement />} />
                                        <Route path="settings" element={<SettingsManagement />} />
                                        <Route path="seo" element={<SEOManagement />} />
                                        <Route path="emails" element={<EmailManagement />} />
                                    </Route>

                                    {/* Main Routes (with header/footer) */}
                                    <Route path="*" element={<MainLayout />} />
                                </Routes>

                                {/* Global Toast Container */}
                                <ToastContainer />
                            </div>
                        </ToastProvider>
                    </ModalProvider>
                </UserProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

function MainLayout() {
    return (
        <>
            <Header />
            <main className="app-main">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/song/:id" element={<SongDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/lists" element={<Lists />} />
                        <Route path="/list/:id" element={<ListDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/about" element={<About />} />

                        {/* Gold Membership */}
                        <Route path="/gold" element={<GoldMembership />} />
                        <Route path="/gold/success" element={<GoldMembership />} />
                        <Route path="/gold/failed" element={<GoldMembership />} />

                        {/* Dynamic routes */}
                        <Route path="/album/:id" element={<Discover />} />
                        <Route path="/artist/:id" element={<Discover />} />
                        <Route path="/user/:username" element={<Profile />} />

                        {/* 404 */}
                        <Route path="*" element={
                            <div className="not-found">
                                <img src="/404.svg" alt="404" className="not-found-illustration" />
                                <h1>Sayfa Bulunamadı</h1>
                                <p>Aradığın sayfa mevcut değil veya kaldırılmış olabilir.</p>
                                <a href="/" className="btn btn-primary">Ana Sayfaya Dön</a>
                            </div>
                        } />
                    </Routes>
                </Suspense>
            </main>
            <Footer />
            <OnboardingWrapper />
        </>
    );
}

// Onboarding wrapper component
function OnboardingWrapper() {
    const { user, isAuthenticated } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Show onboarding for authenticated users who haven't completed it
        if (isAuthenticated && user) {
            const completed = localStorage.getItem('onboarding_completed');
            if (!completed) {
                // Small delay to let the page load first
                const timer = setTimeout(() => setShowOnboarding(true), 500);
                return () => clearTimeout(timer);
            }
        }
    }, [isAuthenticated, user]);

    if (!showOnboarding) return null;

    return (
        <OnboardingModal
            isOpen={showOnboarding}
            onComplete={() => setShowOnboarding(false)}
        />
    );
}

export default App;

