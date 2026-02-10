import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Play, MapPin, Cake, Briefcase, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { fetchWithRetry } from './HomePage';

interface FilmographyItem {
    id: number;
    title: string;
    type: string;
    character: string;
    rating: number;
    imageUrl: string | null;
    releaseDate: string;
}

interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    placeOfBirth: string | null;
    profileUrl: string | null;
    knownFor: string;
    gender: number;
    homepage: string | null;
    alsoKnownAs: string[];
    filmography: FilmographyItem[];
}

function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateAge(birthday: string | null, deathday: string | null): number | null {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Skeleton for the whole page
function PersonSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b] pt-24 animate-pulse">
            <div className="container mx-auto px-4 md:px-8 lg:px-16">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Profile image skeleton */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-[280px] h-[420px] rounded-2xl bg-white/10"></div>
                    </div>
                    {/* Info skeleton */}
                    <div className="flex-1 space-y-6">
                        <div className="h-10 bg-white/10 rounded-xl w-2/3"></div>
                        <div className="flex gap-3">
                            <div className="h-8 w-28 bg-emerald-600/30 rounded-full"></div>
                            <div className="h-8 w-36 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                            <div className="h-16 bg-white/5 rounded-xl"></div>
                            <div className="h-16 bg-white/5 rounded-xl"></div>
                            <div className="h-16 bg-white/5 rounded-xl"></div>
                            <div className="h-16 bg-white/5 rounded-xl"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-5 bg-white/8 rounded-lg w-full"></div>
                            <div className="h-5 bg-white/8 rounded-lg w-full"></div>
                            <div className="h-5 bg-white/8 rounded-lg w-5/6"></div>
                            <div className="h-5 bg-white/8 rounded-lg w-4/6"></div>
                        </div>
                    </div>
                </div>
                {/* Filmography skeleton */}
                <div className="mt-16">
                    <div className="h-8 bg-white/10 rounded-xl w-48 mb-8"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[2/3] bg-white/10 rounded-xl"></div>
                                <div className="h-4 bg-white/8 rounded w-3/4"></div>
                                <div className="h-3 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CastDetails() {
    const { id: rawId } = useParams<{ id: string }>();
    const personId = rawId?.split('-')[0];

    const [person, setPerson] = useState<PersonDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bioExpanded, setBioExpanded] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [personId]);

    useEffect(() => {
        const fetchPerson = async () => {
            if (!personId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<PersonDetails>(
                    `${import.meta.env.VITE_API_BASE_URL}/api/person/${personId}`
                );
                setPerson(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load person details');
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
    }, [personId]);

    if (loading) return <PersonSkeleton />;

    if (error || !person) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b] pt-24 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-400 text-xl font-semibold">Something went wrong</p>
                    <p className="text-gray-500">{error || 'Person not found'}</p>
                    <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mt-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const age = calculateAge(person.birthday, person.deathday);
    const bioNeedsCollapse = person.biography.length > 600;
    const displayBio = bioExpanded || !bioNeedsCollapse
        ? person.biography
        : person.biography.slice(0, 600) + '...';

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b] pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8 lg:px-16">

                {/* Back button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Go Back</span>
                </button>

                {/* Hero Area */}
                <div className="flex flex-col md:flex-row gap-10 lg:gap-14">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div className="relative w-[260px] sm:w-[280px] group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-600/40 via-teal-500/20 to-lime-500/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-2xl shadow-emerald-950/50">
                                {person.profileUrl ? (
                                    <img
                                        src={person.profileUrl}
                                        alt={person.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
                                        <span className="text-6xl text-emerald-300/40 font-black">{person.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                            {person.name}
                        </h1>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            {person.knownFor && (
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-emerald-900/50 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {person.knownFor}
                                </span>
                            )}
                            {person.filmography.length > 0 && (
                                <span className="bg-white/10 backdrop-blur-sm text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-white/15">
                                    {person.filmography.length} Credits
                                </span>
                            )}
                        </div>

                        {/* Personal Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mb-8">
                            {person.birthday && (
                                <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Cake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Born</p>
                                        <p className="text-gray-200 text-sm font-semibold">
                                            {formatDate(person.birthday)}
                                            {age !== null && !person.deathday && (
                                                <span className="text-gray-400 font-normal"> (age {age})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {person.deathday && (
                                <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Cake className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Died</p>
                                        <p className="text-gray-200 text-sm font-semibold">
                                            {formatDate(person.deathday)}
                                            {age !== null && (
                                                <span className="text-gray-400 font-normal"> (age {age})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {person.placeOfBirth && (
                                <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Birthplace</p>
                                        <p className="text-gray-200 text-sm font-semibold leading-tight">{person.placeOfBirth}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Also Known As */}
                        {person.alsoKnownAs.length > 0 && (
                            <div className="mb-8">
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Also Known As</p>
                                <div className="flex flex-wrap gap-2">
                                    {person.alsoKnownAs.slice(0, 5).map((name, i) => (
                                        <span key={i} className="bg-white/5 border border-white/8 text-gray-300 text-xs px-3 py-1.5 rounded-lg">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Biography */}
                        {person.biography && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-emerald-600 w-1 h-6 rounded-full"></span>
                                    Biography
                                </h2>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {displayBio}
                                </p>
                                {bioNeedsCollapse && (
                                    <button
                                        onClick={() => setBioExpanded(!bioExpanded)}
                                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors mt-3 text-sm font-medium"
                                    >
                                        {bioExpanded ? (
                                            <>Read Less <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Read More <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filmography */}
                {person.filmography.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="bg-emerald-600 w-1 h-8 rounded-full"></span>
                            Known For
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {person.filmography.map((item) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    to={`/${item.type}/${item.id}-${createSlug(item.title)}`}
                                    className="group"
                                >
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-emerald-500/40 transition-all duration-300 shadow-lg">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                <span className="text-gray-600 text-xs">No Image</span>
                                            </div>
                                        )}

                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Play button */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-emerald-600 hover:bg-emerald-500 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-emerald-900/50">
                                                <Play className="w-5 h-5 text-white fill-white" />
                                            </div>
                                        </div>

                                        {/* Rating badge */}
                                        {item.rating > 0 && (
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs font-bold text-white">{item.rating.toFixed(1)}</span>
                                            </div>
                                        )}

                                        {/* Type badge */}
                                        <div className="absolute top-2 left-2 bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                            <span className="text-xs font-semibold text-white uppercase tracking-wide">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 px-0.5">
                                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.character && (
                                            <p className="text-gray-500 text-xs mt-1 truncate">
                                                as {item.character}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-0.5">
                                            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : ''}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer gradient */}
                <div className="h-16 bg-gradient-to-t from-[#081a0b] to-transparent mt-8"></div>
            </div>
        </div>
    );
}
