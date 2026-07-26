import { useEffect, useState } from 'react';

import useToast from '../../hooks/useToast';
import { getAllTasks, updateTaskStatus } from '../../services/taskApi';

const STATUS_CONFIG = {
  todo: { label: 'Cần làm', dotClass: 'bg-slate-400' },
  'in-progress': { label: 'Đang làm', dotClass: 'bg-sky-500' },
  done: { label: 'Hoàn thành', dotClass: 'bg-emerald-500' },
};

const FILTERS = [
  ['all', 'Tất cả status'],
  ['todo', 'Cần làm'],
  ['in-progress', 'Đang làm'],
  ['done', 'Hoàn thành'],
  ['overdue', 'Quá hạn'],
];

const SORTS = [
  ['due-asc', 'Due date gần nhất'],
  ['due-desc', 'Due date xa nhất'],
  ['newest', 'Task mới nhất'],
];

function formatDate(dateString) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function PersonalPlanner({ onOpenCourse }) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('due-asc');
  const [page, setPage] = useState(1);
  const [reloadCount, setReloadCount] = useState(0);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      setIsLoading(true);
      setError('');

      try {
        const result = await getAllTasks({ search, filter, sort, page });

        if (isActive) {
          if (result.data.length === 0 && page > 1 && result.pagination.total_pages < page) {
            setPage(Math.max(1, result.pagination.total_pages));
            return;
          }

          setTasks(result.data);
          setPagination(result.pagination);
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

    loadTasks();

    return () => {
      isActive = false;
    };
  }, [search, filter, sort, page, reloadCount]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleFilterChange(event) {
    setFilter(event.target.value);
    setPage(1);
  }

  function handleSortChange(event) {
    setSort(event.target.value);
    setPage(1);
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setFilter('all');
    setSort('due-asc');
    setPage(1);
  }

  async function handleStatusChange(taskId, status) {
    setUpdatingTaskId(taskId);
    setError('');

    try {
      await updateTaskStatus(taskId, status);
      showToast(`Task đã chuyển sang ${STATUS_CONFIG[status].label.toLocaleLowerCase('vi')}.`);
      setReloadCount((count) => count + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  const hasFilters = search || filter !== 'all' || sort !== 'due-asc';

  return (
    <div>
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-indigo-600">Personal planner</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tất cả task</h1>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi công việc xuyên suốt mọi course và project.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{pagination.total} task</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <form
          className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_12rem_12rem_auto]"
          onSubmit={handleSearch}
        >
          <label>
            <span className="sr-only">Tìm task</span>
            <input
              type="search"
              value={searchInput}
              maxLength={200}
              placeholder="Tìm theo title..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Lọc status</span>
            <select
              value={filter}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onChange={handleFilterChange}
            >
              {FILTERS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sắp xếp task</span>
            <select
              value={sort}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onChange={handleSortChange}
            >
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Tìm kiếm
          </button>
        </form>
      </section>

      {error && (
        <div
          className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="shrink-0 font-semibold underline"
            onClick={() => setReloadCount((count) => count + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isLoading ? (
          <PlannerSkeleton />
        ) : tasks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">
              {hasFilters ? 'Không tìm thấy task phù hợp' : 'Bạn chưa có task nào'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {hasFilters
                ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
                : 'Chọn một course để tạo project và task đầu tiên.'}
            </p>
            {hasFilters && (
              <button
                type="button"
                className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_11rem_10rem] lg:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${task.is_overdue ? 'bg-red-500' : STATUS_CONFIG[task.status].dotClass}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                    <button
                      type="button"
                      className="mt-1 max-w-full truncate text-left text-xs text-slate-400 hover:text-indigo-600"
                      onClick={() => onOpenCourse({ id: task.course_id, name: task.course_name })}
                    >
                      {task.course_name} · {task.project_title}
                    </button>
                  </div>
                </div>

                <div>
                  <p
                    className={`text-xs font-semibold ${task.is_overdue ? 'text-red-600' : 'text-slate-600'}`}
                  >
                    {formatDate(task.due_date)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {task.is_overdue ? 'Quá hạn' : 'Due date'}
                  </p>
                </div>

                <select
                  aria-label={`Cập nhật status của ${task.title}`}
                  value={task.status}
                  disabled={updatingTaskId === task.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-400 disabled:opacity-60"
                  onChange={(event) => handleStatusChange(task.id, event.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </section>

      {!isLoading && pagination.total_pages > 1 && (
        <nav className="mt-5 flex items-center justify-between" aria-label="Phân trang task">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Trang trước
          </button>
          <p className="text-sm text-slate-400">
            Trang <span className="font-semibold text-slate-700">{pagination.page}</span> /{' '}
            {pagination.total_pages}
          </p>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-40"
            disabled={page >= pagination.total_pages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Trang sau
          </button>
        </nav>
      )}
    </div>
  );
}

function PlannerSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-slate-100" aria-label="Đang tải task">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_11rem_10rem]">
          <div className="h-10 rounded-lg bg-slate-100" />
          <div className="h-10 rounded-lg bg-slate-100" />
          <div className="h-10 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default PersonalPlanner;
