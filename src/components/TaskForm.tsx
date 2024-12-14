import { useState } from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';

interface TaskFormProps {
  onSubmit: (task: Task) => void;
}

const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#0EA5E9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color,
    };

    onSubmit(task);
    setTitle('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2 className="text-xl font-bold text-gray-900 mb-4">予定を追加</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="task-input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          開始日
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="task-input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          終了日
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="task-input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          色
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 p-1 rounded cursor-pointer"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
      >
        追加
      </button>
    </form>
  );
};

export default TaskForm;