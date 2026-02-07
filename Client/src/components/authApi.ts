import axios from "axios";

export const registerUser = async (email: string, password: string) => {
    const res = await axios.post("http://localhost:3001/api/auth/register", { email, password });
    return res.data
}
export const loginUser = async (email: string, password: string): Promise<{ token: string }> => {
    const res = await axios.post("http://localhost:3001/api/auth/login", { email, password });
    return res.data
};