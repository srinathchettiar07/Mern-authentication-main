import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Verify from './pages/verify.jsx';
import Login from './pages/login.jsx';
import Home from './pages/home.jsx';
import Dashboard from './pages/dashboard.jsx';
import { useAuthStore } from './store/AuthStore.js';

const App = () => {
  const {authUser } = useAuthStore();
  return (
      <Routes>
        <Route path="/" element={ <Home/>}/>
        <Route path='/login' element={!authUser?<Login />:<Navigate to="/dashboard" />} />
        <Route path="/signup" element={!authUser? <Signup/>:<Navigate to="/verify"/>}/>
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={authUser? <Dashboard />:<Navigate to="/login" />} />
      </Routes>
  );
};

export default App;
