import { useState, useEffect } from 'react';
import {
    Search, Shield, Ban, Check, Crown, Bell, Eye,
    Mail, Calendar, Star, MessageSquare, ListMusic, Users,
    X, Send, ChevronDown, Edit2, Key
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function UsersManagement() {
    const { authFetch, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [goldFilter, setGoldFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyUser, setNotifyUser] = useState(null);
    const [notifyMessage, setNotifyMessage] = useState({ title: '', message: '' });
    const limit = 20;

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, statusFilter, goldFilter]);

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                limit,
                offset: (page - 1) * limit,
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
                ...(statusFilter && { status: statusFilter }),
                ...(goldFilter && { gold: goldFilter })
            });

            const response = await authFetch(`/api/admin/users?${params}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleUpdateUser = async (userId, updates, actionName) => {
        // Prevent admin from demoting or deactivating themselves
        if (userId === user?.id && (updates.role === 'user' || updates.is_active === false)) {
            alert('Kendi hesabınızın yetkisini veya durumunu değiştiremezsiniz!');
            return;
        }

        // Confirmation dialog
        const confirmMessages = {
            'admin': 'Bu kullanıcıyı admin yapmak istediğinize emin misiniz?',
            'user': 'Bu kullanıcının admin yetkisini kaldırmak istediğinize emin misiniz?',
            'suspend': 'Bu kullanıcının hesabını askıya almak istediğinize emin misiniz?',
            'activate': 'Bu kullanıcının hesabını aktifleştirmek istediğinize emin misiniz?'
        };

        if (actionName && confirmMessages[actionName]) {
            if (!confirm(confirmMessages[actionName])) return;
        }

        try {
            const response = await authFetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                fetchUsers();
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => ({ ...prev, ...updates }));
                }

                const successMessages = {
                    'admin': 'Kullanıcı admin yapıldı!',
                    'user': 'Admin yetkisi kaldırıldı!',
                    'suspend': 'Hesap askıya alındı!',
                    'activate': 'Hesap aktifleştirildi!'
                };
                if (actionName && successMessages[actionName]) {
                    alert(successMessages[actionName]);
                }
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('İşlem başarısız oldu!');
        }
    };

    const handleToggleGold = async (userId, makeGold) => {
        if (makeGold) {
            if (!confirm('Bu kullanıcıya Gold üyelik vermek istediğinize emin misiniz?')) return;
        } else {
            if (!confirm('Bu kullanıcının Gold üyeliğini kaldırmak istediğinize emin misiniz?')) return;
        }

        const duration = makeGold ? prompt('Gold süresini gün olarak girin:', '30') : null;
        if (makeGold && !duration) return;

        try {
            const response = await authFetch(`/api/admin/users/${userId}/gold`, {
                method: 'POST',
                body: JSON.stringify({
                    action: makeGold ? 'activate' : 'deactivate',
                    days: parseInt(duration) || 30
                })
            });

            if (response.ok) {
                fetchUsers();
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => ({ ...prev, is_gold: makeGold ? 1 : 0 }));
                }
                alert(makeGold ? 'Gold üyelik aktifleştirildi!' : 'Gold üyelik kaldırıldı!');
            }
        } catch (error) {
            console.error('Gold toggle error:', error);
            alert('İşlem başarısız oldu!');
        }
    };

    const handleSendNotification = async () => {
        if (!notifyMessage.title || !notifyMessage.message) {
            alert('Başlık ve mesaj zorunludur');
            return;
        }

        if (!confirm(`@${notifyUser.username} kullanıcısına bildirim göndermek istediğinize emin misiniz?`)) return;

        try {
            const response = await authFetch('/api/admin/notifications/send-to-user', {
                method: 'POST',
                body: JSON.stringify({
                    userId: notifyUser.id,
                    ...notifyMessage
                })
            });

            if (response.ok) {
                alert(`${notifyUser.username}'a bildirim gönderildi!`);
                setShowNotifyModal(false);
                setNotifyMessage({ title: '', message: '' });
            }
        } catch (error) {
            console.error('Notification error:', error);
            alert('Bildirim gönderilemedi');
        }
    };

    const handleResetPassword = async (userId, username) => {
        if (!confirm(`${username} kullanıcısının şifresini sıfırlamak istediğinize emin misiniz?`)) return;

        const newPassword = prompt(`${username} için yeni şifre girin:`);
        if (!newPassword || newPassword.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır');
            return;
        }

        try {
            const response = await authFetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ newPassword })
            });

            if (response.ok) {
                alert('Şifre başarıyla sıfırlandı!');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Şifre sıfırlama başarısız oldu!');
        }
    };

    const openUserDetail = (user) => {
        setSelectedUser(user);
    };

    const openNotifyModal = (user) => {
        setNotifyUser(user);
        setShowNotifyModal(true);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-users">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <Users className="page-title-icon" />
                    Kullanıcı Yönetimi
                </h1>
                <div className="page-stats">
                    <span className="stat-badge">{total} kullanıcı</span>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <form className="admin-search" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Kullanıcı adı, e-posta ara..."
                    />
                </form>

                <select
                    className="admin-select"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                >
                    <option value="">Tüm Roller</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    className="admin-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Devre Dışı</option>
                </select>

                <select
                    className="admin-select"
                    value={goldFilter}
                    onChange={(e) => { setGoldFilter(e.target.value); setPage(1); }}
                >
                    <option value="">Tüm Üyelikler</option>
                    <option value="gold">Gold Üyeler</option>
                    <option value="free">Ücretsiz Üyeler</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>E-posta</th>
                            <th>Üyelik</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th>Kayıt Tarihi</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="table-loading">
                                    <div className="loader-small"></div>
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty">
                                    Kullanıcı bulunamadı
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                alt={user.username}
                                            />
                                            <div>
                                                <div className="user-name">
                                                    {user.display_name || user.username}
                                                    {user.is_gold ? <Crown size={14} className="gold-icon" /> : null}
                                                </div>
                                                <div className="user-username">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="email-cell">{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.is_gold ? 'badge-gold' : 'badge-user'}`}>
                                            {user.is_gold ? 'Gold' : 'Ücretsiz'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${user.role}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        <Calendar size={12} />
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td>
                                        <button className="btn-manage" onClick={() => openUserDetail(user)}>
                                            <Eye size={14} />
                                            Yönet
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="admin-pagination">
                        <div className="pagination-info">
                            {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total}
                        </div>
                        <div className="pagination-buttons">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                            >
                                Önceki
                            </button>
                            <span className="pagination-current">{page} / {totalPages}</span>
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === totalPages}
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kullanıcı Detayları</h3>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="user-detail-content">
                            <div className="user-detail-header">
                                <img
                                    src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                                    alt={selectedUser.username}
                                    className="detail-avatar"
                                />
                                <div className="detail-info">
                                    <h2>
                                        {selectedUser.display_name || selectedUser.username}
                                        {selectedUser.is_gold && <Crown size={20} className="gold-icon" />}
                                    </h2>
                                    <p className="detail-username">@{selectedUser.username}</p>
                                    <p className="detail-email">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="detail-stats">
                                <div className="detail-stat">
                                    <Star size={16} />
                                    <span>{selectedUser.ratings_count || 0} Puanlama</span>
                                </div>
                                <div className="detail-stat">
                                    <MessageSquare size={16} />
                                    <span>{selectedUser.reviews_count || 0} Yorum</span>
                                </div>
                                <div className="detail-stat">
                                    <ListMusic size={16} />
                                    <span>{selectedUser.playlists_count || 0} Liste</span>
                                </div>
                                <div className="detail-stat">
                                    <Calendar size={16} />
                                    <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('tr-TR') : '-'}</span>
                                </div>
                            </div>

                            <div className="detail-badges">
                                <span className={`badge badge-${selectedUser.role}`}>
                                    {selectedUser.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                </span>
                                <span className={`badge ${selectedUser.is_gold ? 'badge-gold' : 'badge-user'}`}>
                                    {selectedUser.is_gold ? 'Gold Üye' : 'Ücretsiz'}
                                </span>
                                <span className={`badge badge-${selectedUser.is_active ? 'active' : 'inactive'}`}>
                                    {selectedUser.is_active ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>

                            {selectedUser.bio && (
                                <div className="detail-bio">
                                    <h4>Hakkında</h4>
                                    <p>{selectedUser.bio}</p>
                                </div>
                            )}

                            <div className="detail-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { openNotifyModal(selectedUser); setSelectedUser(null); }}
                                >
                                    <Bell size={16} /> Bildirim Gönder
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleResetPassword(selectedUser.id, selectedUser.username)}
                                >
                                    <Key size={16} /> Şifre Sıfırla
                                </button>
                                <button
                                    className={`btn ${selectedUser.is_gold ? 'btn-outline-danger' : 'btn-gold'}`}
                                    onClick={() => { handleToggleGold(selectedUser.id, !selectedUser.is_gold); }}
                                >
                                    <Crown size={16} /> {selectedUser.is_gold ? 'Gold Kaldır' : 'Gold Yap'}
                                </button>
                                <button
                                    className={`btn ${selectedUser.role === 'admin' ? 'btn-outline-warning' : 'btn-outline-primary'}`}
                                    onClick={() => {
                                        handleUpdateUser(
                                            selectedUser.id,
                                            { role: selectedUser.role === 'admin' ? 'user' : 'admin' },
                                            selectedUser.role === 'admin' ? 'user' : 'admin'
                                        );
                                    }}
                                >
                                    <Shield size={16} /> {selectedUser.role === 'admin' ? 'Admin Kaldır' : 'Admin Yap'}
                                </button>
                                <button
                                    className={`btn ${selectedUser.is_active ? 'btn-danger' : 'btn-success'}`}
                                    onClick={() => {
                                        handleUpdateUser(
                                            selectedUser.id,
                                            { is_active: !selectedUser.is_active },
                                            selectedUser.is_active ? 'suspend' : 'activate'
                                        );
                                    }}
                                >
                                    {selectedUser.is_active ? (
                                        <><Ban size={16} /> Hesabı Askıya Al</>
                                    ) : (
                                        <><Check size={16} /> Hesabı Aktifleştir</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Notification Modal */}
            {showNotifyModal && notifyUser && (
                <div className="modal-overlay" onClick={() => setShowNotifyModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bildirim Gönder</h3>
                            <button className="modal-close" onClick={() => setShowNotifyModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="notify-modal-content">
                            <p className="notify-to">
                                Alıcı: <strong>@{notifyUser.username}</strong>
                            </p>

                            <div className="form-group">
                                <label>Başlık</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={notifyMessage.title}
                                    onChange={(e) => setNotifyMessage(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Bildirim başlığı"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mesaj</label>
                                <textarea
                                    className="admin-input"
                                    value={notifyMessage.message}
                                    onChange={(e) => setNotifyMessage(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Bildirim mesajı"
                                    rows={4}
                                />
                            </div>

                            <div className="form-actions">
                                <button className="btn btn-secondary" onClick={() => setShowNotifyModal(false)}>
                                    İptal
                                </button>
                                <button className="btn btn-primary" onClick={handleSendNotification}>
                                    <Send size={16} /> Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
