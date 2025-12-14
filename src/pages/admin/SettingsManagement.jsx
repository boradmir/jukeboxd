import { useState } from 'react';
import { Save, Globe, Bell, Shield, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function SettingsManagement() {
    const { authFetch } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Settings state
    const [settings, setSettings] = useState({
        siteName: 'Jukeboxd',
        siteDescription: 'Müzik tutkunları için sosyal platform',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        defaultUserRole: 'user',
        maxPlaylistsPerUser: 50,
        maxTracksPerPlaylist: 200,
        enableNotifications: true,
        enableEmailNotifications: true
    });

    const tabs = [
        { id: 'general', label: 'Genel', icon: Globe },
        { id: 'users', label: 'Kullanıcılar', icon: Shield },
        { id: 'notifications', label: 'Bildirimler', icon: Bell }
    ];

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authFetch('/api/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
            } else {
                throw new Error('Ayarlar kaydedilemedi');
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="admin-settings">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Site Ayarları</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={16} />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="settings-layout">
                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h3 className="section-title">Genel Ayarlar</h3>

                            <div className="form-group">
                                <label>Site Adı</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => handleChange('siteName', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Site Açıklaması</label>
                                <textarea
                                    value={settings.siteDescription}
                                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label className="toggle-label">
                                    <span>Bakım Modu</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    />
                                </label>
                                <span className="form-hint">Aktifken sadece adminler siteye erişebilir</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="settings-section">
                            <h3 className="section-title">Kullanıcı Ayarları</h3>

                            <div className="form-group">
                                <label className="toggle-label">
                                    <span>Kayıt İzni</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.allowRegistration}
                                        onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                                    />
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="toggle-label">
                                    <span>E-posta Doğrulama Zorunlu</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.requireEmailVerification}
                                        onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                                    />
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Kullanıcı Başına Maks. Liste</label>
                                <input
                                    type="number"
                                    value={settings.maxPlaylistsPerUser}
                                    onChange={(e) => handleChange('maxPlaylistsPerUser', parseInt(e.target.value))}
                                    min={1}
                                    max={500}
                                />
                            </div>

                            <div className="form-group">
                                <label>Liste Başına Maks. Şarkı</label>
                                <input
                                    type="number"
                                    value={settings.maxTracksPerPlaylist}
                                    onChange={(e) => handleChange('maxTracksPerPlaylist', parseInt(e.target.value))}
                                    min={1}
                                    max={1000}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3 className="section-title">Bildirim Ayarları</h3>

                            <div className="form-group">
                                <label className="toggle-label">
                                    <span>Uygulama Bildirimleri</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableNotifications}
                                        onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                                    />
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="toggle-label">
                                    <span>E-posta Bildirimleri</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableEmailNotifications}
                                        onChange={(e) => handleChange('enableEmailNotifications', e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-layout {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: var(--space-6);
                }

                .settings-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .settings-tab {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3) var(--space-4);
                    font-family: var(--font-family);
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    text-align: left;
                }

                .settings-tab:hover {
                    color: var(--color-text-primary);
                    background: var(--color-bg-tertiary);
                }

                .settings-tab.active {
                    color: var(--color-bg-primary);
                    background: var(--color-accent-gradient);
                }

                .settings-content {
                    background: var(--color-bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-lg);
                    padding: var(--space-6);
                }

                .settings-section .section-title {
                    font-size: var(--font-size-lg);
                    font-weight: var(--font-weight-semibold);
                    margin-bottom: var(--space-5);
                }

                .form-group {
                    margin-bottom: var(--space-4);
                }

                .form-group label {
                    display: block;
                    font-size: var(--font-size-sm);
                    font-weight: var(--font-weight-medium);
                    color: var(--color-text-secondary);
                    margin-bottom: var(--space-2);
                }

                .form-group input[type="text"],
                .form-group input[type="number"],
                .form-group textarea {
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    font-family: var(--font-family);
                    font-size: var(--font-size-base);
                    color: var(--color-text-primary);
                    background: var(--color-bg-tertiary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    outline: none;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--color-accent-primary);
                }

                .toggle-label {
                    display: flex !important;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }

                .toggle-label input[type="checkbox"] {
                    width: 40px;
                    height: 20px;
                    accent-color: var(--color-accent-primary);
                }

                .form-hint {
                    display: block;
                    font-size: var(--font-size-xs);
                    color: var(--color-text-tertiary);
                    margin-top: var(--space-1);
                }

                .admin-message {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-4);
                }

                .admin-message.success {
                    background: rgba(0, 230, 118, 0.1);
                    color: var(--color-success);
                    border: 1px solid rgba(0, 230, 118, 0.2);
                }

                .admin-message.error {
                    background: rgba(255, 82, 82, 0.1);
                    color: var(--color-error);
                    border: 1px solid rgba(255, 82, 82, 0.2);
                }

                @media (max-width: 768px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }

                    .settings-tabs {
                        flex-direction: row;
                        overflow-x: auto;
                        padding-bottom: var(--space-2);
                    }

                    .settings-tab {
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
}
