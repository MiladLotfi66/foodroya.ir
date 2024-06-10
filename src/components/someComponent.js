// /app/someComponent.js
"use client"
import { useRefreshToken } from '@/utils/useRefreshToken';
import { useEffect } from 'react';

export default function SomeComponent() {
    useEffect(() => {
        async function refresh() {
            try {
                const data = await useRefreshToken();
                console.log(data.message);
            } catch (error) {
                console.error(error.message);
            }
        }

        refresh();
    }, []);

    return (
        <div>
            <h1>Some Component</h1>
        </div>
    );
}
