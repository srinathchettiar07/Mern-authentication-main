// Home.jsx

import React from 'react';
import { motion } from 'framer-motion'; // ✅ Use Framer Motion
import { useAuthStore } from '../store/AuthStore.js';

const Home = () => {
  const { logout } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Hi, this is the Home Page</h1>
      <motion.div
        style={box}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

const box = {
  width: 100,
  height: 100,
  backgroundColor: "#ff0088",
  borderRadius: 5,
};

export default Home;
