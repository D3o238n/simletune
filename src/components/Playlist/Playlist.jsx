import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../firebase/firebase';
import { collection, addDoc, doc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Playlist() {
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  // Получаем плейлисты пользователя
  const fetchPlaylists = async () => {
    const user = auth.currentUser;
    if (user) {
      const playlistsRef = collection(firestore, 'playlists');
      const q = query(playlistsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const playlistsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlaylists(playlistsData);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Создание плейлиста
  const handleCreatePlaylist = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Пожалуйста, войдите в систему.');
      return;
    }

    if (!playlistName) {
      setError('Введите название плейлиста.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'playlists'), {
        name: playlistName,
        userId: user.uid,
        createdAt: new Date(),
      });
      alert('Плейлист создан!');
      setPlaylistName('');
      setError('');
      fetchPlaylists(); // Обновляем список плейлистов после создания
    } catch (error) {
      console.error('Ошибка при создании плейлиста:', error);
      setError('Не удалось создать плейлист. Проверьте подключение к интернету.');
    }
  };

  // Удаление плейлиста
  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deleteDoc(doc(firestore, 'playlists', playlistId));
      setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
    } catch (error) {
      console.error('Ошибка при удалении плейлиста:', error);
    }
  };

  // Переход на страницу плейлиста
  const handleViewPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Мои плейлисты</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Название плейлиста"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleCreatePlaylist}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Создать
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-white p-4 rounded shadow mb-2">
            <p className="font-bold">{playlist.name}</p>
            <button
              onClick={() => handleViewPlaylist(playlist.id)}
              className="bg-green-500 text-white px-2 py-1 rounded mt-2 mr-2"
            >
              Просмотреть
            </button>
            <button
              onClick={() => handleDeletePlaylist(playlist.id)}
              className="bg-red-500 text-white px-2 py-1 rounded mt-2"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlist;
