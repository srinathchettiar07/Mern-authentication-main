import { useState , useEffect } from "react";
import { useAuthStore } from "../store/AuthStore.js";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User ,Loader2 } from "lucide-react";
import { Link , useNavigate} from "react-router-dom";

const Login = () => {
  const { isLogingin, login, exists , authUser} = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  useEffect(() => {
    if (authUser) {
      console.log("authUser updated:", authUser); // ✅ Will log once it's set
      // navigate("/dashboard"); // ✅ Safe navigation here
    }
  }, [authUser]); 
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await login(formData);
      
  };
}

  return (
    <div className="w-screen h-screen grid bg-amber-600 lg:grid-cols-2">
      {/* Left Side */}
      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center bg-white text-black px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center">Login</h2>
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <div className="flex items-center border px-3 py-2 rounded-lg">
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
            <div className="flex items-center border px-3 py-2 rounded-lg">
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
            disabled={isLogingin}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLogingin ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loging In...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600">
            Dont have an account?{" "}
            <Link to="/signup" className="text-amber-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
      <div className="flex items-center justify-center text-center p-10">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">Welcome!</h1>
          <p className="text-lg text-white">Continue exactly where You left.</p>
        </div>
      </div>
    </div>
  );
};
export default Login;
