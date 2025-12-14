import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music, User, Heart, ChevronRight, ChevronLeft,
    Check, Sparkles, Upload, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './OnboardingModal.css';

const GENRES = [
    { id: 'pop', label: 'Pop', emoji: '🎤' },
    { id: 'rock', label: 'Rock', emoji: '🎸' },
    { id: 'hiphop', label: 'Hip Hop', emoji: '🎤' },
    { id: 'electronic', label: 'Electronic', emoji: '🎧' },
    { id: 'jazz', label: 'Jazz', emoji: '🎷' },
    { id: 'classical', label: 'Klasik', emoji: '🎻' },
    { id: 'rnb', label: 'R&B', emoji: '🎹' },
    { id: 'metal', label: 'Metal', emoji: '🤘' },
    { id: 'indie', label: 'Indie', emoji: '🎵' },
    { id: 'folk', label: 'Folk', emoji: '🪕' },
    { id: 'country', label: 'Country', emoji: '🤠' },
    { id: 'reggae', label: 'Reggae', emoji: '🏝️' },
];

const STEPS = [
    { id: 'welcome', title: 'Hoş Geldin!', icon: Sparkles },
    { id: 'profile', title: 'Profil Bilgileri', icon: User },
    { id: 'genres', title: 'Müzik Tercihleri', icon: Heart },
    { id: 'complete', title: 'Tamamlandı', icon: Check },
];

export default function OnboardingModal({ isOpen, onComplete }) {
    const { user, authFetch } = useAuth();
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState(user?.display_name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const handleNext = async () => {
        if (step === 1) {
            // Save profile info
            setIsLoading(true);
            try {
                await authFetch('/api/users/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ display_name: displayName, bio })
                });
            } catch (error) {
                console.error('Profile update error:', error);
            }
            setIsLoading(false);
        }

        if (step === 2) {
            // Save genre preferences
            setIsLoading(true);
            try {
                await authFetch('/api/users/preferences', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ genres: selectedGenres })
                });
            } catch (error) {
                console.error('Preferences update error:', error);
            }
            setIsLoading(false);
        }

        if (step < STEPS.length - 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    if (!isOpen) return null;

    const currentStep = STEPS[step];
    const StepIcon = currentStep.icon;

    return (
        <AnimatePresence>
            <motion.div
                className="onboarding-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="onboarding-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    {/* Skip button */}
                    <button className="onboarding-skip" onClick={handleSkip}>
                        Atla
                    </button>

                    {/* Progress */}
                    <div className="onboarding-progress">
                        {STEPS.map((s, idx) => (
                            <div
                                key={s.id}
                                className={`progress-step ${idx <= step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}
                            >
                                <div className="progress-dot">
                                    {idx < step ? <Check size={12} /> : idx + 1}
                                </div>
                            </div>
                        ))}
                        <div className="progress-line">
                            <div
                                className="progress-fill"
                                style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="onboarding-content">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Step 0: Welcome */}
                                {step === 0 && (
                                    <div className="onboarding-step step-welcome">
                                        <div className="welcome-icon">
                                            <Music size={48} />
                                        </div>
                                        <h2>Jukeboxd'a Hoş Geldin! 🎵</h2>
                                        <p>
                                            Müzik keşfetmenin yeni yolu burada başlıyor.
                                            Birkaç adımda profilini oluştur ve topluluğa katıl.
                                        </p>
                                        <div className="welcome-features">
                                            <div className="feature">
                                                <span className="feature-icon">⭐</span>
                                                <span>Şarkıları puanla</span>
                                            </div>
                                            <div className="feature">
                                                <span className="feature-icon">📝</span>
                                                <span>İnceleme yaz</span>
                                            </div>
                                            <div className="feature">
                                                <span className="feature-icon">📋</span>
                                                <span>Listeler oluştur</span>
                                            </div>
                                            <div className="feature">
                                                <span className="feature-icon">👥</span>
                                                <span>Arkadaşlarını takip et</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Profile */}
                                {step === 1 && (
                                    <div className="onboarding-step step-profile">
                                        <div className="step-header">
                                            <div className="step-icon">
                                                <User size={24} />
                                            </div>
                                            <h2>Profilini Oluştur</h2>
                                            <p>Kendini tanıt, topluluğa katıl</p>
                                        </div>

                                        <div className="profile-fields">
                                            <div className="field-group">
                                                <label>Görünen Ad</label>
                                                <input
                                                    type="text"
                                                    className="onboarding-input"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="Adın veya takma adın"
                                                    maxLength={50}
                                                />
                                            </div>
                                            <div className="field-group">
                                                <label>Hakkında</label>
                                                <textarea
                                                    className="onboarding-input onboarding-textarea"
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    placeholder="Müzik zevkinden bahset..."
                                                    rows={3}
                                                    maxLength={200}
                                                />
                                                <span className="char-count">{bio.length}/200</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Genre Preferences */}
                                {step === 2 && (
                                    <div className="onboarding-step step-genres">
                                        <div className="step-header">
                                            <div className="step-icon">
                                                <Heart size={24} />
                                            </div>
                                            <h2>Müzik Zevkin</h2>
                                            <p>En az 3 tür seç</p>
                                        </div>

                                        <div className="genre-grid">
                                            {GENRES.map(genre => (
                                                <button
                                                    key={genre.id}
                                                    className={`genre-chip ${selectedGenres.includes(genre.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleGenre(genre.id)}
                                                >
                                                    <span className="genre-emoji">{genre.emoji}</span>
                                                    <span>{genre.label}</span>
                                                    {selectedGenres.includes(genre.id) && (
                                                        <Check size={14} className="genre-check" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <p className="genre-count">
                                            {selectedGenres.length} tür seçildi
                                        </p>
                                    </div>
                                )}

                                {/* Step 3: Complete */}
                                {step === 3 && (
                                    <div className="onboarding-step step-complete">
                                        <div className="complete-icon">
                                            <Sparkles size={48} />
                                        </div>
                                        <h2>Hazırsın! 🎉</h2>
                                        <p>
                                            Profilin oluşturuldu. Artık müzik keşfetmeye ve
                                            puanlama yapmaya başlayabilirsin.
                                        </p>

                                        <div className="complete-summary">
                                            <div className="summary-item">
                                                <User size={16} />
                                                <span>{displayName || user?.username}</span>
                                            </div>
                                            {selectedGenres.length > 0 && (
                                                <div className="summary-item">
                                                    <Heart size={16} />
                                                    <span>{selectedGenres.length} tür seçildi</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="onboarding-footer">
                        {step > 0 && step < STEPS.length - 1 && (
                            <button
                                className="btn btn-secondary"
                                onClick={handleBack}
                            >
                                <ChevronLeft size={16} />
                                Geri
                            </button>
                        )}

                        <div className="footer-spacer" />

                        {step < STEPS.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={isLoading || (step === 2 && selectedGenres.length < 3)}
                            >
                                {isLoading ? 'Kaydediliyor...' : (
                                    <>
                                        {step === 0 ? 'Başla' : 'Devam'}
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleComplete}
                            >
                                Keşfetmeye Başla
                                <Sparkles size={16} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
