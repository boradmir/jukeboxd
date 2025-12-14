import { motion } from 'framer-motion';
import { Lock, Star, Music, MessageSquare, ListMusic, Users, Flame, Crown, Heart, Award } from 'lucide-react';
import './Badge.css';

// Badge definitions
export const BADGES = {
    first_rating: {
        id: 'first_rating',
        name: 'İlk Adım',
        description: 'İlk şarkını puanladın!',
        icon: Star,
        emoji: '🌟',
        color: '#FFD700',
        requirement: 'İlk puanlama'
    },
    ten_ratings: {
        id: 'ten_ratings',
        name: 'Müzik Tadımcısı',
        description: '10 şarkı puanladın!',
        icon: Music,
        emoji: '🎵',
        color: '#00D4FF',
        requirement: '10 şarkı puanla'
    },
    fifty_ratings: {
        id: 'fifty_ratings',
        name: 'Kritik',
        description: '50 şarkı puanladın!',
        icon: Award,
        emoji: '🏆',
        color: '#FF6B9D',
        requirement: '50 şarkı puanla'
    },
    first_review: {
        id: 'first_review',
        name: 'Kalem Ustası',
        description: 'İlk incelemeni yazdın!',
        icon: MessageSquare,
        emoji: '📝',
        color: '#10B981',
        requirement: 'İlk inceleme'
    },
    first_list: {
        id: 'first_list',
        name: 'Liste Yapıcı',
        description: 'İlk listeni oluşturdun!',
        icon: ListMusic,
        emoji: '📋',
        color: '#8B5CF6',
        requirement: 'İlk liste'
    },
    ten_followers: {
        id: 'ten_followers',
        name: 'Yükselen Yıldız',
        description: '10 takipçiye ulaştın!',
        icon: Users,
        emoji: '👥',
        color: '#F59E0B',
        requirement: '10 takipçi'
    },
    fifty_followers: {
        id: 'fifty_followers',
        name: 'Etkileyici',
        description: '50 takipçiye ulaştın!',
        icon: Users,
        emoji: '⭐',
        color: '#EC4899',
        requirement: '50 takipçi'
    },
    week_streak: {
        id: 'week_streak',
        name: 'Kararlı',
        description: '7 gün üst üste aktiftin!',
        icon: Flame,
        emoji: '🔥',
        color: '#EF4444',
        requirement: '7 gün streak'
    },
    month_streak: {
        id: 'month_streak',
        name: 'Tutkulu',
        description: '30 gün üst üste aktiftin!',
        icon: Flame,
        emoji: '💎',
        color: '#06B6D4',
        requirement: '30 gün streak'
    },
    gold_member: {
        id: 'gold_member',
        name: 'Gold Üye',
        description: 'Gold üyeliğe katıldın!',
        icon: Crown,
        emoji: '👑',
        color: '#F59E0B',
        requirement: 'Gold üyelik'
    },
    first_like: {
        id: 'first_like',
        name: 'Beğenici',
        description: 'İlk beğenini yaptın!',
        icon: Heart,
        emoji: '❤️',
        color: '#EF4444',
        requirement: 'İlk beğeni'
    },
    referral_master: {
        id: 'referral_master',
        name: 'Davetçi',
        description: '5 arkadaş davet ettin!',
        icon: Users,
        emoji: '🎉',
        color: '#8B5CF6',
        requirement: '5 arkadaş davet et'
    }
};

// Single Badge component
export function Badge({
    badge,
    earned = false,
    earnedAt = null,
    size = 'md', // sm, md, lg
    showTooltip = true,
    onClick
}) {
    const badgeData = typeof badge === 'string' ? BADGES[badge] : badge;

    if (!badgeData) return null;

    const Icon = badgeData.icon;
    const sizeClasses = {
        sm: 'badge-sm',
        md: 'badge-md',
        lg: 'badge-lg'
    };

    return (
        <motion.div
            className={`badge ${sizeClasses[size]} ${earned ? 'badge-earned' : 'badge-locked'}`}
            style={{ '--badge-color': badgeData.color }}
            whileHover={showTooltip ? { scale: 1.1 } : {}}
            onClick={onClick}
            title={showTooltip ? `${badgeData.name}: ${badgeData.description}` : undefined}
        >
            <div className="badge-icon">
                {earned ? (
                    <span className="badge-emoji">{badgeData.emoji}</span>
                ) : (
                    <Lock size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />
                )}
            </div>
            {size !== 'sm' && (
                <div className="badge-info">
                    <span className="badge-name">{badgeData.name}</span>
                    {size === 'lg' && (
                        <span className="badge-desc">{badgeData.description}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}

// Badge Gallery for profile
export function BadgeGallery({
    earnedBadges = [],
    showLocked = true,
    maxDisplay = 12
}) {
    const allBadgeIds = Object.keys(BADGES);
    const earnedSet = new Set(earnedBadges.map(b => b.badge_id || b));

    const displayBadges = showLocked
        ? allBadgeIds.slice(0, maxDisplay)
        : earnedBadges.slice(0, maxDisplay);

    if (displayBadges.length === 0) {
        return (
            <div className="badge-gallery-empty">
                <Award size={32} />
                <p>Henüz rozet kazanılmadı</p>
            </div>
        );
    }

    return (
        <div className="badge-gallery">
            {displayBadges.map((badgeId, index) => {
                const id = typeof badgeId === 'string' ? badgeId : badgeId.badge_id;
                const earned = earnedSet.has(id);
                const earnedData = earnedBadges.find(b => (b.badge_id || b) === id);

                return (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Badge
                            badge={id}
                            earned={earned}
                            earnedAt={earnedData?.earned_at}
                            size="md"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}

// Badge notification popup
export function BadgeNotification({ badge, onClose }) {
    const badgeData = typeof badge === 'string' ? BADGES[badge] : badge;

    if (!badgeData) return null;

    return (
        <motion.div
            className="badge-notification"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{ '--badge-color': badgeData.color }}
        >
            <div className="badge-notif-glow" />
            <div className="badge-notif-content">
                <span className="badge-notif-label">Yeni Rozet Kazandın!</span>
                <span className="badge-notif-emoji">{badgeData.emoji}</span>
                <span className="badge-notif-name">{badgeData.name}</span>
                <span className="badge-notif-desc">{badgeData.description}</span>
                <button className="badge-notif-close" onClick={onClose}>
                    Harika!
                </button>
            </div>
        </motion.div>
    );
}

export default Badge;
