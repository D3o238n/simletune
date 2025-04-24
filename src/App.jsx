import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase/firebase';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Search from './components/Search/Search';
import Playlist from './components/Playlist/Playlist';
import PlaylistDetails from './components/Playlist/PlaylistDetails';
import Artist from './components/Artist/Artist';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe(); 
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute user={user}>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlist"
          element={
            <ProtectedRoute user={user}>
              <Playlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlist/:playlistId"
          element={
            <ProtectedRoute user={user}>
              <PlaylistDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/:artistId"
          element={
            <ProtectedRoute user={user}>
              <Artist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;