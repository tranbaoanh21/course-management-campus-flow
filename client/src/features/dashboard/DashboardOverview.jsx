import { useCallback, useEffect, useState } from 'react';

import { getDashboardOverview } from '../../services/dashboardApi';

const STATUS_LABELS = {
  todo: 'Cần làm',
  'in-progress': 'Đang làm',
};

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function DashboardOverview({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setDashboard(await getDashboardOverview());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    getDashboardOverview()
      .then((data) => {
        if (isActive) {
          setDashboard(data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Không thể tải dashboard</p>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          type="button"
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          onClick={loadDashboard}
        >
          Thử lại
        </button>
      </section>
    );
  }

  const { counts, task_status: taskStatus, completion_percentage: completion } = dashboard;
  const firstName = user.name.trim().split(/\s+/).at(-1);

  return (
    <div>
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-indigo-600">Tổng quan học kỳ</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Chào {firstName}, hôm nay mình làm gì?
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Theo dõi tiến độ và xử lý những deadline cần chú ý trước.
        </p>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Thống kê workspace">
        <StatCard label="Courses" value={counts.courses} detail="môn học đang quản lý" />
        <StatCard label="Projects" value={counts.projects} detail="đồ án và bài tập lớn" />
        <StatCard
          label="Tasks"
          value={counts.tasks}
          detail={`${taskStatus.overdue} task quá hạn`}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Task cần ưu tiên</p>
              <p className="mt-1 text-sm text-slate-400">
                Sắp xếp theo quá hạn và due date gần nhất.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {dashboard.priority_tasks.length}/6
            </span>
          </div>

          {dashboard.priority_tasks.length === 0 ? (
            <div className="py-14 text-center">
              <p className="font-semibold text-slate-800">Không có task đang chờ</p>
              <p className="mt-2 text-sm text-slate-400">
                Chọn một course ở thanh bên để tạo project và task mới.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {dashboard.priority_tasks.map((task) => (
                <article key={task.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                      task.is_overdue ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {task.course_name} · {task.project_title}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-xs font-semibold ${
                        task.is_overdue ? 'text-red-600' : 'text-slate-600'
                      }`}
                    >
                      {formatDate(task.due_date)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {task.is_overdue ? 'Quá hạn' : STATUS_LABELS[task.status]}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-sm font-semibold">Tiến độ tổng thể</p>
          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="text-5xl font-semibold tracking-tight">{completion}%</p>
            <p className="pb-1 text-xs text-slate-400">
              {taskStatus.done}/{counts.tasks} hoàn thành
            </p>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-400 transition-[width]"
              style={{ width: `${completion}%` }}
            />
          </div>

          <dl className="mt-7 space-y-3 border-t border-white/10 pt-5 text-sm">
            <StatusRow label="Cần làm" value={taskStatus.todo} color="bg-slate-400" />
            <StatusRow label="Đang làm" value={taskStatus.in_progress} color="bg-sky-400" />
            <StatusRow label="Hoàn thành" value={taskStatus.done} color="bg-emerald-400" />
            <StatusRow label="Quá hạn" value={taskStatus.overdue} color="bg-red-400" />
          </dl>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </article>
  );
}

function StatusRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2 text-slate-300">
        <span className={`size-2 rounded-full ${color}`} />
        {label}
      </dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Đang tải dashboard">
      <div className="h-28 rounded-2xl bg-slate-200/70" />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-32 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-2xl bg-slate-200/70" />
    </div>
  );
}

export default DashboardOverview;
