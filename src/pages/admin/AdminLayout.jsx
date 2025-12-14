import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, MessageSquare, ListMusic,
    Settings, ChevronLeft, Shield, Menu, X, Crown,
    FileText, Bell, History, Globe, Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function AdminLayout() {
    const { user, isAdmin, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="admin-unauthorized">
                <div className="loader"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    // Redirect if not admin
    if (!isAdmin) {
        return (
            <div className="admin-unauthorized">
                <Shield size={64} />
                <h1>Erişim Reddedildi</h1>
                <p>Bu sayfaya erişim yetkiniz bulunmuyor.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'Kullanıcılar' },
        { to: '/admin/subscriptions', icon: Crown, label: 'Abonelikler' },
        { to: '/admin/reports', icon: FileText, label: 'Raporlar' },
        { to: '/admin/notifications', icon: Bell, label: 'Bildirimler' },
        { to: '/admin/emails', icon: Mail, label: 'E-posta' },
        { to: '/admin/reviews', icon: MessageSquare, label: 'Yorumlar' },
        { to: '/admin/playlists', icon: ListMusic, label: 'Listeler' },
        { to: '/admin/audit', icon: History, label: 'İşlem Geçmişi' },
        { to: '/admin/seo', icon: Globe, label: 'SEO' },
        { to: '/admin/settings', icon: Settings, label: 'Ayarlar' },
    ];

    const handleNavClick = () => {
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <header className="admin-mobile-header">
                <button
                    className="mobile-sidebar-toggle"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle menu"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="mobile-title">Admin Panel</h1>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/" className="back-link">
                        <ChevronLeft size={20} />
                        Siteye Dön
                    </NavLink>
                    <h2 className="sidebar-title">Admin Panel</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <img
                            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                            alt={user?.display_name || user?.username}
                        />
                        <div className="user-info">
                            <span className="user-name">{user?.display_name || user?.username}</span>
                            <span className="user-role">Admin</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
