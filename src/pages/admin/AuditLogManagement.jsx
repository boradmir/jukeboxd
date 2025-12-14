import { useState, useEffect } from 'react';
import { Shield, Search, Filter, User, Calendar, Activity, Eye, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function AuditLogManagement() {
    const { authFetch } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [page, setPage] = useState(1);

    const actionTypes = [
        { value: 'all', label: 'Tüm İşlemler' },
        { value: 'user', label: 'Kullanıcı İşlemleri' },
        { value: 'subscription', label: 'Abonelik İşlemleri' },
        { value: 'content', label: 'İçerik İşlemleri' },
        { value: 'settings', label: 'Ayar Değişiklikleri' },
        { value: 'auth', label: 'Giriş/Çıkış' }
    ];

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await authFetch(`/api/admin/audit-logs?page=${page}&action=${actionFilter}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            } else {
                setLogs(getMockLogs());
            }
        } catch (error) {
            console.error('Logs error:', error);
            setLogs(getMockLogs());
        } finally {
            setIsLoading(false);
        }
    };

    const getMockLogs = () => [
        {
            id: 1,
            admin_username: 'admin',
            action: 'user.role_update',
            target: 'musiclover',
            details: { old_role: 'user', new_role: 'admin' },
            ip_address: '192.168.1.1',
            created_at: '2024-12-09T10:30:00Z'
        },
        {
            id: 2,
            admin_username: 'admin',
            action: 'subscription.activate',
            target: 'djmaster',
            details: { plan: 'yearly', amount: 399.99 },
            ip_address: '192.168.1.1',
            created_at: '2024-12-09T09:15:00Z'
        },
        {
            id: 3,
            admin_username: 'admin',
            action: 'settings.update',
            target: 'maintenance_mode',
            details: { old_value: false, new_value: true },
            ip_address: '192.168.1.1',
            created_at: '2024-12-08T18:45:00Z'
        },
        {
            id: 4,
            admin_username: 'admin',
            action: 'content.delete',
            target: 'review_456',
            details: { reason: 'spam' },
            ip_address: '192.168.1.1',
            created_at: '2024-12-08T14:20:00Z'
        },
        {
            id: 5,
            admin_username: 'admin',
            action: 'auth.login',
            target: null,
            details: { success: true },
            ip_address: '192.168.1.1',
            created_at: '2024-12-08T08:00:00Z'
        }
    ];

    const formatAction = (action) => {
        const labels = {
            'user.role_update': 'Rol Güncelleme',
            'user.delete': 'Kullanıcı Silme',
            'user.ban': 'Kullanıcı Engelleme',
            'subscription.activate': 'Abonelik Aktivasyonu',
            'subscription.cancel': 'Abonelik İptali',
            'settings.update': 'Ayar Değişikliği',
            'content.delete': 'İçerik Silme',
            'content.hide': 'İçerik Gizleme',
            'auth.login': 'Admin Girişi',
            'auth.logout': 'Admin Çıkışı'
        };
        return labels[action] || action;
    };

    const getActionColor = (action) => {
        if (action.startsWith('user')) return 'users';
        if (action.startsWith('subscription')) return 'gold';
        if (action.startsWith('settings')) return 'reviews';
        if (action.startsWith('content')) return 'ratings';
        if (action.startsWith('auth')) return 'playlists';
        return 'users';
    };

    const filteredLogs = logs.filter(log =>
        log.admin_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatAction(log.action).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-audit">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <Shield className="page-title-icon" />
                    İşlem Geçmişi (Audit Log)
                </h1>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Admin, hedef veya işlem ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="admin-select"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                >
                    {actionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Logs Table */}
            <div className="admin-table-container">
                {isLoading ? (
                    <div className="admin-loading">
                        <div className="loader-vinyl">
                            <div className="vinyl-disc spinning">
                                <div className="vinyl-label"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Admin</th>
                                <th>İşlem</th>
                                <th>Hedef</th>
                                <th>IP Adresi</th>
                                <th>Detay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={14} />
                                            {new Date(log.created_at).toLocaleString('tr-TR')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <User size={16} />
                                            {log.admin_username}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getActionColor(log.action)}`}>
                                            {formatAction(log.action)}
                                        </span>
                                    </td>
                                    <td>{log.target || '-'}</td>
                                    <td className="ip-cell">{log.ip_address}</td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => setSelectedLog(log)}
                                            title="Detayları Görüntüle"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {filteredLogs.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <Shield size={48} />
                        <h3>İşlem Bulunamadı</h3>
                        <p>Arama kriterlerine uygun işlem kaydı yok.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>İşlem Detayları</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Tarih</span>
                                <span className="detail-value">
                                    {new Date(selectedLog.created_at).toLocaleString('tr-TR')}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Admin</span>
                                <span className="detail-value">{selectedLog.admin_username}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">İşlem</span>
                                <span className="detail-value">{formatAction(selectedLog.action)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Hedef</span>
                                <span className="detail-value">{selectedLog.target || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">IP Adresi</span>
                                <span className="detail-value">{selectedLog.ip_address}</span>
                            </div>
                            <div className="detail-item full-width">
                                <span className="detail-label">Detaylar</span>
                                <pre className="detail-json">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
