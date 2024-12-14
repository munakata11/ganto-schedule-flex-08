import { useEffect, useState } from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 0, 1);
  const endDate = new Date(currentDate.getFullYear(), 11, 31);
  const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const calculateTaskPosition = (task: Task) => {
    const totalDays = 365;
    const startDayOfYear = Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endDayOfYear = Math.floor((task.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startDayOfYear / totalDays) * 100;
    const width = ((endDayOfYear - startDayOfYear) / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const handleTaskDrag = (taskId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = e.currentTarget;
    const container = taskElement.parentElement;
    if (!container) return;

    const startX = e.clientX;
    const startLeft = taskElement.offsetLeft;
    const containerWidth = container.offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!taskElement || !container) return;
      
      const deltaX = moveEvent.clientX - startX;
      const newLeft = Math.max(0, Math.min(containerWidth - taskElement.offsetWidth, startLeft + deltaX));
      const daysFromStart = Math.floor((newLeft / containerWidth) * 365);
      
      const newStartDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
      const duration = task.endDate.getTime() - task.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);

      onTaskUpdate({
        ...task,
        startDate: newStartDate,
        endDate: newEndDate,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (taskId: string, direction: 'left' | 'right', e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = e.currentTarget.parentElement;
    const container = taskElement?.parentElement;
    if (!taskElement || !container) return;

    const startX = e.clientX;
    const startWidth = taskElement.offsetWidth;
    const startLeft = taskElement.offsetLeft;
    const containerWidth = container.offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!taskElement || !container) return;

      const deltaX = moveEvent.clientX - startX;
      let newWidth, newLeft, newStartDate, newEndDate;

      if (direction === 'right') {
        newWidth = Math.max(20, Math.min(containerWidth - startLeft, startWidth + deltaX));
        const daysWidth = Math.floor((newWidth / containerWidth) * 365);
        newEndDate = new Date(task.startDate.getTime() + daysWidth * 24 * 60 * 60 * 1000);
        newStartDate = task.startDate;
      } else {
        newWidth = Math.max(20, Math.min(startWidth - deltaX, startLeft + startWidth));
        const newLeftPos = Math.max(0, Math.min(startLeft + deltaX, startLeft + startWidth - 20));
        const daysFromStart = Math.floor((newLeftPos / containerWidth) * 365);
        newStartDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
        newEndDate = task.endDate;
      }

      onTaskUpdate({
        ...task,
        startDate: newStartDate,
        endDate: newEndDate,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-[600px] bg-white rounded-lg shadow p-4">
      <div className="relative h-full">
        {/* Month Headers */}
        <div className="flex border-b border-gray-200">
          {months.map((month) => (
            <div
              key={month.getTime()}
              className="flex-1 month-header"
            >
              {format(month, 'M月', { locale: ja })}
            </div>
          ))}
        </div>

        {/* Grid Lines */}
        <div className="relative h-[calc(100%-2rem)] mt-2">
          <div className="absolute inset-0 flex">
            {months.map((month, index) => (
              <div
                key={month.getTime()}
                className="flex-1 gantt-grid"
              />
            ))}
          </div>

          {/* Tasks */}
          <div className="absolute inset-0">
            {tasks.map((task, index) => {
              const position = calculateTaskPosition(task);
              return (
                <TooltipProvider key={task.id}>
                  <Tooltip open={isDragging || isResizing || undefined}>
                    <TooltipTrigger asChild>
                      <div
                        className="gantt-task absolute h-8 rounded group"
                        style={{
                          ...position,
                          top: `${index * 48}px`,
                          backgroundColor: task.color,
                        }}
                        onMouseDown={(e) => handleTaskDrag(task.id, e)}
                      >
                        <div
                          className="absolute left-0 top-0 w-1 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20"
                          onMouseDown={(e) => handleResize(task.id, 'left', e)}
                        />
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20"
                          onMouseDown={(e) => handleResize(task.id, 'right', e)}
                        />
                        <span className="px-2 text-white whitespace-nowrap overflow-hidden text-sm">
                          {task.title}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div>開始: {format(task.startDate, 'yyyy/MM/dd', { locale: ja })}</div>
                        <div>終了: {format(task.endDate, 'yyyy/MM/dd', { locale: ja })}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;