import { useEffect, useState } from 'react';

import { createProject, deleteProject, getProjects } from '../../services/projectApi';

const EMPTY_FORM = {
  title: '',
  description: '',
  due_date: '',
};

function ProjectManager({ selectedCourse }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
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
      const newProject = await createProject(selectedCourse.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date,
      });

      setProjects((currentProjects) =>
        [...currentProjects, newProject].sort((firstProject, secondProject) =>
          firstProject.due_date.localeCompare(secondProject.due_date),
        ),
      );
      setForm(EMPTY_FORM);
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
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingProjectId(null);
    }
  }

  if (!selectedCourse) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Project Management</h2>
        <p className="mt-2 text-slate-500">Chọn “Xem projects” ở một course để bắt đầu.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">Projects</p>
        <h2 className="mt-1 text-2xl font-bold">{selectedCourse.name}</h2>
      </div>

      <form
        className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 lg:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="text-sm font-semibold" htmlFor="project-title">
            Title
          </label>
          <input
            id="project-title"
            name="title"
            type="text"
            value={form.title}
            maxLength={200}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500"
            onChange={handleChange}
          />
          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="project-due-date">
            Due date
          </label>
          <input
            id="project-due-date"
            name="due_date"
            type="date"
            value={form.due_date}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500"
            onChange={handleChange}
          />
          {formErrors.due_date && (
            <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-semibold" htmlFor="project-description">
            Description
          </label>
          <textarea
            id="project-description"
            name="description"
            value={form.description}
            rows={3}
            className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo...' : 'Tạo project'}
        </button>
      </form>

      {actionError && <p className="mt-4 text-sm font-medium text-red-600">{actionError}</p>}

      {isLoading && <p className="mt-6 text-slate-500">Đang tải projects...</p>}

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

      {!isLoading && !loadError && projects.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          Course này chưa có project.
        </p>
      )}

      {!isLoading && !loadError && projects.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id} className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">{project.title}</h3>
                  <p className="mt-1 text-sm font-medium text-violet-600">Due {project.due_date}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  disabled={deletingProjectId === project.id}
                  onClick={() => handleDelete(project)}
                >
                  {deletingProjectId === project.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
              {project.description && (
                <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProjectManager;
