Planning Poker (MVP)

Запуск локально

Сервер

```
cd server
npm install
npm start
```

Сервер поднимется на `http://localhost:3001`.

Опционально задайте `CLIENT_ORIGIN` для CORS (по умолчанию `http://localhost:5173`).

Клиент

```
cd client
npm install
# укажите адрес сервера, если нужен: echo "VITE_SERVER_URL=http://localhost:3001" > .env
npm run dev
```

Клиент доступен на `http://localhost:5173`.

Флоу
- Создайте комнату, скопируйте ссылку и поделитесь.
- Участники заходят по ссылке, вводят имя, присоединяются.
- Ведущий задаёт задачу, участники голосуют картами.
- После голосования ведущий раскрывает результаты; видно среднее.
- Начните новый раунд по кнопке.

Технологии
- Клиент: React + TypeScript + TailwindCSS + Vite
- Сервер: Node.js (Express) + Socket.IO
- Хранилище: In-memory (Map)


