import { useEffect, useMemo, useState } from 'react';

import { getCalendar } from '../../services/calendarApi';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const FILTERS = [
  ['all', 'Tất cả status'],
  ['todo', 'Cần làm'],
  ['in-progress', 'Đang làm'],
  ['done', 'Hoàn thành'],
  ['overdue', 'Quá hạn'],
];
const STATUS_CONFIG = {
  todo: { label: 'Cần làm', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  'in-progress': { label: 'Đang làm', className: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  done: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

function toMonthValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toDateKey(date) {
  return `${toMonthValue(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1);
}

function shiftMonth(month, amount) {
  const date = parseMonth(month);
  date.setMonth(date.getMonth() + amount);
  return toMonthValue(date);
}

function buildCalendarDays(month) {
  const monthDate = parseMonth(month);
  const mondayOffset = (monthDate.getDay() + 6) % 7;
  const gridStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      key: toDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function formatSelectedDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function CalendarView({ onOpenCourse }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const [month, setMonth] = useState(() => toMonthValue(today));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCalendar() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getCalendar(month);

        if (isActive) {
          setTasks(data.tasks);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCalendar();

    return () => {
      isActive = false;
    };
  }, [month, reloadCount]);

  const visibleTasks = tasks.filter(
    (task) =>
      filter === 'all' || task.status === filter || (filter === 'overdue' && task.is_overdue),
  );
  const tasksByDate = visibleTasks.reduce((groups, task) => {
    const dateTasks = groups.get(task.due_date) || [];
    dateTasks.push(task);
    groups.set(task.due_date, dateTasks);
    return groups;
  }, new Map());
  const selectedTasks = tasksByDate.get(selectedDate) || [];
  const calendarDays = buildCalendarDays(month);
  const monthLabel = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(parseMonth(month));

  function showMonth(nextMonth) {
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  }

  function showToday() {
    setMonth(toMonthValue(today));
    setSelectedDate(todayKey);
  }

  function selectDate(day) {
    const dayMonth = day.key.slice(0, 7);

    if (dayMonth !== month) {
      setMonth(dayMonth);
    }

    setSelectedDate(day.key);
  }

  return (
    <div>
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-indigo-600">Monthly agenda</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Lịch deadline</h1>
            <p className="mt-2 text-sm text-slate-500">
              Xem toàn bộ due date theo tháng và tập trung vào từng ngày.
            </p>
          </div>
          <select
            value={filter}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            onChange={(event) => setFilter(event.target.value)}
          >
            {FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setReloadCount((count) => count + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.55fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                onClick={() => showMonth(shiftMonth(month, -1))}
                aria-label="Tháng trước"
              >
                ←
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                onClick={() => showMonth(shiftMonth(month, 1))}
                aria-label="Tháng sau"
              >
                →
              </button>
              <h2 className="ml-2 font-semibold capitalize text-slate-900">{monthLabel}</h2>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              onClick={showToday}
            >
              Hôm nay
            </button>
          </div>

          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
                  {WEEKDAYS.map((weekday) => (
                    <div
                      key={weekday}
                      className="px-2 py-2 text-center text-xs font-semibold text-slate-400"
                    >
                      {weekday}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarDays.map((day) => {
                    const dateTasks = tasksByDate.get(day.key) || [];
                    const isSelected = selectedDate === day.key;
                    const isToday = todayKey === day.key;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`min-h-28 border-r border-b border-slate-100 p-2 text-left transition hover:bg-indigo-50/40 ${
                          isSelected ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : 'bg-white'
                        } ${day.isCurrentMonth ? '' : 'opacity-40'}`}
                        onClick={() => selectDate(day)}
                      >
                        <span
                          className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                            isToday ? 'bg-indigo-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          {day.day}
                        </span>
                        <div className="mt-1.5 space-y-1">
                          {dateTasks.slice(0, 2).map((task) => (
                            <span
                              key={task.id}
                              className={`block truncate rounded px-1.5 py-1 text-[10px] font-semibold ${
                                task.is_overdue
                                  ? 'bg-red-50 text-red-700'
                                  : STATUS_CONFIG[task.status].className
                              }`}
                            >
                              {task.title}
                            </span>
                          ))}
                          {dateTasks.length > 2 && (
                            <span className="block px-1 text-[10px] font-semibold text-slate-400">
                              +{dateTasks.length - 2} task
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Ngày đã chọn
          </p>
          <h2 className="mt-2 font-semibold capitalize text-slate-900">
            {formatSelectedDate(selectedDate)}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{selectedTasks.length} deadline</p>

          {selectedTasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Không có task trong ngày này</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Chọn ngày khác hoặc thay đổi bộ lọc status.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {selectedTasks.map((task) => (
                <article key={task.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                        task.is_overdue ? 'bg-red-500' : STATUS_CONFIG[task.status].dot
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                      <button
                        type="button"
                        className="mt-1 max-w-full truncate text-left text-xs text-slate-400 hover:text-indigo-600"
                        onClick={() => onOpenCourse({ id: task.course_id, name: task.course_name })}
                      >
                        {task.course_name} · {task.project_title}
                      </button>
                      <p
                        className={`mt-2 text-xs font-semibold ${task.is_overdue ? 'text-red-600' : 'text-slate-500'}`}
                      >
                        {task.is_overdue ? 'Quá hạn' : STATUS_CONFIG[task.status].label}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="animate-pulse p-4" aria-label="Đang tải lịch">
      <div className="grid min-w-[700px] grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, index) => (
          <div key={index} className="h-24 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
