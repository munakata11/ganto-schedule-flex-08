import { useState } from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';

interface TaskFormProps {
  onSubmit: (task: Task) => void;
}

const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set time to 00:00 for both dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const task: Task = {
      id: crypto.randomUUID(),
      title,
      startDate: start,
      endDate: end,
    };

    onSubmit(task);
    setTitle('');
    setStartDate(today);
    setEndDate(today);
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日時
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
            終了日時
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="task-input"
            required
          />
        </div>
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