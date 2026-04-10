import { useState, useEffect } from 'react';
import type { UserSession } from '../../api/userApi';
import { fetchSessions, updatePassword, logoutAllSessions } from '../../api/userApi';
import { Shield, Key, Loader2, LogOut, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SecurityTab() {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const navigate = useNavigate();

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [savingPass, setSavingPass] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await fetchSessions();
            // Sort by most recently active
            data.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions", error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const getPasswordStrength = () => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score += 25;
        if (/[A-Z]/.test(newPassword)) score += 25;
        if (/[a-z]/.test(newPassword)) score += 25;
        if (/[0-9]/.test(newPassword)) score += 25;
        return score;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        if (newPassword !== confirmPassword) {
            return setPassError("New passwords do not match.");
        }
        if (getPasswordStrength() < 100) {
            return setPassError("Password must be at least 8 characters with upper, lower, and number.");
        }

        setSavingPass(true);
        try {
            const res = await updatePassword(currentPassword, newPassword);
            setPassSuccess(res.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // Password change invalidates sessions, force logout
            setTimeout(() => {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event("auth-change"));
                navigate('/login');
            }, 3000);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            setPassError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setSavingPass(false);
        }
    };

    const handleLogoutOthers = async () => {
        if (!window.confirm("Are you sure you want to log out of all other devices?")) return;
        
        try {
            await logoutAllSessions();
            await loadSessions(); // Refresh list to just show the current one
            alert("Successfully logged out of all other devices.");
        } catch (error) {
            console.error(error);
            alert("Failed to logout other sessions.");
        }
    };

    const formatRelativeTime = (dateStr: string) => {
        const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const parseDeviceIcon = (deviceStr: string) => {
        const lower = deviceStr.toLowerCase();
        if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
            return <Smartphone className="w-6 h-6 text-slate-400" />;
        }
        return <Monitor className="w-6 h-6 text-slate-400" />;
    };

    const strength = getPasswordStrength();
    const strengthColor = strength < 50 ? 'bg-red-500' : strength < 100 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Security</h2>
                <p className="text-slate-400 text-sm">Manage your password and active sessions.</p>
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Key className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
                    {passError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                            {passError}
                        </div>
                    )}
                    {passSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                            {passSuccess} Redirecting to login...
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium text-slate-300">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        {/* Strength Meter */}
                        {newPassword && (
                            <div className="flex gap-2 mt-2">
                                <div className="h-1.5 flex-1 rounded-full bg-slate-700 overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2 pb-2">
                        <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingPass || !currentPassword || !newPassword || !confirmPassword}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {savingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update Password
                    </button>
                </form>
            </div>

            {/* Active Sessions Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <Shield className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Active Sessions</h3>
                            <p className="text-xs text-slate-400">Devices where you are currently logged in</p>
                        </div>
                    </div>
                    
                    {sessions.length > 1 && (
                        <button
                            onClick={handleLogoutOthers}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out other devices
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {loadingSessions ? (
                        <div className="py-8 flex justify-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No active sessions found.</p>
                    ) : (
                        sessions.map((session, index) => {
                            const isCurrent = index === 0; // The first one is mostly the current/most recent
                            return (
                                <div key={session._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/30">
                                    <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/50">
                                        {parseDeviceIcon(session.device)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate" title={session.device}>
                                            {session.device === 'Unknown Device' ? 'General Browser/Device' : session.device}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span>{session.ip || 'Unknown IP'}</span>
                                            <span>•</span>
                                            <span>Active {formatRelativeTime(session.lastActive)}</span>
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                                            Current
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
}
