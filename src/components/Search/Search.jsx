import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Добавляем импорт Link
import { getSpotifyToken } from '../../spotifayAuth/spotifayAuth';
import { auth, firestore } from '../../firebase/firebase';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [searchType, setSearchType] = useState('track');
  const user = auth.currentUser;

  // Получаем токен при загрузке компонента
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getSpotifyToken();
        setToken(accessToken);
      } catch (error) {
        console.error('Ошибка при получении токена:', error);
        setError('Не удалось получить доступ к Spotify API.');
      }
    };
    fetchToken();
  }, []);

  // Получаем плейлисты пользователя
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user) {
        const playlistsRef = collection(firestore, 'playlists');
        const q = query(playlistsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const playlistsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlaylists(playlistsData);
      }
    };
    fetchPlaylists();
  }, [user]);

  // Поиск треков, альбомов или исполнителей
  const search = async () => {
    if (!searchQuery || !token) {
      setError('Введите запрос для поиска');
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Ошибка при запросе к Spotify API');
      }
      const data = await response.json();
      if (searchType === 'track') {
        setTracks(data.tracks.items);
        setAlbums([]);
        setArtists([]);
      } else if (searchType === 'album') {
        setAlbums(data.albums.items);
        setTracks([]);
        setArtists([]);
      } else if (searchType === 'artist') {
        setArtists(data.artists.items);
        setTracks([]);
        setAlbums([]);
      }
      setError('');
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setError('Не удалось выполнить запрос. Проверьте подключение к интернету.');
    }
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  // Добавление трека в плейлист
  const handleAddToPlaylist = async (track) => {
    if (!selectedPlaylist) {
      setError('Выберите плейлист.');
      return;
    }

    try {
      const playlistRef = doc(firestore, 'playlists', selectedPlaylist);
      await updateDoc(playlistRef, {
        tracks: arrayUnion(track),
      });
      alert('Трек добавлен в плейлист!');
    } catch (error) {
      console.error('Ошибка при добавлении трека:', error);
      setError('Не удалось добавить трек в плейлист.');
    }
  };

  // Добавление всех треков из альбома в плейлист
  const handleAddAlbumToPlaylist = async (album) => {
    if (!selectedPlaylist) {
      setError('Выберите плейлист.');
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Ошибка при запросе к Spotify API');
      }
      const data = await response.json();
      const tracks = data.items;

      const playlistRef = doc(firestore, 'playlists', selectedPlaylist);
      await updateDoc(playlistRef, {
        tracks: arrayUnion(...tracks),
      });
      alert('Все треки из альбома добавлены в плейлист!');
    } catch (error) {
      console.error('Ошибка при добавлении альбома:', error);
      setError('Не удалось добавить треки из альбома в плейлист.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Поиск музыки</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Введите название трека, альбома или исполнителя"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Обработка нажатия Enter
          className="p-2 border rounded w-full"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="track">Треки</option>
          <option value="album">Альбомы</option>
          <option value="artist">Исполнители</option>
        </select>
        <button
          onClick={search}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Поиск
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <select
          value={selectedPlaylist}
          onChange={(e) => setSelectedPlaylist(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Выберите плейлист</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchType === 'track' &&
          tracks.map((track) => (
            <div key={track.id} className="bg-white p-4 rounded shadow">
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-full h-auto rounded"
              />
              <div className="mt-2">
                <p className="font-bold">{track.name}</p>
                <p className="text-gray-600">{track.artists[0].name}</p>
                {user ? (
                  track.preview_url ? (
                    <div>
                      <audio controls className="w-full mt-2">
                        <source src={track.preview_url} type="audio/mpeg" />
                        Ваш браузер не поддерживает аудио элемент.
                      </audio>
                      <p className="text-gray-500 text-sm mt-1">
                        Превью трека (30 секунд).
                      </p>
                    </div>
                  ) : (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        `${track.name} ${track.artists[0].name}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2"
                    >
                      Прослушать на YouTube
                    </a>
                  )
                ) : (
                  <p className="text-red-500 mt-2">
                    Войдите в систему, чтобы добавить трек в плейлист.
                  </p>
                )}
                {user && (
                  <button
                    onClick={() => handleAddToPlaylist(track)}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Добавить в плейлист
                  </button>
                )}
              </div>
            </div>
          ))}
        {searchType === 'album' &&
          albums.map((album) => (
            <div key={album.id} className="bg-white p-4 rounded shadow">
              <img
                src={album.images[0].url}
                alt={album.name}
                className="w-full h-auto rounded"
              />
              <div className="mt-2">
                <p className="font-bold">{album.name}</p>
                <p className="text-gray-600">{album.artists[0].name}</p>
                {user && (
                  <button
                    onClick={() => handleAddAlbumToPlaylist(album)}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Добавить альбом в плейлист
                  </button>
                )}
              </div>
            </div>
          ))}
        {searchType === 'artist' &&
          artists.map((artist) => (
            <div key={artist.id} className="bg-white p-4 rounded shadow">
              <img
                src={artist.images[0]?.url || 'https://via.placeholder.com/150'}
                alt={artist.name}
                className="w-full h-auto rounded"
              />
              <div className="mt-2">
                <p className="font-bold">{artist.name}</p>
                <Link
                  to={`/artist/${artist.id}`} // Ссылка на страницу исполнителя
                  className="text-blue-500 hover:underline"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Search;
