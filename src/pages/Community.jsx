import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import ActivityFeed from '../components/ActivityFeed';
import { mockActivities, mockTracks } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import './Community.css';

export default function Community() {
    const { isAuthenticated, authFetch } = useAuth();
    const [activities, setActivities] = useState(mockActivities);
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchActivities() {
            setIsLoading(true);
            try {
                let endpoint = '/api/activities?limit=30';
                if (activeTab === 'following' && isAuthenticated) {
                    endpoint += '&following_only=true';
                } else if (activeTab !== 'all') {
                    endpoint += `&type=${activeTab}`;
                }

                const response = await authFetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    if (data.activities?.length > 0) {
                        setActivities(data.activities);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch activities:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isAuthenticated) {
            fetchActivities();
        }
    }, [activeTab, isAuthenticated, authFetch]);

    const tabs = [
        { id: 'all', label: 'Tümü', icon: Clock },
        { id: 'following', label: 'Takip Ettiklerim', icon: Users, requiresAuth: true },
        { id: 'rating', label: 'Puanlamalar', icon: TrendingUp },
        { id: 'review', label: 'Yorumlar', icon: MessageSquare },
    ];

    const topRaters = mockTracks.slice(0, 5).map((_, i) => ({
        id: i + 1,
        username: ['melodyfan', 'vinylcollector', 'beatmaster', 'songbird', 'rhythmking'][i],
        displayName: ['Melody Fan', 'Vinyl Collector', 'Beat Master', 'Songbird', 'Rhythm King'][i],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        ratingsCount: 150 - i * 20,
        avgRating: 4.5 - i * 0.1
    }));

    return (
        <div className="community-page">
            <header className="community-header">
                <div className="container">
                    <motion.div
                        className="community-hero"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="community-title">
                            <Users className="title-icon" />
                            Topluluk
                        </h1>
                        <p className="community-subtitle">
                            Müzik tutkunlarının aktivitelerini takip et
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <div className="community-tabs">
                        {tabs.map(tab => (
                            (!tab.requiresAuth || isAuthenticated) && (
                                <button
                                    key={tab.id}
                                    className={`community-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            </header>

            <main className="community-main container">
                <div className="community-grid">
                    {/* Activity Feed */}
                    <section className="community-feed">
                        {isLoading ? (
                            <div className="feed-loading">
                                <div className="loader-vinyl">
                                    <div className="vinyl-disc spinning">
                                        <div className="vinyl-label"></div>
                                    </div>
                                </div>
                                <p>Aktiviteler yükleniyor...</p>
                            </div>
                        ) : (
                            <ActivityFeed activities={activities} />
                        )}
                    </section>

                    {/* Sidebar */}
                    <aside className="community-sidebar">
                        {/* Top Raters */}
                        <div className="sidebar-card glass-card">
                            <h3 className="sidebar-title">
                                <TrendingUp size={18} />
                                En Aktif Kullanıcılar
                            </h3>
                            <div className="top-users">
                                {topRaters.map((user, index) => (
                                    <Link
                                        key={user.id}
                                        to={`/user/${user.username}`}
                                        className="top-user-item"
                                    >
                                        <span className="user-rank">{index + 1}</span>
                                        <img src={user.avatar} alt={user.displayName} />
                                        <div className="user-info">
                                            <span className="user-name">{user.displayName}</span>
                                            <span className="user-stats">{user.ratingsCount} puanlama</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Join CTA */}
                        {!isAuthenticated && (
                            <div className="sidebar-card glass-card join-card">
                                <h3>Topluluğa Katıl!</h3>
                                <p>Müzik zevkini paylaş ve keşfet</p>
                                <Link to="/register" className="btn btn-primary">
                                    Ücretsiz Kayıt Ol
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
}
