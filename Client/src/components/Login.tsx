import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "./authApi";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Loader2, Star, Sparkles } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", email);
            window.dispatchEvent(new Event("auth-change"));
            navigate("/");
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setError(axiosErr.response?.data?.message || "Login failed. Please check your credentials.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-[#081a0b] via-[#0e1f10] to-[#081a0b]">

            {/* Left branding panel — hidden on mobile */}
            <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900/30 to-teal-900/20 lg:flex">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center gap-6 px-12 text-center"
                >
                    <div className="flex items-center gap-3">
                        <Star className="h-10 w-10 fill-emerald-400 text-emerald-400" />
                        <h1 className="bg-gradient-to-r from-lime-200 via-emerald-300 to-teal-400 bg-clip-text text-6xl font-black tracking-tighter text-transparent">
                            StarVault
                        </h1>
                    </div>
                    <p className="max-w-sm text-lg font-medium text-gray-300">
                        Your personal galaxy of movies, shows, and reviews.
                    </p>
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-gray-300 backdrop-blur-sm border border-white/10">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        Discover · Review · Share
                    </div>
                </motion.div>
            </div>

            {/* Right form panel */}
            <div className="relative flex w-full items-center justify-center px-6 py-20 lg:w-1/2">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <motion.div variants={itemVariants} className="mb-10 flex items-center justify-center gap-2 lg:hidden">
                        <Star className="h-7 w-7 fill-emerald-400 text-emerald-400" />
                        <span className="bg-gradient-to-r from-lime-200 via-emerald-300 to-teal-400 bg-clip-text text-3xl font-black tracking-tighter text-transparent">
                            StarVault
                        </span>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:p-10"
                    >
                        <motion.div variants={itemVariants}>
                            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                            <p className="mt-2 text-gray-400">Sign in to continue to StarVault</p>
                        </motion.div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-5 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-300"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="mt-8 space-y-5">
                            <motion.div variants={itemVariants}>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-emerald-400/50 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/30"
                                        placeholder="you@example.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-12 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-emerald-400/50 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/30"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-200"
                                    >
                                        {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all duration-300 hover:shadow-emerald-700/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                        {loading ? "Signing in…" : "Sign In"}
                                    </span>
                                </button>
                            </motion.div>
                        </form>

                        <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                            >
                                Create account
                            </Link>
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
