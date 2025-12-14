import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Emin misiniz?',
    message,
    confirmLabel = 'Onayla',
    cancelLabel = 'İptal',
    variant = 'danger', // danger, warning, info
    isLoading = false,
}) {
    const confirmButtonRef = useRef(null);
    const modalRef = useRef(null);

    // Focus trap and keyboard handling
    useEffect(() => {
        if (isOpen) {
            confirmButtonRef.current?.focus();
            document.body.style.overflow = 'hidden';
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="confirm-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-title"
                    aria-describedby="confirm-modal-message"
                >
                    <motion.div
                        ref={modalRef}
                        className={`confirm-modal confirm-modal-${variant}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <button
                            className="confirm-modal-close"
                            onClick={onClose}
                            aria-label="Kapat"
                        >
                            <X size={18} />
                        </button>

                        <div className="confirm-modal-icon">
                            <AlertTriangle size={32} />
                        </div>

                        <h2 id="confirm-modal-title" className="confirm-modal-title">
                            {title}
                        </h2>

                        {message && (
                            <p id="confirm-modal-message" className="confirm-modal-message">
                                {message}
                            </p>
                        )}

                        <div className="confirm-modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                ref={confirmButtonRef}
                                className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`}
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? 'İşleniyor...' : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
