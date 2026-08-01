import { useEffect, useState } from 'react';

import { getCourseOverview } from '../../services/courseApi';

const STATUS_LABELS = {
  todo: 'Cần làm',
  'in-progress': 'Đang làm',
};

function formatDate(dateString) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function CourseOverview({ selectedCourse, refreshKey }) {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      setIsLoading(true);
      setLoadError('');

      try {
        const data = await getCourseOverview(selectedCourse.id);

        if (isActive) {
          setOverview(data);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      isActive = false;
    };
  }, [selectedCourse.id, refreshKey, reloadCount]);

  if (isLoading) {
    return (
      <div className="grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 rounded-xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{loadError}</p>
        <button
          type="button"
          className="mt-2 font-semibold underline"
          onClick={() => setReloadCount((count) => count + 1)}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { counts, task_status: taskStatus, next_deadline: nextDeadline } = overview;

  return (
    <section aria-label="Tổng quan course">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Projects" value={counts.projects} helper="Trong course này" />
        <MetricCard
          label="Tasks"
          value={counts.tasks}
          helper={`${taskStatus.done} đã hoàn thành`}
        />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Tiến độ
            </p>
            <span className="text-lg font-semibold text-slate-900">
              {overview.completion_percentage}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-[width]"
              style={{ width: `${overview.completion_percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {taskStatus.in_progress} đang làm · {taskStatus.todo} cần làm
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            taskStatus.overdue > 0 ? 'border-red-200 bg-red-50/70' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Deadline kế tiếp
          </p>
          {nextDeadline ? (
            <>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                {nextDeadline.title}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {nextDeadline.project_title} · {STATUS_LABELS[nextDeadline.status]}
              </p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  nextDeadline.is_overdue ? 'text-red-600' : 'text-indigo-600'
                }`}
              >
                {nextDeadline.is_overdue ? 'Quá hạn' : 'Hạn'} {formatDate(nextDeadline.due_date)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm font-semibold text-emerald-700">Không còn việc tồn đọng</p>
              <p className="mt-1 text-xs text-slate-500">Mọi task hiện tại đã hoàn thành.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export default CourseOverview;
