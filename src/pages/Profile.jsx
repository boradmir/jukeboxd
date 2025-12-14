import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Settings, Calendar, Music, Star, ListMusic, Users,
    Heart, Edit2, Share2, LogIn, Crown, UserPlus, UserMinus, Award
} from 'lucide-react';
import VinylRating from '../components/VinylRating';
import SongCard from '../components/SongCard';
import GoldBadge from '../components/GoldBadge';
import AvatarUpload from '../components/AvatarUpload';
import { BadgeGallery } from '../components/Badge';
import { EmptyRatings, EmptyLists, EmptyLikes } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { mockTracks, mockLists } from '../data/mockData';
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('overview');
    const [profileUser, setProfileUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const { user, isAuthenticated, isLoading, isGold, authFetch, refreshUser } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();
    const { username } = useParams();

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: Music },
        { id: 'ratings', label: 'Puanlamalar', icon: Star },
        { id: 'lists', label: 'Listeler', icon: ListMusic },
        { id: 'likes', label: 'Beğenilenler', icon: Heart },
    ];

    // Determine if viewing own profile or another user's
    const isOwnProfile = !username || (user && user.username === username);

    // Fetch profile data
    useEffect(() => {
        async function fetchProfile() {
            setProfileLoading(true);

            if (isOwnProfile) {
                // Own profile - use auth user
                if (user) {
                    setProfileUser(user);
                }
                setProfileLoading(false);
            } else {
                // Other user's profile - fetch from API
                try {
                    const response = await fetch(`${API_URL}/api/users/${username}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProfileUser(data.user);
                        setIsFollowing(data.user.is_following || false);
                    } else {
                        setProfileUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setProfileUser(null);
                }
                setProfileLoading(false);
            }
        }

        if (!isLoading) {
            fetchProfile();
        }
    }, [username, user, isLoading, isOwnProfile]);

    // Redirect to login only if trying to view own profile and not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated && isOwnProfile && !username) {
            navigate('/login', { state: { from: { pathname: '/profile' } } });
        }
    }, [isAuthenticated, isLoading, navigate, isOwnProfile, username]);

    // Handle follow/unfollow
    const handleFollowToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await authFetch(`/api/users/${profileUser.id}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST'
            });
            if (response.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    // Loading state
    if (isLoading || profileLoading) {
        return (
            <div className="profile-loading">
                <div className="loader-vinyl">
                    <div className="vinyl-disc spinning">
                        <div className="vinyl-label"></div>
                    </div>
                </div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Not found state for other users
    if (!isOwnProfile && !profileUser) {
        return (
            <div className="profile-not-auth">
                <Users size={64} />
                <h2>Kullanıcı Bulunamadı</h2>
                <p>Aradığınız kullanıcı mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/" className="btn btn-primary">
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    // Not authenticated view (only for own profile)
    if (isOwnProfile && (!isAuthenticated || !user)) {
        return (
            <div className="profile-not-auth">
                <LogIn size={64} />
                <h2>Giriş Yapmanız Gerekiyor</h2>
                <p>Profilinizi görüntülemek için lütfen giriş yapın.</p>
                <Link to="/login" className="btn btn-primary">
                    Giriş Yap
                </Link>
            </div>
        );
    }

    // Use profileUser for display
    const displayUser = profileUser || user;
    const displayIsGold = displayUser?.is_gold;

    // User stats (mock for now, will be fetched from API)
    const stats = {
        totalListened: profileUser?.ratings_count || 0,
        totalRatings: profileUser?.ratings_count || 0,
        avgRating: 0,
        totalLists: profileUser?.playlists_count || 0,
        followers: profileUser?.followers_count || 0,
        following: profileUser?.following_count || 0
    };

    // Mock favorite artists
    const favoriteArtists = [
        { id: 'a1', name: 'The Weeknd', image: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
        { id: 'a3', name: 'Taylor Swift', image: 'https://i.scdn.co/image/ab6761610000e5eb859e4c14fa59296c8649e0e4' },
        { id: 'a7', name: 'Dua Lipa', image: 'https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abee8d' }
    ];

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <header className="profile-header">
                <div className="profile-banner">
                    <div className="banner-gradient"></div>
                </div>

                <div className="profile-header-content container">
                    <motion.div
                        className="profile-avatar-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="profile-avatar">
                            <img
                                src={displayUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`}
                                alt={displayUser.display_name || displayUser.username}
                            />
                            {isOwnProfile && (
                                <button
                                    className="avatar-edit-btn"
                                    onClick={() => setShowAvatarUpload(true)}
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="profile-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">{displayUser.display_name || displayUser.username}</h1>
                                {displayIsGold && <GoldBadge size="lg" />}
                            </div>
                            <p className="profile-username">@{displayUser.username}</p>
                            {displayUser.bio && <p className="profile-bio">{displayUser.bio}</p>}

                            <div className="profile-meta">
                                <span className="meta-item">
                                    <Calendar size={14} />
                                    {displayUser.created_at && !isNaN(new Date(displayUser.created_at).getTime())
                                        ? `${new Date(displayUser.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}'den beri üye`
                                        : 'Üye'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="profile-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <button className="btn btn-secondary">
                            <Share2 size={16} />
                            Paylaş
                        </button>
                        {isOwnProfile ? (
                            <Link to="/settings" className="btn btn-primary">
                                <Settings size={18} />
                                Ayarlar
                            </Link>
                        ) : (
                            <button
                                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? (
                                    <><UserMinus size={16} /> Takipten Çık</>
                                ) : (
                                    <><UserPlus size={16} /> Takip Et</>
                                )}
                            </button>
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Stats Bar */}
            <section className="profile-stats-bar">
                <div className="container">
                    <motion.div
                        className="stats-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.totalListened}</span>
                            <span className="stat-label">Dinleme</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.totalRatings}</span>
                            <span className="stat-label">Puanlama</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.avgRating.toFixed(1)}</span>
                            <span className="stat-label">Ort. Puan</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.totalLists}</span>
                            <span className="stat-label">Liste</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.followers}</span>
                            <span className="stat-label">Takipçi</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-value gradient-text">{stats.following}</span>
                            <span className="stat-label">Takip</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="profile-main container">
                {/* Tabs */}
                <div className="profile-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="profile-content">
                    {activeTab === 'overview' && (
                        <div className="overview-content">
                            {/* Favorite Artists */}
                            <section className="content-section">
                                <h2 className="section-title">
                                    <Users size={20} />
                                    Favori Sanatçılar
                                </h2>
                                <div className="favorite-artists">
                                    {favoriteArtists.map((artist, index) => (
                                        <motion.div
                                            key={artist.id}
                                            className="artist-card glass-card"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <img src={artist.image} alt={artist.name} className="artist-image" />
                                            <span className="artist-name">{artist.name}</span>
                                            <span className="artist-rank">#{index + 1}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Badges/Achievements */}
                            <section className="content-section">
                                <h2 className="section-title">
                                    <Award size={20} />
                                    Rozetler
                                </h2>
                                <BadgeGallery
                                    earnedBadges={['first_rating', 'ten_ratings', 'first_like']}
                                    showLocked={true}
                                    maxDisplay={8}
                                />
                            </section>

                            {/* Recent Listens */}
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <Music size={20} />
                                        Son Dinlenenler
                                    </h2>
                                </div>
                                <div className="grid-songs">
                                    {mockTracks.slice(0, 4).map((track, index) => (
                                        <SongCard key={track.id} track={track} index={index} />
                                    ))}
                                </div>
                            </section>

                            {/* User's Lists */}
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <ListMusic size={20} />
                                        Listelerim
                                    </h2>
                                    <Link to="/lists" className="section-link">
                                        Tümünü Gör
                                    </Link>
                                </div>
                                <div className="lists-grid">
                                    {mockLists.slice(0, 3).map((list, index) => (
                                        <motion.article
                                            key={list.id}
                                            className="list-card glass-card glass-card-hover"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Link to={`/list/${list.id}`} className="list-link">
                                                <div className="list-covers">
                                                    {list.tracks.slice(0, 4).map((track, i) => (
                                                        <img
                                                            key={track.id}
                                                            src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                                            alt=""
                                                            className="list-cover"
                                                            style={{ zIndex: 4 - i }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="list-info">
                                                    <h3 className="list-name">{list.name}</h3>
                                                    <p className="list-description">{list.description}</p>
                                                    <div className="list-meta">
                                                        <span>{list.tracks.length} şarkı</span>
                                                        <span>•</span>
                                                        <span>{list.likes} beğeni</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.article>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'ratings' && (
                        <div className="ratings-content">
                            <div className="ratings-header">
                                <h2>Tüm Puanlamalar</h2>
                                {stats.totalRatings > 0 && (
                                    <select className="sort-select">
                                        <option value="recent">En Son</option>
                                        <option value="highest">En Yüksek</option>
                                        <option value="lowest">En Düşük</option>
                                    </select>
                                )}
                            </div>
                            {stats.totalRatings === 0 ? (
                                <EmptyRatings compact={!isOwnProfile} />
                            ) : (
                                <div className="ratings-list">
                                    {mockTracks.map((track, index) => {
                                        const rating = ((track.popularity || 75) / 20);
                                        return (
                                            <motion.article
                                                key={track.id}
                                                className="rating-item glass-card"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <Link to={`/song/${track.id}`} className="rating-track">
                                                    <img
                                                        src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                                        alt={track.name}
                                                        className="rating-cover"
                                                    />
                                                    <div className="rating-info">
                                                        <span className="rating-name">{track.name}</span>
                                                        <span className="rating-artist">
                                                            {track.artists?.map(a => a.name).join(', ')}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <VinylRating rating={rating} size="sm" />
                                            </motion.article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'lists' && (
                        <div className="lists-content">
                            <div className="lists-header">
                                <h2>{isOwnProfile ? 'Listelerim' : 'Listeler'}</h2>
                                {isOwnProfile && (
                                    <Link to="/lists" className="btn btn-primary">
                                        <ListMusic size={16} />
                                        Yeni Liste Oluştur
                                    </Link>
                                )}
                            </div>
                            {stats.totalLists === 0 ? (
                                <EmptyLists compact={!isOwnProfile} />
                            ) : (
                                <div className="lists-grid full-width">
                                    {mockLists.map((list, index) => (
                                        <motion.article
                                            key={list.id}
                                            className="list-card glass-card glass-card-hover"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Link to={`/list/${list.id}`} className="list-link">
                                                <div className="list-covers">
                                                    {list.tracks.slice(0, 4).map((track, i) => (
                                                        <img
                                                            key={track.id}
                                                            src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                                            alt=""
                                                            className="list-cover"
                                                            style={{ zIndex: 4 - i }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="list-info">
                                                    <h3 className="list-name">{list.name}</h3>
                                                    <p className="list-description">{list.description}</p>
                                                    <div className="list-meta">
                                                        <span>{list.tracks.length} şarkı</span>
                                                        <span>•</span>
                                                        <span>{list.likes} beğeni</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.article>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'likes' && (
                        <div className="likes-content">
                            <h2>Beğenilen Şarkılar</h2>
                            {mockTracks.length === 0 ? (
                                <EmptyLikes compact={!isOwnProfile} />
                            ) : (
                                <div className="grid-songs">
                                    {mockTracks.slice(0, 8).map((track, index) => (
                                        <SongCard key={track.id} track={track} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Avatar Upload Modal */}
            <AvatarUpload
                isOpen={showAvatarUpload}
                currentAvatar={displayUser?.avatar_url}
                onClose={() => setShowAvatarUpload(false)}
                onUpload={async (formData) => {
                    try {
                        // For now, we'll use a simple base64 approach
                        // In production, you'd upload to a file server
                        const response = await authFetch('/api/users/avatar', {
                            method: 'POST',
                            body: formData
                        });
                        if (response.ok) {
                            success('Profil fotoğrafı güncellendi!');
                            if (refreshUser) refreshUser();
                        } else {
                            showError('Fotoğraf yüklenemedi');
                        }
                    } catch (err) {
                        showError('Bir hata oluştu');
                    }
                }}
            />
        </div>
    );
}

