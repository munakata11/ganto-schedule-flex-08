import { useRef, useEffect } from 'react';
import { Task } from '../types/task';
import { format, addMonths, startOfYear, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYear = startOfYear(new Date());
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startYear, i));
  
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let activeTask: HTMLElement | null = null;
    let initialX: number = 0;
    let initialWidth: number = 0;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('gantt-task')) {
        activeTask = target;
        initialX = e.clientX;
        initialWidth = target.offsetWidth;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!activeTask) return;

      const diff = e.clientX - initialX;
      const newWidth = Math.max(50, initialWidth + diff);
      activeTask.style.width = `${newWidth}px`;

      const taskId = activeTask.getAttribute('data-task-id');
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const daysToAdd = Math.floor(diff / (container.offsetWidth / 365));
        const newEndDate = new Date(task.endDate);
        newEndDate.setDate(newEndDate.getDate() + daysToAdd);
        onTaskUpdate({ ...task, endDate: newEndDate });
      }
    };

    const handleMouseUp = () => {
      activeTask = null;
    };

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tasks, onTaskUpdate]);

  const getTaskPosition = (task: Task) => {
    const daysFromStart = differenceInDays(task.startDate, startYear);
    const taskDuration = differenceInDays(task.endDate, task.startDate);
    const dayWidth = 100 / 365;

    return {
      left: `${daysFromStart * dayWidth}%`,
      width: `${taskDuration * dayWidth}%`,
    };
  };

  return (
    <div className="overflow-x-auto">
      <div ref={containerRef} className="relative min-w-[800px]">
        <div className="grid grid-cols-12 mb-4">
          {months.map((month, index) => (
            <div key={index} className="month-header">
              {format(month, 'M月', { locale: ja })}
            </div>
          ))}
        </div>
        <div className="relative h-[400px] border border-gray-200 rounded">
          <div className="grid grid-cols-12 h-full absolute w-full">
            {months.map((_, index) => (
              <div key={index} className="gantt-grid h-full" />
            ))}
          </div>
          {tasks.map((task) => {
            const position = getTaskPosition(task);
            return (
              <div
                key={task.id}
                data-task-id={task.id}
                className="gantt-task absolute h-8 rounded"
                style={{
                  ...position,
                  backgroundColor: task.color || 'rgb(14 165 233)',
                  top: '1rem',
                }}
              >
                <div className="px-2 py-1 text-white text-sm truncate">
                  {task.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;