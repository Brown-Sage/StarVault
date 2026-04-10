import { useState } from 'react';
import type { UserProfile } from '../../api/userApi';
import { updateProfile } from '../../api/userApi';
import { Camera, Check, Loader2 } from 'lucide-react';
import md5 from 'md5';

interface AccountTabProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function AccountTab({ profile, setProfile }: AccountTabProps) {
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form inputs state
    const [editName, setEditName] = useState(profile.displayName || '');
    const [editBio, setEditBio] = useState(profile.bio || '');
    const [editAvatar, setEditAvatar] = useState(profile.avatarUrl || '');
    const [showAvatarInput, setShowAvatarInput] = useState(false);

    // Accent colors definitions
    const accentColors = [
        { id: 'indigo', hex: 'bg-indigo-500', name: 'Indigo' },
        { id: 'violet', hex: 'bg-violet-500', name: 'Violet' },
        { id: 'emerald', hex: 'bg-emerald-500', name: 'Emerald' },
        { id: 'rose', hex: 'bg-rose-500', name: 'Rose' },
        { id: 'amber', hex: 'bg-amber-500', name: 'Amber' }
    ];

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSave = async (dataToUpdate: Partial<UserProfile>, showFeedback = true) => {
        setSaving(true);
        try {
            await updateProfile(dataToUpdate);
            setProfile(p => p ? { ...p, ...dataToUpdate } : p);
            window.dispatchEvent(new Event("profile-change"));
            if (showFeedback) showToast('Profile updated!');
        } catch (error) {
            console.error('Failed to update profile', error);
            if (showFeedback) showToast('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Auto-save blurring handlers
    const handleNameBlur = () => {
        if (editName !== profile.displayName) handleSave({ displayName: editName });
    };

    const handleBioBlur = () => {
        if (editBio !== profile.bio) handleSave({ bio: editBio });
    };

    const handleAvatarSave = () => {
        if (editAvatar !== profile.avatarUrl) handleSave({ avatarUrl: editAvatar });
        setShowAvatarInput(false);
    };

    const handleColorSelect = (color: string) => {
        if (color !== profile.accentColor) {
            setProfile(p => p ? { ...p, accentColor: color } : p); // Optimistic UI update
            handleSave({ accentColor: color }, true);
        }
    };

    const displayAvatar = profile.avatarUrl || `https://www.gravatar.com/avatar/${md5(profile.email.trim().toLowerCase())}?d=identicon`;
    
    // Parse Date safely
    const joinedStr = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric'
    }) : 'Recently';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">My Account</h2>
                <p className="text-slate-400 text-sm">Manage your profile information and appearance settings.</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-8">
                
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group/avatar cursor-pointer" onClick={() => setShowAvatarInput(!showAvatarInput)}>
                        <img 
                            src={displayAvatar} 
                            alt="Profile Avatar" 
                            className={`w-28 h-28 object-cover rounded-full border-4 border-slate-700 group-hover/avatar:border-${profile.accentColor || 'indigo'}-500 transition-colors bg-slate-900 shadow-xl`}
                        />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white mb-1" />
                            <span className="text-[10px] text-white font-medium">EDIT URL</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-xl font-bold text-white">{profile.displayName || 'Set Display Name'}</h3>
                                <p className="text-slate-400 text-sm">{profile.email}</p>
                            </div>
                            <span className="inline-flex max-w-max items-center rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-600/50">
                                Member since {joinedStr}
                            </span>
                        </div>

                        {showAvatarInput && (
                            <div className="flex gap-2 animate-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    placeholder="Paste image URL here..."
                                    value={editAvatar}
                                    onChange={e => setEditAvatar(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <button 
                                    onClick={handleAvatarSave}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-slate-700/50" />

                {/* Profile Form */}
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Display Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onBlur={handleNameBlur}
                                placeholder="Your display name"
                                className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address <span className="text-slate-500 text-xs ml-2">(Cannot be changed)</span></label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full bg-slate-900/30 border border-slate-700/30 cursor-not-allowed text-slate-400 rounded-xl px-4 py-3"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Short Bio</label>
                        <textarea
                            value={editBio}
                            onChange={e => setEditBio(e.target.value)}
                            onBlur={handleBioBlur}
                            placeholder="Write a little bit about your favorite movies and shows..."
                            rows={3}
                            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                        />
                    </div>
                </div>

                <hr className="border-slate-700/50" />

                {/* Theme Customization */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">Accent Color</label>
                    <p className="text-xs text-slate-400 mb-3">Choose the color that powers your StarVault experience.</p>
                    <div className="flex flex-wrap gap-4">
                        {accentColors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => handleColorSelect(color.id)}
                                className={`w-12 h-12 rounded-full ${color.hex} flex items-center justify-center transition-all shadow-lg ${
                                    profile.accentColor === color.id 
                                    ? 'ring-4 ring-offset-2 ring-offset-slate-800 ring-white scale-110' 
                                    : 'hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-800 hover:ring-white/50'
                                }`}
                                title={color.name}
                            >
                                {profile.accentColor === color.id && <Check className="w-6 h-6 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Floating Toast */}
            <div className={`fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span className="font-medium text-sm">{toastMessage}</span>
            </div>
        </div>
    );
}
