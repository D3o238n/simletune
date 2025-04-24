import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';

function ProtectedRoute({ children }) { 
  const user = auth.currentUser; // Проверяем, авторизован ли пользователь  
  return user ? children : <Navigate to="/login" />; // Если пользователь авторизован, отображаем дочерний элемент, иначе перенаправляем на страницу входа
}

export default ProtectedRoute;
