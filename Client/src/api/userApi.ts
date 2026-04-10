import axiosInstance from "../lib/axiosInstance";

export interface UserProfile {
    _id: string;
    email: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    accentColor: string;
    memberSince: string | null;
}

export interface UserSession {
    _id: string;
    device: string;
    ip: string;
    lastActive: string;
}

export const fetchProfile = async (): Promise<UserProfile> => {
    const res = await axiosInstance.get<UserProfile>("/api/user/profile");
    return res.data;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await axiosInstance.patch<UserProfile>("/api/user/profile", data);
    return res.data;
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await axiosInstance.patch<{ message: string }>("/api/user/password", { currentPassword, newPassword });
    return res.data;
};

export const fetchSessions = async (): Promise<UserSession[]> => {
    const res = await axiosInstance.get<{ sessions: UserSession[] }>("/api/user/sessions");
    return res.data.sessions;
};

export const logoutAllSessions = async (): Promise<{ message: string }> => {
    const res = await axiosInstance.delete<{ message: string }>("/api/user/sessions");
    return res.data;
};
