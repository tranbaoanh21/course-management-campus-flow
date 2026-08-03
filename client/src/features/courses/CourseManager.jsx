import { useEffect, useState } from 'react';

import ConfirmDialog from '../../components/ConfirmDialog';
import useToast from '../../hooks/useToast';
import { createCourse, deleteCourse, getCourses, updateCourse } from '../../services/courseApi';

function CourseManager({ selectedCourseId, onSelectCourse, onUpdateCourse }) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editError, setEditError] = useState('');
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
      setShowForm(false);
      onSelectCourse(newCourse);
      showToast('Course đã được tạo.');
    } catch (error) {
      setFormError(error.fieldErrors?.name || error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(course) {
    setCourseToDelete(course);
    setActionError('');
  }

  async function confirmDelete() {
    if (!courseToDelete) {
      return;
    }

    setDeletingCourseId(courseToDelete.id);
    setActionError('');

    try {
      await deleteCourse(courseToDelete.id);
      setCourses((currentCourses) =>
        currentCourses.filter((currentCourse) => currentCourse.id !== courseToDelete.id),
      );

      if (selectedCourseId === courseToDelete.id) {
        onSelectCourse(null);
      }

      showToast('Course đã được xóa.');
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingCourseId(null);
      setCourseToDelete(null);
    }
  }

  function startEditing(course) {
    setEditingCourseId(course.id);
    setEditName(course.name);
    setEditError('');
    setActionError('');
  }

  function stopEditing() {
    setEditingCourseId(null);
    setEditName('');
    setEditError('');
  }

  async function handleUpdate(event, courseId) {
    event.preventDefault();
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setEditError('Tên course là bắt buộc.');
      return;
    }

    setIsUpdating(true);
    setEditError('');

    try {
      const updatedCourse = await updateCourse(courseId, trimmedName);
      setCourses((currentCourses) =>
        currentCourses.map((course) => (course.id === courseId ? updatedCourse : course)),
      );
      onUpdateCourse(updatedCourse);
      stopEditing();
      showToast('Tên course đã được cập nhật.');
    } catch (error) {
      setEditError(error.fieldErrors?.name || error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <aside className="border-b border-[var(--cf-line)] bg-[var(--cf-paper)] px-4 py-5 sm:px-6 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-xl font-semibold tracking-tight">Môn học</h2>
            <p className="mt-1 text-xs text-[var(--cf-muted)]">Không gian theo học kỳ</p>
          </div>
          <button
            type="button"
            aria-label="Tạo course"
            className="grid size-8 place-items-center border border-[var(--cf-line-strong)] text-lg text-[var(--cf-accent)] transition hover:border-[var(--cf-accent)] hover:bg-[var(--cf-accent-soft)]"
            onClick={() => {
              setShowForm((currentValue) => !currentValue);
              setFormError('');
            }}
          >
            +
          </button>
        </div>

        {showForm && (
          <form
            className="mt-5 border border-[var(--cf-line)] bg-[var(--cf-accent-soft)] p-3"
            onSubmit={handleSubmit}
          >
            <label className="text-xs font-semibold text-[var(--cf-ink)]" htmlFor="course-name">
              Tên course
            </label>
            <input
              id="course-name"
              type="text"
              value={name}
              maxLength={150}
              autoFocus
              className="mt-2 w-full border border-[var(--cf-line-strong)] bg-[var(--cf-paper)] px-3 py-2 text-sm outline-none transition focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[#c8ddcf]"
              placeholder="Database Systems"
              onChange={(event) => setName(event.target.value)}
            />
            {formError && <p className="mt-2 text-xs font-medium text-red-600">{formError}</p>}
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="bg-[var(--cf-accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--cf-accent-hover)] disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo course'}
              </button>
              <button
                type="button"
                className="px-3 py-2 text-xs font-semibold text-[var(--cf-muted)] hover:bg-white/70"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <div className="mt-7">
          {isLoading && <p className="py-4 text-sm text-[var(--cf-faint)]">Đang tải môn học...</p>}

          {!isLoading && loadError && (
            <div className="border border-red-200 bg-[var(--cf-danger-soft)] p-3 text-sm text-[var(--cf-danger)]">
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

          {!isLoading && !loadError && courses.length === 0 && (
            <p className="border-y border-dashed border-[var(--cf-line)] px-3 py-6 text-center text-sm text-[var(--cf-faint)]">
              Chưa có môn học nào.
            </p>
          )}

          {!isLoading && !loadError && courses.length > 0 && (
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible">
              {courses.map((course) => (
                <li key={course.id} className="group min-w-52 lg:min-w-0">
                  {editingCourseId === course.id ? (
                    <form
                      className="border border-[var(--cf-line)] bg-[var(--cf-accent-soft)] p-2"
                      onSubmit={(event) => handleUpdate(event, course.id)}
                    >
                      <input
                        type="text"
                        value={editName}
                        maxLength={150}
                        autoFocus
                        aria-label={`Tên mới của ${course.name}`}
                        className="w-full border border-[var(--cf-line-strong)] bg-[var(--cf-paper)] px-2.5 py-2 text-sm outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[#c8ddcf]"
                        onChange={(event) => setEditName(event.target.value)}
                      />
                      {editError && <p className="mt-1.5 text-xs text-red-600">{editError}</p>}
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="bg-[var(--cf-accent)] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-xs font-semibold text-[var(--cf-muted)] hover:bg-white/70"
                          onClick={stopEditing}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      className={`flex items-center gap-1 border-l-2 py-2 pr-1 transition ${
                        selectedCourseId === course.id
                          ? 'border-[var(--cf-accent)] bg-[var(--cf-accent-soft)] text-[var(--cf-ink)]'
                          : 'border-transparent text-[var(--cf-muted)] hover:bg-[var(--cf-surface)] hover:text-[var(--cf-ink)]'
                      }`}
                    >
                      <button
                        type="button"
                        aria-current={selectedCourseId === course.id ? 'page' : undefined}
                        className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1 text-left"
                        onClick={() => onSelectCourse(course)}
                      >
                        <span
                          className={`grid size-8 shrink-0 place-items-center border text-[10px] font-bold tracking-wide ${
                            selectedCourseId === course.id
                              ? 'border-[var(--cf-accent)] bg-[var(--cf-accent)] text-white'
                              : 'border-[var(--cf-line)] bg-[var(--cf-surface)] text-[var(--cf-faint)]'
                          }`}
                        >
                          {course.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="truncate text-sm font-medium">{course.name}</span>
                      </button>
                      <div className="flex opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={`Sửa ${course.name}`}
                          className="px-1.5 py-1 text-xs font-medium text-[var(--cf-faint)] hover:text-[var(--cf-accent)]"
                          onClick={() => startEditing(course)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${course.name}`}
                          className="px-1.5 py-1 text-xs font-medium text-[var(--cf-faint)] hover:text-[var(--cf-danger)]"
                          disabled={deletingCourseId === course.id}
                          onClick={() => handleDelete(course)}
                        >
                          {deletingCourseId === course.id ? '...' : 'Xóa'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {actionError && (
            <p className="mt-3 px-2 text-xs font-medium text-red-600">{actionError}</p>
          )}
        </div>
      </aside>

      {courseToDelete && (
        <ConfirmDialog
          title={`Xóa course “${courseToDelete.name}”?`}
          description="Project và task thuộc course này cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
          confirmLabel="Xóa course"
          isConfirming={deletingCourseId === courseToDelete.id}
          onCancel={() => setCourseToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

export default CourseManager;
