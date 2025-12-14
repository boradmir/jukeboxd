import { useState, useEffect } from 'react';
import { Search, Globe, Share2, FileText, BarChart3, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SEOManagement() {
    const [settings, setSettings] = useState({
        // Basic SEO
        site_name: 'Jukeboxd',
        site_description: 'Müzik tutkunları için sosyal platform. Şarkılarını keşfet, puanla ve paylaş.',
        site_keywords: 'müzik, şarkı, puanlama, playlist, spotify, letterboxd',
        site_url: 'https://jukeboxd.com',

        // Open Graph
        seo_default_og_image: '/og-image.jpg',
        seo_twitter_handle: '@jukeboxd',

        // Analytics & Verification
        seo_google_analytics_id: '',
        seo_google_search_console: '',
        seo_facebook_pixel_id: '',

        // Robots & Sitemap
        seo_robots_txt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /settings/

Sitemap: https://jukeboxd.com/sitemap.xml`,

        // Advanced
        seo_canonical_url: '',
        seo_noindex_pages: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const { authFetch } = useAuth();
    const { success, error } = useToast();

    const tabs = [
        { id: 'basic', label: 'Temel SEO', icon: Search },
        { id: 'social', label: 'Sosyal Medya', icon: Share2 },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'robots', label: 'Robots & Sitemap', icon: FileText },
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await authFetch('/api/admin/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await authFetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                success('SEO ayarları kaydedildi!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            error('Ayarlar kaydedilemedi');
        }
        setIsSaving(false);
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="loader-vinyl">
                    <div className="vinyl-disc spinning">
                        <div className="vinyl-label"></div>
                    </div>
                </div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">
                        <Globe className="admin-title-icon" />
                        SEO Ayarları
                    </h1>
                    <p className="admin-subtitle">
                        Arama motoru optimizasyonu ve sosyal medya ayarlarını yönetin
                    </p>
                </div>
                <div className="admin-header-actions">
                    <button className="btn btn-secondary" onClick={fetchSettings}>
                        <RefreshCw size={16} />
                        Yenile
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-content glass-card">
                {/* Basic SEO */}
                {activeTab === 'basic' && (
                    <div className="settings-section">
                        <h3 className="settings-section-title">Temel SEO Ayarları</h3>

                        <div className="settings-group">
                            <label className="settings-label">
                                Site Adı
                                <span className="settings-hint">Tarayıcı sekmesinde ve arama sonuçlarında görünür</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.site_name}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                                placeholder="Jukeboxd"
                            />
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Site Açıklaması
                                <span className="settings-hint">Arama sonuçlarında görünen meta description (max 160 karakter)</span>
                            </label>
                            <textarea
                                className="admin-input admin-textarea"
                                value={settings.site_description}
                                onChange={(e) => handleChange('site_description', e.target.value)}
                                placeholder="Müzik tutkunları için sosyal platform..."
                                rows={3}
                                maxLength={160}
                            />
                            <span className="char-count">{settings.site_description?.length || 0}/160</span>
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Anahtar Kelimeler
                                <span className="settings-hint">Virgülle ayırarak yazın</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.site_keywords}
                                onChange={(e) => handleChange('site_keywords', e.target.value)}
                                placeholder="müzik, şarkı, puanlama, playlist"
                            />
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Site URL
                                <span className="settings-hint">Canonical URL için kullanılır</span>
                            </label>
                            <input
                                type="url"
                                className="admin-input"
                                value={settings.site_url}
                                onChange={(e) => handleChange('site_url', e.target.value)}
                                placeholder="https://jukeboxd.com"
                            />
                        </div>
                    </div>
                )}

                {/* Social Media */}
                {activeTab === 'social' && (
                    <div className="settings-section">
                        <h3 className="settings-section-title">Sosyal Medya Paylaşım Ayarları</h3>

                        <div className="seo-preview-card">
                            <h4>Open Graph Önizleme</h4>
                            <div className="og-preview">
                                <div className="og-preview-image">
                                    <img
                                        src={settings.seo_default_og_image || '/og-image.jpg'}
                                        alt="OG Preview"
                                        onError={(e) => e.target.src = '/vinyl.svg'}
                                    />
                                </div>
                                <div className="og-preview-content">
                                    <span className="og-preview-url">{settings.site_url}</span>
                                    <h5 className="og-preview-title">{settings.site_name}</h5>
                                    <p className="og-preview-desc">{settings.site_description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Varsayılan OG Görseli
                                <span className="settings-hint">Sosyal paylaşımlarda kullanılacak görsel (1200x630px önerilir)</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.seo_default_og_image}
                                onChange={(e) => handleChange('seo_default_og_image', e.target.value)}
                                placeholder="/og-image.jpg"
                            />
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Twitter Kullanıcı Adı
                                <span className="settings-hint">@ ile birlikte yazın</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.seo_twitter_handle}
                                onChange={(e) => handleChange('seo_twitter_handle', e.target.value)}
                                placeholder="@jukeboxd"
                            />
                        </div>
                    </div>
                )}

                {/* Analytics */}
                {activeTab === 'analytics' && (
                    <div className="settings-section">
                        <h3 className="settings-section-title">Analytics & Doğrulama</h3>

                        <div className="settings-group">
                            <label className="settings-label">
                                Google Analytics ID
                                <span className="settings-hint">GA4 formatı: G-XXXXXXXXXX</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.seo_google_analytics_id}
                                onChange={(e) => handleChange('seo_google_analytics_id', e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Google Search Console
                                <span className="settings-hint">Doğrulama meta tag içeriği</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.seo_google_search_console}
                                onChange={(e) => handleChange('seo_google_search_console', e.target.value)}
                                placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                            />
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Facebook Pixel ID
                                <span className="settings-hint">Facebook/Meta reklam takibi için</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={settings.seo_facebook_pixel_id}
                                onChange={(e) => handleChange('seo_facebook_pixel_id', e.target.value)}
                                placeholder="XXXXXXXXXXXXXXXX"
                            />
                        </div>

                        <div className="seo-info-box">
                            <h4>📊 Analytics Entegrasyonu</h4>
                            <p>
                                Analytics kodları sayfaya otomatik olarak eklenecektir.
                                Değişikliklerin aktif olması için sayfayı yenilemeniz gerekebilir.
                            </p>
                            <a
                                href="https://analytics.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="seo-external-link"
                            >
                                Google Analytics'e Git <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                )}

                {/* Robots & Sitemap */}
                {activeTab === 'robots' && (
                    <div className="settings-section">
                        <h3 className="settings-section-title">Robots.txt & Sitemap</h3>

                        <div className="settings-group">
                            <label className="settings-label">
                                Robots.txt İçeriği
                                <span className="settings-hint">Arama motoru tarayıcıları için erişim kuralları</span>
                            </label>
                            <textarea
                                className="admin-input admin-textarea admin-code-textarea"
                                value={settings.seo_robots_txt}
                                onChange={(e) => handleChange('seo_robots_txt', e.target.value)}
                                rows={12}
                                spellCheck={false}
                            />
                        </div>

                        <div className="seo-info-box">
                            <h4>🤖 Robots.txt Hakkında</h4>
                            <ul>
                                <li><code>User-agent: *</code> - Tüm arama motorları için geçerli</li>
                                <li><code>Allow: /</code> - Tüm sayfaları indexle</li>
                                <li><code>Disallow: /admin/</code> - Admin sayfalarını indexleme</li>
                                <li><code>Sitemap:</code> - Sitemap konumu</li>
                            </ul>
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">
                                Noindex Sayfalar
                                <span className="settings-hint">İndexlenmemesi gereken sayfa yolları (her satıra bir tane)</span>
                            </label>
                            <textarea
                                className="admin-input admin-textarea"
                                value={settings.seo_noindex_pages}
                                onChange={(e) => handleChange('seo_noindex_pages', e.target.value)}
                                placeholder="/login&#10;/register&#10;/settings"
                                rows={4}
                            />
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-tabs {
                    display: flex;
                    gap: var(--space-2);
                    margin-bottom: var(--space-6);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: var(--space-4);
                }
                
                .admin-tab {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-4);
                    background: transparent;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                }
                
                .admin-tab:hover {
                    background: rgba(255,255,255,0.05);
                    color: var(--color-text-primary);
                }
                
                .admin-tab.active {
                    background: var(--color-accent-primary);
                    color: var(--color-bg-primary);
                }
                
                .settings-section-title {
                    font-size: var(--font-size-lg);
                    margin-bottom: var(--space-6);
                    color: var(--color-text-primary);
                }
                
                .settings-group {
                    margin-bottom: var(--space-6);
                }
                
                .settings-label {
                    display: block;
                    font-weight: var(--font-weight-medium);
                    margin-bottom: var(--space-2);
                    color: var(--color-text-primary);
                }
                
                .settings-hint {
                    display: block;
                    font-size: var(--font-size-xs);
                    color: var(--color-text-tertiary);
                    font-weight: normal;
                    margin-top: var(--space-1);
                }
                
                .admin-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .admin-code-textarea {
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: var(--font-size-sm);
                }
                
                .char-count {
                    display: block;
                    text-align: right;
                    font-size: var(--font-size-xs);
                    color: var(--color-text-tertiary);
                    margin-top: var(--space-1);
                }
                
                .seo-preview-card {
                    background: rgba(0,0,0,0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-6);
                }
                
                .seo-preview-card h4 {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin-bottom: var(--space-3);
                }
                
                .og-preview {
                    background: #242526;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                
                .og-preview-image {
                    aspect-ratio: 1.91 / 1;
                    background: var(--color-bg-tertiary);
                }
                
                .og-preview-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .og-preview-content {
                    padding: var(--space-3);
                }
                
                .og-preview-url {
                    font-size: var(--font-size-xs);
                    color: #606770;
                    text-transform: uppercase;
                }
                
                .og-preview-title {
                    font-size: var(--font-size-base);
                    font-weight: var(--font-weight-semibold);
                    color: #e4e6eb;
                    margin: var(--space-1) 0;
                }
                
                .og-preview-desc {
                    font-size: var(--font-size-sm);
                    color: #b0b3b8;
                    margin: 0;
                }
                
                .seo-info-box {
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    margin-top: var(--space-6);
                }
                
                .seo-info-box h4 {
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--space-2);
                }
                
                .seo-info-box p,
                .seo-info-box ul {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 0;
                }
                
                .seo-info-box ul {
                    padding-left: var(--space-4);
                    margin-top: var(--space-2);
                }
                
                .seo-info-box li {
                    margin-bottom: var(--space-1);
                }
                
                .seo-info-box code {
                    background: rgba(0,0,0,0.3);
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-size-xs);
                }
                
                .seo-external-link {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-1);
                    margin-top: var(--space-3);
                    font-size: var(--font-size-sm);
                    color: var(--color-accent-primary);
                }
            `}</style>
        </div>
    );
}
