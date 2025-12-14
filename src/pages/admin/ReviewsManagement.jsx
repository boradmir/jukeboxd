import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function ReviewsManagement() {
    const { authFetch } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        fetchReviews();
    }, [page]);

    async function fetchReviews() {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                limit,
                offset: (page - 1) * limit,
                ...(search && { search })
            });

            const response = await authFetch(`/api/admin/reviews?${params}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
                setTotal(data.total || 0);
            } else {
                throw new Error('Yorumlar yüklenemedi');
            }
        } catch (err) {
            setError(err.message);
            // Fallback to mock data for display
            setReviews([
                {
                    id: 1,
                    user: { username: 'musiclover', display_name: 'Music Lover' },
                    track_name: 'Blinding Lights',
                    artist_name: 'The Weeknd',
                    rating: 5,
                    content: 'Harika bir şarkı, 80\'ler vibesı mükemmel!',
                    created_at: '2024-01-15T10:30:00Z'
                },
                {
                    id: 2,
                    user: { username: 'vinylhead', display_name: 'Vinyl Head' },
                    track_name: 'As It Was',
                    artist_name: 'Harry Styles',
                    rating: 4,
                    content: 'Çok güzel bir parça ama biraz daha uzun olabilirdi.',
                    created_at: '2024-01-14T15:20:00Z'
                },
                {
                    id: 3,
                    user: { username: 'beatmaster', display_name: 'Beat Master' },
                    track_name: 'Anti-Hero',
                    artist_name: 'Taylor Swift',
                    rating: 5,
                    content: 'Taylor\'un en iyi şarkılarından biri!',
                    created_at: '2024-01-13T09:45:00Z'
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
        fetchReviews();
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const response = await authFetch(`/api/admin/reviews/${reviewId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchReviews();
            }
        } catch (err) {
            console.error('Failed to delete review:', err);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-reviews">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Yorum Yönetimi</h1>
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
                        placeholder="Yorum veya kullanıcı ara..."
                    />
                </form>
            </div>

            {/* Reviews Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Şarkı</th>
                            <th>Puan</th>
                            <th>Yorum</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="table-loading">
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : reviews.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="table-empty">
                                    Yorum bulunamadı
                                </td>
                            </tr>
                        ) : (
                            reviews.map(review => (
                                <tr key={review.id}>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.username}`}
                                                alt={review.user?.username}
                                            />
                                            <div>
                                                <div>{review.user?.display_name}</div>
                                                <div className="user-secondary">@{review.user?.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="track-cell">
                                            <div>{review.track_name}</div>
                                            <div className="track-artist">{review.artist_name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="rating-cell">
                                            <Star size={14} fill="currentColor" />
                                            {review.rating}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="review-content">
                                            {review.content?.substring(0, 100)}
                                            {review.content?.length > 100 && '...'}
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
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
                                                onClick={() => handleDeleteReview(review.id)}
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
                            {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total} yorum
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
