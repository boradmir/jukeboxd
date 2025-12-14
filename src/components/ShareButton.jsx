import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2, Twitter, Facebook, Link2, Check,
    ExternalLink, Music, Copy
} from 'lucide-react';
import './ShareButton.css';

// Spotify icon component
const SpotifyIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

export default function ShareButton({
    track,
    className = '',
    showLabel = true,
    size = 'md' // sm, md, lg
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!track) return null;

    const trackUrl = `${window.location.origin}/song/${track.id}`;
    const shareText = `${track.name} - ${track.artists?.map(a => a.name).join(', ')} 🎵 @Jukeboxd`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(trackUrl);

    // Spotify deep link
    const spotifyUrl = track.external_urls?.spotify ||
        `https://open.spotify.com/track/${track.id}`;

    const shareOptions = [
        {
            id: 'spotify',
            label: "Spotify'da Aç",
            icon: SpotifyIcon,
            color: '#1DB954',
            onClick: () => window.open(spotifyUrl, '_blank')
        },
        {
            id: 'twitter',
            label: 'Twitter/X',
            icon: Twitter,
            color: '#1DA1F2',
            onClick: () => window.open(
                `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
                '_blank',
                'width=550,height=420'
            )
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: Facebook,
            color: '#1877F2',
            onClick: () => window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
                '_blank',
                'width=550,height=420'
            )
        },
        {
            id: 'copy',
            label: copied ? 'Kopyalandı!' : 'Linki Kopyala',
            icon: copied ? Check : Link2,
            color: copied ? '#10B981' : '#9CA3AF',
            onClick: async () => {
                try {
                    await navigator.clipboard.writeText(trackUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Copy failed:', err);
                }
            }
        }
    ];

    return (
        <div className={`share-button-container ${className}`}>
            <button
                className={`share-trigger share-trigger-${size}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Paylaş"
                aria-expanded={isOpen}
            >
                <Share2 size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
                {showLabel && <span>Paylaş</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="share-backdrop"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            className="share-menu"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="share-header">
                                <img
                                    src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                    alt=""
                                    className="share-cover"
                                />
                                <div className="share-track-info">
                                    <span className="share-track-name">{track.name}</span>
                                    <span className="share-track-artist">
                                        {track.artists?.map(a => a.name).join(', ')}
                                    </span>
                                </div>
                            </div>

                            <div className="share-options">
                                {shareOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        className="share-option"
                                        onClick={() => {
                                            option.onClick();
                                            if (option.id !== 'copy') {
                                                setIsOpen(false);
                                            }
                                        }}
                                        style={{ '--option-color': option.color }}
                                    >
                                        <span className="share-option-icon">
                                            <option.icon size={20} />
                                        </span>
                                        <span className="share-option-label">{option.label}</span>
                                        {option.id === 'spotify' && (
                                            <ExternalLink size={14} className="share-external" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Quick share buttons for inline use
export function QuickShareButtons({ track, className = '' }) {
    const spotifyUrl = track?.external_urls?.spotify ||
        `https://open.spotify.com/track/${track?.id}`;

    if (!track) return null;

    return (
        <div className={`quick-share-buttons ${className}`}>
            <button
                className="quick-share-btn spotify"
                onClick={() => window.open(spotifyUrl, '_blank')}
                title="Spotify'da Aç"
            >
                <SpotifyIcon size={18} />
            </button>
            <button
                className="quick-share-btn twitter"
                onClick={() => {
                    const text = encodeURIComponent(
                        `${track.name} - ${track.artists?.map(a => a.name).join(', ')} 🎵`
                    );
                    const url = encodeURIComponent(`${window.location.origin}/song/${track.id}`);
                    window.open(
                        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                        '_blank'
                    );
                }}
                title="Twitter'da Paylaş"
            >
                <Twitter size={18} />
            </button>
        </div>
    );
}
