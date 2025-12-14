import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Lock, Bell, Palette, Globe,
    Shield, Trash2, LogOut, Save, AlertCircle, Gift
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReferralCard from '../components/ReferralCard';
import WeeklyDigestSettings from '../components/WeeklyDigest';
import './Settings.css';

export default function Settings() {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateProfile, logout } = useAuth();

    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Form states
    const [displayName, setDisplayName] = useState(user?.display_name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [email, setEmail] = useState(user?.email || '');

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/settings' } } });
        return null;
    }

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'account', label: 'Hesap', icon: Lock },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'referrals', label: 'Davetler', icon: Gift },
        { id: 'appearance', label: 'Görünüm', icon: Palette },
        { id: 'privacy', label: 'Gizlilik', icon: Shield },
    ];

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile({ displayName, bio });
            setSuccess('Profil güncellendi!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="settings-page">
            <div className="container">
                <motion.div
                    className="settings-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="settings-title">Ayarlar</h1>
                </motion.div>

                <div className="settings-layout">
                    {/* Sidebar */}
                    <aside className="settings-sidebar">
                        <nav className="settings-nav">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="settings-sidebar-footer">
                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={18} />
                                Çıkış Yap
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="settings-content">
                        {activeTab === 'profile' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Profil Bilgileri</h2>

                                {success && (
                                    <div className="alert alert-success">{success}</div>
                                )}
                                {error && (
                                    <div className="alert alert-error">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile}>
                                    <div className="form-group">
                                        <label>Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            value={user?.username}
                                            disabled
                                        />
                                        <span className="form-hint">Kullanıcı adı değiştirilemez</span>
                                    </div>

                                    <div className="form-group">
                                        <label>Görünen İsim</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Adınız Soyadınız"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Biyografi</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Kendiniz hakkında birkaç şey..."
                                            rows={4}
                                            maxLength={500}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        <Save size={16} />
                                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'account' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Hesap Ayarları</h2>

                                <div className="form-group">
                                    <label>E-posta</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <h3 className="subsection-title">Şifre Değiştir</h3>

                                <div className="form-group">
                                    <label>Mevcut Şifre</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>

                                <div className="form-group">
                                    <label>Yeni Şifre</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>

                                <div className="form-group">
                                    <label>Yeni Şifre (Tekrar)</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>

                                <button className="btn btn-primary">
                                    <Save size={16} />
                                    Kaydet
                                </button>

                                <div className="danger-zone">
                                    <h3 className="danger-title">Tehlikeli Bölge</h3>
                                    <p>Hesabınızı silmek geri alınamaz bir işlemdir.</p>
                                    <button className="btn btn-danger">
                                        <Trash2 size={16} />
                                        Hesabı Sil
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Bildirim Ayarları</h2>

                                <div className="toggle-group">
                                    <label className="toggle-label">
                                        <span>E-posta Bildirimleri</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Yeni Takipçi</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Yorum Beğenileri</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Liste Beğenileri</span>
                                        <input type="checkbox" />
                                    </label>
                                </div>

                                {/* Weekly Digest Section */}
                                <div className="settings-divider" />
                                <WeeklyDigestSettings />
                            </motion.div>
                        )}

                        {activeTab === 'referrals' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Arkadaşlarını Davet Et</h2>
                                <p className="section-description">
                                    Arkadaşlarını Jukeboxd'a davet et ve Gold üeyelik kazan!
                                </p>
                                <ReferralCard />
                            </motion.div>
                        )}

                        {activeTab === 'appearance' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Görünüm</h2>

                                <div className="form-group">
                                    <label>Tema</label>
                                    <select defaultValue="dark">
                                        <option value="dark">Koyu</option>
                                        <option value="light">Açık</option>
                                        <option value="system">Sistem</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Dil</label>
                                    <select defaultValue="tr">
                                        <option value="tr">Türkçe</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'privacy' && (
                            <motion.div
                                className="settings-section glass-card"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h2 className="section-title">Gizlilik</h2>

                                <div className="toggle-group">
                                    <label className="toggle-label">
                                        <span>Profilimi Herkese Açık Yap</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Puanlamalarımı Göster</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Listelerimi Göster</span>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="toggle-label">
                                        <span>Aktivitelerimi Göster</span>
                                        <input type="checkbox" />
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
