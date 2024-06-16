import axios from 'axios';

export async function POST(req, res) {
  const { token } = await req.json();

  try {
    await axios.post('http://localhost:3000/api/auth/revoke', {
      token: token,
    });

    return new Response(JSON.stringify({ message: 'Tokens revoked successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error revoking tokens:', error);
    return new Response(JSON.stringify({ message: 'Failed to revoke tokens' }), { status: 500 });
  }
};
