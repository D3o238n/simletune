const clientId = ''; 
const clientSecret = ''; 

export const getSpotifyToken = async () => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
      throw new Error('Ошибка при получении токена');
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    throw error;
  }
};
