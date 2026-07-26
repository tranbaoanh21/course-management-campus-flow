import { useState } from 'react';

import AuthScreen, { AuthLoadingScreen, SessionErrorScreen } from './features/auth/AuthScreen';
import CourseManager from './features/courses/CourseManager';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ProjectManager from './features/projects/ProjectManager';
import TaskManager from './features/tasks/TaskManager';
import useAuth from './hooks/useAuth';
import useToast from './hooks/useToast';

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Workspace({ user, isLoggingOut, onLogout }) {
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

  function handleShowDashboard() {
    setSelectedCourse(null);
    setSelectedProject(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={handleShowDashboard}
            aria-label="Mở dashboard"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
              CF
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-950">CampusFlow</p>
              <p className="text-xs text-slate-500">Không gian học tập cá nhân</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="max-w-56 truncate text-xs text-slate-400">{user.email}</p>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {getInitials(user.name)}
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
            </button>
          </div>
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
            <DashboardOverview user={user} />
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

function App() {
  const { user, isLoading, sessionError, logout, restoreSession } = useAuth();
  const { showToast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (sessionError) {
    return <SessionErrorScreen message={sessionError} onRetry={restoreSession} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Workspace user={user} isLoggingOut={isLoggingOut} onLogout={handleLogout} />;
}

export default App;
