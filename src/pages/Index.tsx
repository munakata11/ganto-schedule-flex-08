import { useState } from 'react';
import GanttChart from '../components/GanttChart';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/task';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">年間スケジュール管理</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TaskForm onSubmit={handleAddTask} />
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <GanttChart 
              tasks={tasks} 
              onTaskUpdate={handleUpdateTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;