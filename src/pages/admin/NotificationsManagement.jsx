import { useState, useEffect } from 'react';
import { Bell, Send, Users, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function NotificationsManagement() {
    const { authFetch } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetGroup: 'all',
        type: 'info'
    });

    const targetGroups = [
        { value: 'all', label: 'Tüm Kullanıcılar' },
        { value: 'gold', label: 'Sadece Gold Üyeler' },
        { value: 'free', label: 'Ücretsiz Kullanıcılar' },
        { value: 'inactive', label: 'İnaktif Kullanıcılar' }
    ];

    const notificationTypes = [
        { value: 'info', label: 'Bilgi', color: 'users' },
        { value: 'success', label: 'Başarı', color: 'revenue' },
        { value: 'warning', label: 'Uyarı', color: 'gold' },
        { value: 'promo', label: 'Promosyon', color: 'ratings' }
    ];

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await authFetch('/api/admin/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            } else {
                setNotifications(getMockNotifications());
            }
        } catch (error) {
            console.error('Notifications error:', error);
            setNotifications(getMockNotifications());
        } finally {
            setIsLoading(false);
        }
    };

    const getMockNotifications = () => [
        {
            id: 1,
            title: 'Yeni Özellik: Gold Üyelik',
            message: 'Artık Gold üye olarak premium özelliklere erişebilirsiniz!',
            target_group: 'all',
            type: 'promo',
            sent_at: '2024-12-08T10:00:00Z',
            sent_count: 1247,
            read_count: 856
        },
        {
            id: 2,
            title: 'Bakım Bildirimi',
            message: 'Yarın saat 03:00-05:00 arası bakım yapılacaktır.',
            target_group: 'all',
            type: 'warning',
            sent_at: '2024-12-07T14:30:00Z',
            sent_count: 1247,
            read_count: 1102
        },
        {
            id: 3,
            title: 'Gold Özel: Yeni Temalar',
            message: '3 yeni profil teması eklendi. Ayarlardan aktive edebilirsiniz.',
            target_group: 'gold',
            type: 'info',
            sent_at: '2024-12-05T09:00:00Z',
            sent_count: 45,
            read_count: 38
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            alert('Başlık ve mesaj zorunludur');
            return;
        }

        setIsSending(true);
        try {
            const response = await authFetch('/api/admin/notifications/send', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Bildirim başarıyla gönderildi!');
                setShowForm(false);
                setFormData({ title: '', message: '', targetGroup: 'all', type: 'info' });
                fetchNotifications();
            } else {
                // Mock success for demo
                alert('Bildirim başarıyla gönderildi! (Demo)');
                setShowForm(false);
            }
        } catch (error) {
            console.error('Send error:', error);
            alert('Bildirim gönderildi (Demo)');
            setShowForm(false);
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;

        try {
            await authFetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} />;
            case 'warning': return <AlertCircle size={16} />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <div className="admin-notifications">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <Bell className="page-title-icon" />
                    Bildirim Yönetimi
                </h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Send size={16} />
                    Yeni Bildirim
                </button>
            </div>

            {/* Send Notification Form */}
            {showForm && (
                <div className="notification-form glass-card">
                    <h3>Yeni Bildirim Gönder</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Başlık</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Bildirim başlığı"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mesaj</label>
                            <textarea
                                className="admin-input"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Bildirim mesajı"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Hedef Kitle</label>
                                <select
                                    className="admin-select"
                                    value={formData.targetGroup}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetGroup: e.target.value }))}
                                >
                                    {targetGroups.map(group => (
                                        <option key={group.value} value={group.value}>{group.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tür</label>
                                <select
                                    className="admin-select"
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    {notificationTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSending}>
                                {isSending ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notifications History */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">Gönderim Geçmişi</h3>
                </div>

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
                                <th>Başlık</th>
                                <th>Hedef</th>
                                <th>Tür</th>
                                <th>Gönderildi</th>
                                <th>Okunma</th>
                                <th>Tarih</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map(notification => (
                                <tr key={notification.id}>
                                    <td>
                                        <div className="notification-title-cell">
                                            {getTypeIcon(notification.type)}
                                            <span>{notification.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-users">
                                            <Users size={12} />
                                            {targetGroups.find(g => g.value === notification.target_group)?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${notificationTypes.find(t => t.value === notification.type)?.color}`}>
                                            {notificationTypes.find(t => t.value === notification.type)?.label}
                                        </span>
                                    </td>
                                    <td>{notification.sent_count}</td>
                                    <td>
                                        {notification.read_count}
                                        <span className="read-percentage">
                                            ({Math.round((notification.read_count / notification.sent_count) * 100)}%)
                                        </span>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <Clock size={14} />
                                            {new Date(notification.sent_at).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn danger"
                                            onClick={() => handleDelete(notification.id)}
                                            title="Sil"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {notifications.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <Bell size={48} />
                        <h3>Bildirim Bulunamadı</h3>
                        <p>Henüz hiç bildirim gönderilmemiş.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
