import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SEOContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Default SEO settings
const defaultSettings = {
    site_name: 'Jukeboxd',
    site_description: 'Müzik tutkunları için sosyal platform. Şarkılarını keşfet, puanla ve paylaş.',
    site_keywords: 'müzik, şarkı, puanlama, playlist, spotify, letterboxd, müzik sosyal ağ',
    site_url: 'https://jukeboxd.com',
    default_og_image: '/og-image.jpg',
    google_analytics_id: '',
    google_search_console: '',
    twitter_handle: '@jukeboxd',
    robots_txt: 'User-agent: *\nAllow: /',
};

export function SEOProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch SEO settings from backend
    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch(`${API_URL}/api/settings/seo`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.warn('Could not fetch SEO settings, using defaults');
            }
            setIsLoading(false);
        }

        fetchSettings();
    }, []);

    // Generate page title
    const getPageTitle = useCallback((pageTitle) => {
        if (!pageTitle) return settings.site_name;
        return `${pageTitle} | ${settings.site_name}`;
    }, [settings.site_name]);

    // Generate meta tags for a page
    const getMetaTags = useCallback((options = {}) => {
        const {
            title,
            description = settings.site_description,
            image = settings.default_og_image,
            url,
            type = 'website',
            noindex = false,
        } = options;

        return {
            title: getPageTitle(title),
            description,
            image: image?.startsWith('http') ? image : `${settings.site_url}${image}`,
            url: url ? `${settings.site_url}${url}` : settings.site_url,
            type,
            noindex,
            siteName: settings.site_name,
            twitterHandle: settings.twitter_handle,
        };
    }, [settings, getPageTitle]);

    return (
        <SEOContext.Provider value={{
            settings,
            isLoading,
            getPageTitle,
            getMetaTags
        }}>
            {children}
        </SEOContext.Provider>
    );
}

export function useSEO() {
    const context = useContext(SEOContext);
    if (!context) {
        throw new Error('useSEO must be used within an SEOProvider');
    }
    return context;
}

export default SEOContext;
