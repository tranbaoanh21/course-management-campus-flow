function buildDataExport(account, courses, projects, tasks, exportedAt = new Date().toISOString()) {
  const coursesById = new Map(
    courses.map((course) => [
      course.id,
      {
        ...course,
        projects: [],
      },
    ]),
  );
  const projectsById = new Map();

  for (const project of projects) {
    const exportedProject = {
      ...project,
      tasks: [],
    };
    projectsById.set(project.id, exportedProject);
    coursesById.get(project.course_id)?.projects.push(exportedProject);
  }

  for (const task of tasks) {
    projectsById.get(task.project_id)?.tasks.push(task);
  }

  return {
    format: 'campusflow-export',
    version: 1,
    exported_at: exportedAt,
    account,
    summary: {
      courses: courses.length,
      projects: projects.length,
      tasks: tasks.length,
    },
    courses: [...coursesById.values()],
  };
}

module.exports = {
  buildDataExport,
};
