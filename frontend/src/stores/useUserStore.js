import { create } from "zustand";
import axios from "../lib/axios.js"
import { toast } from "react-hot-toast"


export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async({name, email, password, confirmPassword}) => {
        set({loading: true})
        if(password !== confirmPassword) {
            toast.error("Passwords do not match")
            set({loading: false})
            return
        }

        try {
            const res = await axios.post('/auth/signup', {name, email, password});
            set({user: res.data.user, loading:false});
        } catch (error) {
            set({loading: false});
            console.log(error);
            toast.error(error.response?.data?.message || "Signup failed, please try again...");  
        }
    },
    login: async(email, password) => {
        set({loading: true})
        
        try {
            const res = await axios.post('/auth/login', {email, password});
            // console.log(res.data.user.role, "data.user.role");
            
            set({user: res.data.user, loading:false});
        } catch (error) {
            set({loading: false});
            console.log(error);
            toast.error(error.response?.data?.message || "Login failed, please try again...");  
        }
    },
    checkAuth: async() => {
        set({checkingAuth: true});
        try {
            const response = await axios.get('/auth/profile');
            // console.log(response.data.role);
            
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            set({checkingAuth: false, user: null});
            
        }
    },
    logout: async() => {
        try {
            await axios.post("/auth/logout");
            set({user: null});
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occured during logout");
        }
    }
}))

//implement kar axios interceptors for refreshing the access token after every 15min