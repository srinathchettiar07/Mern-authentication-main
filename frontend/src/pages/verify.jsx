import React , {useState ,useEffect} from 'react'
import { useAuthStore } from "../store/AuthStore.js";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

const verify = () => { 
const {isVerifying, verify , authUser , pendingEmail} = useAuthStore();
const navigate = useNavigate();
const [formData, setFormData] = useState({
  email: '',
  otp:''});
  useEffect(() => {
    if (!pendingEmail) {
      navigate("/signup");
    }
  }, [pendingEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await verify({
      email: pendingEmail,
      otp: formData.otp,
    });

    if (success) navigate("/login");
  };

  return (
 <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(270deg, #facc15, #fbbf24, #fcd34d)',
      }}
    >
      {/* OTP Verification Card */}
      <motion.div
        className="relative bg-white p-12 rounded-xl shadow-2xl w-full max-w-lg z-10"
        whileHover={{ scale: 1.03 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Enter the 6-digit OTP sent to <span className="font-semibold text-amber-700">{pendingEmail}</span>
          </p>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={formData.otp[i] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/, '');
                  const otpArray = formData.otp.split('');
                  otpArray[i] = val;
                  const newOtp = otpArray.join('').padEnd(6, '');
                  setFormData(prev => ({ ...prev, otp: newOtp }));

                  if (val && i < 5) {
                    const next = document.getElementById(`otp-${i + 1}`);
                    if (next) next.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !formData.otp[i] && i > 0) {
                    const prev = document.getElementById(`otp-${i - 1}`);
                    if (prev) prev.focus();
                  }
                }}
                id={`otp-${i}`}
                className="w-14 h-16 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg text-lg hover:bg-amber-700 transition shadow-md"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </form>
      </motion.div>
    </div>

  )
}

export default verify;
