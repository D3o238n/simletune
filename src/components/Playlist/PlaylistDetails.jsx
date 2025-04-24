import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

function PlaylistDetails() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');

  // Получаем данные плейлиста
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const playlistRef = doc(firestore, 'playlists', playlistId);
        const playlistDoc = await getDoc(playlistRef);
        if (playlistDoc.exists()) {
          setPlaylist(playlistDoc.data());
          setTracks(playlistDoc.data().tracks || []);
        } else {
          setError('Плейлист не найден.');
        }
      } catch (error) {
        console.error('Ошибка при загрузке плейлиста:', error);
        setError('Не удалось загрузить плейлист.');
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  // Удаление трека из плейлиста
  const handleRemoveTrack = async (track) => {
    try {
      const playlistRef = doc(firestore, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        tracks: arrayRemove(track),
      });
      setTracks(tracks.filter((t) => t.id !== track.id));
    } catch (error) {
      console.error('Ошибка при удалении трека:', error);
      setError('Не удалось удалить трек.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{playlist?.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white p-4 rounded shadow">
            <img
              src={track.album?.images?.[0]?.url || 'https://via.placeholder.com/150'}
              alt={track.name}
              className="w-full h-auto rounded"
            />
            <div className="mt-2">
              <p className="font-bold">{track.name}</p>
              <p className="text-gray-600">{track.artists[0].name}</p>
              {track.preview_url ? (
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
              )}
              <button
                onClick={() => handleRemoveTrack(track)}
                className="bg-red-500 text-white px-2 py-1 rounded mt-2"
              >
                Удалить из плейлиста
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlaylistDetails;