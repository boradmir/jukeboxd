import { useState, useEffect } from 'react';
import { Users, Star, MessageSquare, ListMusic, TrendingUp, Activity, Crown, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function Dashboard() {
    const { authFetch } = useAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await authFetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, [authFetch]);

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="loader-vinyl">
                    <div className="vinyl-disc spinning">
                        <div className="vinyl-label"></div>
                    </div>
                </div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Calculate expiring soon subscriptions
    const expiringSoon = stats?.subscriptions?.expiring_soon || 0;

    return (
        <div className="admin-dashboard">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Dashboard</h1>
            </div>

            {/* Expiring Soon Alert */}
            {expiringSoon > 0 && (
                <div className="dashboard-alert warning">
                    <AlertTriangle size={20} />
                    <span><strong>{expiringSoon}</strong> kullanıcının Gold üyeliği bu hafta sona eriyor.</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid stats-grid-6">
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-value">{stats?.users?.total || 0}</div>
                    <div className="stat-label">Toplam Kullanıcı</div>
                    <div className="stat-change positive">
                        +{stats?.users?.new_this_week || 0} bu hafta
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon gold">
                        <Crown size={24} />
                    </div>
                    <div className="stat-value">{stats?.subscriptions?.active || 0}</div>
                    <div className="stat-label">Gold Üye</div>
                    <div className="stat-change positive">
                        +{stats?.subscriptions?.new_this_month || 0} bu ay
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-value">₺{(stats?.subscriptions?.revenue || 0).toLocaleString()}</div>
                    <div className="stat-label">Toplam Gelir</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon ratings">
                        <Star size={24} />
                    </div>
                    <div className="stat-value">{stats?.content?.ratings || 0}</div>
                    <div className="stat-label">Puanlama</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon reviews">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-value">{stats?.content?.reviews || 0}</div>
                    <div className="stat-label">Yorum</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon playlists">
                        <ListMusic size={24} />
                    </div>
                    <div className="stat-value">{stats?.content?.playlists || 0}</div>
                    <div className="stat-label">Liste</div>
                </div>
            </div>

            {/* Charts & Tables */}
            <div className="charts-grid">
                {/* Activity Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <Activity size={18} />
                        Son 7 Gün Aktivite
                    </h3>
                    <div className="activity-bars">
                        {(stats?.dailyActivity || []).map((day, index) => (
                            <div key={day.date} className="activity-bar-container">
                                <div
                                    className="activity-bar"
                                    style={{ height: `${Math.min(day.count * 10, 100)}%` }}
                                />
                                <span className="activity-label">
                                    {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Tracks */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <TrendingUp size={18} />
                        En Çok Puanlanan Şarkılar
                    </h3>
                    <div className="top-tracks-list">
                        {(stats?.topTracks || []).slice(0, 5).map((track, index) => (
                            <div key={track.track_id} className="top-track-item">
                                <span className="track-rank">{index + 1}</span>
                                <img
                                    src={track.album_image || '/vinyl.svg'}
                                    alt={track.track_name}
                                    className="track-cover"
                                />
                                <div className="track-info">
                                    <span className="track-name">{track.track_name}</span>
                                    <span className="track-artist">{track.artist_name}</span>
                                </div>
                                <div className="track-rating">
                                    <Star size={14} fill="currentColor" />
                                    {track.avg_rating.toFixed(1)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Users */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">En Aktif Kullanıcılar</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Puanlama</th>
                            <th>Yorum</th>
                            <th>Liste</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(stats?.activeUsers || []).map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-cell">
                                        <img
                                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            alt={user.username}
                                        />
                                        <div>
                                            <div>{user.display_name || user.username}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                                @{user.username}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.ratings}</td>
                                <td>{user.reviews}</td>
                                <td>{user.playlists}</td>
                                <td>
                                    <span className={`badge badge-${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: var(--space-4);
          color: var(--color-text-secondary);
        }
        
        .activity-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 150px;
          gap: var(--space-2);
        }
        
        .activity-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        
        .activity-bar {
          width: 100%;
          max-width: 40px;
          background: var(--color-accent-gradient);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          min-height: 4px;
          margin-top: auto;
        }
        
        .activity-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--space-2);
        }
        
        .top-tracks-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        
        .top-track-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }
        
        .top-track-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .track-rank {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-tertiary);
        }
        
        .track-cover {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }
        
        .top-track-item .track-info {
          flex: 1;
          min-width: 0;
        }
        
        .top-track-item .track-name {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .top-track-item .track-artist {
          display: block;
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }
        
        .track-rating {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-gold);
        }
        
        .chart-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
      `}</style>
        </div>
    );
}
