import { useEffect, useState } from 'react';

import { createTask, deleteTask, getTasks, updateTaskStatus } from '../../services/taskApi';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  due_date: '',
};

const STATUS_LABELS = {
  todo: 'Todo',
  'in-progress': 'In progress',
  done: 'Done',
};

function sortTasks(tasks) {
  return [...tasks].sort((firstTask, secondTask) =>
    firstTask.due_date.localeCompare(secondTask.due_date),
  );
}

function TaskManager({ selectedProject }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!selectedProject) {
      return undefined;
    }

    let isActive = true;

    async function loadTasks() {
      setIsLoading(true);
      setLoadError('');
      setTasks([]);

      try {
        const data = await getTasks(selectedProject.id);

        if (isActive) {
          setTasks(data);
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

    loadTasks();

    return () => {
      isActive = false;
    };
  }, [selectedProject, reloadCount]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};

    if (!form.title.trim()) {
      errors.title = 'Title là bắt buộc.';
    }

    if (!form.due_date) {
      errors.due_date = 'Due date là bắt buộc.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      const newTask = await createTask(selectedProject.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        due_date: form.due_date,
      });

      setTasks((currentTasks) => sortTasks([...currentTasks, newTask]));
      setForm(EMPTY_FORM);
    } catch (error) {
      setFormErrors(error.fieldErrors || {});
      setActionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    setUpdatingTaskId(taskId);
    setActionError('');

    try {
      const updatedTask = await updateTaskStatus(taskId, status);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
    } catch (error) {
      setActionError(error.message);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Xóa task “${task.title}”?`)) {
      return;
    }

    setDeletingTaskId(task.id);
    setActionError('');

    try {
      await deleteTask(task.id);
      setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== task.id));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingTaskId(null);
    }
  }

  if (!selectedProject) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Task Management</h2>
        <p className="mt-2 text-slate-500">Chọn “Xem tasks” ở một project để bắt đầu.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Tasks</p>
        <h2 className="mt-1 text-2xl font-bold">{selectedProject.title}</h2>
      </div>

      <form
        className="mt-6 grid gap-4 rounded-xl bg-emerald-50 p-5 lg:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="text-sm font-semibold" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            name="title"
            type="text"
            value={form.title}
            maxLength={200}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
            onChange={handleChange}
          />
          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="task-due-date">
            Due date
          </label>
          <input
            id="task-due-date"
            name="due_date"
            type="date"
            value={form.due_date}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
            onChange={handleChange}
          />
          {formErrors.due_date && (
            <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            name="status"
            value={form.status}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
            onChange={handleChange}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            value={form.description}
            rows={3}
            className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo...' : 'Tạo task'}
        </button>
      </form>

      {actionError && <p className="mt-4 text-sm font-medium text-red-600">{actionError}</p>}
      {isLoading && <p className="mt-6 text-slate-500">Đang tải tasks...</p>}

      {!isLoading && loadError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-2 font-semibold underline"
            onClick={() => setReloadCount((count) => count + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !loadError && tasks.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          Project này chưa có task.
        </p>
      )}

      {!isLoading && !loadError && tasks.length > 0 && (
        <ul className="mt-6 space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`rounded-xl border p-4 ${
                task.is_overdue ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800">{task.title}</h3>
                    {task.is_overdue && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        Quá hạn
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Due {task.due_date}</p>
                  {task.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status của ${task.title}`}
                    value={task.status}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500 disabled:opacity-60"
                    disabled={updatingTaskId === task.id}
                    onChange={(event) => handleStatusChange(task.id, event.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    disabled={deletingTaskId === task.id}
                    onClick={() => handleDelete(task)}
                  >
                    {deletingTaskId === task.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskManager;
