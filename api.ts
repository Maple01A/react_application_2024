// APIクライアントの実装
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface EventData {
  title: string;
  date: string;
  description?: string;
}

const api = {
  // イベント一覧の取得
  getEvents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      return response.data;
    } catch (error) {
      console.error('イベント取得エラー:', error);
      throw error;
    }
  },

  // イベントの追加
  addEvent: async (eventData: EventData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('イベント追加エラー:', error);
      throw error;
    }
  },

  // イベントの削除
  deleteEvent: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('イベント削除エラー:', error);
      throw error;
    }
  },

  // タスク一覧の取得
  getTasks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      return response.data;
    } catch (error) {
      console.error('タスク取得エラー:', error);
      throw error;
    }
  },

  // タスクの追加
  addTask: async (taskData: { title: string; description?: string }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('タスク追加エラー:', error);
      throw error;
    }
  },

  // タスクの更新
  updateTask: async (id: string, taskData: { title?: string; description?: string; completed?: boolean }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('タスク更新エラー:', error);
      throw error;
    }
  },

  // タスクの削除
  deleteTask: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('タスク削除エラー:', error);
      throw error;
    }
  },

  // タスクの完了状態の切り替え
  toggleTaskCompletion: async (id: string) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tasks/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('タスク状態切り替えエラー:', error);
      throw error;
    }
  }
};

export default api;