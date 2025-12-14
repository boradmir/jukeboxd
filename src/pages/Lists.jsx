import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Heart, TrendingUp, Clock, Search, Music, ChevronDown } from 'lucide-react';
import { mockLists, mockTracks } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import CreateListModal from '../components/modals/CreateListModal';
import './Lists.css';

const LIMIT = 9; // Number of lists per page

export default function Lists() {
    const [activeTab, setActiveTab] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [lists, setLists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { isAuthenticated, authFetch } = useAuth();
    const { openModal } = useModal();
    const navigate = useNavigate();

    const tabs = [
        { id: 'popular', label: 'Popüler', icon: TrendingUp },
        { id: 'new', label: 'Yeni', icon: Clock },
        { id: 'following', label: 'Takip Ettiklerim', icon: Heart },
    ];

    const fetchLists = useCallback(async (pageNum, isLoadMore = false) => {
        if (!isLoadMore) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const offset = pageNum * LIMIT;
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/playlists?limit=${LIMIT}&offset=${offset}`);

            if (response.ok) {
                const data = await response.json();
                const fetchedLists = data.playlists && data.playlists.length > 0
                    ? data.playlists.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || '',
                        user: {
                            name: p.username || 'Anonim',
                            avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || 'user'}`
                        },
                        tracks: [], // Tracks are usually fetched with detail, just count here
                        tracksCount: p.tracks_count || 0,
                        likes: p.likes_count || 0,
                        isPublic: p.is_public,
                        createdAt: p.created_at
                    }))
                    : [];

                if (isLoadMore) {
                    setLists(prev => [...prev, ...fetchedLists]);
                } else {
                    setLists(fetchedLists.length > 0 ? fetchedLists : getExtendedMockLists());
                }

                // Check if there are more items
                if (data.total) { // If backend returns total count
                    setHasMore(offset + fetchedLists.length < data.total);
                } else {
                    setHasMore(fetchedLists.length === LIMIT);
                }

            } else {
                if (!isLoadMore) setLists(getExtendedMockLists());
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch lists:', error);
            if (!isLoadMore) setLists(getExtendedMockLists());
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        setPage(0);
        fetchLists(0, false);
    }, [fetchLists]);

    // Load more handler
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLists(nextPage, true);
    };

    // Extended mock lists
    function getExtendedMockLists() {
        return [
            ...mockLists,
            {
                id: 'list4',
                name: 'Yaz Hitleri 2024',
                description: 'Bu yazın en çok dinlenen şarkıları',
                user: { name: 'summerview', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=summerview' },
                tracks: mockTracks.slice(2, 7),
                likes: 892,
                createdAt: '2024-06-01'
            },
            {
                id: 'list5',
                name: 'Retro Klasikler',
                description: '80ler ve 90lardan unutulmaz parçalar',
                user: { name: 'retrowave', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retrowave' },
                tracks: mockTracks.slice(0, 5),
                likes: 445,
                createdAt: '2024-02-28'
            },
            {
                id: 'list6',
                name: 'Akustik Seçmeler',
                description: 'Sakin ve huzurlu akustik versiyonlar',
                user: { name: 'acoustic_soul', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=acoustic_soul' },
                tracks: mockTracks.slice(4, 10),
                likes: 678,
                createdAt: '2024-03-15'
            }
        ];
    }

    const filteredLists = lists.filter(list =>
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCreateList = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/lists' } } });
            return;
        }
        openModal(CreateListModal);
    };

    return (
        <div className="lists-page">
            {/* Header */}
            <header className="lists-header">
                <div className="container">
                    <motion.div
                        className="lists-hero"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="lists-title">Listeler</h1>
                        <p className="lists-subtitle">
                            Topluluk tarafından oluşturulan müzik listeleri
                        </p>
                    </motion.div>

                    <motion.div
                        className="lists-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Search */}
                        <div className="lists-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Liste ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Create Button */}
                        <button className="btn btn-primary" onClick={handleCreateList}>
                            <Plus size={18} />
                            Yeni Liste Oluştur
                        </button>
                    </motion.div>

                    {/* Tabs */}
                    <div className="lists-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`lists-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="lists-main container">
                {isLoading ? (
                    <div className="lists-loading">
                        <div className="loader-vinyl">
                            <div className="vinyl-disc spinning">
                                <div className="vinyl-label"></div>
                            </div>
                        </div>
                        <p>Listeler yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        <div className="lists-grid">
                            {filteredLists.map((list, index) => (
                                <motion.article
                                    key={list.id}
                                    className="list-card-large glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Link to={`/list/${list.id}`} className="list-card-link">
                                        {/* Cover Mosaic */}
                                        <div className="list-mosaic">
                                            {list.tracks && list.tracks.length > 0 ? (
                                                list.tracks.slice(0, 4).map((track, i) => (
                                                    <img
                                                        key={track.id || i}
                                                        src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                                                        alt=""
                                                        className="mosaic-image"
                                                    />
                                                ))
                                            ) : (
                                                <div className="mosaic-placeholder">
                                                    <Music size={48} />
                                                </div>
                                            )}
                                            <div className="mosaic-overlay">
                                                <span className="track-count">
                                                    {list.tracksCount || list.tracks?.length || 0} şarkı
                                                </span>
                                            </div>
                                        </div>

                                        {/* List Info */}
                                        <div className="list-card-content">
                                            <h3 className="list-card-title">{list.name}</h3>
                                            <p className="list-card-description">{list.description}</p>

                                            <div className="list-card-footer">
                                                <div className="list-creator">
                                                    <img src={list.user.avatar} alt={list.user.name} />
                                                    <span>{list.user.name}</span>
                                                </div>

                                                <div className="list-stats">
                                                    <span className="list-likes">
                                                        <Heart size={14} />
                                                        {list.likes}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {!searchQuery && hasMore && (
                            <div className="load-more-container">
                                <button
                                    className="btn btn-secondary btn-load-more"
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? 'Yükleniyor...' : (
                                        <>
                                            Daha Fazla Göster
                                            <ChevronDown size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!isLoading && filteredLists.length === 0 && (
                    <div className="no-lists">
                        <Search size={48} />
                        <h3>Liste bulunamadı</h3>
                        <p>Farklı anahtar kelimeler deneyin veya yeni bir liste oluşturun.</p>
                        <button className="btn btn-primary" onClick={handleCreateList}>
                            <Plus size={18} />
                            İlk Listeyi Oluştur
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
