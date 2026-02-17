import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/AuthStore.js'

const Dash= () => {
  const { logout } = useAuthStore();
  const [showContent, setShowContent] = useState(false);

  // Load Spline viewer script

  // Trigger content display after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Full-screen robot */}
      {/* Fade-in text and button */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 transition-opacity transition-transform duration-1000 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <p className="text-white text-2xl mb-4">Hi</p>
        <button onClick={logout} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
          Logout
        </button>
      </div>
    </div>
    <div>
      hi
    </div>
    </div>
  );
};

export default Dash;
