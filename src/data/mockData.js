// Mock data for development when Spotify API is not configured
// This allows the app to work with realistic-looking data

export const mockTracks = [
    {
        id: '1',
        name: 'Blinding Lights',
        artists: [{ id: 'a1', name: 'The Weeknd' }],
        album: {
            id: 'al1',
            name: 'After Hours',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', height: 640 }],
            release_date: '2020-03-20'
        },
        duration_ms: 200040,
        preview_url: null,
        popularity: 94
    },
    {
        id: '2',
        name: 'As It Was',
        artists: [{ id: 'a2', name: 'Harry Styles' }],
        album: {
            id: 'al2',
            name: "Harry's House",
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14', height: 640 }],
            release_date: '2022-05-20'
        },
        duration_ms: 167303,
        preview_url: null,
        popularity: 91
    },
    {
        id: '3',
        name: 'Anti-Hero',
        artists: [{ id: 'a3', name: 'Taylor Swift' }],
        album: {
            id: 'al3',
            name: 'Midnights',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', height: 640 }],
            release_date: '2022-10-21'
        },
        duration_ms: 200690,
        preview_url: null,
        popularity: 89
    },
    {
        id: '4',
        name: 'Flowers',
        artists: [{ id: 'a4', name: 'Miley Cyrus' }],
        album: {
            id: 'al4',
            name: 'Endless Summer Vacation',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d', height: 640 }],
            release_date: '2023-03-10'
        },
        duration_ms: 200455,
        preview_url: null,
        popularity: 92
    },
    {
        id: '5',
        name: 'Vampire',
        artists: [{ id: 'a5', name: 'Olivia Rodrigo' }],
        album: {
            id: 'al5',
            name: 'GUTS',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d', height: 640 }],
            release_date: '2023-09-08'
        },
        duration_ms: 219724,
        preview_url: null,
        popularity: 88
    },
    {
        id: '6',
        name: 'Cruel Summer',
        artists: [{ id: 'a3', name: 'Taylor Swift' }],
        album: {
            id: 'al6',
            name: 'Lover',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647', height: 640 }],
            release_date: '2019-08-23'
        },
        duration_ms: 178427,
        preview_url: null,
        popularity: 90
    },
    {
        id: '7',
        name: 'Starboy',
        artists: [{ id: 'a1', name: 'The Weeknd' }, { id: 'a6', name: 'Daft Punk' }],
        album: {
            id: 'al7',
            name: 'Starboy',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452', height: 640 }],
            release_date: '2016-11-25'
        },
        duration_ms: 230453,
        preview_url: null,
        popularity: 87
    },
    {
        id: '8',
        name: 'Levitating',
        artists: [{ id: 'a7', name: 'Dua Lipa' }],
        album: {
            id: 'al8',
            name: 'Future Nostalgia',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946', height: 640 }],
            release_date: '2020-03-27'
        },
        duration_ms: 203807,
        preview_url: null,
        popularity: 86
    },
    {
        id: '9',
        name: 'heat waves',
        artists: [{ id: 'a8', name: 'Glass Animals' }],
        album: {
            id: 'al9',
            name: 'Dreamland',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea', height: 640 }],
            release_date: '2020-08-07'
        },
        duration_ms: 238805,
        preview_url: null,
        popularity: 85
    },
    {
        id: '10',
        name: 'drivers license',
        artists: [{ id: 'a5', name: 'Olivia Rodrigo' }],
        album: {
            id: 'al10',
            name: 'SOUR',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a', height: 640 }],
            release_date: '2021-05-21'
        },
        duration_ms: 242014,
        preview_url: null,
        popularity: 84
    },
    {
        id: '11',
        name: 'Watermelon Sugar',
        artists: [{ id: 'a2', name: 'Harry Styles' }],
        album: {
            id: 'al11',
            name: 'Fine Line',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2732a75e4a9a2b269b3aca6d9e7', height: 640 }],
            release_date: '2019-12-13'
        },
        duration_ms: 174000,
        preview_url: null,
        popularity: 83
    },
    {
        id: '12',
        name: 'bad guy',
        artists: [{ id: 'a9', name: 'Billie Eilish' }],
        album: {
            id: 'al12',
            name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
            images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce', height: 640 }],
            release_date: '2019-03-29'
        },
        duration_ms: 194088,
        preview_url: null,
        popularity: 82
    }
];

export const mockNewReleases = [
    {
        id: 'nr1',
        name: 'Hit Me Hard and Soft',
        artists: [{ id: 'a9', name: 'Billie Eilish' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f4e973ed1b8d1e8eec86f4d8', height: 640 }],
        release_date: '2024-05-17',
        total_tracks: 10
    },
    {
        id: 'nr2',
        name: 'THE TORTURED POETS DEPARTMENT',
        artists: [{ id: 'a3', name: 'Taylor Swift' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273d4f9c5f8ab545f5d4b4f9e5d', height: 640 }],
        release_date: '2024-04-19',
        total_tracks: 16
    },
    {
        id: 'nr3',
        name: 'Hurry Up Tomorrow',
        artists: [{ id: 'a1', name: 'The Weeknd' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273d9a8d8f8a8d8f8a8d8f8a8d8', height: 640 }],
        release_date: '2025-01-24',
        total_tracks: 18
    },
    {
        id: 'nr4',
        name: 'Radical Optimism',
        artists: [{ id: 'a7', name: 'Dua Lipa' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2737e8a8d8f8a8d8f8a8d8f8a8d', height: 640 }],
        release_date: '2024-05-03',
        total_tracks: 11
    }
];

export const mockActivities = [
    {
        id: 'act1',
        user: { name: 'musiclover99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover99' },
        type: 'rating',
        track: mockTracks[0],
        rating: 4.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
    },
    {
        id: 'act2',
        user: { name: 'vinylhead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinylhead' },
        type: 'review',
        track: mockTracks[2],
        rating: 5,
        review: 'Bu şarkı gerçekten muhteşem! Sözleri ve melodisi mükemmel uyum içinde.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        id: 'act3',
        user: { name: 'beatmaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster' },
        type: 'list',
        listName: 'En İyi 2024 Şarkıları',
        tracksCount: 25,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    },
    {
        id: 'act4',
        user: { name: 'soundwave', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=soundwave' },
        type: 'rating',
        track: mockTracks[4],
        rating: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
    },
    {
        id: 'act5',
        user: { name: 'melodyfan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=melodyfan' },
        type: 'like',
        track: mockTracks[1],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
    }
];

export const mockLists = [
    {
        id: 'list1',
        name: '2024 En İyileri',
        description: 'Bu yılın en çok dinlediğim ve sevdiğim şarkılar',
        user: { name: 'musiclover99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover99' },
        tracks: mockTracks.slice(0, 5),
        likes: 234,
        createdAt: '2024-01-15'
    },
    {
        id: 'list2',
        name: 'Gece Çalışma Müzikleri',
        description: 'Konsantrasyonu artıran ambient ve lo-fi parçalar',
        user: { name: 'vinylhead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinylhead' },
        tracks: mockTracks.slice(3, 8),
        likes: 567,
        createdAt: '2024-02-20'
    },
    {
        id: 'list3',
        name: 'Sabah Enerjisi',
        description: 'Güne mutlu başlamak için upbeat şarkılar',
        user: { name: 'beatmaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster' },
        tracks: mockTracks.slice(1, 6),
        likes: 189,
        createdAt: '2024-03-10'
    }
];

export const mockUserProfile = {
    id: 'user1',
    name: 'Bora',
    username: 'boramusic',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boramusic',
    bio: 'Müzik tutkunu. Her türe açığım. 🎵',
    stats: {
        totalListened: 1234,
        totalRatings: 456,
        avgRating: 3.8,
        totalLists: 12,
        followers: 89,
        following: 156
    },
    favoriteArtists: [
        { id: 'a1', name: 'The Weeknd', image: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
        { id: 'a3', name: 'Taylor Swift', image: 'https://i.scdn.co/image/ab6761610000e5eb859e4c14fa59296c8649e0e4' },
        { id: 'a7', name: 'Dua Lipa', image: 'https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abee8d' }
    ],
    recentListens: mockTracks.slice(0, 4)
};

// Helper to format duration
export function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper to format date
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Helper to format relative time
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(dateString);
}
