import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export default function CreateListModal({ closeModal }) {
    const navigate = useNavigate();
    const { isAuthenticated, authFetch } = useAuth();
    const { createList } = useUser();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 2) {
            setError('Liste adı en az 2 karakter olmalı');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create in local context
            const newList = createList(name.trim(), description.trim());

            // If authenticated, also save to server
            if (isAuthenticated) {
                const response = await authFetch('/api/playlists', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                        isPublic
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Liste oluşturulamadı');
                }
            }

            closeModal();
            navigate(`/list/${newList.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">Yeni Liste Oluştur</h2>
                <p className="modal-subtitle">En sevdiğin şarkıları bir araya getir</p>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
                {/* List Name */}
                <div className="form-group">
                    <label htmlFor="list-name">Liste Adı</label>
                    <input
                        type="text"
                        id="list-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Örn: Yaz Playlistim"
                        required
                        minLength={2}
                        maxLength={100}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="list-description">Açıklama (opsiyonel)</label>
                    <textarea
                        id="list-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Bu liste hakkında kısa bir açıklama..."
                        rows={3}
                        maxLength={500}
                    />
                </div>

                {/* Privacy */}
                <div className="form-group">
                    <label>Gizlilik</label>
                    <div className="privacy-options">
                        <button
                            type="button"
                            className={`privacy-option ${isPublic ? 'active' : ''}`}
                            onClick={() => setIsPublic(true)}
                        >
                            <Globe size={18} />
                            <span>Herkese Açık</span>
                        </button>
                        <button
                            type="button"
                            className={`privacy-option ${!isPublic ? 'active' : ''}`}
                            onClick={() => setIsPublic(false)}
                        >
                            <Lock size={18} />
                            <span>Gizli</span>
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="form-error">{error}</div>
                )}

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModal}
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading || name.trim().length < 2}
                    >
                        {isLoading ? 'Oluşturuluyor...' : 'Liste Oluştur'}
                    </button>
                </div>
            </form>

            <style>{`
        .privacy-options {
          display: flex;
          gap: var(--space-3);
        }
        
        .privacy-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          background: var(--color-bg-tertiary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .privacy-option:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .privacy-option.active {
          color: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          background: rgba(0, 212, 255, 0.1);
        }
        
        .form-error {
          color: var(--color-error);
          font-size: var(--font-size-sm);
          padding: var(--space-2) var(--space-3);
          background: rgba(255, 82, 82, 0.1);
          border-radius: var(--radius-sm);
        }
      `}</style>
        </div>
    );
}
