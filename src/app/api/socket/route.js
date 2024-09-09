import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('message', (msg) => {
        console.log('Message received:', msg);
        io.emit('message', msg); // ارسال پیام به تمامی کلاینت‌ها
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  return NextResponse.next();
}
