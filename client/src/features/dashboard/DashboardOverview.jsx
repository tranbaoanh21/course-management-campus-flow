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

function formatToday() {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
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
      <section className="border border-red-200 bg-[var(--cf-paper)] p-7 text-center">
        <p className="font-semibold text-[var(--cf-ink)]">Không thể tải tổng quan</p>
        <p className="mt-2 text-sm text-[var(--cf-muted)]">{error}</p>
        <button
          type="button"
          className="mt-5 bg-[var(--cf-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cf-accent)]"
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
      <header className="grid gap-5 border-b border-[var(--cf-line)] pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="text-xs font-semibold text-[var(--cf-accent)]">Tổng quan học kỳ</p>
          <h1 className="font-editorial mt-2 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Chào {firstName}. Việc nào cần làm trước?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--cf-muted)]">
            Một bản tóm tắt ngắn về tiến độ và những deadline đang cần sự chú ý của bạn.
          </p>
        </div>
        <p className="border-l border-[var(--cf-line-strong)] pl-4 text-sm capitalize text-[var(--cf-muted)]">
          {formatToday()}
        </p>
      </header>

      <section
        className="grid border-b border-[var(--cf-line)] sm:grid-cols-3"
        aria-label="Thống kê workspace"
      >
        <SummaryMetric label="Môn học" value={counts.courses} detail="đang quản lý" />
        <SummaryMetric label="Đồ án" value={counts.projects} detail="và bài tập lớn" />
        <SummaryMetric
          label="Công việc"
          value={counts.tasks}
          detail={`${taskStatus.overdue} việc quá hạn`}
          danger={taskStatus.overdue > 0}
        />
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.65fr)]">
        <section>
          <div className="flex items-end justify-between gap-4 border-b border-[var(--cf-line-strong)] pb-3">
            <div>
              <h2 className="font-editorial text-2xl font-semibold tracking-tight">
                Công việc cần ưu tiên
              </h2>
              <p className="mt-1 text-sm text-[var(--cf-muted)]">
                Quá hạn trước, sau đó đến deadline gần nhất.
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-[var(--cf-faint)]">
              {dashboard.priority_tasks.length} / 6
            </span>
          </div>

          {dashboard.priority_tasks.length === 0 ? (
            <div className="border-b border-[var(--cf-line)] py-14">
              <p className="font-editorial text-xl font-semibold">Không có việc đang chờ.</p>
              <p className="mt-2 text-sm text-[var(--cf-muted)]">
                Chọn một môn học ở thanh bên để bắt đầu kế hoạch tiếp theo.
              </p>
            </div>
          ) : (
            <div>
              {dashboard.priority_tasks.map((task, index) => (
                <article
                  key={task.id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-[var(--cf-line)] py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_8rem] sm:gap-4"
                >
                  <span className="pt-0.5 text-xs font-semibold tabular-nums text-[var(--cf-faint)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {task.is_overdue && (
                        <span className="size-1.5 shrink-0 rounded-full bg-[var(--cf-danger)]" />
                      )}
                      <p className="truncate text-sm font-semibold">{task.title}</p>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--cf-muted)]">
                      {task.course_name} · {task.project_title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-semibold ${
                        task.is_overdue ? 'text-[var(--cf-danger)]' : 'text-[var(--cf-ink)]'
                      }`}
                    >
                      {formatDate(task.due_date)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--cf-faint)]">
                      {task.is_overdue ? 'Quá hạn' : STATUS_LABELS[task.status]}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="self-start rounded-md bg-[var(--cf-accent)] p-6 text-[#f6f3e9]">
          <p className="text-xs font-semibold text-[#c9d9ce]">Tiến độ tổng thể</p>
          <div className="mt-8 flex items-end justify-between gap-4">
            <p className="font-editorial text-6xl font-semibold leading-none tracking-tight">
              {completion}%
            </p>
            <p className="pb-1 text-xs text-[#c9d9ce]">
              {taskStatus.done}/{counts.tasks} hoàn thành
            </p>
          </div>
          <div className="mt-6 h-1 overflow-hidden bg-white/15">
            <div
              className="h-full bg-[#f0c978] transition-[width]"
              style={{ width: `${completion}%` }}
            />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/20 pt-5 text-sm">
            <StatusItem label="Cần làm" value={taskStatus.todo} />
            <StatusItem label="Đang làm" value={taskStatus.in_progress} />
            <StatusItem label="Hoàn thành" value={taskStatus.done} />
            <StatusItem label="Quá hạn" value={taskStatus.overdue} danger />
          </dl>
        </section>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, detail, danger = false }) {
  return (
    <article className="border-t border-[var(--cf-line)] py-5 sm:border-t-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
      <div className="flex items-baseline justify-between gap-4 sm:block">
        <p className="text-xs font-semibold text-[var(--cf-muted)]">{label}</p>
        <p className="font-editorial mt-1 text-4xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </div>
      <p
        className={`mt-1 text-xs ${
          danger ? 'font-semibold text-[var(--cf-danger)]' : 'text-[var(--cf-faint)]'
        }`}
      >
        {detail}
      </p>
    </article>
  );
}

function StatusItem({ label, value, danger = false }) {
  return (
    <div>
      <dt className="text-xs text-[#c9d9ce]">{label}</dt>
      <dd
        className={`mt-1 text-lg font-semibold tabular-nums ${
          danger && value > 0 ? 'text-[#ffd0c6]' : 'text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Đang tải dashboard">
      <div className="h-36 border-b border-[var(--cf-line)] bg-[var(--cf-line)]/35" />
      <div className="grid border-b border-[var(--cf-line)] sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 border-r border-[var(--cf-line)] last:border-r-0" />
        ))}
      </div>
      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.65fr)]">
        <div className="h-72 bg-[var(--cf-line)]/35" />
        <div className="h-72 bg-[var(--cf-accent-soft)]" />
      </div>
    </div>
  );
}

export default DashboardOverview;
