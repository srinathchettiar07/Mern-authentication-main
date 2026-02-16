import {create} from  "zustand";
import { persist } from 'zustand/middleware';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { LogOut } from "lucide-react";

const URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore =create(persist((set)=>({
        authUser:null,
        isCheckingAuth:true,
        isSigningin:false,
        isLogingin:false,
        isVerifying:false,
        isUpdatingProfile:false,
        exists:false,
        pendingEmail: null,

        checkAuth: async () =>{
            const res = await axiosInstance.get("/auth/check");
            try {
                if(res)
                set({authUser:res.data});
            } catch (error) {
                set({authUser:null})
                console.log(error + "error in useAuthstore checkUath");
            }
            finally
            {
                set({isCheckingAuth:false})
            }
        },

        signup: async(data) =>{
        set({isSigningUp:true});
        
            try {
            const res = await axiosInstance.post("/auth/signup", data) 
            if(res)console.log("Signup data:", data);  
            else
            {
                console.log("No response from signup");
                return;
            }
            console.log("Signup response:", res.data.user);
            set({pendingEmail: data.email});
            set({exists:false});
            } catch (error) {
            console.log(error + "error in signup");
            toast.error(error.response.data.message);
            }
            finally {
                set({isSigningUp:false});
            }
        },

        verify: async (data) => {
    set({ isVerifying: true });
    try {
        await axiosInstance.post("/auth/verify", data);
        set({ exists: true });
        toast.success("Verification successful, you can now login");
        set({ pendingEmail: null });
        return true; // ✅ success
    } catch (error) {
        toast.error(error.response?.data?.message || "Verification failed");
        return false; // ✅ failure
    } finally {
        set({ isVerifying: false });
    }
},


        login: async(data)=>{
            set({isLogingin:true});
            try {
                const res = await axiosInstance.post("/auth/login", data);
                set({authUser:res.data});
                toast.success("Logged in successfully");
                return true;
            } catch (error) {
                toast.error(error.response.data.message);
                console.log(error + " in login controller");
                return false;
            }
            finally {
                set({isLogingin:false});
            }
        },
         updateProfile: async (data) => {
            set({ isUpdatingProfile: true });
            try {
              const res = await axiosInstance.put("/auth/update-Profile", data);
              set({ authUser: res.data });
              toast.success("Profile updated successfully");
            } catch (error) {
              console.log("error in update profile:", error);
              toast.error(error.response.data.message);
            } finally {
              set({ isUpdatingProfile: false });
            }
          },
          logout : async () =>{
            set({authUser:null});
            try {
                const res = await axiosInstance.post("/auth/logout");
                console.log("Logout response:", res);
                toast.success("Logged out successfully");
            } catch (error) {
                console.log(error + " in logout controller");
                toast.error(error.response.data.message);
            }
            finally {
                set({authUser:null});
            }
          }
    }
)))
