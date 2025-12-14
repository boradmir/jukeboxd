import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Crown, Check, Star, Zap, Shield, Music,
    BarChart3, Palette, Infinity, MessageCircle, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './GoldMembership.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GoldMembership() {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState(null);
    const { user, isAuthenticated, authFetch } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check for success/failed redirect
    const successOrder = searchParams.get('success');
    const failedOrder = searchParams.get('failed');

    const features = [
        { icon: Crown, title: 'Gold Rozet', description: 'Profilinizde özel Gold rozeti' },
        { icon: BarChart3, title: 'Detaylı İstatistikler', description: 'Gelişmiş müzik analizi ve grafikler' },
        { icon: Palette, title: 'Özel Temalar', description: 'Profil özelleştirme seçenekleri' },
        { icon: Infinity, title: 'Sınırsız Listeler', description: 'Liste sayısı limiti yok' },
        { icon: MessageCircle, title: 'Öncelikli Destek', description: 'Hızlı yanıt garantisi' },
        { icon: Shield, title: 'Erken Erişim', description: 'Yeni özelliklere ilk erişim' }
    ];

    useEffect(() => {
        fetchPlans();
        if (isAuthenticated) {
            fetchStatus();
        }
    }, [isAuthenticated]);

    const fetchPlans = async () => {
        try {
            const response = await fetch(`${API_URL}/api/subscription/plans`);
            const data = await response.json();
            if (data.plans) {
                setPlans(data.plans);
                // Select yearly by default (better value)
                const yearly = data.plans.find(p => p.slug === 'yearly');
                setSelectedPlan(yearly || data.plans[0]);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            // Use mock plans as fallback
            setPlans([
                { id: 1, name: 'Aylık', slug: 'monthly', price: 49.99, duration_days: 30 },
                { id: 2, name: 'Yıllık', slug: 'yearly', price: 399.99, duration_days: 365 }
            ]);
            setSelectedPlan({ id: 2, name: 'Yıllık', slug: 'yearly', price: 399.99, duration_days: 365 });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const response = await authFetch('/api/subscription/status');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/gold' } } });
            return;
        }

        if (!selectedPlan) return;

        setIsProcessing(true);
        try {
            const response = await authFetch('/api/subscription/create', {
                method: 'POST',
                body: JSON.stringify({ planId: selectedPlan.id })
            });

            const data = await response.json();

            if (data.success && data.paymentData) {
                // Create and submit hidden form to Shopier
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.paymentData.paymentUrl;
                form.target = '_self';

                const fields = {
                    'API_key': data.paymentData.apiKey,
                    'platform_order_id': data.paymentData.orderId,
                    'product_name': data.paymentData.productName,
                    'product_type': data.paymentData.productType,
                    'buyer_name': data.paymentData.buyerName,
                    'buyer_email': data.paymentData.buyerEmail,
                    'buyer_phone': data.paymentData.buyerPhone,
                    'total': data.paymentData.total,
                    'currency': data.paymentData.currency,
                    'signature': data.paymentData.signature,
                    'module_version': '1.0.0',
                    'platform': 'Jukeboxd',
                    'is_in_frame': '0'
                };

                for (const [key, value] of Object.entries(fields)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value || '';
                    form.appendChild(input);
                }

                document.body.appendChild(form);
                form.submit();
            } else {
                alert('Bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Subscribe error:', error);
            alert('Abonelik oluşturulurken bir hata oluştu.');
            setIsProcessing(false);
        }
    };

    const calculateSavings = () => {
        const monthly = plans.find(p => p.slug === 'monthly');
        const yearly = plans.find(p => p.slug === 'yearly');
        if (monthly && yearly) {
            const yearlyMonthly = monthly.price * 12;
            const savings = yearlyMonthly - yearly.price;
            const percentage = Math.round((savings / yearlyMonthly) * 100);
            return { savings, percentage };
        }
        return { savings: 0, percentage: 0 };
    };

    const { savings, percentage } = calculateSavings();

    return (
        <div className="gold-page">
            {/* Success/Failed Messages */}
            {successOrder && (
                <div className="gold-alert success">
                    <Check size={24} />
                    <div>
                        <h4>Ödemeniz Başarılı!</h4>
                        <p>Gold üyeliğiniz aktif edildi. Premium özelliklerin tadını çıkarın!</p>
                    </div>
                    <Link to="/profile" className="btn btn-primary">Profilime Git</Link>
                </div>
            )}

            {failedOrder && (
                <div className="gold-alert error">
                    <X size={24} />
                    <div>
                        <h4>Ödeme Başarısız</h4>
                        <p>Bir sorun oluştu. Lütfen tekrar deneyin veya destek ile iletişime geçin.</p>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="gold-hero">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="gold-badge-large">
                            <Crown size={48} />
                        </div>
                        <h1 className="gold-title">
                            <span className="gradient-text">Jukeboxd Gold</span>
                        </h1>
                        <p className="gold-subtitle">
                            Müzik deneyiminizi bir üst seviyeye taşıyın
                        </p>

                        {status?.isGold && (
                            <div className="current-status">
                                <Crown size={20} />
                                <span>Gold Üyesiniz!</span>
                                <span className="expires">
                                    {status.expiresAt && `Bitiş: ${new Date(status.expiresAt).toLocaleDateString('tr-TR')}`}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="gold-features">
                <div className="container">
                    <h2 className="section-title">Gold Avantajları</h2>
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
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="gold-pricing">
                <div className="container">
                    <h2 className="section-title">Planlar</h2>
                    <div className="pricing-cards">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                className={`pricing-card glass-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.slug === 'yearly' ? 'recommended' : ''}`}
                                onClick={() => setSelectedPlan(plan)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {plan.slug === 'yearly' && (
                                    <div className="recommended-badge">
                                        <Star size={14} />
                                        %{percentage} Tasarruf
                                    </div>
                                )}
                                <h3>{plan.name}</h3>
                                <div className="price">
                                    <span className="amount">₺{plan.price}</span>
                                    <span className="period">/{plan.slug === 'monthly' ? 'ay' : 'yıl'}</span>
                                </div>
                                {plan.slug === 'yearly' && (
                                    <p className="savings">₺{savings.toFixed(2)} tasarruf edin</p>
                                )}
                                <div className="plan-check">
                                    {selectedPlan?.id === plan.id && <Check size={20} />}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        className="btn btn-gold btn-large"
                        onClick={handleSubscribe}
                        disabled={isProcessing || status?.isGold}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isProcessing ? 'İşleniyor...' : status?.isGold ? 'Zaten Gold Üyesiniz' : 'Gold\'a Yükselt'}
                        {!status?.isGold && <Zap size={20} />}
                    </motion.button>

                    <p className="payment-note">
                        Güvenli ödeme Shopier üzerinden gerçekleştirilir.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="gold-faq">
                <div className="container">
                    <h2 className="section-title">Sıkça Sorulan Sorular</h2>
                    <div className="faq-list">
                        <div className="faq-item glass-card">
                            <h4>Gold üyeliği nasıl iptal edebilirim?</h4>
                            <p>Profil ayarlarınızdan istediğiniz zaman iptal edebilirsiniz. Mevcut süreniz dolana kadar avantajlarınız devam eder.</p>
                        </div>
                        <div className="faq-item glass-card">
                            <h4>Ödeme yöntemleri nelerdir?</h4>
                            <p>Shopier üzerinden kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz.</p>
                        </div>
                        <div className="faq-item glass-card">
                            <h4>Yıllık plandan aylık plana geçebilir miyim?</h4>
                            <p>Mevcut aboneliğiniz bittiğinde farklı bir plan seçebilirsiniz.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
