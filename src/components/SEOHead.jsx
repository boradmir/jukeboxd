import { useEffect } from 'react';
import { useSEO } from '../contexts/SEOContext';

/**
 * SEO Head Component
 * Updates document head with meta tags for each page
 * 
 * Usage:
 * <SEOHead 
 *   title="Şarkı Adı"
 *   description="Şarkı açıklaması"
 *   image="/album-cover.jpg"
 *   url="/song/123"
 *   type="music.song"
 * />
 */
export default function SEOHead({
    title,
    description,
    image,
    url,
    type = 'website',
    noindex = false,
    schema = null,
}) {
    const { getMetaTags, settings } = useSEO();
    const meta = getMetaTags({ title, description, image, url, type, noindex });

    useEffect(() => {
        // Update document title
        document.title = meta.title;

        // Update or create meta tags
        const updateMetaTag = (name, content, isProperty = false) => {
            if (!content) return;

            const attr = isProperty ? 'property' : 'name';
            let tag = document.querySelector(`meta[${attr}="${name}"]`);

            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        // Basic meta tags
        updateMetaTag('description', meta.description);
        if (noindex) {
            updateMetaTag('robots', 'noindex, nofollow');
        } else {
            updateMetaTag('robots', 'index, follow');
        }

        // Open Graph
        updateMetaTag('og:title', meta.title, true);
        updateMetaTag('og:description', meta.description, true);
        updateMetaTag('og:image', meta.image, true);
        updateMetaTag('og:url', meta.url, true);
        updateMetaTag('og:type', meta.type, true);
        updateMetaTag('og:site_name', meta.siteName, true);
        updateMetaTag('og:locale', 'tr_TR', true);

        // Twitter Card
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:site', meta.twitterHandle);
        updateMetaTag('twitter:title', meta.title);
        updateMetaTag('twitter:description', meta.description);
        updateMetaTag('twitter:image', meta.image);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', meta.url);

        // JSON-LD Schema
        if (schema) {
            let scriptTag = document.querySelector('script[data-schema="page"]');
            if (!scriptTag) {
                scriptTag = document.createElement('script');
                scriptTag.setAttribute('type', 'application/ld+json');
                scriptTag.setAttribute('data-schema', 'page');
                document.head.appendChild(scriptTag);
            }
            scriptTag.textContent = JSON.stringify(schema);
        }

        // Cleanup function
        return () => {
            // Reset to default on unmount
            document.title = settings.site_name;
        };
    }, [meta, noindex, schema, settings.site_name]);

    return null; // This component doesn't render anything
}

/**
 * Generate Schema.org markup for a music track
 */
export function generateTrackSchema(track, rating) {
    return {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        'name': track.name,
        'byArtist': {
            '@type': 'MusicGroup',
            'name': track.artists?.map(a => a.name).join(', '),
        },
        'inAlbum': {
            '@type': 'MusicAlbum',
            'name': track.album?.name,
            'image': track.album?.images?.[0]?.url,
        },
        'duration': track.duration_ms ? `PT${Math.floor(track.duration_ms / 60000)}M${Math.floor((track.duration_ms % 60000) / 1000)}S` : undefined,
        ...(rating && {
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': rating.average,
                'ratingCount': rating.count,
                'bestRating': 5,
                'worstRating': 0.5,
            }
        })
    };
}

/**
 * Generate Schema.org markup for a user profile
 */
export function generateProfileSchema(user) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': user.display_name || user.username,
        'alternateName': `@${user.username}`,
        'image': user.avatar_url,
        'description': user.bio,
    };
}

/**
 * Generate Schema.org markup for a playlist
 */
export function generatePlaylistSchema(playlist, tracks) {
    return {
        '@context': 'https://schema.org',
        '@type': 'MusicPlaylist',
        'name': playlist.name,
        'description': playlist.description,
        'numTracks': tracks?.length || 0,
        'track': tracks?.map(t => ({
            '@type': 'MusicRecording',
            'name': t.track_name,
            'byArtist': t.artist_name,
        })),
    };
}
