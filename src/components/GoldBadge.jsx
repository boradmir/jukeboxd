import { Crown } from 'lucide-react';
import './GoldBadge.css';

/**
 * GoldBadge component - displays a gold crown icon for premium users
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.showTooltip - whether to show tooltip on hover
 */
export default function GoldBadge({ size = 'md', showTooltip = true }) {
    const sizeMap = {
        sm: 12,
        md: 16,
        lg: 20
    };

    return (
        <span
            className={`gold-badge gold-badge-${size}`}
            title={showTooltip ? 'Gold Üye' : undefined}
        >
            <Crown size={sizeMap[size]} />
        </span>
    );
}
