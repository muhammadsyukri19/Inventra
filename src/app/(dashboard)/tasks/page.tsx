'use client';

import { Typography } from '@/components/atoms/typography';
import { TaskList } from '@/features/task/components/TaskList';
import { useTaskList } from '@/features/task/hooks/useTaskList';

export default function Page() {
  const taskState = useTaskList();

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-6xl mx-auto">
      <div>
        <Typography variant="h1">Tugas Gudang & Shift Handover</Typography>
        <Typography variant="body" color="secondary" className="mt-1 max-w-3xl">
          Rencanakan pekerjaan shift, catat tugas kritis, dan pastikan penyerahan antara staf gudang berjalan lancar.
        </Typography>
      </div>

      <TaskList {...taskState} />
    </div>
  );
}
