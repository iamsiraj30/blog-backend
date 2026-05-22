import app from './app';
import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './app/lib/prisma';


const PORT = process.env.PORT || 3000;


async function startServer() {
  try {
    await  prisma.$connect();
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();