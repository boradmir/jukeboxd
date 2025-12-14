import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Music, Lock, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function PlaylistsManagement() {
    const { authFetch } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        fetchPlaylists();
    }, [page]);

    async function fetchPlaylists() {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                limit,
                offset: (page - 1) * limit,
                ...(search && { search })
            });

            const response = await authFetch(`/api/admin/playlists?${params}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data.playlists || []);
                setTotal(data.total || 0);
            } else {
                throw new Error('Listeler yüklenemedi');
            }
        } catch (err) {
            setError(err.message);
            // Mock data fallback
            setPlaylists([
                {
                    id: 1,
                    name: 'Summer Vibes 2024',
                    user: { username: 'musiclover', display_name: 'Music Lover' },
                    tracks_count: 25,
                    is_public: true,
                    likes_count: 128,
                    created_at: '2024-01-10T10:30:00Z'
                },
                {
                    id: 2,
                    name: 'Chill & Study',
                    user: { username: 'vinylhead', display_name: 'Vinyl Head' },
                    tracks_count: 50,
                    is_public: true,
                    likes_count: 89,
                    created_at: '2024-01-08T15:20:00Z'
                },
                {
                    id: 3,
                    name: 'My Private Collection',
                    user: { username: 'beatmaster', display_name: 'Beat Master' },
                    tracks_count: 15,
                    is_public: false,
                    likes_count: 0,
                    created_at: '2024-01-05T09:45:00Z'
                }
            ]);
            setTotal(3);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPlaylists();
    };

    const handleDeletePlaylist = async (playlistId) => {
        if (!confirm('Bu listeyi silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await authFetch(`/api/admin/playlists/${playlistId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchPlaylists();
            }
        } catch (err) {
            console.error('Failed to delete playlist:', err);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-playlists">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Liste Yönetimi</h1>
            </div>

            {error && (
                <div className="admin-error">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="admin-filters">
                <form className="admin-search" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Liste veya kullanıcı ara..."
                    />
                </form>
            </div>

            {/* Playlists Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Liste Adı</th>
                            <th>Oluşturan</th>
                            <th>Şarkı</th>
                            <th>Gizlilik</th>
                            <th>Beğeni</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="table-loading">
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : playlists.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty">
                                    Liste bulunamadı
                                </td>
                            </tr>
                        ) : (
                            playlists.map(playlist => (
                                <tr key={playlist.id}>
                                    <td>
                                        <div className="playlist-name-cell">
                                            <Music size={16} />
                                            {playlist.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playlist.user?.username}`}
                                                alt={playlist.user?.username}
                                            />
                                            <div>
                                                <div>{playlist.user?.display_name}</div>
                                                <div className="user-secondary">@{playlist.user?.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{playlist.tracks_count}</td>
                                    <td>
                                        {playlist.is_public ? (
                                            <span className="badge badge-active">
                                                <Globe size={10} /> Herkese Açık
                                            </span>
                                        ) : (
                                            <span className="badge badge-inactive">
                                                <Lock size={10} /> Gizli
                                            </span>
                                        )}
                                    </td>
                                    <td>{playlist.likes_count}</td>
                                    <td>
                                        {new Date(playlist.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="action-btn"
                                                title="Görüntüle"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                onClick={() => handleDeletePlaylist(playlist.id)}
                                                title="Sil"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
                            {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total} liste
                        </div>
                        <div className="pagination-buttons">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                            >
                                Önceki
                            </button>
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
        </div>
    );
}
