import axiosInstance from "../lib/axiosInstance";

interface AuthResponse {
    token: string;
}

export interface MeResponse {
    _id: string;
    email: string;
}

export const registerUser = async (email: string, password: string) => {
    const res = await axiosInstance.post("/api/auth/register", { email, password });
    return res.data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/api/auth/login", { email, password });
    return res.data;
};

export const getMe = async (): Promise<MeResponse> => {
    const res = await axiosInstance.get<MeResponse>("/api/auth/me");
    return res.data;
};