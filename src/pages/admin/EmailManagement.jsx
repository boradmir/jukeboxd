import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, FileText, Eye, Save, Edit2, Send,
    Clock, Users, TrendingUp, Sparkles, Bell,
    Check, AlertCircle, RefreshCw, Copy
} from 'lucide-react';
import './EmailManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Default email templates
const DEFAULT_TEMPLATES = {
    weekly_digest: {
        id: 'weekly_digest',
        name: 'Haftalık Özet',
        description: 'Her Pazartesi gönderilen haftalık aktivite özeti',
        subject: 'Jukeboxd Haftalık Özet - {{week_range}}',
        enabled: true,
        schedule: 'Her Pazartesi 09:00',
        variables: ['username', 'week_range', 'top_songs', 'friend_activity', 'new_followers', 'recommendations'],
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #14181c; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e2328; border-radius: 12px; overflow: hidden; }
        .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #00d4ff, #ff6b9d); }
        .logo { width: 60px; height: 60px; }
        .header h1 { margin: 10px 0 5px; font-size: 24px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { display: flex; align-items: center; gap: 8px; color: #00d4ff; font-size: 16px; font-weight: 600; margin-bottom: 15px; }
        .song-item { display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px; }
        .song-rank { font-weight: bold; color: #ff6b9d; margin-right: 12px; }
        .song-info { flex: 1; }
        .song-name { font-weight: 500; }
        .song-artist { font-size: 12px; color: #9ca3af; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00d4ff, #ff6b9d); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="Jukeboxd" class="logo">
            <h1>Haftalık Özet</h1>
            <p>{{week_range}}</p>
        </div>
        <div class="content">
            <p>Merhaba <strong>{{username}}</strong>! 👋</p>
            <p>İşte bu haftaki müzik aktiviten:</p>
            
            {{#if top_songs}}
            <div class="section">
                <div class="section-title">📈 En Çok Dinlenenler</div>
                {{#each top_songs}}
                <div class="song-item">
                    <span class="song-rank">#{{rank}}</span>
                    <div class="song-info">
                        <div class="song-name">{{name}}</div>
                        <div class="song-artist">{{artist}}</div>
                    </div>
                </div>
                {{/each}}
            </div>
            {{/if}}
            
            {{#if friend_activity}}
            <div class="section">
                <div class="section-title">👥 Arkadaşlarından</div>
                {{#each friend_activity}}
                <p>• <strong>@{{user}}</strong> {{action}}</p>
                {{/each}}
            </div>
            {{/if}}
            
            {{#if new_followers}}
            <div class="section">
                <div class="section-title">✨ Yeni Takipçiler</div>
                <p>Bu hafta <strong>{{new_followers}}</strong> yeni kişi seni takip etmeye başladı!</p>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="{{app_url}}" class="btn">Jukeboxd'u Aç</a>
            </div>
        </div>
        <div class="footer">
            <p>Bu e-postayı almak istemiyorsanız <a href="{{unsubscribe_url}}" style="color: #00d4ff;">buradan</a> aboneliğinizi iptal edebilirsiniz.</p>
            <p>© 2024 Jukeboxd. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>`
    },
    welcome: {
        id: 'welcome',
        name: 'Hoş Geldin',
        description: 'Yeni kullanıcılara gönderilen karşılama e-postası',
        subject: 'Jukeboxd\'a Hoş Geldin, {{username}}! 🎵',
        enabled: true,
        schedule: 'Kayıt sonrası anında',
        variables: ['username', 'app_url'],
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #14181c; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e2328; border-radius: 12px; overflow: hidden; }
        .header { text-align: center; padding: 40px; background: linear-gradient(135deg, #00d4ff, #ff6b9d); }
        .content { padding: 30px; text-align: center; }
        .feature { padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border-radius: 8px; }
        .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #00d4ff, #ff6b9d); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🎵 Hoş Geldin!</h1>
        </div>
        <div class="content">
            <h2>Merhaba {{username}}!</h2>
            <p>Jukeboxd ailesine katıldığın için çok mutluyuz.</p>
            
            <div class="feature">🎧 Şarkıları puanla ve incele</div>
            <div class="feature">📝 Listeler oluştur ve paylaş</div>
            <div class="feature">👥 Arkadaşlarınla bağlan</div>
            <div class="feature">🏆 Rozetler kazan</div>
            
            <a href="{{app_url}}" class="btn">Keşfetmeye Başla</a>
        </div>
        <div class="footer">
            <p>© 2024 Jukeboxd. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>`
    },
    password_reset: {
        id: 'password_reset',
        name: 'Şifre Sıfırlama',
        description: 'Şifre sıfırlama talebi e-postası',
        subject: 'Jukeboxd Şifre Sıfırlama',
        enabled: true,
        schedule: 'Talep üzerine anında',
        variables: ['username', 'reset_url', 'expire_time'],
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #14181c; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e2328; border-radius: 12px; overflow: hidden; }
        .header { text-align: center; padding: 30px; background: #2d3748; }
        .content { padding: 30px; text-align: center; }
        .btn { display: inline-block; padding: 14px 28px; background: #00d4ff; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🔐 Şifre Sıfırlama</h1>
        </div>
        <div class="content">
            <p>Merhaba {{username}},</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            
            <a href="{{reset_url}}" class="btn">Şifremi Sıfırla</a>
            
            <div class="warning">
                <p>⚠️ Bu bağlantı {{expire_time}} içinde geçerliliğini yitirecektir.</p>
                <p>Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
        </div>
        <div class="footer">
            <p>© 2024 Jukeboxd. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>`
    },
    new_follower: {
        id: 'new_follower',
        name: 'Yeni Takipçi',
        description: 'Birisi sizi takip ettiğinde gönderilir',
        subject: '{{follower_name}} seni takip etmeye başladı!',
        enabled: true,
        schedule: 'Anlık (veya günlük özet)',
        variables: ['username', 'follower_name', 'follower_avatar', 'follower_url'],
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #14181c; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e2328; border-radius: 12px; overflow: hidden; }
        .content { padding: 30px; text-align: center; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00d4ff, #ff6b9d); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h2>👋 Yeni Takipçi!</h2>
            <img src="{{follower_avatar}}" alt="{{follower_name}}" class="avatar">
            <p><strong>{{follower_name}}</strong> seni takip etmeye başladı.</p>
            <a href="{{follower_url}}" class="btn">Profili Görüntüle</a>
        </div>
        <div class="footer">
            <p>© 2024 Jukeboxd</p>
        </div>
    </div>
</body>
</html>`
    }
};

export default function EmailManagement() {
    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
    const [activeTemplate, setActiveTemplate] = useState('weekly_digest');
    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [emailSettings, setEmailSettings] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        from_email: 'noreply@jukeboxd.com',
        from_name: 'Jukeboxd',
        digest_day: 'monday',
        digest_hour: '09:00'
    });

    const currentTemplate = templates[activeTemplate];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/email-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.templates) setTemplates({ ...DEFAULT_TEMPLATES, ...data.templates });
                if (data.settings) setEmailSettings({ ...emailSettings, ...data.settings });
            }
        } catch (error) {
            console.error('Failed to load email settings:', error);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/email-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ templates, settings: emailSettings })
            });
            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save email settings:', error);
        }
        setIsSaving(false);
        setIsEditing(false);
    };

    const updateTemplate = (field, value) => {
        setTemplates(prev => ({
            ...prev,
            [activeTemplate]: {
                ...prev[activeTemplate],
                [field]: value
            }
        }));
    };

    const sendTestEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/email-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ templateId: activeTemplate })
            });
            alert('Test e-postası gönderildi!');
        } catch (error) {
            alert('Test e-postası gönderilemedi');
        }
    };

    return (
        <div className="email-management">
            <div className="email-header">
                <div className="email-title">
                    <Mail size={24} />
                    <div>
                        <h1>E-posta Yönetimi</h1>
                        <p>E-posta şablonlarını ve ayarlarını yönetin</p>
                    </div>
                </div>
                <div className="email-actions">
                    {saveSuccess && (
                        <span className="save-success">
                            <Check size={16} /> Kaydedildi
                        </span>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={saveSettings}
                        disabled={isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>

            <div className="email-layout">
                {/* Sidebar - Template List */}
                <aside className="email-sidebar">
                    <div className="sidebar-section">
                        <h3>Şablonlar</h3>
                        <div className="template-list">
                            {Object.values(templates).map(template => (
                                <button
                                    key={template.id}
                                    className={`template-item ${activeTemplate === template.id ? 'active' : ''}`}
                                    onClick={() => setActiveTemplate(template.id)}
                                >
                                    <div className="template-icon">
                                        {template.id === 'weekly_digest' && <Clock size={18} />}
                                        {template.id === 'welcome' && <Sparkles size={18} />}
                                        {template.id === 'password_reset' && <AlertCircle size={18} />}
                                        {template.id === 'new_follower' && <Users size={18} />}
                                    </div>
                                    <div className="template-info">
                                        <span className="template-name">{template.name}</span>
                                        <span className="template-schedule">{template.schedule}</span>
                                    </div>
                                    <span className={`template-status ${template.enabled ? 'enabled' : 'disabled'}`}>
                                        {template.enabled ? 'Aktif' : 'Pasif'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>SMTP Ayarları</h3>
                        <div className="smtp-form">
                            <div className="form-group">
                                <label>SMTP Host</label>
                                <input
                                    type="text"
                                    value={emailSettings.smtp_host}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                                    placeholder="smtp.example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Port</label>
                                <input
                                    type="text"
                                    value={emailSettings.smtp_port}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                                    placeholder="587"
                                />
                            </div>
                            <div className="form-group">
                                <label>Kullanıcı</label>
                                <input
                                    type="text"
                                    value={emailSettings.smtp_user}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Şifre</label>
                                <input
                                    type="password"
                                    value={emailSettings.smtp_pass}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_pass: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gönderen E-posta</label>
                                <input
                                    type="email"
                                    value={emailSettings.from_email}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Haftalık Özet Zamanı</h3>
                        <div className="digest-schedule">
                            <select
                                value={emailSettings.digest_day}
                                onChange={(e) => setEmailSettings({ ...emailSettings, digest_day: e.target.value })}
                            >
                                <option value="monday">Pazartesi</option>
                                <option value="tuesday">Salı</option>
                                <option value="wednesday">Çarşamba</option>
                                <option value="thursday">Perşembe</option>
                                <option value="friday">Cuma</option>
                                <option value="saturday">Cumartesi</option>
                                <option value="sunday">Pazar</option>
                            </select>
                            <input
                                type="time"
                                value={emailSettings.digest_hour}
                                onChange={(e) => setEmailSettings({ ...emailSettings, digest_hour: e.target.value })}
                            />
                        </div>
                    </div>
                </aside>

                {/* Main Content - Template Editor */}
                <main className="email-main">
                    {currentTemplate && (
                        <motion.div
                            key={activeTemplate}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="template-editor"
                        >
                            <div className="editor-header">
                                <div className="editor-info">
                                    <h2>{currentTemplate.name}</h2>
                                    <p>{currentTemplate.description}</p>
                                </div>
                                <div className="editor-actions">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={currentTemplate.enabled}
                                            onChange={(e) => updateTemplate('enabled', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        <Eye size={16} />
                                        {showPreview ? 'Editör' : 'Önizleme'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={sendTestEmail}
                                    >
                                        <Send size={16} />
                                        Test Gönder
                                    </button>
                                </div>
                            </div>

                            <div className="editor-content">
                                {!showPreview ? (
                                    <>
                                        <div className="form-group">
                                            <label>Konu</label>
                                            <input
                                                type="text"
                                                value={currentTemplate.subject}
                                                onChange={(e) => updateTemplate('subject', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                HTML Şablon
                                                <span className="label-hint">Handlebars syntax desteklenir</span>
                                            </label>
                                            <textarea
                                                className="html-editor"
                                                value={currentTemplate.htmlTemplate}
                                                onChange={(e) => updateTemplate('htmlTemplate', e.target.value)}
                                                rows={20}
                                            />
                                        </div>

                                        <div className="variables-section">
                                            <h4>Kullanılabilir Değişkenler</h4>
                                            <div className="variables-list">
                                                {currentTemplate.variables.map(variable => (
                                                    <button
                                                        key={variable}
                                                        className="variable-chip"
                                                        onClick={() => navigator.clipboard.writeText(`{{${variable}}}`)}
                                                        title="Kopyalamak için tıkla"
                                                    >
                                                        <Copy size={12} />
                                                        {`{{${variable}}}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="template-preview">
                                        <div className="preview-header">
                                            <span className="preview-label">E-posta Önizleme</span>
                                            <span className="preview-subject">{currentTemplate.subject}</span>
                                        </div>
                                        <iframe
                                            srcDoc={currentTemplate.htmlTemplate
                                                .replace(/\{\{username\}\}/g, 'JohnDoe')
                                                .replace(/\{\{week_range\}\}/g, '12-18 Aralık 2024')
                                                .replace(/\{\{app_url\}\}/g, '#')
                                                .replace(/\{\{logo_url\}\}/g, '/vinyl.svg')
                                                .replace(/\{\{#if.*?\}\}/g, '')
                                                .replace(/\{\{\/if\}\}/g, '')
                                                .replace(/\{\{#each.*?\}\}/g, '')
                                                .replace(/\{\{\/each\}\}/g, '')
                                            }
                                            className="preview-iframe"
                                            title="Email Preview"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
}
