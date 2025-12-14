import { useState } from 'react';
import { Plus, Check, ListMusic, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export default function AddToListModal({ track, closeModal }) {
    const { isAuthenticated, authFetch } = useAuth();
    const { userLists, createList, addToList } = useUser();
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [addedTo, setAddedTo] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToList = async (listId) => {
        setIsLoading(true);
        try {
            // Add to local context
            addToList(listId, track);

            // If authenticated, also save to server
            if (isAuthenticated) {
                await authFetch(`/api/playlists/${listId}/tracks`, {
                    method: 'POST',
                    body: JSON.stringify({
                        trackId: track.id,
                        trackName: track.name,
                        artistName: track.artists?.map(a => a.name).join(', '),
                        albumImage: track.album?.images?.[0]?.url,
                        durationMs: track.duration_ms
                    })
                });
            }

            setAddedTo(prev => new Set(prev).add(listId));
        } catch (error) {
            console.error('Failed to add to list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateList = () => {
        if (!newListName.trim()) return;

        const newList = createList(newListName.trim());
        handleAddToList(newList.id);
        setNewListName('');
        setIsCreating(false);
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">Listeye Ekle</h2>
            </div>

            {/* Track Preview */}
            <div className="modal-track-preview">
                <img
                    src={track.album?.images?.[0]?.url || '/vinyl.svg'}
                    alt={track.name}
                />
                <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">
                        {track.artists?.map(a => a.name).join(', ')}
                    </div>
                </div>
            </div>

            <div className="modal-body">
                {/* Create New List */}
                {isCreating ? (
                    <div className="create-list-form">
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Liste adı..."
                            autoFocus
                        />
                        <div className="create-list-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setIsCreating(false)}
                            >
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateList}
                                disabled={!newListName.trim()}
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="create-list-btn"
                        onClick={() => setIsCreating(true)}
                    >
                        <Plus size={20} />
                        Yeni Liste Oluştur
                    </button>
                )}

                {/* User's Lists */}
                <div className="lists-selector">
                    {userLists.length === 0 ? (
                        <p className="no-lists-message">
                            Henüz listeniz yok. Yeni bir liste oluşturun!
                        </p>
                    ) : (
                        userLists.map(list => {
                            const isAdded = addedTo.has(list.id) || list.tracks.some(t => t.id === track.id);

                            return (
                                <button
                                    key={list.id}
                                    className={`list-item ${isAdded ? 'added' : ''}`}
                                    onClick={() => !isAdded && handleAddToList(list.id)}
                                    disabled={isAdded || isLoading}
                                >
                                    <ListMusic size={18} />
                                    <span className="list-name">{list.name}</span>
                                    <span className="list-count">{list.tracks.length} şarkı</span>
                                    {isAdded && <Check size={18} className="added-icon" />}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                    Kapat
                </button>
            </div>

            <style>{`
        .create-list-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--color-bg-tertiary);
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-bottom: var(--space-4);
        }
        
        .create-list-btn:hover {
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }
        
        .create-list-form {
          margin-bottom: var(--space-4);
        }
        
        .create-list-form input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--color-bg-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-family);
          font-size: var(--font-size-base);
          outline: none;
          margin-bottom: var(--space-3);
        }
        
        .create-list-form input:focus {
          border-color: var(--color-accent-primary);
        }
        
        .create-list-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
        }
        
        .lists-selector {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          max-height: 300px;
          overflow-y: auto;
        }
        
        .list-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-bg-tertiary);
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        
        .list-item:hover:not(:disabled) {
          border-color: var(--color-accent-primary);
        }
        
        .list-item.added {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
        }
        
        .list-item .list-name {
          flex: 1;
        }
        
        .list-item .list-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }
        
        .list-item .added-icon {
          color: var(--color-success);
        }
        
        .no-lists-message {
          text-align: center;
          color: var(--color-text-tertiary);
          padding: var(--space-6);
        }
      `}</style>
        </div>
    );
}
