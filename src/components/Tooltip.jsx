import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Tooltip.css';

export default function Tooltip({
    children,
    content,
    position = 'top', // top, bottom, left, right
    delay = 300,
    disabled = false,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);

    const showTooltip = () => {
        if (disabled) return;

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            updatePosition();
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let x = triggerRect.left + scrollX + triggerRect.width / 2;
        let y = triggerRect.top + scrollY;

        switch (position) {
            case 'bottom':
                y = triggerRect.bottom + scrollY + 8;
                break;
            case 'left':
                x = triggerRect.left + scrollX - 8;
                y = triggerRect.top + scrollY + triggerRect.height / 2;
                break;
            case 'right':
                x = triggerRect.right + scrollX + 8;
                y = triggerRect.top + scrollY + triggerRect.height / 2;
                break;
            default: // top
                y = triggerRect.top + scrollY - 8;
        }

        setTooltipPosition({ x, y });
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <span
                ref={triggerRef}
                className="tooltip-trigger"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                aria-describedby={isVisible ? 'tooltip' : undefined}
            >
                {children}
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        id="tooltip"
                        role="tooltip"
                        className={`tooltip tooltip-${position}`}
                        style={{
                            left: tooltipPosition.x,
                            top: tooltipPosition.y,
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        {content}
                        <span className="tooltip-arrow" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
