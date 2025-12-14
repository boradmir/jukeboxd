import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, Play, MoreHorizontal } from 'lucide-react';
import VinylRating from './VinylRating';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import AddToListModal from './modals/AddToListModal';
import { formatDuration } from '../data/mockData';
import './SongCard.css';

export default function SongCard({ track, showRating = true, showActions = true, index = 0 }) {
    const [isHovered, setIsHovered] = useState(false);
    const { isLiked, toggleLike, getRating } = useUser();
    const { isAuthenticated } = useAuth();
    const { openModal } = useModal();

    const albumImage = track.album?.images?.[0]?.url || '/vinyl.svg';
    const artistNames = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
    const duration = track.duration_ms ? formatDuration(track.duration_ms) : '';

    // Get user's rating or fallback to mock
    const userRating = getRating(track.id);
    const displayRating = userRating || ((track.popularity || 75) / 20);
    const liked = isLiked(track.id);

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(track.id);
    };

    const handleAddToList = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(AddToListModal, { track });
    };

    const handlePlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // If track has preview_url, play it
        if (track.preview_url) {
            const audio = new Audio(track.preview_url);
            audio.play();
        }
    };

    return (
        <motion.article
            className="song-card glass-card glass-card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/song/${track.id}`} className="song-card-link">
                {/* Album Cover */}
                <div className="song-card-cover">
                    <img
                        src={albumImage}
                        alt={`${track.name} album cover`}
                        className="song-card-image"
                        loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <motion.div
                        className="song-card-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.button
                            className="play-button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePlay}
                        >
                            <Play size={24} fill="currentColor" />
                        </motion.button>

                        {/* Sound Wave Animation */}
                        <div className="sound-wave">
                            <span className="sound-wave-bar"></span>
                            <span className="sound-wave-bar"></span>
                            <span className="sound-wave-bar"></span>
                            <span className="sound-wave-bar"></span>
                            <span className="sound-wave-bar"></span>
                        </div>
                    </motion.div>

                    {/* Duration Badge */}
                    {duration && (
                        <span className="song-card-duration">{duration}</span>
                    )}
                </div>

                {/* Song Info */}
                <div className="song-card-info">
                    <h3 className="song-card-title" title={track.name}>
                        {track.name}
                    </h3>
                    <p className="song-card-artist" title={artistNames}>
                        {artistNames}
                    </p>

                    {showRating && (
                        <div className="song-card-rating">
                            <VinylRating rating={parseFloat(displayRating)} size="sm" />
                            <span className="rating-text">{displayRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Quick Actions */}
            {showActions && (
                <div className="song-card-actions">
                    <motion.button
                        className={`action-btn ${liked ? 'liked' : ''}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
                    >
                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    </motion.button>

                    <motion.button
                        className="action-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleAddToList}
                        aria-label="Listeye ekle"
                    >
                        <Plus size={16} />
                    </motion.button>

                    <motion.button
                        className="action-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Daha fazla"
                    >
                        <MoreHorizontal size={16} />
                    </motion.button>
                </div>
            )}
        </motion.article>
    );
}
