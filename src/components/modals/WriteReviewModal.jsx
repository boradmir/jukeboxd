import { useState } from 'react';
import VinylRating from '../VinylRating';
import { useAuth } from '../../contexts/AuthContext';

export default function WriteReviewModal({ track, closeModal, onSuccess }) {
    const { isAuthenticated, authFetch } = useAuth();
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(0);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (content.trim().length < 10) {
            setError('Yorum en az 10 karakter olmalı');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (isAuthenticated) {
                const response = await authFetch(`/api/tracks/${track.id}/review`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: content.trim(),
                        rating: rating || undefined,
                        trackName: track.name,
                        artistName: track.artists?.map(a => a.name).join(', '),
                        albumImage: track.album?.images?.[0]?.url,
                        isSpoiler
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Yorum gönderilemedi');
                }

                if (onSuccess) {
                    const data = await response.json();
                    onSuccess(data.review);
                }
            }

            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">Yorum Yaz</h2>
                <p className="modal-subtitle">Düşüncelerini paylaş</p>
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

            <form className="modal-form" onSubmit={handleSubmit}>
                {/* Rating */}
                <div className="form-group">
                    <label>Puanın (opsiyonel)</label>
                    <div className="rating-input">
                        <VinylRating
                            rating={rating}
                            size="md"
                            interactive
                            onChange={setRating}
                        />
                        {rating > 0 && (
                            <span className="rating-value">{rating.toFixed(1)}</span>
                        )}
                    </div>
                </div>

                {/* Review Content */}
                <div className="form-group">
                    <label htmlFor="review-content">Yorumun</label>
                    <textarea
                        id="review-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Bu şarkı hakkında ne düşünüyorsun?"
                        rows={5}
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                    <span className="char-count">
                        {content.length} / 2000
                    </span>
                </div>

                {/* Spoiler Toggle */}
                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isSpoiler}
                            onChange={(e) => setIsSpoiler(e.target.checked)}
                        />
                        <span>Spoiler içeriyor</span>
                    </label>
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
                        disabled={isLoading || content.trim().length < 10}
                    >
                        {isLoading ? 'Gönderiliyor...' : 'Yorum Yayınla'}
                    </button>
                </div>
            </form>

            <style>{`
        .rating-input {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        
        .rating-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-accent-primary);
        }
        
        .char-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          text-align: right;
          display: block;
          margin-top: var(--space-1);
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }
        
        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--color-accent-primary);
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
