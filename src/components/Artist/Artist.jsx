import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSpotifyToken } from '../../spotifayAuth/spotifayAuth';
import { auth, firestore } from '../../firebase/firebase';
import { collection, doc, updateDoc, arrayUnion, getDocs, query, where } from 'firebase/firestore';

function Artist() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [token, setToken] = useState('');

  // Получаем данные исполнителя
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const token = await getSpotifyToken();
        setToken(token);

        // Получаем информацию об исполнителе
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!artistResponse.ok) {
          throw new Error('Ошибка при запросе к Spotify API');
        }
        const artistData = await artistResponse.json();
        setArtist(artistData);

        // Получаем альбомы исполнителя
        const albumsResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/albums`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!albumsResponse.ok) {
          throw new Error('Ошибка при запросе к Spotify API');
        }
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData.items);

        // Получаем популярные треки исполнителя
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!tracksResponse.ok) {
          throw new Error('Ошибка при запросе к Spotify API');
        }
        const tracksData = await tracksResponse.json();
        setTracks(tracksData.tracks);
      } catch (error) {
        console.error('Ошибка при загрузке данных исполнителя:', error);
        setError('Не удалось загрузить данные исполнителя.');
      }
    };
    fetchArtistData();
  }, [artistId]);

  // Получаем плейлисты пользователя
  useEffect(() => {
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
    fetchPlaylists();
  }, []);

  // Добавление всех треков из альбома в плейлист
  const handleAddAlbumToPlaylist = async (album) => {
    if (!selectedPlaylist) {
      setError('Выберите плейлист.');
      return;
    }

    try {
      // Получаем треки из альбома
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
      const albumTracks = data.items;

      // Добавляем треки в плейлист
      const playlistRef = doc(firestore, 'playlists', selectedPlaylist);
      await updateDoc(playlistRef, {
        tracks: arrayUnion(...albumTracks),
      });
      alert('Все треки из альбома добавлены в плейлист!');
    } catch (error) {
      console.error('Ошибка при добавлении альбома:', error);
      setError('Не удалось добавить треки из альбома в плейлист.');
    }
  };

  // Добавление одного трека в плейлист
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

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{artist?.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Выбор плейлиста */}
      <div className="mb-6">
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

      {/* Альбомы исполнителя */}
      <h2 className="text-xl font-bold mt-6 mb-4">Альбомы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={album.images[0].url}
              alt={album.name}
              className="w-full h-auto rounded"
            />
            <div className="mt-2">
              <p className="font-bold">{album.name}</p>
              <p className="text-gray-600">{album.release_date}</p>
              <button
                onClick={() => handleAddAlbumToPlaylist(album)}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              >
                Добавить альбом в плейлист
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Популярные треки исполнителя */}
      <h2 className="text-xl font-bold mt-6 mb-4">Популярные треки</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-full h-auto rounded"
            />
            <div className="mt-2">
              <p className="font-bold">{track.name}</p>
              <p className="text-gray-600">{track.artists[0].name}</p>
              {track.preview_url && (
                <audio controls className="w-full mt-2">
                  <source src={track.preview_url} type="audio/mpeg" />
                  Ваш браузер не поддерживает аудио элемент.
                </audio>
              )}
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
              <button
                onClick={() => handleAddToPlaylist(track)}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              >
                Добавить в плейлист
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
