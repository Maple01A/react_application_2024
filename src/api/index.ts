import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// アプリケーションの初期化
const app = express();
const port = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// データファイルのパス
const tasksFilePath = path.join(__dirname, 'tasks.json');
const eventsFilePath = path.join(__dirname, 'events.json');

// タスクの型定義
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// イベントの型定義
interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// データファイルの読み込み
const readDataFromFile = <T>(filePath: string): T[] => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('データの読み込みエラー:', error);
    return [];
  }
};

// データファイルへの書き込み
const writeDataToFile = <T>(filePath: string, data: T[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('データの書き込みエラー:', error);
  }
};

// タスク関連のヘルパー関数
const readTasksFromFile = (): Task[] => readDataFromFile<Task>(tasksFilePath);
const writeTasksToFile = (tasks: Task[]): void => writeDataToFile<Task>(tasksFilePath, tasks);

// イベント関連のヘルパー関数
const readEventsFromFile = (): Event[] => readDataFromFile<Event>(eventsFilePath);
const writeEventsToFile = (events: Event[]): void => writeDataToFile<Event>(eventsFilePath, events);

// ==== タスク関連のエンドポイント ====

// すべてのタスクを取得
app.get('/api/tasks', (req: Request, res: Response) => {
  const tasks = readTasksFromFile();
  res.json(tasks);
});

// IDによるタスクの取得
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ message: 'タスクが見つかりません' });
  }
  
  res.json(task);
});

// 新しいタスクの作成
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'タイトルは必須です' });
  }
  
  const tasks = readTasksFromFile();
  const now = new Date().toISOString();
  
  const newTask: Task = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now
  };
  
  tasks.push(newTask);
  writeTasksToFile(tasks);
  
  res.status(201).json(newTask);
});

// タスクの更新
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { title, description, completed } = req.body;
  const taskId = req.params.id;
  
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ message: 'タイトルは空にできません' });
  }
  
  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'タスクが見つかりません' });
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    title: title !== undefined ? title.trim() : tasks[taskIndex].title,
    description: description !== undefined ? description.trim() : tasks[taskIndex].description,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  writeTasksToFile(tasks);
  
  res.json(updatedTask);
});

// タスクの削除
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const tasks = readTasksFromFile();
  const initialLength = tasks.length;
  
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  
  if (filteredTasks.length === initialLength) {
    return res.status(404).json({ message: 'タスクが見つかりません' });
  }
  
  writeTasksToFile(filteredTasks);
  res.json({ message: 'タスクを削除しました' });
});

// タスクの完了状態の切り替え
app.patch('/api/tasks/:id/toggle', (req: Request, res: Response) => {
  const taskId = req.params.id;
  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'タスクが見つかりません' });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    completed: !tasks[taskIndex].completed,
    updatedAt: new Date().toISOString()
  };
  
  writeTasksToFile(tasks);
  res.json(tasks[taskIndex]);
});

// すべてのタスクの削除
app.delete('/api/tasks', (req: Request, res: Response) => {
  writeTasksToFile([]);
  res.json({ message: 'すべてのタスクを削除しました' });
});

// ==== イベント関連のエンドポイント ====

// すべてのイベントを取得
app.get('/api/events', (req: Request, res: Response) => {
  const events = readEventsFromFile();
  res.json(events);
});

// IDによるイベントの取得
app.get('/api/events/:id', (req: Request, res: Response) => {
  const events = readEventsFromFile();
  const event = events.find(e => e.id === req.params.id);
  
  if (!event) {
    return res.status(404).json({ message: 'イベントが見つかりません' });
  }
  
  res.json(event);
});

// 新しいイベントの作成
app.post('/api/events', (req: Request, res: Response) => {
  const { title, date, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'タイトルは必須です' });
  }
  
  if (!date) {
    return res.status(400).json({ message: '日時は必須です' });
  }
  
  const events = readEventsFromFile();
  const now = new Date().toISOString();
  
  const newEvent: Event = {
    id: uuidv4(),
    title: title.trim(),
    date: date,
    description: description?.trim(),
    createdAt: now,
    updatedAt: now
  };
  
  events.push(newEvent);
  writeEventsToFile(events);
  
  res.status(201).json(newEvent);
});

// イベントの更新
app.put('/api/events/:id', (req: Request, res: Response) => {
  const { title, date, description } = req.body;
  const eventId = req.params.id;
  
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ message: 'タイトルは空にできません' });
  }
  
  const events = readEventsFromFile();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'イベントが見つかりません' });
  }
  
  const updatedEvent = {
    ...events[eventIndex],
    title: title !== undefined ? title.trim() : events[eventIndex].title,
    date: date !== undefined ? date : events[eventIndex].date,
    description: description !== undefined ? description.trim() : events[eventIndex].description,
    updatedAt: new Date().toISOString()
  };
  
  events[eventIndex] = updatedEvent;
  writeEventsToFile(events);
  
  res.json(updatedEvent);
});

// イベントの削除
app.delete('/api/events/:id', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const events = readEventsFromFile();
  const initialLength = events.length;
  
  const filteredEvents = events.filter(e => e.id !== eventId);
  
  if (filteredEvents.length === initialLength) {
    return res.status(404).json({ message: 'イベントが見つかりません' });
  }
  
  writeEventsToFile(filteredEvents);
  res.json({ message: 'イベントを削除しました' });
});

// すべてのイベントの削除
app.delete('/api/events', (req: Request, res: Response) => {
  writeEventsToFile([]);
  res.json({ message: 'すべてのイベントを削除しました' });
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しました`);
});

export default app;