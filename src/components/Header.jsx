import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogIn, LogOut, Bell, Music, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsSearchOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Ana Sayfa' },
        { to: '/discover', label: 'Keşfet' },
        { to: '/lists', label: 'Listeler' },
        { to: '/community', label: 'Topluluk' },
    ];

    return (
        <header className="header">
            <div className="header-container container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="logo-vinyl">
                        <div className="vinyl-disc">
                            <div className="vinyl-label"></div>
                        </div>
                    </div>
                    <span className="logo-text">
                        <span className="logo-juke">Juke</span>
                        <span className="logo-boxd">boxd</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link-active' : ''}`
                            }
                            end={link.to === '/'}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="header-right">
                    {/* Search */}
                    <div className={`header-search ${isSearchOpen ? 'search-open' : ''}`}>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Şarkı, sanatçı veya albüm ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <button type="submit" className="search-submit">
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    <button
                        className="btn btn-icon search-toggle"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Arama"
                    >
                        {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            {/* Notifications */}
                            <button className="btn btn-icon header-notifications" aria-label="Bildirimler">
                                <Bell size={20} />
                                <span className="notification-badge">3</span>
                            </button>

                            {/* User Menu */}
                            <div className="user-menu-container">
                                <button
                                    className="header-profile"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <img
                                        src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                        alt={user?.display_name || user?.username}
                                        className="profile-avatar"
                                    />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div
                                            className="user-menu-overlay"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="user-menu glass-card">
                                            <div className="user-menu-header">
                                                <img
                                                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                                    alt={user?.display_name}
                                                />
                                                <div>
                                                    <span className="user-name">{user?.display_name || user?.username}</span>
                                                    <span className="user-email">@{user?.username}</span>
                                                </div>
                                            </div>
                                            <div className="user-menu-items">
                                                <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                                                    <User size={18} />
                                                    Profilim
                                                </Link>
                                                {isAdmin && (
                                                    <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                                                        <Shield size={18} />
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout}>
                                                    <LogOut size={18} />
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Login Button */
                        <Link to="/login" className="btn btn-primary header-login">
                            <LogIn size={16} />
                            <span>Giriş Yap</span>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="btn btn-icon mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menü"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <nav className="mobile-nav">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                            end={link.to === '/'}
                        >
                            <Music size={18} />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="mobile-menu-footer">
                    {isAuthenticated ? (
                        <button
                            className="btn btn-secondary mobile-login"
                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                        >
                            <LogOut size={18} />
                            Çıkış Yap
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary mobile-login" onClick={() => setIsMobileMenuOpen(false)}>
                            <LogIn size={18} />
                            Giriş Yap
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    );
}
