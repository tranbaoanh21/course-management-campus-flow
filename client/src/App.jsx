import { useState } from 'react';

import CourseManager from './features/courses/CourseManager';
import ProjectManager from './features/projects/ProjectManager';

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          Phase 1 MVP
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">CampusFlow</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Quản lý course, project, task và deadline trong một luồng full-stack đơn giản.
        </p>

        <div className="mt-10">
          <CourseManager selectedCourseId={selectedCourse?.id} onSelectCourse={setSelectedCourse} />
        </div>

        <div className="mt-8">
          <ProjectManager selectedCourse={selectedCourse} />
        </div>
      </div>
    </main>
  );
}

export default App;
