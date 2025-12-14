import { useState } from 'react';
import { motion } from 'framer-motion';
import './VinylRating.css';

export default function VinylRating({
    rating = 0,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange = () => { },
    showValue = false
}) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 40
    };

    const vinylSize = sizes[size] || sizes.md;

    const handleClick = (value) => {
        if (interactive) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`vinyl-rating vinyl-rating-${size}`}>
            <div className="vinyl-rating-discs">
                {[...Array(maxRating)].map((_, index) => {
                    const value = index + 1;
                    const isFilled = value <= displayRating;
                    const isHalf = value - 0.5 === displayRating;

                    return (
                        <motion.button
                            key={index}
                            type="button"
                            className={`vinyl-rating-disc ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''} ${interactive ? 'interactive' : ''}`}
                            style={{ width: vinylSize, height: vinylSize }}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            onMouseLeave={handleMouseLeave}
                            whileHover={interactive ? { scale: 1.2, rotate: 360 } : {}}
                            whileTap={interactive ? { scale: 0.9 } : {}}
                            transition={{ duration: 0.3 }}
                            disabled={!interactive}
                            aria-label={`${value} puan ver`}
                        >
                            <svg viewBox="0 0 100 100" className="vinyl-svg">
                                {/* Outer ring */}
                                <circle cx="50" cy="50" r="48" className="vinyl-outer" />
                                {/* Grooves */}
                                <circle cx="50" cy="50" r="40" className="vinyl-groove" />
                                <circle cx="50" cy="50" r="35" className="vinyl-groove thin" />
                                <circle cx="50" cy="50" r="30" className="vinyl-groove" />
                                <circle cx="50" cy="50" r="25" className="vinyl-groove thin" />
                                {/* Center label */}
                                <circle cx="50" cy="50" r="15" className="vinyl-label" />
                                {/* Center hole */}
                                <circle cx="50" cy="50" r="3" className="vinyl-hole" />
                            </svg>
                        </motion.button>
                    );
                })}
            </div>

            {showValue && (
                <span className="vinyl-rating-value">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
