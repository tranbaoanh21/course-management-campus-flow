import { useEffect, useState } from 'react';

import Modal from '../../components/Modal';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '../../services/projectApi';

const EMPTY_FORM = {
  title: '',
  description: '',
  due_date: '',
};

function formatDate(dateString) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

function sortProjects(projects) {
  return [...projects].sort((firstProject, secondProject) =>
    firstProject.due_date.localeCompare(secondProject.due_date),
  );
}

function ProjectManager({ selectedCourse, selectedProjectId, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!selectedCourse) {
      return undefined;
    }

    let isActive = true;

    async function loadProjects() {
      setIsLoading(true);
      setLoadError('');
      setProjects([]);

      try {
        const data = await getProjects(selectedCourse.id);

        if (isActive) {
          setProjects(data);
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

    loadProjects();

    return () => {
      isActive = false;
    };
  }, [selectedCourse, reloadCount]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function closeForm() {
    setShowForm(false);
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActionError('');
  }

  function openCreateForm() {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActionError('');
    setShowForm(true);
  }

  function openEditForm(project) {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      due_date: project.due_date,
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
      const projectInput = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date,
      };

      if (editingProject) {
        const updatedProject = await updateProject(editingProject.id, projectInput);

        setProjects((currentProjects) =>
          sortProjects(
            currentProjects.map((project) =>
              project.id === updatedProject.id ? updatedProject : project,
            ),
          ),
        );

        if (selectedProjectId === updatedProject.id) {
          onSelectProject(updatedProject);
        }
      } else {
        const newProject = await createProject(selectedCourse.id, projectInput);

        setProjects((currentProjects) => sortProjects([...currentProjects, newProject]));
        onSelectProject(newProject);
      }

      closeForm();
    } catch (error) {
      setFormErrors(error.fieldErrors || {});
      setActionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(project) {
    const shouldDelete = window.confirm(
      `Xóa project “${project.title}”? Các task liên quan cũng sẽ bị xóa.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingProjectId(project.id);
    setActionError('');

    try {
      await deleteProject(project.id);
      setProjects((currentProjects) =>
        currentProjects.filter((currentProject) => currentProject.id !== project.id),
      );

      if (selectedProjectId === project.id) {
        onSelectProject(null);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Projects
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Đồ án và bài tập lớn
          </h2>
        </div>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          onClick={openCreateForm}
        >
          + Tạo project
        </button>
      </div>

      {isLoading && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl bg-slate-200/70" />
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

      {!isLoading && !loadError && projects.length === 0 && (
        <button
          type="button"
          className="mt-5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
          onClick={openCreateForm}
        >
          <span className="font-medium text-slate-700">Course này chưa có project</span>
          <span className="mt-1 block text-sm text-slate-400">
            Tạo project đầu tiên để quản lý task.
          </span>
        </button>
      )}

      {!isLoading && !loadError && projects.length > 0 && (
        <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const isSelected = selectedProjectId === project.id;

            return (
              <li key={project.id}>
                <article
                  className={`group h-full rounded-xl border bg-white p-4 transition ${
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => onSelectProject(project)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isSelected ? 'Đang mở' : 'Project'}
                      </span>
                      <span className="text-xs text-slate-400">#{project.id}</span>
                    </div>
                    <h3 className="mt-3 line-clamp-1 font-semibold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {project.description || 'Chưa có mô tả.'}
                    </p>
                  </button>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs font-medium text-slate-500">
                      Hạn {formatDate(project.due_date)}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-400 transition hover:text-indigo-600"
                        onClick={() => openEditForm(project)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-400 transition hover:text-red-600 disabled:opacity-50"
                        disabled={deletingProjectId === project.id}
                        onClick={() => handleDelete(project)}
                      >
                        {deletingProjectId === project.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {actionError && !showForm && (
        <p className="mt-3 text-sm font-medium text-red-600">{actionError}</p>
      )}

      {showForm && (
        <Modal
          title={editingProject ? 'Chỉnh sửa project' : 'Tạo project mới'}
          description={
            editingProject
              ? 'Cập nhật thông tin project. Các task hiện tại sẽ được giữ nguyên.'
              : `Project sẽ được thêm vào course ${selectedCourse.name}.`
          }
          onClose={closeForm}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="project-title">
                Tên project
              </label>
              <input
                id="project-title"
                name="title"
                type="text"
                value={form.title}
                maxLength={200}
                autoFocus
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Ví dụ: Database Assignment"
                onChange={handleChange}
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="project-due-date">
                Hạn hoàn thành
              </label>
              <input
                id="project-due-date"
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

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="project-description">
                Mô tả <span className="font-normal text-slate-400">(không bắt buộc)</span>
              </label>
              <textarea
                id="project-description"
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
                {isSubmitting ? 'Đang lưu...' : editingProject ? 'Lưu thay đổi' : 'Tạo project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ProjectManager;
