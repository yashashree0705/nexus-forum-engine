import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateDiscussion from './pages/CreateDiscussion';
import DiscussionDetail from './pages/DiscussionDetail';
import Profile from './pages/Profile';
// Security Route Vector Guard
const Guard = ({ children }) => {
  return localStorage.getItem('forum_token') ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/create-discussion" element={<Guard><CreateDiscussion /></Guard>} />
        <Route path="/discussion/:id" element={<Guard><DiscussionDetail /></Guard>} />
        <Route path="/profile" element={<Guard><Profile /></Guard>} />
      </Routes>
    </Router>
  );
}