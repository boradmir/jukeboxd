import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Sparkles, ChevronRight, Disc, Crown } from 'lucide-react';
import SongCard from '../components/SongCard';
import ActivityFeed from '../components/ActivityFeed';
import { mockTracks, mockNewReleases, mockActivities } from '../data/mockData';
import { isSpotifyConfigured, getNewReleases, searchSpotify } from '../services/spotify';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export default function Home() {
    const [trendingTracks, setTrendingTracks] = useState(mockTracks.slice(0, 6));
    const [popularTracks, setPopularTracks] = useState(mockTracks.slice(0, 10));
    const [newReleases, setNewReleases] = useState(mockNewReleases);
    const [activities] = useState(mockActivities);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, isGold } = useAuth();

    useEffect(() => {
        async function fetchData() {
            if (isSpotifyConfigured()) {
                try {
                    // Fetch trending/popular tracks
                    const searchResult = await searchSpotify('year:2024', 'track', 12);
                    if (searchResult?.tracks?.items) {
                        setTrendingTracks(searchResult.tracks.items.slice(0, 6));
                        setPopularTracks(searchResult.tracks.items);
                    }

                    // Fetch new releases
                    const releases = await getNewReleases(8);
                    if (releases?.albums?.items) {
                        setNewReleases(releases.albums.items);
                    }
                } catch (error) {
                    console.error('Error fetching Spotify data:', error);
                }
            }
            setIsLoading(false);
        }

        fetchData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-vinyl vinyl-1"></div>
                    <div className="hero-vinyl vinyl-2"></div>
                    <div className="hero-vinyl vinyl-3"></div>
                </div>

                <div className="hero-content container">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="hero-title">
                            Müziğini <span className="gradient-text">Keşfet</span>,<br />
                            Puanla ve Paylaş
                        </h1>
                        <p className="hero-subtitle">
                            Dinlediğin şarkıları takip et, favori parçalarını puanla ve müzik zevkini dünyayla paylaş.
                        </p>
                        <div className="hero-actions">
                            <Link to="/discover" className="btn btn-primary btn-lg">
                                <Sparkles size={18} />
                                Keşfetmeye Başla
                            </Link>
                            {!isAuthenticated ? (
                                <Link to="/register" className="btn btn-secondary btn-lg">
                                    Ücretsiz Üye Ol
                                </Link>
                            ) : !isGold ? (
                                <Link to="/gold" className="btn btn-gold btn-lg">
                                    <Crown size={18} />
                                    Gold'a Yükselt
                                </Link>
                            ) : null}
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="stat-item">
                            <span className="stat-value">50K+</span>
                            <span className="stat-label">Şarkı Puanlama</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">12K+</span>
                            <span className="stat-label">Aktif Üye</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">3K+</span>
                            <span className="stat-label">Playlist</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="home-main container">
                {/* Trending Section */}
                <section className="home-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <TrendingUp className="section-icon" />
                            Trending Şarkılar
                        </h2>
                        <Link to="/discover?sort=trending" className="section-link">
                            Tümünü Gör <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid-songs">
                        {trendingTracks.map((track, index) => (
                            <SongCard key={track.id} track={track} index={index} />
                        ))}
                    </div>
                </section>

                {/* Two Column Layout */}
                <div className="home-columns">
                    {/* Popular This Week */}
                    <section className="home-section home-popular">
                        <div className="section-header">
                            <h2 className="section-title">
                                <Disc className="section-icon" />
                                Bu Hafta Popüler
                            </h2>
                        </div>

                        <div className="popular-list glass-card">
                            {popularTracks.slice(0, 5).map((track, index) => (
                                <Link
                                    key={track.id}
                                    to={`/song/${track.id}`}
                                    className="popular-item"
                                >
                                    <span className="popular-rank">{index + 1}</span>
                                    <img
                                        src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                        alt={track.name}
                                        className="popular-cover"
                                    />
                                    <div className="popular-info">
                                        <span className="popular-name">{track.name}</span>
                                        <span className="popular-artist">
                                            {track.artists?.map(a => a.name).join(', ')}
                                        </span>
                                    </div>
                                    <span className="popular-rating">
                                        {((track.popularity || 75) / 20).toFixed(1)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Activity Feed */}
                    <section className="home-section home-activity">
                        <div className="section-header">
                            <h2 className="section-title">
                                <Users className="section-icon" />
                                Arkadaş Aktivitesi
                            </h2>
                            <Link to="/community" className="section-link">
                                Tümü <ChevronRight size={16} />
                            </Link>
                        </div>

                        <ActivityFeed activities={activities} limit={4} />
                    </section>
                </div>

                {/* New Releases */}
                <section className="home-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Clock className="section-icon" />
                            Yeni Çıkanlar
                        </h2>
                        <Link to="/discover?sort=new" className="section-link">
                            Tümünü Gör <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="new-releases-grid">
                        {newReleases.slice(0, 4).map((album, index) => (
                            <motion.article
                                key={album.id}
                                className="new-release-card glass-card glass-card-hover"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link to={`/album/${album.id}`} className="new-release-link">
                                    <img
                                        src={album.images?.[0]?.url || '/vinyl.svg'}
                                        alt={album.name}
                                        className="new-release-cover"
                                    />
                                    <div className="new-release-info">
                                        <h3 className="new-release-name">{album.name}</h3>
                                        <p className="new-release-artist">
                                            {album.artists?.map(a => a.name).join(', ')}
                                        </p>
                                        <span className="new-release-date">
                                            {new Date(album.release_date).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
