import { useEffect, useState } from 'react';

import Modal from '../../components/Modal';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../../services/taskApi';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  due_date: '',
};

const STATUS_CONFIG = {
  todo: {
    label: 'Cần làm',
    dotClass: 'bg-slate-400',
  },
  'in-progress': {
    label: 'Đang làm',
    dotClass: 'bg-blue-500',
  },
  done: {
    label: 'Hoàn thành',
    dotClass: 'bg-emerald-500',
  },
};

function formatDate(dateString) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateString}T00:00:00`));
}

function TaskManager({ selectedProject }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActionError('');
  }

  function openCreateForm() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActionError('');
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      due_date: task.due_date,
    });
    setFormErrors({});
    setActionError('');
    setShowForm(true);
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
      const taskInput = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        due_date: form.due_date,
      };

      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, taskInput);

        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
      } else {
        const newTask = await createTask(selectedProject.id, taskInput);

        setTasks((currentTasks) => [...currentTasks, newTask]);
      }

      closeForm();
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
      <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <span className="text-sm font-medium text-slate-700">Chưa chọn project</span>
        <p className="mt-1 text-sm text-slate-400">Chọn một project phía trên để mở task board.</p>
      </section>
    );
  }

  const completedTaskCount = tasks.filter((task) => task.status === 'done').length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTaskCount / tasks.length) * 100);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 border-t border-slate-200 pt-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Task board
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {selectedProject.title}
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {completedTaskCount}/{tasks.length} hoàn thành · {progress}%
            </span>
          </div>
        </div>
        <button
          type="button"
          className="self-start rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:self-auto"
          onClick={openCreateForm}
        >
          + Thêm task
        </button>
      </div>

      {actionError && !showForm && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {actionError}
        </p>
      )}

      {isLoading && (
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-xl bg-slate-200/70" />
          ))}
        </div>
      )}

      {!isLoading && loadError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

      {!isLoading && !loadError && (
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const statusTasks = tasks.filter((task) => task.status === status);

            return (
              <div key={status} className="rounded-xl bg-slate-100/80 p-3">
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${config.dotClass}`} />
                    <h3 className="text-sm font-semibold text-slate-700">{config.label}</h3>
                  </div>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
                    {statusTasks.length}
                  </span>
                </div>

                <ul className="mt-3 space-y-3">
                  {statusTasks.map((task) => (
                    <li key={task.id}>
                      <article
                        className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                          task.is_overdue ? 'border-red-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-medium leading-6 text-slate-900">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Sửa ${task.title}`}
                              className="text-xs font-semibold text-slate-400 transition hover:text-indigo-600"
                              onClick={() => openEditForm(task)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              aria-label={`Xóa ${task.title}`}
                              className="text-lg leading-none text-slate-300 transition hover:text-red-600 disabled:opacity-50"
                              disabled={deletingTaskId === task.id}
                              onClick={() => handleDelete(task)}
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="mt-2 text-sm leading-5 text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <span
                            className={`text-xs font-semibold ${
                              task.is_overdue ? 'text-red-600' : 'text-slate-400'
                            }`}
                          >
                            {task.is_overdue ? 'Quá hạn · ' : 'Hạn '}
                            {formatDate(task.due_date)}
                          </span>
                          <select
                            aria-label={`Trạng thái của ${task.title}`}
                            value={task.status}
                            className="max-w-32 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 disabled:opacity-60"
                            disabled={updatingTaskId === task.id}
                            onChange={(event) => handleStatusChange(task.id, event.target.value)}
                          >
                            {Object.entries(STATUS_CONFIG).map(([value, statusConfig]) => (
                              <option key={value} value={value}>
                                {statusConfig.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>

                {statusTasks.length === 0 && (
                  <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-5 text-center text-xs text-slate-400">
                    Chưa có task
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal
          title={editingTask ? 'Chỉnh sửa task' : 'Tạo task mới'}
          description={
            editingTask
              ? 'Cập nhật nội dung, trạng thái hoặc deadline của task.'
              : `Task sẽ được thêm vào project ${selectedProject.title}.`
          }
          onClose={closeForm}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="task-title">
                Tên task
              </label>
              <input
                id="task-title"
                name="title"
                type="text"
                value={form.title}
                maxLength={200}
                autoFocus
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Ví dụ: Hoàn thiện ERD"
                onChange={handleChange}
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="task-status">
                  Trạng thái
                </label>
                <select
                  id="task-status"
                  name="status"
                  value={form.status}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  onChange={handleChange}
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="task-due-date">
                  Hạn hoàn thành
                </label>
                <input
                  id="task-due-date"
                  name="due_date"
                  type="date"
                  value={form.due_date}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  onChange={handleChange}
                />
                {formErrors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="task-description">
                Mô tả <span className="font-normal text-slate-400">(không bắt buộc)</span>
              </label>
              <textarea
                id="task-description"
                name="description"
                value={form.description}
                rows={3}
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                onChange={handleChange}
              />
            </div>

            {actionError && <p className="text-sm font-medium text-red-600">{actionError}</p>}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={closeForm}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : editingTask ? 'Lưu thay đổi' : 'Tạo task'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default TaskManager;
