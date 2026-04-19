import { useState, useEffect } from "react";
import type { UserProfile } from "../api/userApi";
import { fetchProfile } from "../api/userApi";
import AccountTab from "../components/settings/AccountTab";
import SecurityTab from "../components/settings/SecurityTab";
import { User, Shield, Loader2 } from "lucide-react";
import { getAccent } from "../lib/accentTheme";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<"account" | "security">("account");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await fetchProfile();
            setProfile(data);
        } catch {
            setError("Failed to load profile. Please try logging in again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#6366f1' }} />
                <p className="text-slate-400 font-medium">Loading your settings...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md">
                    <p className="text-red-400 font-medium">{error || "Could not load settings."}</p>
                </div>
            </div>
        );
    }

    const accent = getAccent(profile.accentColor);

    const activeTabStyle = {
        backgroundColor: accent.bg,
        color: accent.text,
        borderColor: accent.border,
        boxShadow: accent.shadow,
    };

    return (
        <div
            className="settings-root min-h-screen pt-28 pb-20 px-4 sm:px-8 xl:px-0 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10"
            style={{ '--settings-accent': accent.solid } as React.CSSProperties}
        >
            {/* Sidebar */}
            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <div className="sticky top-28 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Settings</h1>
                        <p className="text-sm text-slate-400">Manage your personalized StarVault experience.</p>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab("account")}
                            style={activeTab === "account" ? activeTabStyle : {}}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm border ${
                                activeTab === "account"
                                    ? "border-transparent"
                                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white"
                            }`}
                        >
                            <User className={`w-5 h-5 ${activeTab === "account" ? "" : "opacity-70"}`} />
                            My Account
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            style={activeTab === "security" ? activeTabStyle : {}}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm border ${
                                activeTab === "security"
                                    ? "border-transparent"
                                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white"
                            }`}
                        >
                            <Shield className={`w-5 h-5 ${activeTab === "security" ? "" : "opacity-70"}`} />
                            Security
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                {activeTab === "account" && <AccountTab profile={profile} setProfile={setProfile} />}
                {activeTab === "security" && <SecurityTab />}
            </main>
        </div>
    );
}
