import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Star, ChevronRight, ChevronLeft } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaItem {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string | null;
    overview: string;
    releaseDate: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    media?: MediaItem[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// ─── Mini Media Card ─────────────────────────────────────────────────────────

function MiniMediaCard({ item }: { item: MediaItem }) {
    return (
        <Link
            to={`/${item.type}/${item.id}-${createSlug(item.title)}`}
            className="flex-shrink-0 w-28 group"
        >
            <div className="relative rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-indigo-500/60 transition-all duration-300">
                <div className="aspect-[2/3] bg-white/5">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/30 text-xs text-center p-2">
                            No Image
                        </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Rating badge */}
                    <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-yellow-500/25">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-white">{item.rating.toFixed(1)}</span>
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-1.5 left-1.5 bg-indigo-600/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        <span className="text-[9px] font-semibold text-white uppercase tracking-wide">{item.type}</span>
                    </div>
                </div>
            </div>
            <p className="mt-1.5 text-[11px] text-white/80 group-hover:text-indigo-400 font-medium line-clamp-2 transition-colors leading-tight">
                {item.title}
            </p>
        </Link>
    );
}

// ─── Media Row (scrollable with arrows) ──────────────────────────────────────

function MediaRow({ media }: { media: MediaItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 2);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener('scroll', checkScroll);
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [media]);

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
    };

    return (
        <div className="w-full relative group/mediarow">
            {canLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-6 z-10 bg-black/70 hover:bg-indigo-600 text-white rounded-full p-1 opacity-0 group-hover/mediarow:opacity-100 transition-all duration-200 hover:scale-110 border border-white/10"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
            )}
            <div
                ref={scrollRef}
                className="flex gap-2.5 overflow-x-auto pb-2 px-0.5 scroll-smooth"
                style={{ scrollbarWidth: 'none' }}
            >
                {media.map((item) => (
                    <MiniMediaCard key={item.id} item={item} />
                ))}
            </div>
            {canRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-6 z-10 bg-black/70 hover:bg-indigo-600 text-white rounded-full p-1 opacity-0 group-hover/mediarow:opacity-100 transition-all duration-200 hover:scale-110 border border-white/10"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
        >
            {/* Text bubble */}
            <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isUser
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white/8 border border-white/10 text-gray-200 rounded-bl-sm'
                }`}
            >
                {msg.content}
            </div>

            {/* Media cards row */}
            {msg.media && msg.media.length > 0 && (
                <MediaRow media={msg.media} />
            )}
        </motion.div>
    );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-start gap-2"
        >
            <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
    role: 'assistant',
    content: "Hey! I'm StarBot 🎬 Ask me for movie, TV show, or anime recommendations — or anything about a specific title!",
};

const SUGGESTIONS = [
    'Recommend a thriller',
    'Best anime of all time',
    'Movies like Inception',
    'Top sci-fi TV shows',
];

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: trimmed };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Build history for context (exclude the welcome message, cap at 10)
            const history = updatedMessages
                .slice(1) // skip welcome
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, history }),
            });

            if (!res.ok) throw new Error('API request failed');
            const data: { text: string; media: MediaItem[] } = await res.json();

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.text || 'Sorry, I had trouble with that. Try asking something else!',
                    media: data.media || [],
                },
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: "Oops, something went wrong on my end. Give it another shot!",
                    media: [],
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chat-panel"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                        style={{
                            background: 'rgba(15, 23, 42, 0.92)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4), inset 0 0 10px rgba(99, 102, 241, 0.2), 0 8px 40px rgba(0,0,0,0.6)',
                        }}
                    >

                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8"
                             style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0">
                                <Bot className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">StarBot</p>
                                <p className="text-indigo-400 text-xs">Your movie & anime guide</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/8"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 min-h-[320px] max-h-[420px]"
                             style={{ scrollbarWidth: 'none' }}>
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} />
                            ))}
                            <AnimatePresence>
                                {isLoading && <TypingIndicator />}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion chips (only shown when just the welcome message) */}
                        {messages.length === 1 && (
                            <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => sendMessage(s)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/60 transition-all duration-200 flex items-center gap-1"
                                    >
                                        {s}
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-3.5 py-3 border-t border-white/8 flex gap-2 items-center"
                             style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about movies, shows, anime..."
                                disabled={isLoading}
                                className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all disabled:opacity-50"
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating Trigger Button ── */}
            <motion.button
                onClick={() => setIsOpen(prev => !prev)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl shadow-indigo-900/60 flex items-center justify-center transition-colors duration-300"
                style={{
                    background: isOpen
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : 'linear-gradient(135deg, #6366f1, #14b8a6)',
                }}
                aria-label="Open StarBot chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="x"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bot"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <Bot className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-25 pointer-events-none" />
                )}
            </motion.button>
        </>
    );
}
