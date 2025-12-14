import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, Plus, Share2, Play, Clock, Calendar,
    Disc, Users, ExternalLink, ChevronRight
} from 'lucide-react';
import VinylRating from '../components/VinylRating';
import SongCard from '../components/SongCard';
import ShareButton, { QuickShareButtons } from '../components/ShareButton';
import { mockTracks, formatDuration, formatDate } from '../data/mockData';
import { getTrack, getRecommendations, isSpotifyConfigured } from '../services/spotify';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import AddToListModal from '../components/modals/AddToListModal';
import WriteReviewModal from '../components/modals/WriteReviewModal';
import './SongDetail.css';

export default function SongDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [track, setTrack] = useState(null);
    const [similarTracks, setSimilarTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    const { isLiked, toggleLike, getRating, setRating } = useUser();
    const { isAuthenticated } = useAuth();
    const { openModal } = useModal();

    const userRating = getRating(id);
    const liked = isLiked(id);

    // Mock reviews
    const mockReviews = [
        {
            id: 'r1',
            user: { name: 'musiclover99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover99' },
            rating: 5,
            text: 'Bu şarkı tam anlamıyla bir başyapıt! Prodüksiyon kalitesi, vokal performansı ve sözler mükemmel bir uyum içinde.',
            date: '2024-01-15',
            likes: 42
        },
        {
            id: 'r2',
            user: { name: 'vinylhead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinylhead' },
            rating: 4,
            text: 'Çok beğendim ama birkaç yerde daha iyi olabilirdi. Yine de playlistimden çıkmıyor!',
            date: '2024-01-10',
            likes: 18
        },
        {
            id: 'r3',
            user: { name: 'beatmaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster' },
            rating: 4.5,
            text: 'Melodisi akılda kalıcı, ritmi enerji dolu. Gece geç saatlerde dinlemek için mükemmel.',
            date: '2024-01-05',
            likes: 25
        }
    ];

    useEffect(() => {
        async function fetchTrack() {
            setIsLoading(true);

            if (isSpotifyConfigured()) {
                try {
                    const trackData = await getTrack(id);
                    if (trackData) {
                        setTrack(trackData);

                        const recommendations = await getRecommendations({
                            seedTracks: [id],
                            limit: 6
                        });
                        if (recommendations?.tracks) {
                            setSimilarTracks(recommendations.tracks);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching track:', error);
                }
            }

            // Fallback to mock data
            if (!track) {
                const mockTrack = mockTracks.find(t => t.id === id) || mockTracks[0];
                setTrack(mockTrack);
                setSimilarTracks(mockTracks.filter(t => t.id !== id).slice(0, 6));
            }

            setReviews(mockReviews);
            setIsLoading(false);
        }

        fetchTrack();
    }, [id]);

    const handleAddToList = () => {
        if (!track) return;
        openModal(AddToListModal, { track });
    };

    const handleWriteReview = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/song/${id}` } } });
            return;
        }
        if (!track) return;
        openModal(WriteReviewModal, {
            track,
            onSuccess: (newReview) => {
                setReviews(prev => [newReview, ...prev]);
            }
        });
    };

    const handleRatingChange = (newRating) => {
        setRating(id, newRating);
    };

    const handleLike = () => {
        toggleLike(id);
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: track?.name,
                text: `${track?.name} - ${track?.artists?.map(a => a.name).join(', ')}`,
                url: window.location.href
            });
        } catch (error) {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    const handlePlay = () => {
        if (track?.preview_url) {
            const audio = new Audio(track.preview_url);
            audio.play();
        } else if (track?.external_urls?.spotify) {
            window.open(track.external_urls.spotify, '_blank');
        }
    };

    if (isLoading || !track) {
        return (
            <div className="song-detail-loading">
                <div className="loading-vinyl vinyl-spin">
                    <Disc size={64} />
                </div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    const albumImage = track.album?.images?.[0]?.url || '/vinyl.svg';
    const artistNames = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
    const albumName = track.album?.name || 'Unknown Album';
    const releaseDate = track.album?.release_date || '2024';
    const duration = track.duration_ms ? formatDuration(track.duration_ms) : '0:00';
    const averageRating = userRating || ((track.popularity || 75) / 20);

    const ratingDistribution = [
        { stars: 5, percentage: 45 },
        { stars: 4, percentage: 30 },
        { stars: 3, percentage: 15 },
        { stars: 2, percentage: 7 },
        { stars: 1, percentage: 3 },
    ];

    return (
        <div className="song-detail-page">
            {/* Hero Section */}
            <section className="song-hero">
                <div
                    className="song-hero-bg"
                    style={{ backgroundImage: `url(${albumImage})` }}
                />
                <div className="song-hero-overlay" />

                <div className="song-hero-content container">
                    <motion.div
                        className="song-cover-wrapper"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <img
                            src={albumImage}
                            alt={track.name}
                            className="song-cover"
                        />
                        <button className="song-play-btn" onClick={handlePlay}>
                            <Play size={32} fill="currentColor" />
                        </button>
                    </motion.div>

                    <motion.div
                        className="song-info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="song-type badge badge-primary">ŞARKI</span>
                        <h1 className="song-title">{track.name}</h1>

                        <div className="song-meta">
                            <Link to={`/artist/${track.artists?.[0]?.id}`} className="song-artist">
                                {artistNames}
                            </Link>
                            <span className="meta-divider">•</span>
                            <Link to={`/album/${track.album?.id}`} className="song-album">
                                {albumName}
                            </Link>
                            <span className="meta-divider">•</span>
                            <span className="song-year">{releaseDate.split('-')[0]}</span>
                            <span className="meta-divider">•</span>
                            <span className="song-duration">
                                <Clock size={14} />
                                {duration}
                            </span>
                        </div>

                        {/* Rating Display */}
                        <div className="song-rating-display">
                            <VinylRating rating={parseFloat(averageRating)} size="lg" showValue />
                            <span className="rating-count">1.2K puanlama</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="song-actions">
                            <div className="user-rating-section">
                                <span className="rating-label">Puanla:</span>
                                <VinylRating
                                    rating={userRating || 0}
                                    size="md"
                                    interactive
                                    onChange={handleRatingChange}
                                />
                            </div>

                            <div className="action-buttons">
                                <motion.button
                                    className={`action-btn-large ${liked ? 'liked' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLike}
                                >
                                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                                    Beğen
                                </motion.button>

                                <motion.button
                                    className="action-btn-large"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddToList}
                                >
                                    <Plus size={20} />
                                    Listeye Ekle
                                </motion.button>

                                <ShareButton track={track} size="lg" />

                                {track.external_urls?.spotify && (
                                    <motion.a
                                        href={track.external_urls.spotify}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-btn-large spotify-btn"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ExternalLink size={20} />
                                        Spotify
                                    </motion.a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="song-main container">
                <div className="song-content-grid">
                    {/* Reviews Section */}
                    <section className="song-reviews">
                        <div className="section-header">
                            <h2 className="section-title">
                                <Users className="section-icon" />
                                Yorumlar
                            </h2>
                            <button className="btn btn-primary" onClick={handleWriteReview}>
                                Yorum Yaz
                            </button>
                        </div>

                        <div className="reviews-list">
                            {reviews.map((review, index) => (
                                <motion.article
                                    key={review.id}
                                    className="review-card glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className="review-header">
                                        <Link to={`/user/${review.user.name}`} className="review-user">
                                            <img src={review.user.avatar} alt={review.user.name} />
                                            <span>{review.user.name}</span>
                                        </Link>
                                        <VinylRating rating={review.rating} size="sm" />
                                    </div>
                                    <p className="review-text">{review.text}</p>
                                    <div className="review-footer">
                                        <span className="review-date">
                                            <Calendar size={14} />
                                            {formatDate(review.date)}
                                        </span>
                                        <button className="review-like">
                                            <Heart size={14} />
                                            {review.likes}
                                        </button>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="song-sidebar">
                        <div className="stats-card glass-card">
                            <h3 className="stats-title">İstatistikler</h3>

                            <div className="rating-distribution">
                                {ratingDistribution.map((item) => (
                                    <div key={item.stars} className="distribution-row">
                                        <span className="distribution-stars">{item.stars}★</span>
                                        <div className="distribution-bar">
                                            <div
                                                className="distribution-fill"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="distribution-percent">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>

                            <div className="stats-numbers">
                                <div className="stat-number">
                                    <span className="stat-value">1.2K</span>
                                    <span className="stat-label">Puanlama</span>
                                </div>
                                <div className="stat-number">
                                    <span className="stat-value">{reviews.length}</span>
                                    <span className="stat-label">Yorum</span>
                                </div>
                                <div className="stat-number">
                                    <span className="stat-value">5.6K</span>
                                    <span className="stat-label">Dinleme</span>
                                </div>
                            </div>
                        </div>

                        <div className="listeners-card glass-card">
                            <h3 className="listeners-title">Dinleyenler Ayrıca Beğendi</h3>
                            <div className="listeners-list">
                                {similarTracks.slice(0, 4).map((t) => (
                                    <Link
                                        key={t.id}
                                        to={`/song/${t.id}`}
                                        className="listener-item"
                                    >
                                        <img
                                            src={t.album?.images?.[0]?.url || '/vinyl.svg'}
                                            alt={t.name}
                                        />
                                        <div className="listener-info">
                                            <span className="listener-name">{t.name}</span>
                                            <span className="listener-artist">
                                                {t.artists?.map(a => a.name).join(', ')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Similar Tracks */}
                <section className="similar-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Disc className="section-icon" />
                            Benzer Şarkılar
                        </h2>
                        <Link to="/discover" className="section-link">
                            Daha Fazla <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid-songs">
                        {similarTracks.map((t, index) => (
                            <SongCard key={t.id} track={t} index={index} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
