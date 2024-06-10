// /utils/useRefreshToken.js

'use server';

export async function useRefreshToken() {
    try {
        console.log("11111");
        const res = await fetch('/api/refreshToken', {
            method: 'POST',
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to refresh token');
        }

        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to refresh token');
    }
}
