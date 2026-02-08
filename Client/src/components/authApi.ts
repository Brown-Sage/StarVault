import axios from "axios";
interface AuthResponse {
    token: string;
}

const API = import.meta.env.VITE_API_BASE_URL;

export const registerUser = async (email: string, password: string) => {
    const res = await axios.post(`${API}/api/auth/register`, { email, password });
    return res.data
}
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await axios.post<AuthResponse>(`${API}/api/auth/login`, { email, password });
    return res.data;
};