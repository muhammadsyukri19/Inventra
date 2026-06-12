'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { WarehouseTask } from '@/features/task/hooks/useTaskList';
import { CalendarCheck, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: WarehouseTask[];
  filteredTasks: WarehouseTask[];
  filter: 'all' | 'active' | 'completed';
  setFilter: (value: 'all' | 'active' | 'completed') => void;
  addTask: (payload: { title: string; description: string; dueDate?: string }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
}

export function TaskList({
  tasks,
  filteredTasks,
  filter,
  setFilter,
  addTask,
  toggleTask,
  deleteTask,
  clearCompleted,
}: TaskListProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const canSubmit = title.trim().length > 0;

  const statusSummary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2">Daftar Tugas Shift</Typography>
            <Typography variant="body" color="secondary" className="mt-1 max-w-2xl">
              Tambahkan dan tandai tugas gudang sebagai selesai untuk setiap shift.
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
              Semua
            </Button>
            <Button variant={filter === 'active' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('active')}>
              Aktif
            </Button>
            <Button variant={filter === 'completed' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('completed')}>
              Selesai
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <Typography variant="body-sm" color="secondary">Total tugas</Typography>
            <Typography variant="h4" className="mt-2">{statusSummary.total}</Typography>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <Typography variant="body-sm" color="secondary">Sedang berjalan</Typography>
            <Typography variant="h4" className="mt-2">{statusSummary.active}</Typography>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <Typography variant="body-sm" color="secondary">Selesai</Typography>
            <Typography variant="h4" className="mt-2">{statusSummary.completed}</Typography>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <Typography variant="h3">Tambah Tugas Baru</Typography>
            <Typography variant="body" color="secondary" className="mt-1">
              Isi judul, deskripsi, dan jadwal target jika diperlukan.
            </Typography>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Judul tugas"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Deskripsi tugas..."
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Typography variant="body-sm" color="secondary">
              Tugas tersimpan otomatis ke local storage agar bisa dilanjutkan setelah pergantian shift.
            </Typography>
            <Button
              className="rounded-2xl"
              onClick={() => {
                if (!canSubmit) return;
                addTask({ title, description, dueDate });
                setTitle('');
                setDescription('');
                setDueDate('');
              }}
              disabled={!canSubmit}
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h3">Daftar Tugas</Typography>
            <Typography variant="body" color="secondary" className="mt-1">
              Kelola tugas shift gudang secara efektif.
            </Typography>
          </div>
          <Button variant="secondary" size="sm" onClick={clearCompleted}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus Selesai
          </Button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Tidak ada tugas pada filter ini.
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredTasks.map((task) => (
              <li key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </span>
                      <Typography variant="h4" className={task.completed ? 'line-through text-slate-500' : 'text-slate-900'}>
                        {task.title}
                      </Typography>
                    </div>
                    <Typography variant="body" color="secondary">
                      {task.description || 'Tidak ada deskripsi tambahan.'}
                    </Typography>
                    {task.dueDate && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                        <CalendarCheck className="h-4 w-4" /> Tenggat: {task.dueDate}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant={task.completed ? 'secondary' : 'primary'} size="sm" onClick={() => toggleTask(task.id)}>
                      {task.completed ? 'Buka' : 'Selesai'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
