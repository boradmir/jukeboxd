import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './DropdownMenu.css';

const DropdownContext = createContext(null);

export function DropdownMenu({ children, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const menuRef = useRef(null);
    const itemsRef = useRef([]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setFocusedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < itemsRef.current.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev > 0 ? prev - 1 : itemsRef.current.length - 1
                );
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
                    itemsRef.current[focusedIndex].click();
                }
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    // Focus item when focusedIndex changes
    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
            itemsRef.current[focusedIndex].focus();
        }
    }, [focusedIndex, isOpen]);

    return (
        <DropdownContext.Provider value={{
            isOpen,
            setIsOpen,
            focusedIndex,
            setFocusedIndex,
            itemsRef,
            handleKeyDown
        }}>
            <div
                ref={menuRef}
                className={`dropdown-menu ${className}`}
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export function DropdownTrigger({ children, className = '', showArrow = true }) {
    const { isOpen, setIsOpen } = useContext(DropdownContext);

    return (
        <button
            type="button"
            className={`dropdown-trigger ${className} ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
        >
            {children}
            {showArrow && (
                <ChevronDown
                    size={16}
                    className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
                />
            )}
        </button>
    );
}

export function DropdownContent({
    children,
    className = '',
    align = 'left',  // left, right, center
    position = 'bottom' // bottom, top
}) {
    const { isOpen } = useContext(DropdownContext);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={`dropdown-content dropdown-align-${align} dropdown-position-${position} ${className}`}
                    initial={{ opacity: 0, y: position === 'top' ? 8 : -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: position === 'top' ? 8 : -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function DropdownItem({
    children,
    onClick,
    icon: Icon,
    disabled = false,
    danger = false,
    className = ''
}) {
    const { setIsOpen, itemsRef } = useContext(DropdownContext);
    const itemRef = useRef(null);

    useEffect(() => {
        if (itemRef.current && !disabled) {
            itemsRef.current.push(itemRef.current);
        }
        return () => {
            itemsRef.current = itemsRef.current.filter(ref => ref !== itemRef.current);
        };
    }, [disabled, itemsRef]);

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
        setIsOpen(false);
    };

    return (
        <button
            ref={itemRef}
            type="button"
            className={`dropdown-item ${danger ? 'dropdown-item-danger' : ''} ${disabled ? 'disabled' : ''} ${className}`}
            onClick={handleClick}
            disabled={disabled}
            role="menuitem"
            tabIndex={-1}
        >
            {Icon && <Icon size={16} className="dropdown-item-icon" />}
            <span>{children}</span>
        </button>
    );
}

export function DropdownDivider() {
    return <div className="dropdown-divider" role="separator" />;
}

export function DropdownLabel({ children }) {
    return <div className="dropdown-label">{children}</div>;
}

export default DropdownMenu;
