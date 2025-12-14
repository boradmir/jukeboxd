import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Disc, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validateForm = () => {
        if (formData.username.length < 3) {
            setError('Kullanıcı adı en az 3 karakter olmalı');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setError('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.displayName || formData.username
            );
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (password.length === 0) return { level: 0, text: '' };
        if (password.length < 6) return { level: 1, text: 'Zayıf' };
        if (password.length < 10) return { level: 2, text: 'Orta' };
        if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { level: 3, text: 'Güçlü' };
        }
        return { level: 2, text: 'Orta' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-gradient"></div>
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-card glass-card">
                    {/* Logo */}
                    <Link to="/" className="auth-logo">
                        <Disc className="logo-icon" />
                        <span className="logo-text">Jukeboxd</span>
                    </Link>

                    <h1 className="auth-title">Topluluğa Katıl</h1>
                    <p className="auth-subtitle">Müzik zevkini paylaş, keşfet</p>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            className="auth-error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    {/* Register Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Kullanıcı Adı</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="kullaniciadi"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="displayName">Görünen İsim (opsiyonel)</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Adınız Soyadınız"
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-posta</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ornek@email.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="En az 6 karakter"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className={`strength-bar level-${passwordStrength.level}`}>
                                        <div className="strength-fill"></div>
                                    </div>
                                    <span className="strength-text">{passwordStrength.text}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Şifre Tekrar</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Şifrenizi tekrar girin"
                                    required
                                    autoComplete="new-password"
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <Check className="input-icon-right success" size={18} />
                                )}
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" required />
                                <span>
                                    <Link to="/terms">Kullanım Şartları</Link>'nı ve{' '}
                                    <Link to="/privacy">Gizlilik Politikası</Link>'nı kabul ediyorum
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="auth-switch">
                        Zaten hesabın var mı?{' '}
                        <Link to="/login">Giriş Yap</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
