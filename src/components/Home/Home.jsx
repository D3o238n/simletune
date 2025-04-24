import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Добро пожаловать в SimpleTune!</h1>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded">
          Вход
        </Link>
        <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded">
          Регистрация
        </Link>
      </div>
    </div>
  );
}

export default Home;
