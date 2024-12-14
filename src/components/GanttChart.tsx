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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);
  const months = Array.from({ length: 12 }, (_, i) => new Date(selectedYear, i, 1));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // 年度選択のオプションを生成（現在年から前後5年）
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // 選択された年度内に収まるタスクのみをフィルタリング
  const filteredTasks = tasks.filter(task => {
    const taskStartYear = task.startDate.getFullYear();
    const taskEndYear = task.endDate.getFullYear();
    return taskStartYear === selectedYear || taskEndYear === selectedYear;
  });

  const calculateTaskPosition = (task: Task) => {
    const totalDays = 365;
    const taskStartDate = new Date(Math.max(task.startDate.getTime(), startDate.getTime()));
    const taskEndDate = new Date(Math.min(task.endDate.getTime(), endDate.getTime()));
    
    const startDayOfYear = Math.floor((taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endDayOfYear = Math.floor((taskEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startDayOfYear / totalDays) * 100;
    const width = ((endDayOfYear - startDayOfYear) / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const handleTaskDrag = (taskId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveTaskId(taskId);
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
      setActiveTaskId(null);
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
    setActiveTaskId(taskId);
    
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
      setActiveTaskId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-[600px] bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="年度を選択" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}年度
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative h-[calc(100%-3rem)]">
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
            {filteredTasks.map((task, index) => {
              const position = calculateTaskPosition(task);
              const isActive = task.id === activeTaskId;
              return (
                <TooltipProvider key={task.id}>
                  <Tooltip>
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