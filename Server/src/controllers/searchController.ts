import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBResponse {
    results: Array<{
        id: number;
        title?: string;
        name?: string;
        media_type?: string;
        vote_average: number;
        poster_path: string | null;
        overview: string;
        release_date?: string;
        first_air_date?: string;
    }>;
}

export const searchMedia = async (req: Request, res: Response) => {
    try {
        const { query, page = '1' } = req.query;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({
                error: 'Search query is required',
                details: 'Please provide a valid search query'
            });
        }

        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log(`Searching TMDB for: "${query}"`);

        // Use TMDB multi-search endpoint to search both movies and TV shows
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/multi`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                query: query.trim(),
                page: parseInt(page as string) || 1
            }
        });

        console.log(`Found ${response.data.results.length} results for: "${query}"`);

        // Transform the data to match our frontend needs
        const searchResults = response.data.results
            .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item) => ({
                id: item.id,
                title: item.title || item.name,
                type: item.media_type,
                rating: item.vote_average,
                imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
                overview: item.overview,
                releaseDate: item.release_date || item.first_air_date
            }));

        res.json(searchResults);
    } catch (error) {
        console.error('Error details:', error);
        if (axios.isAxiosError(error)) {
            console.error('TMDB API Error:', error.response?.data);
        }
        res.status(500).json({
            error: 'Failed to perform search',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const searchVibe = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({
                error: 'Search query is required',
                details: 'Please provide a valid vibe search query'
            });
        }

        if (!process.env.TMDB_API_KEY || !process.env.GROQ_API_KEY) {
            throw new Error('API keys are missing in environment variables');
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        console.log(`Vibe Searching for: "${query}"`);

        // Step 1: Ask Groq ONLY for a ranked list of titles — nothing else.
        // The LLM's encyclopedic knowledge is the filter. No TMDB filter logic needed.
        const systemPrompt = `You are the world's best movie and TV show recommender. You have watched everything.

The user describes what they want. Your ONLY job is to return a JSON object with one field:
  "titles": an ordered array of 10–15 exact movie or TV show titles that best match the request.

Rules:
- Put the BEST match first, then descending order of relevance.
- Use the EXACT title as it appears on TMDB/IMDb (e.g. "Fullmetal Alchemist: Brotherhood", not "FMA Brotherhood").
- Cover a range: include the most obvious picks AND some hidden gems.
- For anime, include actual anime titles (not cartoons).
- For character/lore references (e.g. "mother of dragons"), identify the exact show/movie.
- NO explanations, NO other fields, ONLY the JSON with "titles".

Examples:
User: "fantasy anime with elves and dwarfs"
→ {"titles": ["Frieren: Beyond Journey's End", "Mushoku Tensei: Jobless Reincarnation", "The Rising of the Shield Hero", "Overlord", "That Time I Got Reincarnated as a Slime", "Is It Wrong to Try to Pick Up Girls in a Dungeon?", "Log Horizon", "Record of Lodoss War", "Grimgar: Ashes and Illusions", "Spice and Wolf", "Sword Art Online: Alicization"]}

User: "psychological thriller where you can't trust anyone"
→ {"titles": ["Gone Girl", "Shutter Island", "The Girl on the Train", "Black Swan", "Memento", "Fight Club", "The Others", "Parasite", "Prisoners", "Oldboy"]}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
        console.log("Groq titles:", aiResponse);

        const parsed = JSON.parse(aiResponse);
        const titles: string[] = Array.isArray(parsed.titles)
            ? parsed.titles.filter((t: any) => typeof t === 'string').slice(0, 15)
            : [];

        if (titles.length === 0) {
            return res.json([]);
        }

        // Step 2: Look up every title on TMDB in parallel, in the same order Groq ranked them
        const tmdbLookups = await Promise.all(
            titles.map(title =>
                axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/multi`, {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        language: 'en-US',
                        query: title,
                        page: 1
                    }
                }).catch(() => null)
            )
        );

        // Step 3: For each title, take the single best TMDB match (index 0, skipping persons).
        // Preserve Groq's order exactly — no re-sorting, Groq already ranked by relevance.
        const seenIds = new Set<number>();
        const searchResults: Array<object> = [];

        for (const res of tmdbLookups) {
            if (!res) continue;
            const bestMatch = res.data.results.find(item => item.media_type !== 'person');
            if (!bestMatch) continue;
            if (seenIds.has(bestMatch.id)) continue;
            seenIds.add(bestMatch.id);
            searchResults.push({
                id: bestMatch.id,
                title: bestMatch.title || bestMatch.name,
                type: bestMatch.media_type,
                rating: bestMatch.vote_average,
                imageUrl: bestMatch.poster_path ? `${TMDB_IMAGE_BASE_URL}${bestMatch.poster_path}` : null,
                overview: bestMatch.overview,
                releaseDate: bestMatch.release_date || bestMatch.first_air_date
            });
        }

        console.log(`Vibe Search: ${titles.length} titles → ${searchResults.length} TMDB matches`);
        res.json(searchResults);

    } catch (error) {
        console.error('Vibe Search error:', error);
        res.status(500).json({
            error: 'Failed to perform vibe search',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const CHATBOT_SYSTEM_PROMPT = `You are StarBot, a friendly AI assistant built into StarVault — a platform for discovering movies, TV shows, and anime.

YOUR STRICT SCOPE:
- You ONLY discuss movies, TV shows, anime, actors, directors, genres, and related topics.
- If the user asks ANYTHING unrelated (coding, politics, math, general knowledge, etc.), respond with this exact JSON and nothing else:
  {"text": "I'm StarBot — I only know about movies, TV shows, and anime! Try asking me for recommendations or questions about a specific title. 🎬", "titles": []}

RESPONSE FORMAT:
- Always respond with a single valid JSON object: {"text": "...", "titles": [...]}
- "text": Your conversational reply (1–3 friendly sentences). Never include markdown or special formatting inside "text".
- "titles": An array of EXACT movie/TV/anime titles (as they appear on TMDB/IMDb) when you are recommending content. Use [] if no titles are being recommended.
- Do NOT include any text outside the JSON object. No markdown fences, no preamble.

EXAMPLES:
User: "recommend me a good sci-fi movie"
→ {"text": "Here are some fantastic sci-fi films you might love!", "titles": ["Interstellar", "Arrival", "The Martian", "Ex Machina", "Dune"]}

User: "who directed Parasite?"
→ {"text": "Parasite was directed by the brilliant Bong Joon-ho. He won the Academy Award for Best Director for it in 2020!", "titles": []}

User: "what is the capital of France?"
→ {"text": "I'm StarBot — I only know about movies, TV shows, and anime! Try asking me for recommendations or questions about a specific title. 🎬", "titles": []}`;

export const chatbot = async (req: Request, res: Response) => {
    try {
        const { message, history = [] } = req.body as { message: string; history: ChatMessage[] };

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GROQ_API_KEY || !process.env.TMDB_API_KEY) {
            throw new Error('API keys are missing in environment variables');
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Build message history (cap at last 10 for context window)
        const recentHistory = history.slice(-10);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
                ...recentHistory,
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const rawResponse = chatCompletion.choices[0]?.message?.content || '{}';
        console.log('ChatBot raw response:', rawResponse);

        let parsed: { text?: string; titles?: string[] } = {};
        try {
            parsed = JSON.parse(rawResponse);
        } catch {
            parsed = { text: 'Something went wrong. Please try again!', titles: [] };
        }

        const text = parsed.text || '';
        const titles: string[] = Array.isArray(parsed.titles)
            ? parsed.titles.filter((t: unknown) => typeof t === 'string').slice(0, 10)
            : [];

        // Resolve titles to TMDB media objects (reuse vibe search logic)
        let media: object[] = [];
        if (titles.length > 0) {
            const tmdbLookups = await Promise.all(
                titles.map(title =>
                    axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/multi`, {
                        params: {
                            api_key: process.env.TMDB_API_KEY,
                            language: 'en-US',
                            query: title,
                            page: 1
                        }
                    }).catch(() => null)
                )
            );

            const seenIds = new Set<number>();
            for (const result of tmdbLookups) {
                if (!result) continue;
                const bestMatch = result.data.results.find(item => item.media_type !== 'person');
                if (!bestMatch || seenIds.has(bestMatch.id)) continue;
                seenIds.add(bestMatch.id);
                media.push({
                    id: bestMatch.id,
                    title: bestMatch.title || bestMatch.name,
                    type: bestMatch.media_type,
                    rating: bestMatch.vote_average,
                    imageUrl: bestMatch.poster_path ? `${TMDB_IMAGE_BASE_URL}${bestMatch.poster_path}` : null,
                    overview: bestMatch.overview,
                    releaseDate: bestMatch.release_date || bestMatch.first_air_date
                });
            }
        }

        console.log(`ChatBot: "${message}" → ${media.length} media results`);
        res.json({ text, media });

    } catch (error) {
        console.error('ChatBot error:', error);
        res.status(500).json({
            error: 'Failed to get chatbot response',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

