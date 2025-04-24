import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function Navbar() {
  const [user] = useAuthState(auth); // Получаем текущего пользователя

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Логотип и название */}
        <div className="text-xl font-bold flex items-center">
          <span className="mr-2">🎵</span>
          <span>SimpleTune</span>
        </div>

        {/* Кнопки навигации */}
        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Поиск
          </Link>
          <Link
            to="/playlist"
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition duration-300"
          >
            Плейлисты
          </Link>

          {/* Профиль или вход/регистрация */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Аватар"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300">
                    Профиль
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
              >
                Выход
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300"
              >
                Вход
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
