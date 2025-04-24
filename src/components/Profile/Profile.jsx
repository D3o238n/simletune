import React, { useState, useEffect } from 'react';
import { auth, firestore, storage } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarURL, setAvatarURL] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Получаем данные пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setDisplayName(userDoc.data().displayName || '');
            setEmail(user.email || '');
            setAvatarURL(userDoc.data().avatarURL || '');
          } else {
            setError('Данные пользователя не найдены.');
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
          setError('Не удалось загрузить данные пользователя.');
        }
      } else {
        setError('Пользователь не авторизован.');
      }
    };
    fetchUserData();
  }, []);

  // Редактирование профиля
  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Пользователь не авторизован.');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        email: email,
      });

      // Обновляем email в Firebase Authentication
      await updateEmail(user, email);

      setEditMode(false);
      setUserData({ ...userData, displayName: displayName, email: email });
      setSuccess('Профиль успешно обновлён!');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setError('Не удалось обновить профиль.');
    }
  };

  // Загрузка аватара
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка формата и размера файла
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2 МБ

      if (!allowedTypes.includes(file.type)) {
        setError('Допустимые форматы: JPEG, PNG.');
        return;
      }

      if (file.size > maxSize) {
        setError('Размер файла не должен превышать 2 МБ.');
        return;
      }

      const user = auth.currentUser;
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        avatarURL: url,
      });

      setAvatarURL(url);
      setSuccess('Аватар успешно обновлён!');
    }
  };

  // Смена пароля
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Пользователь не авторизован.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess('Пароль успешно изменён!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      setError('Не удалось изменить пароль. Проверьте текущий пароль.');
    }
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Пользователь не авторизован.');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      return;
    }

    try {
      // Удаляем данные пользователя из Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await deleteDoc(userRef);

      // Удаляем аватар из Storage
      if (avatarURL) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await deleteObject(storageRef);
      }

      // Удаляем аккаунт из Firebase Authentication
      await deleteUser(user);

      setSuccess('Аккаунт успешно удалён.');
      navigate('/ '); // Перенаправляем на главную страницу
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
      setError('Не удалось удалить аккаунт. Проверьте, что вы ввели правильный пароль.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {userData ? (
        <div>
          <div className="flex items-center mb-4">
            <img
              src={avatarURL || 'https://via.placeholder.com/150'}
              alt="Аватар"
              className="w-24 h-24 rounded-full mr-4"
            />
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
            >
              Загрузить аватар
            </label>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Допустимые форматы: JPEG, PNG. Максимальный размер: 2 МБ.
          </p>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Имя:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              >
                Отмена
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Имя: {userData.displayName || 'Не указано'}</p>
              <p className="text-gray-600">Email: {userData.email}</p>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              >
                Редактировать профиль
              </button>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Смена пароля</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Текущий пароль:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Новый пароль:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Сменить пароль
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Удаление аккаунта</h2>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Удалить аккаунт
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Загрузка данных...</p>
      )}
    </div>
  );
}

export default Profile;
