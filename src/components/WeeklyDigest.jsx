import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Bell, BellOff, Calendar, Music, Users,
    TrendingUp, Sparkles, Check, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './WeeklyDigest.css';

// Weekly Digest Settings Card
export default function WeeklyDigestSettings({ className = '' }) {
    const { user, authFetch } = useAuth();
    const { success, error: showError } = useToast();
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        top_songs: true,
        friend_activity: true,
        recommendations: true,
        new_followers: true
    });

    useEffect(() => {
        if (user) {
            loadSettings();
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const response = await authFetch('/api/users/digest-settings');
            if (response.ok) {
                const data = await response.json();
                setEnabled(data.enabled ?? true);
                setPreferences(data.preferences || preferences);
            }
        } catch (err) {
            // Use defaults
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            const response = await authFetch('/api/users/digest-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled, preferences })
            });
            if (response.ok) {
                success('Bildirim ayarları güncellendi');
            } else {
                showError('Ayarlar kaydedilemedi');
            }
        } catch (err) {
            showError('Bir hata oluştu');
        }
        setLoading(false);
    };

    const togglePreference = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const preferenceItems = [
        { key: 'top_songs', icon: TrendingUp, label: 'Haftanın En Çok Dinlenenleri' },
        { key: 'friend_activity', icon: Users, label: 'Arkadaş Aktiviteleri' },
        { key: 'recommendations', icon: Sparkles, label: 'Kişiselleştirilmiş Öneriler' },
        { key: 'new_followers', icon: Users, label: 'Yeni Takipçiler' }
    ];

    return (
        <motion.div
            className={`digest-settings ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="digest-header">
                <div className="digest-icon">
                    <Mail size={24} />
                </div>
                <div className="digest-title">
                    <h3>Haftalık Özet</h3>
                    <p>Her Pazartesi e-posta ile haftalık özetini al</p>
                </div>
            </div>

            {/* Main Toggle */}
            <div className="digest-toggle-main">
                <div className="toggle-info">
                    {enabled ? <Bell size={20} /> : <BellOff size={20} />}
                    <span>Haftalık Özet E-postaları</span>
                </div>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>

            {/* Preferences */}
            {enabled && (
                <motion.div
                    className="digest-preferences"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <span className="preferences-label">Özete dahil et:</span>
                    {preferenceItems.map((item) => (
                        <label key={item.key} className="preference-item">
                            <div className="preference-info">
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences[item.key]}
                                onChange={() => togglePreference(item.key)}
                                className="preference-checkbox"
                            />
                        </label>
                    ))}
                </motion.div>
            )}

            {/* Save Button */}
            <button
                className="digest-save-btn"
                onClick={saveSettings}
                disabled={loading}
            >
                {loading ? 'Kaydediliyor...' : (
                    <>
                        <Check size={16} />
                        Kaydet
                    </>
                )}
            </button>

            {/* Preview */}
            <details className="digest-preview">
                <summary>
                    Özet Önizleme
                    <ChevronRight size={16} className="preview-arrow" />
                </summary>
                <div className="preview-content">
                    <DigestPreview preferences={preferences} />
                </div>
            </details>
        </motion.div>
    );
}

// Email Digest Preview Component
function DigestPreview({ preferences }) {
    const mockData = {
        topSongs: [
            { name: 'Blinding Lights', artist: 'The Weeknd', plays: 1247 },
            { name: 'Levitating', artist: 'Dua Lipa', plays: 982 },
            { name: 'Save Your Tears', artist: 'The Weeknd', plays: 876 }
        ],
        friendActivity: [
            { user: 'musiclover123', action: '5 yeni şarkı puanladı' },
            { user: 'djmaster', action: 'yeni liste oluşturdu' }
        ],
        newFollowers: 3,
        recommendations: ['As It Was - Harry Styles', 'Heat Waves - Glass Animals']
    };

    return (
        <div className="digest-email-preview">
            <div className="email-header">
                <img src="/vinyl.svg" alt="Jukeboxd" className="email-logo" />
                <h4>Haftalık Özet</h4>
                <span className="email-date">12-18 Aralık 2024</span>
            </div>

            {preferences.top_songs && (
                <div className="email-section">
                    <div className="section-title">
                        <TrendingUp size={16} />
                        Bu Hafta En Çok Dinlenenler
                    </div>
                    <ul className="top-songs-list">
                        {mockData.topSongs.map((song, i) => (
                            <li key={i}>
                                <span className="song-rank">#{i + 1}</span>
                                <span className="song-name">{song.name}</span>
                                <span className="song-artist">{song.artist}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {preferences.friend_activity && (
                <div className="email-section">
                    <div className="section-title">
                        <Users size={16} />
                        Arkadaşlarından
                    </div>
                    <ul className="activity-list">
                        {mockData.friendActivity.map((item, i) => (
                            <li key={i}>
                                <strong>@{item.user}</strong> {item.action}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {preferences.new_followers && mockData.newFollowers > 0 && (
                <div className="email-section">
                    <div className="section-title">
                        <Sparkles size={16} />
                        Yeni Takipçiler
                    </div>
                    <p>{mockData.newFollowers} yeni kişi seni takip etmeye başladı!</p>
                </div>
            )}

            {preferences.recommendations && (
                <div className="email-section">
                    <div className="section-title">
                        <Music size={16} />
                        Sana Özel Öneriler
                    </div>
                    <ul className="recommendations-list">
                        {mockData.recommendations.map((song, i) => (
                            <li key={i}>🎵 {song}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="email-footer">
                <p>Jukeboxd - Müziğini Keşfet, Puanla ve Paylaş</p>
            </div>
        </div>
    );
}

export { WeeklyDigestSettings };
