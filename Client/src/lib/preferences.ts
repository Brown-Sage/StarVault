export interface OnboardingPreferences {
    favoriteArtists: string[];
    favoriteMovieTypes: string[];
    favoriteFormats: string[];
    favoriteMoods: string[];
}

export const ARTIST_SUGGESTIONS = [
    'Hans Zimmer',
    'A. R. Rahman',
    'Anirudh',
    'Taylor Swift',
    'Billie Eilish',
    'The Weeknd',
    'Travis Scott',
    'Arijit Singh',
];

export const MOVIE_TYPE_OPTIONS = [
    'Sci-Fi',
    'Psychological Thriller',
    'Rom-Com',
    'Dark Comedy',
    'Crime',
    'Fantasy',
    'Anime',
    'Superhero',
    'Slice of Life',
    'Mystery',
    'Horror',
    'Coming of Age',
];

export const FORMAT_OPTIONS = ['Movies', 'TV Shows', 'Anime', 'Documentaries'];

export const MOOD_OPTIONS = [
    'Mind-bending',
    'Cozy',
    'Adrenaline',
    'Emotional',
    'Funny',
    'Feel-good',
    'Suspenseful',
    'Epic',
];

export function createEmptyPreferences(): OnboardingPreferences {
    return {
        favoriteArtists: [],
        favoriteMovieTypes: [],
        favoriteFormats: [],
        favoriteMoods: [],
    };
}

export function toggleSelection(items: string[], value: string) {
    return items.includes(value)
        ? items.filter((item) => item !== value)
        : [...items, value];
}
