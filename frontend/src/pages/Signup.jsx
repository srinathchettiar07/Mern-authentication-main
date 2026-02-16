import { useState } from "react";
import { useAuthStore } from "../store/AuthStore.js";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link , useNavigate} from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    role: '',
    email: '',
    password: '',
  });

  const { isSigningin, signup , exists} = useAuthStore();

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error("Full name is required");
    if (!formData.role.trim()) return toast.error("Role is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    console.log("Form Data:", formData);
    if (success === true) 
    {
      signup(formData);
      if (!exists) {
        toast.success("please check your email for verification");
        navigate("/verify");
      } 
    }
      
    
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-screen h-screen grid bg-amber-600 lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex items-center justify-center text-center p-10">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">Welcome!</h1>
          <p className="text-lg text-white">Join us today and start your journey.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center bg-white text-black px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center">Create Account</h2>

          {/* Full Name */}
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <div className="flex items-center border border-gray-200 px-3 py-2 rounded-lg focus-within:border-red-600 focus-within:shadow-md focus-within:shadow-red-300 transition duration-200">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full outline-none bg-transparent "
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium">Role</label>
            <div className="flex items-center border border-gray-200 px-3 py-2 rounded-lg focus-within:border-red-600 focus-within:shadow-md focus-within:shadow-red-300 transition duration-200">
              <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full outline-none bg-transparent"
              >
                <option value="" className="text-gray-400">Select role</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                
              </select>
            </div>
          </div>


          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <div className="flex items-center border border-gray-200 px-3 py-2 rounded-lg focus-within:border-red-600 focus-within:shadow-md focus-within:shadow-red-300 transition duration-200">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <div className="flex items-center border border-gray-200 px-3 py-2 rounded-lg focus-within:border-red-600 focus-within:shadow-md focus-within:shadow-red-300 transition duration-200">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={showPassword? "password" :"••••••••"}
                className="w-full outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="ml-2 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningin}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {isSigningin ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
