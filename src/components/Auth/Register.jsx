import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Сохраняем данные пользователя в Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        displayName: displayName,
        email: email,
        createdAt: new Date(),
        avatarURL: '', // По умолчанию аватар пустой
      });

      console.log('Пользователь успешно зарегистрирован и данные сохранены в Firestore');
      navigate('/search'); // Перенаправление на страницу поиска
    } catch (error) {
      console.error('Ошибка при регистрации:', error.message);
      setError('Ошибка при регистрации. Проверьте введённые данные. Пароль должен содержать не менее 6 символов.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md">
        <input
          type="text"
          placeholder="Имя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
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
          Зарегистрироваться
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default Register;