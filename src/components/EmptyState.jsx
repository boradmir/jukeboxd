import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Disc, ListMusic, Star, Users, Music, Plus, Search } from 'lucide-react';
import './EmptyState.css';

const icons = {
    disc: Disc,
    list: ListMusic,
    star: Star,
    users: Users,
    music: Music,
    plus: Plus,
    search: Search,
};

const illustrations = {
    ratings: '/empty-state.svg',
    lists: '/create-playlist.svg',
    search: '/no-results.svg',
    activity: '/empty-state.svg',
    default: '/empty-state.svg',
};

export default function EmptyState({
    icon = 'disc',
    illustration,
    title,
    description,
    actionLabel,
    actionLink,
    onAction,
    variant = 'default', // ratings, lists, search, activity
    compact = false,
}) {
    const Icon = icons[icon] || Disc;
    const illustrationSrc = illustration || illustrations[variant] || illustrations.default;

    return (
        <motion.div
            className={`empty-state ${compact ? 'empty-state-compact' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {!compact && (
                <div className="empty-state-illustration">
                    <img src={illustrationSrc} alt="" aria-hidden="true" />
                </div>
            )}

            {compact && (
                <div className="empty-state-icon">
                    <Icon size={32} />
                </div>
            )}

            <h3 className="empty-state-title">{title}</h3>

            {description && (
                <p className="empty-state-description">{description}</p>
            )}

            {(actionLabel && (actionLink || onAction)) && (
                actionLink ? (
                    <Link to={actionLink} className="btn btn-primary empty-state-action">
                        {actionLabel}
                    </Link>
                ) : (
                    <button onClick={onAction} className="btn btn-primary empty-state-action">
                        {actionLabel}
                    </button>
                )
            )}
        </motion.div>
    );
}

// Preset empty states for common use cases
export function EmptyRatings({ onAction }) {
    return (
        <EmptyState
            variant="ratings"
            icon="star"
            title="Henüz puanlama yapmadın"
            description="Dinlediğin şarkıları puanlayarak müzik zevkini takip et ve arkadaşlarınla paylaş."
            actionLabel="Keşfetmeye Başla"
            actionLink="/discover"
        />
    );
}

export function EmptyLists({ onAction }) {
    return (
        <EmptyState
            variant="lists"
            icon="list"
            title="Henüz liste oluşturmadın"
            description="Favori şarkılarını bir araya getirerek kendi playlistlerini oluştur."
            actionLabel="İlk Listeni Oluştur"
            onAction={onAction}
        />
    );
}

export function EmptySearch({ query }) {
    return (
        <EmptyState
            variant="search"
            icon="search"
            title={`"${query}" için sonuç bulunamadı`}
            description="Farklı anahtar kelimeler deneyebilir veya daha genel bir arama yapabilirsin."
        />
    );
}

export function EmptyActivity() {
    return (
        <EmptyState
            variant="activity"
            icon="users"
            title="Henüz aktivite yok"
            description="Kullanıcıları takip etmeye başladığında aktiviteleri burada görünecek."
            actionLabel="Kullanıcıları Keşfet"
            actionLink="/community"
        />
    );
}

export function EmptyLikes() {
    return (
        <EmptyState
            variant="ratings"
            icon="music"
            title="Henüz beğendiğin şarkı yok"
            description="Sevdiğin şarkıları beğenerek koleksiyonunu oluştur."
            actionLabel="Müzik Keşfet"
            actionLink="/discover"
        />
    );
}
