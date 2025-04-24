const clientId = '6ff93fcb64514f0aa4f132f15f3a7592'; 
const clientSecret = '62c2e51b30f34ecc8e19db2862de91fc'; 

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