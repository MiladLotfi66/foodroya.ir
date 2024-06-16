import axios from 'axios';

export async function POST(req, res) {
  const { refreshToken } = await req.json();

  try {
    const response = await axios.post('http://localhost:3000/api/auth/refresh', {
      refresh_token: refreshToken,
    });

    const refreshedTokens = response.data;
    return new Response(JSON.stringify(refreshedTokens), { status: 200 });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return new Response(JSON.stringify({ error: 'Failed to refresh token' }), { status: 500 });
  }
};
