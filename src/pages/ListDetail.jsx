import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, Play, Share2, Edit, Trash2,
    Clock, User, Calendar, Plus, MoreHorizontal
} from 'lucide-react';
import { mockLists, mockTracks, formatDuration, formatDate } from '../data/mockData';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import VinylRating from '../components/VinylRating';
import './ListDetail.css';

export default function ListDetail() {
    const { id } = useParams();
    const [list, setList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isAuthenticated, user } = useAuth();
    const { isLiked, toggleLike, getRating } = useUser();

    useEffect(() => {
        // Simulate fetch
        setIsLoading(true);

        const foundList = mockLists.find(l => l.id === id) || {
            id,
            name: 'Harika Liste',
            description: 'En sevdiğim şarkılardan oluşan özel bir koleksiyon',
            user: { name: 'musiclover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover' },
            tracks: mockTracks.slice(0, 8),
            likes: 234,
            createdAt: '2024-01-15',
            isPublic: true
        };

        setList(foundList);
        setIsLoading(false);
    }, [id]);

    const handleShare = async () => {
        try {
            await navigator.share({
                title: list?.name,
                text: list?.description,
                url: window.location.href
            });
        } catch (error) {
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    if (isLoading || !list) {
        return (
            <div className="list-detail-loading">
                <div className="loader-vinyl">
                    <div className="vinyl-disc spinning">
                        <div className="vinyl-label"></div>
                    </div>
                </div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    const totalDuration = list.tracks.reduce((acc, t) => acc + (t.duration_ms || 0), 0);
    const isOwner = isAuthenticated && user?.username === list.user.name;

    return (
        <div className="list-detail-page">
            {/* Hero */}
            <header className="list-hero">
                <div className="list-hero-bg">
                    {list.tracks.slice(0, 4).map((track, i) => (
                        <div
                            key={track.id}
                            className="hero-bg-image"
                            style={{ backgroundImage: `url(${track.album?.images?.[0]?.url || '/vinyl.svg'})` }}
                        />
                    ))}
                </div>
                <div className="list-hero-overlay" />

                <div className="list-hero-content container">
                    {/* Cover Mosaic */}
                    <motion.div
                        className="list-cover-mosaic"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {list.tracks.slice(0, 4).map((track, i) => (
                            <img
                                key={track.id}
                                src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                alt=""
                                className="mosaic-img"
                            />
                        ))}
                    </motion.div>

                    {/* List Info */}
                    <motion.div
                        className="list-info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="list-type badge badge-primary">LİSTE</span>
                        <h1 className="list-title">{list.name}</h1>
                        <p className="list-description">{list.description}</p>

                        <div className="list-meta">
                            <Link to={`/user/${list.user.name}`} className="list-creator">
                                <img src={list.user.avatar} alt={list.user.name} />
                                <span>{list.user.name}</span>
                            </Link>
                            <span className="meta-divider">•</span>
                            <span>{list.tracks.length} şarkı</span>
                            <span className="meta-divider">•</span>
                            <span>{formatDuration(totalDuration)}</span>
                            <span className="meta-divider">•</span>
                            <span>
                                <Heart size={14} />
                                {list.likes}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="list-actions">
                            <motion.button
                                className="btn btn-primary btn-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Play size={20} fill="currentColor" />
                                Çal
                            </motion.button>

                            <motion.button
                                className="action-btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Heart size={20} />
                                Beğen
                            </motion.button>

                            <motion.button
                                className="action-btn-large"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                            >
                                <Share2 size={20} />
                                Paylaş
                            </motion.button>

                            {isOwner && (
                                <>
                                    <motion.button
                                        className="action-btn-large"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit size={20} />
                                        Düzenle
                                    </motion.button>

                                    <motion.button
                                        className="action-btn-large danger"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Trash2 size={20} />
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Tracks */}
            <main className="list-main container">
                <div className="tracks-table">
                    <div className="tracks-header">
                        <span className="track-num">#</span>
                        <span className="track-title-col">TİTLE</span>
                        <span className="track-album-col">ALBÜM</span>
                        <span className="track-rating-col">PUAN</span>
                        <span className="track-duration-col">
                            <Clock size={16} />
                        </span>
                        <span className="track-actions-col"></span>
                    </div>

                    {list.tracks.map((track, index) => {
                        const rating = getRating(track.id) || ((track.popularity || 75) / 20);
                        const liked = isLiked(track.id);

                        return (
                            <motion.div
                                key={track.id}
                                className="track-row"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                            >
                                <span className="track-num">{index + 1}</span>

                                <div className="track-title-col">
                                    <img
                                        src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                        alt={track.name}
                                        className="track-cover"
                                    />
                                    <div className="track-info">
                                        <Link to={`/song/${track.id}`} className="track-name">
                                            {track.name}
                                        </Link>
                                        <span className="track-artist">
                                            {track.artists?.map(a => a.name).join(', ')}
                                        </span>
                                    </div>
                                </div>

                                <span className="track-album-col">
                                    <Link to={`/album/${track.album?.id}`}>
                                        {track.album?.name}
                                    </Link>
                                </span>

                                <span className="track-rating-col">
                                    <VinylRating rating={rating} size="xs" />
                                </span>

                                <span className="track-duration-col">
                                    {formatDuration(track.duration_ms)}
                                </span>

                                <div className="track-actions-col">
                                    <button
                                        className={`track-action ${liked ? 'liked' : ''}`}
                                        onClick={() => toggleLike(track.id)}
                                    >
                                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                                    </button>
                                    <button className="track-action">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
