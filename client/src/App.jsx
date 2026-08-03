import { useState } from 'react';

import AuthScreen, { AuthLoadingScreen, SessionErrorScreen } from './features/auth/AuthScreen';
import CalendarView from './features/calendar/CalendarView';
import CourseManager from './features/courses/CourseManager';
import CourseOverview from './features/courses/CourseOverview';
import DashboardOverview from './features/dashboard/DashboardOverview';
import AccountSettings from './features/settings/AccountSettings';
import PersonalPlanner from './features/tasks/PersonalPlanner';
import ProjectManager from './features/projects/ProjectManager';
import GlobalSearch from './features/search/GlobalSearch';
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
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRefreshKey, setProjectRefreshKey] = useState(0);
  const [courseOverviewRefreshKey, setCourseOverviewRefreshKey] = useState(0);

  function handleSelectCourse(course) {
    setActiveView(course ? 'course' : 'dashboard');
    setSelectedCourse(course);
    setSelectedProject(null);
  }

  function handleUpdateCourse(course) {
    setSelectedCourse((currentCourse) =>
      currentCourse?.id === course.id ? course : currentCourse,
    );
  }

  function handleShowDashboard() {
    setActiveView('dashboard');
    setSelectedCourse(null);
    setSelectedProject(null);
  }

  function handleShowPlanner() {
    setActiveView('planner');
    setSelectedCourse(null);
    setSelectedProject(null);
  }

  function handleShowCalendar() {
    setActiveView('calendar');
    setSelectedCourse(null);
    setSelectedProject(null);
  }

  function handleShowSettings() {
    setActiveView('settings');
    setSelectedCourse(null);
    setSelectedProject(null);
  }

  function handleOpenSearchResult(type, item) {
    setActiveView('course');

    if (type === 'course') {
      setSelectedCourse(item);
      setSelectedProject(null);
      return;
    }

    setSelectedCourse({
      id: item.course_id,
      name: item.course_name,
    });

    if (type === 'project') {
      setSelectedProject(item);
      return;
    }

    setSelectedProject({
      id: item.project_id,
      course_id: item.course_id,
      title: item.project_title,
    });
  }

  function handleProjectsChanged() {
    setCourseOverviewRefreshKey((key) => key + 1);
  }

  function handleTasksChanged() {
    setProjectRefreshKey((key) => key + 1);
    setCourseOverviewRefreshKey((key) => key + 1);
  }

  return (
    <div className="min-h-screen bg-[var(--cf-canvas)] text-[var(--cf-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cf-line)] bg-[var(--cf-paper)]/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-7">
            <button
              type="button"
              className="flex shrink-0 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-accent)]"
              onClick={handleShowDashboard}
              aria-label="Mở dashboard"
            >
              <div className="grid size-9 place-items-center border border-[var(--cf-ink)] bg-[var(--cf-ink)] text-xs font-bold tracking-wider text-[var(--cf-paper)]">
                CF
              </div>
              <div className="hidden sm:block">
                <p className="font-editorial text-lg font-semibold leading-none tracking-tight">
                  CampusFlow
                </p>
                <p className="mt-1 text-[11px] text-[var(--cf-muted)]">Sổ học tập cá nhân</p>
              </div>
            </button>
            <nav className="hidden h-[4.5rem] items-stretch md:flex" aria-label="Workspace">
              <button
                type="button"
                className={`border-b-2 px-3 text-xs font-semibold transition ${
                  activeView === 'dashboard'
                    ? 'border-[var(--cf-accent)] text-[var(--cf-ink)]'
                    : 'border-transparent text-[var(--cf-muted)] hover:text-[var(--cf-ink)]'
                }`}
                onClick={handleShowDashboard}
              >
                Tổng quan
              </button>
              <button
                type="button"
                className={`border-b-2 px-3 text-xs font-semibold transition ${
                  activeView === 'planner'
                    ? 'border-[var(--cf-accent)] text-[var(--cf-ink)]'
                    : 'border-transparent text-[var(--cf-muted)] hover:text-[var(--cf-ink)]'
                }`}
                onClick={handleShowPlanner}
              >
                Tất cả task
              </button>
              <button
                type="button"
                className={`border-b-2 px-3 text-xs font-semibold transition ${
                  activeView === 'calendar'
                    ? 'border-[var(--cf-accent)] text-[var(--cf-ink)]'
                    : 'border-transparent text-[var(--cf-muted)] hover:text-[var(--cf-ink)]'
                }`}
                onClick={handleShowCalendar}
              >
                Lịch
              </button>
            </nav>
            <GlobalSearch onOpenResult={handleOpenSearchResult} />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className={`flex items-center gap-3 p-1 text-right transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cf-accent)] ${
                activeView === 'settings' ? 'text-[var(--cf-accent)]' : ''
              }`}
              onClick={handleShowSettings}
              aria-label="Mở cài đặt tài khoản"
            >
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold">{user.name}</span>
                <span className="block max-w-56 truncate text-xs text-[var(--cf-faint)]">
                  {user.email}
                </span>
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-[var(--cf-line)] bg-[var(--cf-surface)] text-xs font-bold text-[var(--cf-muted)]">
                {getInitials(user.name)}
              </span>
            </button>
            <button
              type="button"
              className="border-l border-[var(--cf-line)] py-2 pl-3 text-xs font-semibold text-[var(--cf-muted)] transition hover:text-[var(--cf-danger)] disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
        <nav
          className="grid grid-cols-3 border-t border-[var(--cf-line)] bg-[var(--cf-paper)] px-4 md:hidden"
          aria-label="Workspace mobile"
        >
          <MobileNavButton active={activeView === 'dashboard'} onClick={handleShowDashboard}>
            Tổng quan
          </MobileNavButton>
          <MobileNavButton active={activeView === 'planner'} onClick={handleShowPlanner}>
            Công việc
          </MobileNavButton>
          <MobileNavButton active={activeView === 'calendar'} onClick={handleShowCalendar}>
            Lịch
          </MobileNavButton>
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <CourseManager
          selectedCourseId={selectedCourse?.id}
          onSelectCourse={handleSelectCourse}
          onUpdateCourse={handleUpdateCourse}
        />

        <main className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
          {activeView === 'dashboard' ? (
            <DashboardOverview user={user} />
          ) : activeView === 'planner' ? (
            <PersonalPlanner onOpenCourse={handleSelectCourse} />
          ) : activeView === 'calendar' ? (
            <CalendarView onOpenCourse={handleSelectCourse} />
          ) : activeView === 'settings' ? (
            <AccountSettings />
          ) : (
            <div>
              <nav
                className="flex items-center gap-2 text-xs text-[var(--cf-faint)]"
                aria-label="Breadcrumb"
              >
                <span>Môn học</span>
                <span>/</span>
                <span className="font-medium text-[var(--cf-muted)]">{selectedCourse.name}</span>
                {selectedProject && (
                  <>
                    <span>/</span>
                    <span className="truncate font-medium text-[var(--cf-muted)]">
                      {selectedProject.title}
                    </span>
                  </>
                )}
              </nav>

              <div className="mt-4 border-b border-[var(--cf-line)] pb-7">
                <p className="text-xs font-semibold text-[var(--cf-accent)]">Không gian môn học</p>
                <h1 className="font-editorial mt-1 text-4xl font-semibold tracking-tight">
                  {selectedCourse.name}
                </h1>
              </div>

              <div className="mt-7">
                <CourseOverview
                  key={selectedCourse.id}
                  selectedCourse={selectedCourse}
                  refreshKey={courseOverviewRefreshKey}
                />
              </div>

              <div className="mt-8">
                <ProjectManager
                  selectedCourse={selectedCourse}
                  selectedProjectId={selectedProject?.id}
                  refreshKey={projectRefreshKey}
                  onProjectsChanged={handleProjectsChanged}
                  onSelectProject={setSelectedProject}
                />
              </div>

              <div className="mt-8">
                <TaskManager
                  selectedProject={selectedProject}
                  onTasksChanged={handleTasksChanged}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MobileNavButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`border-b-2 px-3 py-3 text-xs font-semibold ${
        active
          ? 'border-[var(--cf-accent)] text-[var(--cf-ink)]'
          : 'border-transparent text-[var(--cf-muted)]'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
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
