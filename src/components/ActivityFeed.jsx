import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ListMusic, Heart } from 'lucide-react';
import VinylRating from './VinylRating';
import { formatRelativeTime } from '../data/mockData';
import './ActivityFeed.css';

export default function ActivityFeed({ activities = [], limit = 5 }) {
    const displayActivities = activities.slice(0, limit);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'rating':
                return <Star size={16} />;
            case 'review':
                return <MessageSquare size={16} />;
            case 'list':
                return <ListMusic size={16} />;
            case 'like':
                return <Heart size={16} />;
            default:
                return <Star size={16} />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'rating':
                return (
                    <>
                        <span className="activity-highlight">{activity.track?.name}</span> şarkısını puanladı
                    </>
                );
            case 'review':
                return (
                    <>
                        <span className="activity-highlight">{activity.track?.name}</span> için yorum yazdı
                    </>
                );
            case 'list':
                return (
                    <>
                        <span className="activity-highlight">{activity.listName}</span> listesini oluşturdu
                    </>
                );
            case 'like':
                return (
                    <>
                        <span className="activity-highlight">{activity.track?.name}</span> şarkısını beğendi
                    </>
                );
            default:
                return 'bir aktivite gerçekleştirdi';
        }
    };

    return (
        <div className="activity-feed">
            {displayActivities.map((activity, index) => (
                <motion.article
                    key={activity.id}
                    className="activity-item glass-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    {/* User Avatar */}
                    <Link to={`/user/${activity.user?.name}`} className="activity-avatar">
                        <img
                            src={activity.user?.avatar}
                            alt={activity.user?.name}
                            loading="lazy"
                        />
                    </Link>

                    {/* Activity Content */}
                    <div className="activity-content">
                        <div className="activity-header">
                            <Link to={`/user/${activity.user?.name}`} className="activity-username">
                                {activity.user?.name}
                            </Link>
                            <span className="activity-icon" data-type={activity.type}>
                                {getActivityIcon(activity.type)}
                            </span>
                        </div>

                        <p className="activity-text">
                            {getActivityText(activity)}
                        </p>

                        {/* Rating Display */}
                        {activity.rating && (
                            <div className="activity-rating">
                                <VinylRating rating={activity.rating} size="sm" />
                            </div>
                        )}

                        {/* Review Snippet */}
                        {activity.review && (
                            <p className="activity-review">
                                "{activity.review.length > 100
                                    ? activity.review.substring(0, 100) + '...'
                                    : activity.review}"
                            </p>
                        )}

                        {/* List Info */}
                        {activity.type === 'list' && activity.tracksCount && (
                            <span className="activity-list-count">
                                {activity.tracksCount} şarkı
                            </span>
                        )}

                        <span className="activity-time">
                            {formatRelativeTime(activity.timestamp)}
                        </span>
                    </div>

                    {/* Album Cover (if track) */}
                    {activity.track && (
                        <Link
                            to={`/song/${activity.track.id}`}
                            className="activity-track-cover"
                        >
                            <img
                                src={activity.track.album?.images?.[0]?.url || '/vinyl.svg'}
                                alt={activity.track.name}
                                loading="lazy"
                            />
                        </Link>
                    )}
                </motion.article>
            ))}

            {activities.length > limit && (
                <Link to="/community" className="activity-see-more">
                    Tüm aktiviteleri gör →
                </Link>
            )}
        </div>
    );
}
