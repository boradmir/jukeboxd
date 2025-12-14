import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import './Modal.css';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modals, setModals] = useState([]);

    const openModal = useCallback((component, props = {}) => {
        const id = Date.now();
        setModals(prev => [...prev, { id, component, props }]);
        return id;
    }, []);

    const closeModal = useCallback((id) => {
        if (id) {
            setModals(prev => prev.filter(modal => modal.id !== id));
        } else {
            // Close the topmost modal
            setModals(prev => prev.slice(0, -1));
        }
    }, []);

    const closeAllModals = useCallback(() => {
        setModals([]);
    }, []);

    return (
        <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
            {children}

            <AnimatePresence>
                {modals.map((modal, index) => (
                    <Modal
                        key={modal.id}
                        id={modal.id}
                        onClose={() => closeModal(modal.id)}
                        isTop={index === modals.length - 1}
                    >
                        <modal.component {...modal.props} closeModal={() => closeModal(modal.id)} />
                    </Modal>
                ))}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}

function Modal({ id, children, onClose, isTop }) {
    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 400 + id % 100 }}
        >
            <motion.div
                className="modal-container"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

export default ModalContext;
