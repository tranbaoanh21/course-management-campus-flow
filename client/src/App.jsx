import { useState } from 'react';

import CourseManager from './features/courses/CourseManager';
import ProjectManager from './features/projects/ProjectManager';
import TaskManager from './features/tasks/TaskManager';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  function handleSelectCourse(course) {
    setSelectedCourse(course);
    setSelectedProject(null);
  }

  function handleUpdateCourse(course) {
    setSelectedCourse((currentCourse) =>
      currentCourse?.id === course.id ? course : currentCourse,
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
              CF
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-950">CampusFlow</p>
              <p className="text-xs text-slate-500">Không gian học tập cá nhân</p>
            </div>
          </div>
          <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">
            Phase 1.5 · Product polish
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <CourseManager
          selectedCourseId={selectedCourse?.id}
          onSelectCourse={handleSelectCourse}
          onUpdateCourse={handleUpdateCourse}
        />

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!selectedCourse ? (
            <section className="flex min-h-[65vh] items-center justify-center">
              <div className="max-w-lg text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50 text-xl font-semibold text-indigo-600">
                  01
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                  Bắt đầu từ một môn học
                </h1>
                <p className="mt-3 leading-7 text-slate-500">
                  Chọn course ở thanh bên để xem project và task, hoặc tạo course đầu tiên cho học
                  kỳ của bạn.
                </p>
              </div>
            </section>
          ) : (
            <div>
              <nav
                className="flex items-center gap-2 text-sm text-slate-400"
                aria-label="Breadcrumb"
              >
                <span>Courses</span>
                <span>/</span>
                <span className="font-medium text-slate-600">{selectedCourse.name}</span>
                {selectedProject && (
                  <>
                    <span>/</span>
                    <span className="truncate font-medium text-slate-600">
                      {selectedProject.title}
                    </span>
                  </>
                )}
              </nav>

              <div className="mt-3 border-b border-slate-200 pb-6">
                <p className="text-sm font-medium text-indigo-600">Không gian môn học</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedCourse.name}
                </h1>
              </div>

              <div className="mt-7">
                <ProjectManager
                  selectedCourse={selectedCourse}
                  selectedProjectId={selectedProject?.id}
                  onSelectProject={setSelectedProject}
                />
              </div>

              <div className="mt-8">
                <TaskManager selectedProject={selectedProject} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
