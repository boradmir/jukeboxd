import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Heart, Music } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        discover: [
            { to: '/discover', label: 'Şarkıları Keşfet' },
            { to: '/discover?type=album', label: 'Albümler' },
            { to: '/discover?type=artist', label: 'Sanatçılar' },
            { to: '/lists', label: 'Popüler Listeler' },
        ],
        community: [
            { to: '/community', label: 'Aktivite Akışı' },
            { to: '/community/reviews', label: 'Son Yorumlar' },
            { to: '/community/members', label: 'Üyeler' },
            { to: '/community/lists', label: 'Topluluk Listeleri' },
        ],
        about: [
            { to: '/about', label: 'Hakkımızda' },
            { to: '/contact', label: 'İletişim' },
            { to: '/privacy', label: 'Gizlilik Politikası' },
            { to: '/terms', label: 'Kullanım Koşulları' },
        ],
    };

    const socialLinks = [
        { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
        { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
        { href: 'https://github.com', icon: Github, label: 'GitHub' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container container">
                {/* Main Footer Content */}
                <div className="footer-main">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                <Music size={24} />
                            </div>
                            <span className="footer-logo-text">
                                <span>Juke</span>
                                <span className="gradient-text">boxd</span>
                            </span>
                        </Link>
                        <p className="footer-tagline">
                            Şarkılarını keşfet, puanla ve paylaş.<br />
                            Müzik tutkunları için sosyal platform.
                        </p>

                        {/* Social Links */}
                        <div className="footer-social">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <div className="footer-links-group">
                            <h4 className="footer-links-title">Keşfet</h4>
                            <ul className="footer-links-list">
                                {footerLinks.discover.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-links-group">
                            <h4 className="footer-links-title">Topluluk</h4>
                            <ul className="footer-links-list">
                                {footerLinks.community.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-links-group">
                            <h4 className="footer-links-title">Jukeboxd</h4>
                            <ul className="footer-links-list">
                                {footerLinks.about.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Jukeboxd. Tüm hakları saklıdır.
                    </p>
                    <p className="footer-made-with">
                        <Heart size={14} className="heart-icon" /> ile yapıldı
                    </p>
                    <p className="footer-spotify">
                        Müzik verileri <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">Spotify</a> tarafından sağlanmaktadır.
                    </p>
                </div>
            </div>
        </footer>
    );
}
