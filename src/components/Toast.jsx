import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import './Toast.css';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container" role="region" aria-label="Bildirimler" aria-live="polite">
            <AnimatePresence mode="sync">
                {toasts.map(toast => {
                    const Icon = icons[toast.type] || Info;

                    return (
                        <motion.div
                            key={toast.id}
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            role="alert"
                        >
                            <div className="toast-icon">
                                <Icon size={20} />
                            </div>
                            <div className="toast-content">
                                <p className="toast-message">{toast.message}</p>
                                {toast.action && (
                                    <button
                                        className="toast-action"
                                        onClick={() => {
                                            toast.action.onClick();
                                            removeToast(toast.id);
                                        }}
                                    >
                                        {toast.action.label}
                                    </button>
                                )}
                            </div>
                            <button
                                className="toast-close"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Bildirimi kapat"
                            >
                                <X size={16} />
                            </button>
                            <div className="toast-progress">
                                <motion.div
                                    className="toast-progress-bar"
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
