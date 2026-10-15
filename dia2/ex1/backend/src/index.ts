import dotenv from 'dotenv';
import { createApp } from './app';
import { openDatabase } from './database';

dotenv.config();
const database = openDatabase(process.env.DATABASE_PATH);
const app = createApp(database);
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
