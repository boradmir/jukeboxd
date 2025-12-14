import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Disc, Heart, Users, Star, ListMusic,
    Github, Twitter, Mail, ExternalLink
} from 'lucide-react';
import './About.css';

export default function About() {
    const features = [
        {
            icon: Star,
            title: 'Şarkıları Puanla',
            description: 'Dinlediğin şarkıları 1-5 arası puanla ve koleksiyonunu oluştur.'
        },
        {
            icon: ListMusic,
            title: 'Listeler Oluştur',
            description: 'En sevdiğin şarkıları bir araya getir ve toplulukla paylaş.'
        },
        {
            icon: Users,
            title: 'Topluluk',
            description: 'Diğer müzik severlerle bağlan, aktivitelerini takip et.'
        },
        {
            icon: Heart,
            title: 'Keşfet',
            description: 'Yeni müzikler keşfet, önerileri incele ve zevkini genişlet.'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Kullanıcı' },
        { value: '50K+', label: 'Puanlama' },
        { value: '5K+', label: 'Liste' },
        { value: '100K+', label: 'Şarkı' }
    ];

    return (
        <div className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="hero-logo">
                            <Disc className="logo-icon" />
                        </div>
                        <h1 className="hero-title">
                            <span className="text-gradient">Jukeboxd</span>
                        </h1>
                        <p className="hero-subtitle">
                            Müzik tutkunları için sosyal platform
                        </p>
                        <p className="hero-description">
                            Letterboxd'dan ilham alınarak geliştirilmiş, müzik severler için
                            tasarlanmış bir platform. Dinlediğin şarkıları puanla, listeler
                            oluştur ve diğer müzik tutkunlarıyla bağlan.
                        </p>

                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Ücretsiz Katıl
                            </Link>
                            <Link to="/discover" className="btn btn-secondary btn-lg">
                                Keşfet
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="about-stats">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="about-features">
                <div className="container">
                    <h2 className="section-title">Özellikler</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="feature-icon">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="about-tech">
                <div className="container">
                    <h2 className="section-title">Teknolojiler</h2>
                    <div className="tech-grid">
                        <div className="tech-item">React</div>
                        <div className="tech-item">Vite</div>
                        <div className="tech-item">Framer Motion</div>
                        <div className="tech-item">Express.js</div>
                        <div className="tech-item">SQLite</div>
                        <div className="tech-item">Spotify API</div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="about-contact">
                <div className="container">
                    <h2 className="section-title">İletişim</h2>
                    <div className="contact-links">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                            <Github size={24} />
                            GitHub
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                            <Twitter size={24} />
                            Twitter
                        </a>
                        <a href="mailto:contact@jukeboxd.com" className="contact-link">
                            <Mail size={24} />
                            E-posta
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
