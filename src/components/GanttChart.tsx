import { useRef, useEffect } from 'react';
import { Task } from '../types/task';
import { format, addMonths, startOfYear, differenceInDays, addDays } from 'date-fns';
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
    let initialLeft: number = 0;
    let initialWidth: number = 0;
    let isResizing: boolean = false;
    let isResizingLeft: boolean = false;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const taskElement = target.closest('.gantt-task') as HTMLElement;
      
      if (!taskElement) return;
      
      activeTask = taskElement;
      initialX = e.clientX;
      initialLeft = parseFloat(taskElement.style.left);
      initialWidth = taskElement.offsetWidth;

      // リサイズハンドルの判定を改善
      const isLeftHandle = target.classList.contains('resize-handle-left');
      const isRightHandle = target.classList.contains('resize-handle-right');
      
      if (isLeftHandle) {
        isResizingLeft = true;
        isResizing = false;
      } else if (isRightHandle) {
        isResizingLeft = false;
        isResizing = true;
      } else {
        isResizingLeft = false;
        isResizing = false;
      }

      // ドラッグ中はテキスト選択を防ぐ
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!activeTask) return;

      const containerWidth = container.offsetWidth;
      const dayWidth = containerWidth / 365;
      
      // 移動量の計算を改善（より滑らかな移動のため）
      const rawDiff = e.clientX - initialX;
      const diff = Math.round(rawDiff / 10) * 10; // 10ピクセル単位で移動

      const taskId = activeTask.getAttribute('data-task-id');
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (isResizingLeft) {
        // 左端のリサイズ処理を改善
        const maxLeftMove = initialLeft + initialWidth - dayWidth;
        const newLeft = Math.max(0, Math.min(maxLeftMove, initialLeft + diff));
        const newWidth = Math.max(dayWidth * 2, initialWidth - (newLeft - initialLeft));
        
        activeTask.style.left = `${newLeft}px`;
        activeTask.style.width = `${newWidth}px`;
        
        const daysDiff = Math.round((newLeft - initialLeft) / dayWidth);
        const newStartDate = addDays(task.startDate, daysDiff);
        onTaskUpdate({ ...task, startDate: newStartDate });
      } else if (isResizing) {
        // 右端のリサイズ処理を改善
        const newWidth = Math.max(dayWidth * 2, initialWidth + diff);
        const maxWidth = containerWidth - parseFloat(activeTask.style.left);
        
        activeTask.style.width = `${Math.min(newWidth, maxWidth)}px`;
        
        const daysToAdd = Math.round((newWidth - initialWidth) / dayWidth);
        const newEndDate = addDays(task.endDate, daysToAdd);
        onTaskUpdate({ ...task, endDate: newEndDate });
      } else {
        // タスクの移動処理を改善
        const newLeft = Math.max(0, Math.min(containerWidth - activeTask.offsetWidth, initialLeft + diff));
        activeTask.style.left = `${newLeft}px`;
        
        const daysDiff = Math.round((newLeft - initialLeft) / dayWidth);
        const newStartDate = addDays(task.startDate, daysDiff);
        const newEndDate = addDays(task.endDate, daysDiff);
        onTaskUpdate({ ...task, startDate: newStartDate, endDate: newEndDate });
      }
    };

    const handleMouseUp = () => {
      activeTask = null;
      isResizing = false;
      isResizingLeft = false;
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
                <div className="resize-handle-left absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize" />
                <div className="resize-handle-right absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;