import { X, ShieldX, Mail, Phone } from 'lucide-react';
import './SuspensionModal.css';

export default function SuspensionModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="suspension-overlay" onClick={onClose}>
            <div className="suspension-modal" onClick={e => e.stopPropagation()}>
                <button className="suspension-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="suspension-icon">
                    <ShieldX size={64} />
                </div>

                <h2 className="suspension-title">Hesabınız Askıya Alındı</h2>

                <p className="suspension-message">
                    Hesabınız kullanım koşullarını ihlal ettiği gerekçesiyle askıya alınmıştır.
                    Bu durumun bir hata olduğunu düşünüyorsanız lütfen bizimle iletişime geçin.
                </p>

                <div className="suspension-reasons">
                    <h4>Olası Nedenler:</h4>
                    <ul>
                        <li>Spam veya kötüye kullanım</li>
                        <li>Topluluk kurallarının ihlali</li>
                        <li>Şüpheli aktivite tespit edilmesi</li>
                        <li>Diğer kullanıcılardan gelen şikayetler</li>
                    </ul>
                </div>

                <div className="suspension-contact">
                    <h4>İletişim</h4>
                    <a href="mailto:destek@jukeboxd.com" className="contact-link">
                        <Mail size={16} />
                        destek@jukeboxd.com
                    </a>
                </div>

                <button className="btn btn-secondary suspension-btn" onClick={onClose}>
                    Anladım
                </button>
            </div>
        </div>
    );
}
