import { useEffect, useState } from 'react';

import Modal from '../../components/Modal';
import { searchWorkspace } from '../../services/searchApi';

const EMPTY_RESULTS = {
  counts: { courses: 0, projects: 0, tasks: 0 },
  courses: [],
  projects: [],
  tasks: [],
};

const STATUS_LABELS = {
  todo: 'Cần làm',
  'in-progress': 'Đang làm',
  done: 'Hoàn thành',
};

function formatDate(dateString) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function GlobalSearch({ onOpenResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!isOpen || normalizedQuery.length < 2) {
      return undefined;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await searchWorkspace(normalizedQuery);

        if (isActive) {
          setResults(data);
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
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, query]);

  function closeSearch() {
    setIsOpen(false);
    setQuery('');
    setResults(EMPTY_RESULTS);
    setError('');
  }

  function handleQueryChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (nextQuery.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setIsLoading(false);
      setError('');
    }
  }

  function openResult(type, item) {
    onOpenResult(type, item);
    closeSearch();
  }

  const totalResults = results.counts.courses + results.counts.projects + results.counts.tasks;
  const canSearch = query.trim().length >= 2;

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 border border-[var(--cf-line)] bg-transparent px-2.5 py-2 text-xs font-medium text-[var(--cf-muted)] transition hover:border-[var(--cf-line-strong)] hover:text-[var(--cf-ink)] sm:px-3"
        aria-label="Tìm trong workspace"
        onClick={() => setIsOpen(true)}
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden sm:inline">Tìm kiếm</span>
      </button>

      {isOpen && (
        <Modal
          title="Tìm trong CampusFlow"
          description="Tìm Course, Project hoặc Task theo tên."
          onClose={closeSearch}
        >
          <label>
            <span className="sr-only">Từ khóa tìm kiếm</span>
            <input
              type="search"
              value={query}
              minLength={2}
              maxLength={100}
              autoFocus
              placeholder="Nhập ít nhất 2 ký tự..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onChange={handleQueryChange}
            />
          </label>

          {!canSearch && (
            <p className="mt-5 text-center text-sm text-slate-400">
              Kết quả sẽ xuất hiện khi bạn nhập ít nhất 2 ký tự.
            </p>
          )}

          {canSearch && isLoading && (
            <div className="mt-5 space-y-2" aria-label="Đang tìm kiếm">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {canSearch && !isLoading && error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          {canSearch && !isLoading && !error && totalResults === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center">
              <p className="font-medium text-slate-700">Không tìm thấy kết quả</p>
              <p className="mt-1 text-sm text-slate-400">Thử một từ khóa khác.</p>
            </div>
          )}

          {canSearch && !isLoading && !error && totalResults > 0 && (
            <div className="mt-5 space-y-5">
              <ResultGroup title="Courses" count={results.counts.courses}>
                {results.courses.map((course) => (
                  <ResultButton
                    key={course.id}
                    title={course.name}
                    meta="Course"
                    onClick={() => openResult('course', course)}
                  />
                ))}
              </ResultGroup>

              <ResultGroup title="Projects" count={results.counts.projects}>
                {results.projects.map((project) => (
                  <ResultButton
                    key={project.id}
                    title={project.title}
                    meta={`${project.course_name} · Hạn ${formatDate(project.due_date)}`}
                    onClick={() => openResult('project', project)}
                  />
                ))}
              </ResultGroup>

              <ResultGroup title="Tasks" count={results.counts.tasks}>
                {results.tasks.map((task) => (
                  <ResultButton
                    key={task.id}
                    title={task.title}
                    meta={`${task.course_name} / ${task.project_title} · ${STATUS_LABELS[task.status]}`}
                    danger={task.is_overdue}
                    onClick={() => openResult('task', task)}
                  />
                ))}
              </ResultGroup>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function ResultGroup({ title, count, children }) {
  if (count === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </h3>
        <span className="text-xs font-medium text-slate-400">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function ResultButton({ title, meta, danger = false, onClick }) {
  return (
    <button
      type="button"
      className="block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      onClick={onClick}
    >
      <span className="block truncate text-sm font-semibold text-slate-800">{title}</span>
      <span
        className={`mt-0.5 block truncate text-xs ${danger ? 'text-red-600' : 'text-slate-400'}`}
      >
        {danger ? `Quá hạn · ${meta}` : meta}
      </span>
    </button>
  );
}

export default GlobalSearch;
