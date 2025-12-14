import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, X, Music, Disc, Users as UsersIcon } from 'lucide-react';
import SongCard from '../components/SongCard';
import { mockTracks } from '../data/mockData';
import { searchSpotify, isSpotifyConfigured } from '../services/spotify';
import './Discover.css';

export default function Discover() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchType, setSearchType] = useState('track');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [tracks, setTracks] = useState(mockTracks);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const genres = [
        'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz',
        'Classical', 'Country', 'Latin', 'Metal', 'Indie', 'Folk'
    ];

    const decades = ['2020s', '2010s', '2000s', '90s', '80s', '70s'];

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedDecade, setSelectedDecade] = useState(null);

    useEffect(() => {
        async function performSearch() {
            if (!searchQuery.trim()) {
                setTracks(mockTracks);
                return;
            }

            setIsLoading(true);

            if (isSpotifyConfigured()) {
                try {
                    const result = await searchSpotify(searchQuery, searchType, 24);
                    if (result?.tracks?.items) {
                        setTracks(result.tracks.items);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    // Fallback to mock filtering
                    filterMockTracks();
                }
            } else {
                filterMockTracks();
            }

            setIsLoading(false);
        }

        function filterMockTracks() {
            const filtered = mockTracks.filter(track =>
                track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.artists?.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setTracks(filtered.length > 0 ? filtered : mockTracks);
        }

        const debounce = setTimeout(performSearch, 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, searchType]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery });
        }
    };

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedDecade(null);
        setSearchQuery('');
        setSearchParams({});
    };

    return (
        <div className="discover-page">
            {/* Header */}
            <header className="discover-header">
                <div className="container">
                    <motion.div
                        className="discover-hero"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="discover-title">
                            <Disc className="title-icon" />
                            Keşfet
                        </h1>
                        <p className="discover-subtitle">
                            Milyonlarca şarkı arasından favorilerini bul
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.form
                        className="discover-search"
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Şarkı, sanatçı veya albüm ara..."
                                className="discover-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Search Type Tabs */}
                        <div className="search-type-tabs">
                            <button
                                type="button"
                                className={`type-tab ${searchType === 'track' ? 'active' : ''}`}
                                onClick={() => setSearchType('track')}
                            >
                                <Music size={16} />
                                Şarkılar
                            </button>
                            <button
                                type="button"
                                className={`type-tab ${searchType === 'album' ? 'active' : ''}`}
                                onClick={() => setSearchType('album')}
                            >
                                <Disc size={16} />
                                Albümler
                            </button>
                            <button
                                type="button"
                                className={`type-tab ${searchType === 'artist' ? 'active' : ''}`}
                                onClick={() => setSearchType('artist')}
                            >
                                <UsersIcon size={16} />
                                Sanatçılar
                            </button>
                        </div>
                    </motion.form>
                </div>
            </header>

            {/* Main Content */}
            <main className="discover-main container">
                {/* Toolbar */}
                <div className="discover-toolbar">
                    <div className="toolbar-left">
                        <button
                            className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} />
                            Filtreler
                            {(selectedGenres.length > 0 || selectedDecade) && (
                                <span className="filter-count">
                                    {selectedGenres.length + (selectedDecade ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {(selectedGenres.length > 0 || selectedDecade) && (
                            <button className="btn btn-ghost" onClick={clearFilters}>
                                <X size={16} />
                                Temizle
                            </button>
                        )}
                    </div>

                    <div className="toolbar-right">
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="popular">En Popüler</option>
                            <option value="new">En Yeni</option>
                            <option value="rating">En Yüksek Puan</option>
                            <option value="name">İsme Göre (A-Z)</option>
                        </select>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid görünümü"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                aria-label="Liste görünümü"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        className="filters-panel glass-card"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="filter-group">
                            <h3 className="filter-title">Tür</h3>
                            <div className="filter-chips">
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        className={`filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                                        onClick={() => toggleGenre(genre)}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3 className="filter-title">Dönem</h3>
                            <div className="filter-chips">
                                {decades.map(decade => (
                                    <button
                                        key={decade}
                                        className={`filter-chip ${selectedDecade === decade ? 'active' : ''}`}
                                        onClick={() => setSelectedDecade(selectedDecade === decade ? null : decade)}
                                    >
                                        {decade}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                <div className="discover-results">
                    {isLoading ? (
                        <div className="results-loading">
                            <div className="loading-vinyl vinyl-spin">
                                <Disc size={48} />
                            </div>
                            <p>Şarkılar aranıyor...</p>
                        </div>
                    ) : tracks.length > 0 ? (
                        <>
                            <p className="results-count">
                                {tracks.length} sonuç bulundu
                                {searchQuery && ` "${searchQuery}" için`}
                            </p>

                            <div className={viewMode === 'grid' ? 'grid-songs' : 'list-view'}>
                                {tracks.map((track, index) => (
                                    <SongCard
                                        key={track.id}
                                        track={track}
                                        index={index}
                                        showActions={viewMode === 'grid'}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-results">
                            <img src="/no-results.svg" alt="Sonuç bulunamadı" className="no-results-illustration" />
                            <h3>Sonuç Bulunamadı</h3>
                            <p>Farklı anahtar kelimeler deneyin veya filtreleri temizleyin.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
