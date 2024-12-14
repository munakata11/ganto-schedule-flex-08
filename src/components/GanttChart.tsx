import { useEffect, useState } from 'react';
import { Task } from '../types/task';
import {
  Scheduler,
  DayView,
  Appointments,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import { format } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    // タスクをスケジューラーの形式に変換
    const convertedAppointments = tasks.map(task => ({
      id: task.id,
      title: task.title,
      startDate: task.startDate,
      endDate: task.endDate,
      color: task.color,
    }));
    setAppointments(convertedAppointments);
  }, [tasks]);

  const onCommitChanges = ({ added, changed, deleted }: any) => {
    if (changed) {
      const taskId = Object.keys(changed)[0];
      const changedTask = changed[taskId];
      const originalTask = tasks.find(t => t.id === taskId);
      
      if (originalTask && changedTask) {
        onTaskUpdate({
          ...originalTask,
          startDate: changedTask.startDate || originalTask.startDate,
          endDate: changedTask.endDate || originalTask.endDate,
        });
      }
    }
  };

  const Appointment = ({ children, style, ...restProps }: any) => {
    const { data } = restProps;
    return (
      <Appointments.Appointment
        {...restProps}
        style={{
          ...style,
          backgroundColor: data.color,
          borderRadius: '4px',
        }}
      >
        {children}
      </Appointments.Appointment>
    );
  };

  return (
    <div className="h-[400px] bg-white rounded-lg shadow">
      <Scheduler data={appointments}>
        <ViewState />
        <EditingState onCommitChanges={onCommitChanges} />
        <DayView
          startDayHour={0}
          endDayHour={24}
          cellDuration={60}
        />
        <Appointments appointmentComponent={Appointment} />
        <AllDayPanel />
        <DragDropProvider />
        <EditRecurrenceMenu />
      </Scheduler>
    </div>
  );
};

export default GanttChart;