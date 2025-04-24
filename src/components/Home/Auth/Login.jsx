import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/search'); // Перенаправление на страницу поиска
    } catch (error) {
      console.error('Ошибка при входе:', error.message);
      setError('Неверный email или пароль.');
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Войти
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      
    </div>
    
  );
}

export default Login;
