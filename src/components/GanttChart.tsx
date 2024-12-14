import { useEffect, useState } from 'react';
import { Task } from '../types/task';
import {
  Scheduler,
  Appointments,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
  MonthView,
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const GanttChart = ({ tasks, onTaskUpdate }: GanttChartProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 0, 1);
  const endDate = new Date(currentDate.getFullYear(), 11, 31);

  useEffect(() => {
    const convertedAppointments = tasks.map(task => ({
      id: task.id,
      title: task.title,
      startDate: task.startDate,
      endDate: task.endDate,
      color: task.color || '#1EAEDB',
    }));
    setAppointments(convertedAppointments);
  }, [tasks]);

  const onCommitChanges = ({ changed, deleted }: any) => {
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
          padding: '4px 8px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {children}
      </Appointments.Appointment>
    );
  };

  const TimeTableCell = ({ ...restProps }: any) => {
    return (
      <MonthView.TimeTableCell
        {...restProps}
        style={{
          height: '80px',
          borderRight: '1px solid #e5e7eb',
          backgroundColor: 'white',
        }}
      />
    );
  };

  const DayScaleCell = ({ ...restProps }: any) => {
    const date = new Date(restProps.startDate);
    const monthName = format(date, 'M月', { locale: ja });
    
    return (
      <MonthView.DayScaleCell
        {...restProps}
        style={{
          textAlign: 'center',
          padding: '8px',
          borderBottom: '1px solid #e5e7eb',
          borderRight: '1px solid #e5e7eb',
          backgroundColor: 'white',
          color: '#374151',
          fontWeight: 500,
        }}
      >
        {monthName}
      </MonthView.DayScaleCell>
    );
  };

  return (
    <div className="h-[600px] bg-white rounded-lg shadow">
      <Scheduler 
        data={appointments}
        locale="ja-JP"
        firstDayOfWeek={1}
      >
        <ViewState 
          defaultCurrentDate={startDate}
        />
        <EditingState onCommitChanges={onCommitChanges} />
        <MonthView
          intervalCount={12}
          dayScaleCellComponent={DayScaleCell}
          timeTableCellComponent={TimeTableCell}
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