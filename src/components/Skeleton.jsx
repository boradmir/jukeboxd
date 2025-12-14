import './Skeleton.css';

// Generic skeleton component
export function Skeleton({ width, height, borderRadius, className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: width || '100%',
                height: height || '1rem',
                borderRadius: borderRadius || 'var(--radius-md)'
            }}
            aria-hidden="true"
        />
    );
}

// Song card skeleton
export function SongCardSkeleton() {
    return (
        <div className="song-card-skeleton" aria-hidden="true">
            <div className="skeleton song-card-skeleton-image" />
            <div className="song-card-skeleton-info">
                <div className="skeleton song-card-skeleton-title" />
                <div className="skeleton song-card-skeleton-artist" />
            </div>
        </div>
    );
}

// Song card grid skeleton
export function SongGridSkeleton({ count = 6 }) {
    return (
        <div className="grid-songs">
            {Array.from({ length: count }).map((_, i) => (
                <SongCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Profile skeleton
export function ProfileSkeleton() {
    return (
        <div className="profile-skeleton" aria-hidden="true">
            <div className="profile-skeleton-header">
                <div className="skeleton profile-skeleton-avatar" />
                <div className="profile-skeleton-info">
                    <div className="skeleton profile-skeleton-name" />
                    <div className="skeleton profile-skeleton-username" />
                    <div className="skeleton profile-skeleton-bio" />
                </div>
            </div>
            <div className="profile-skeleton-stats">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton profile-skeleton-stat" />
                ))}
            </div>
        </div>
    );
}

// Activity feed skeleton
export function ActivitySkeleton({ count = 4 }) {
    return (
        <div className="activity-skeleton" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="activity-skeleton-item">
                    <div className="skeleton activity-skeleton-avatar" />
                    <div className="activity-skeleton-content">
                        <div className="skeleton activity-skeleton-text" />
                        <div className="skeleton activity-skeleton-meta" />
                    </div>
                    <div className="skeleton activity-skeleton-image" />
                </div>
            ))}
        </div>
    );
}

// List/playlist skeleton
export function ListSkeleton({ count = 3 }) {
    return (
        <div className="list-skeleton" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="list-skeleton-item">
                    <div className="skeleton list-skeleton-cover" />
                    <div className="list-skeleton-info">
                        <div className="skeleton list-skeleton-title" />
                        <div className="skeleton list-skeleton-meta" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Text skeleton
export function TextSkeleton({ lines = 3 }) {
    return (
        <div className="text-skeleton" aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton text-skeleton-line"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

export default Skeleton;
