import { useState, useEffect } from 'react';
import { Crown, Search, Check, X, RefreshCw, DollarSign, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function SubscriptionsManagement() {
    const { authFetch } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({ active: 0, total: 0, revenue: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const response = await authFetch('/api/admin/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.subscriptions || []);
                setStats(data.stats || { active: 0, total: 0, revenue: 0 });
            } else {
                // Use mock data for demo
                setSubscriptions(getMockSubscriptions());
                setStats({ active: 5, total: 12, revenue: 1899.88 });
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            setSubscriptions(getMockSubscriptions());
            setStats({ active: 5, total: 12, revenue: 1899.88 });
        } finally {
            setIsLoading(false);
        }
    };

    const getMockSubscriptions = () => [
        {
            id: 1,
            user: { username: 'musiclover', display_name: 'Müzik Sever', avatar_url: null },
            plan_name: 'Yıllık',
            status: 'active',
            amount_paid: 399.99,
            starts_at: '2024-01-15',
            expires_at: '2025-01-15'
        },
        {
            id: 2,
            user: { username: 'djmaster', display_name: 'DJ Master', avatar_url: null },
            plan_name: 'Aylık',
            status: 'active',
            amount_paid: 49.99,
            starts_at: '2024-11-01',
            expires_at: '2024-12-01'
        },
        {
            id: 3,
            user: { username: 'vinylcollector', display_name: 'Plak Koleksiyoncusu', avatar_url: null },
            plan_name: 'Yıllık',
            status: 'expired',
            amount_paid: 399.99,
            starts_at: '2023-06-01',
            expires_at: '2024-06-01'
        }
    ];

    const handleActivate = async (subscriptionId) => {
        if (!confirm('Bu aboneliği aktive etmek istediğinize emin misiniz?')) return;

        try {
            const response = await authFetch(`/api/admin/subscriptions/${subscriptionId}/activate`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Activation failed:', error);
        }
    };

    const handleCancel = async (subscriptionId) => {
        if (!confirm('Bu aboneliği iptal etmek istediğinize emin misiniz?')) return;

        try {
            const response = await authFetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Cancellation failed:', error);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('tr-TR');
    };

    const formatCurrency = (amount) => {
        return `₺${Number(amount).toFixed(2)}`;
    };

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

    return (
        <div className="admin-subscriptions">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <Crown className="page-title-icon gold" />
                    Abonelik Yönetimi
                </h1>
            </div>

            {/* Stats */}
            <div className="stats-grid stats-grid-3">
                <div className="stat-card">
                    <div className="stat-icon gold">
                        <Crown size={24} />
                    </div>
                    <div className="stat-value">{stats.active}</div>
                    <div className="stat-label">Aktif Gold Üye</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Toplam Abonelik</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-value">{formatCurrency(stats.revenue)}</div>
                    <div className="stat-label">Toplam Gelir</div>
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">Abonelikler</h3>
                    <div className="admin-filters">
                        <div className="admin-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={fetchSubscriptions}>
                            <RefreshCw size={16} />
                            Yenile
                        </button>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Plan</th>
                            <th>Durum</th>
                            <th>Tutar</th>
                            <th>Başlangıç</th>
                            <th>Bitiş</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscriptions.map(sub => (
                            <tr key={sub.id}>
                                <td>
                                    <div className="user-cell">
                                        <img
                                            src={sub.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.user?.username}`}
                                            alt={sub.user?.display_name}
                                        />
                                        <div>
                                            <span className="user-name">{sub.user?.display_name || sub.user?.username}</span>
                                            <span className="user-username">@{sub.user?.username}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-gold">
                                        <Crown size={12} />
                                        {sub.plan_name}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-${sub.status}`}>
                                        {sub.status === 'active' ? 'Aktif' : sub.status === 'expired' ? 'Süresi Dolmuş' : 'İptal'}
                                    </span>
                                </td>
                                <td>{formatCurrency(sub.amount_paid)}</td>
                                <td>{formatDate(sub.starts_at)}</td>
                                <td>{formatDate(sub.expires_at)}</td>
                                <td>
                                    <div className="actions">
                                        {sub.status !== 'active' && (
                                            <button
                                                className="action-btn success"
                                                onClick={() => handleActivate(sub.id)}
                                                title="Aktive Et"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        {sub.status === 'active' && (
                                            <button
                                                className="action-btn danger"
                                                onClick={() => handleCancel(sub.id)}
                                                title="İptal Et"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredSubscriptions.length === 0 && (
                    <div className="empty-state">
                        <Crown size={48} />
                        <h3>Abonelik Bulunamadı</h3>
                        <p>Henüz Gold abonesi bulunmuyor veya arama kriterlerine uygun sonuç yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
