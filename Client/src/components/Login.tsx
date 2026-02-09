import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "./authApi";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const data = await loginUser(email, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        window.dispatchEvent(new Event("auth-change"));

        alert("Logged in");
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0118] text-white">
            <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Welcome Back
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>
                </div>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
