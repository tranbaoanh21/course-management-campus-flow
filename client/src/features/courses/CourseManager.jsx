import { useEffect, useState } from 'react';

import { createCourse, deleteCourse, getCourses } from '../../services/courseApi';

function CourseManager({ selectedCourseId, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCourses() {
      setIsLoading(true);
      setLoadError('');

      try {
        const data = await getCourses();

        if (isActive) {
          setCourses(data);
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

    loadCourses();

    return () => {
      isActive = false;
    };
  }, [reloadCount]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setActionError('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError('Tên course là bắt buộc.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCourse = await createCourse(trimmedName);
      setCourses((currentCourses) => [newCourse, ...currentCourses]);
      setName('');
    } catch (error) {
      setFormError(error.fieldErrors?.name || error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(course) {
    const shouldDelete = window.confirm(
      `Xóa course “${course.name}”? Project và task liên quan cũng sẽ bị xóa.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingCourseId(course.id);
    setActionError('');

    try {
      await deleteCourse(course.id);
      setCourses((currentCourses) =>
        currentCourses.filter((currentCourse) => currentCourse.id !== course.id),
      );

      if (selectedCourseId === course.id) {
        onSelectCourse(null);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingCourseId(null);
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Courses</p>
            <h2 className="mt-1 text-2xl font-bold">Môn học của bạn</h2>
          </div>
          {!isLoading && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {courses.length} course
            </span>
          )}
        </div>

        {isLoading && <p className="mt-8 text-slate-500">Đang tải danh sách course...</p>}

        {!isLoading && loadError && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p>{loadError}</p>
            <button
              type="button"
              className="mt-3 font-semibold underline"
              onClick={() => setReloadCount((count) => count + 1)}
            >
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !loadError && courses.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-semibold text-slate-700">Chưa có course nào</p>
            <p className="mt-1 text-sm text-slate-500">Tạo course đầu tiên bằng form bên cạnh.</p>
          </div>
        )}

        {!isLoading && !loadError && courses.length > 0 && (
          <ul className="mt-6 space-y-3">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{course.name}</p>
                  <p className="text-sm text-slate-500">Course #{course.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      selectedCourseId === course.id
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => onSelectCourse(course)}
                  >
                    {selectedCourseId === course.id ? 'Đang xem' : 'Xem projects'}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={deletingCourseId === course.id}
                    onClick={() => handleDelete(course)}
                  >
                    {deletingCourseId === course.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {actionError && <p className="mt-4 text-sm font-medium text-red-600">{actionError}</p>}
      </div>

      <form
        className="h-fit rounded-2xl bg-slate-900 p-6 text-white shadow-sm"
        onSubmit={handleSubmit}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">New course</p>
        <h2 className="mt-1 text-2xl font-bold">Tạo course</h2>

        <label className="mt-6 block text-sm font-semibold" htmlFor="course-name">
          Tên course
        </label>
        <input
          id="course-name"
          type="text"
          value={name}
          maxLength={150}
          className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
          placeholder="Ví dụ: Database Systems"
          onChange={(event) => setName(event.target.value)}
        />

        {formError && <p className="mt-2 text-sm text-red-300">{formError}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-semibold hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo...' : 'Tạo course'}
        </button>
      </form>
    </section>
  );
}

export default CourseManager;
