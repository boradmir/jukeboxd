import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Copy, Check, Users, Crown, Share2,
    ChevronRight, Sparkles, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './ReferralCard.css';

export default function ReferralCard({ className = '' }) {
    const { user, authFetch } = useAuth();
    const { success } = useToast();
    const [referralCode, setReferralCode] = useState('');
    const [stats, setStats] = useState({ total: 0, successful: 0, pending: 0 });
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchReferralData();
        }
    }, [user]);

    const fetchReferralData = async () => {
        try {
            const response = await authFetch('/api/referrals/code');
            if (response.ok) {
                const data = await response.json();
                setReferralCode(data.code);
                setStats(data.stats || { total: 0, successful: 0, pending: 0 });
            }
        } catch (error) {
            console.error('Referral fetch error:', error);
            // Generate a temporary code based on username
            setReferralCode(user?.username?.toUpperCase().slice(0, 6) + Math.random().toString(36).slice(2, 6).toUpperCase());
        }
        setLoading(false);
    };

    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            success('Kopyalandı!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const shareViaTwitter = () => {
        const text = encodeURIComponent(
            `Jukeboxd'a katıl ve müzik deneyimini paylaş! 🎵 Referans kodum: ${referralCode}`
        );
        const url = encodeURIComponent(referralLink);
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            '_blank'
        );
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent("Jukeboxd'a Katıl!");
        const body = encodeURIComponent(
            `Merhaba!\n\nJukeboxd'a katıl ve müzik zevkini paylaş. Şarkıları puanla, listeler oluştur ve arkadaşlarınla keşfet!\n\nKayıt için bu linki kullan: ${referralLink}\n\nReferans kodum: ${referralCode}\n\nGörüşürüz! 🎵`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Progress towards Gold reward (3 referrals = 1 month Gold)
    const progressToGold = Math.min((stats.successful / 3) * 100, 100);
    const referralsNeeded = Math.max(3 - stats.successful, 0);

    if (loading) {
        return (
            <div className={`referral-card referral-loading ${className}`}>
                <div className="loader-vinyl">
                    <div className="vinyl-disc spinning small">
                        <div className="vinyl-label"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`referral-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="referral-header">
                <div className="referral-icon">
                    <Gift size={24} />
                </div>
                <div className="referral-title">
                    <h3>Arkadaşını Davet Et</h3>
                    <p>3 arkadaş davet et, <span className="gold-text">1 ay Gold</span> kazan!</p>
                </div>
            </div>

            {/* Progress */}
            <div className="referral-progress">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToGold}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <div className="progress-labels">
                    <span>{stats.successful} / 3 davet</span>
                    {referralsNeeded > 0 ? (
                        <span>{referralsNeeded} kaldı</span>
                    ) : (
                        <span className="gold-text">
                            <Crown size={14} /> Gold Kazandın!
                        </span>
                    )}
                </div>
            </div>

            {/* Referral Code */}
            <div className="referral-code-section">
                <label>Referans Kodun</label>
                <div className="referral-code-box">
                    <span className="referral-code">{referralCode}</span>
                    <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(referralCode)}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Referral Link */}
            <div className="referral-link-section">
                <label>Davet Linkin</label>
                <div className="referral-link-box">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="referral-link-input"
                    />
                    <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(referralLink)}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Share Buttons */}
            <div className="referral-share">
                <button className="share-btn twitter" onClick={shareViaTwitter}>
                    <Share2 size={16} />
                    Twitter
                </button>
                <button className="share-btn email" onClick={shareViaEmail}>
                    <Mail size={16} />
                    E-posta
                </button>
            </div>

            {/* Stats */}
            {stats.total > 0 && (
                <div className="referral-stats">
                    <div className="stat-item">
                        <Users size={16} />
                        <span>{stats.total} toplam davet</span>
                    </div>
                    <div className="stat-item success">
                        <Sparkles size={16} />
                        <span>{stats.successful} başarılı</span>
                    </div>
                </div>
            )}

            {/* How it works */}
            <details className="referral-howto">
                <summary>
                    Nasıl Çalışır?
                    <ChevronRight size={16} className="howto-arrow" />
                </summary>
                <ol className="howto-steps">
                    <li>Referans kodunu veya linkini arkadaşlarınla paylaş</li>
                    <li>Arkadaşın kayıt olurken kodunu kullanır</li>
                    <li>Her 3 başarılı davette 1 ay Gold kazan!</li>
                </ol>
            </details>
        </motion.div>
    );
}

// Mini version for sidebar or other places
export function ReferralMini({ className = '' }) {
    const { user } = useAuth();
    const referralCode = user?.username?.toUpperCase().slice(0, 6) + 'REF';

    return (
        <div className={`referral-mini ${className}`}>
            <Gift size={16} />
            <span>Arkadaşını davet et, Gold kazan!</span>
            <span className="referral-mini-code">{referralCode}</span>
        </div>
    );
}
