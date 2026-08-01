function toCount(value) {
  return Number(value) || 0;
}

function normalizeCourseOverview(summary, nextDeadline = null) {
  const taskCount = toCount(summary.tasks);
  const doneCount = toCount(summary.done);

  return {
    course: {
      id: summary.id,
      name: summary.name,
    },
    counts: {
      projects: toCount(summary.projects),
      tasks: taskCount,
    },
    task_status: {
      todo: toCount(summary.todo),
      in_progress: toCount(summary.in_progress),
      done: doneCount,
      overdue: toCount(summary.overdue),
    },
    completion_percentage: taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100),
    next_deadline: nextDeadline
      ? {
          ...nextDeadline,
          is_overdue: Boolean(Number(nextDeadline.is_overdue)),
        }
      : null,
  };
}

module.exports = {
  normalizeCourseOverview,
};
