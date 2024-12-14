import { useEffect, useState } from 'react';
import { Task } from '../types/task';
import {
  Scheduler,
  Appointments,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
  WeekView,
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import { format } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 0, 1); // 年初
  const endDate = new Date(currentDate.getFullYear(), 11, 31); // 年末

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
    <div className="h-[600px] bg-white rounded-lg shadow">
      <Scheduler 
        data={appointments}
        firstDayOfWeek={1}
      >
        <ViewState 
          defaultCurrentDate={startDate}
        />
        <EditingState onCommitChanges={onCommitChanges} />
        <WeekView
          startDayHour={0}
          endDayHour={24}
          cellDuration={1440}
          intervalCount={52}
        />
        <EditRecurrenceMenu />
        <Appointments appointmentComponent={Appointment} />
        <AllDayPanel />
        <DragDropProvider />
      </Scheduler>
    </div>
  );
};

export default GanttChart;