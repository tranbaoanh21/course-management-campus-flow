function toCount(value) {
  return Number(value) || 0;
}

function normalizeProjectProgress(project) {
  const taskCount = toCount(project.task_count);
  const completedTaskCount = toCount(project.completed_task_count);
  const overdueTaskCount = toCount(project.overdue_task_count);
  const isOverdue = Boolean(toCount(project.is_overdue));
  let progressStatus = 'active';

  if (taskCount > 0 && completedTaskCount === taskCount) {
    progressStatus = 'completed';
  } else if (isOverdue || overdueTaskCount > 0) {
    progressStatus = 'at-risk';
  } else if (taskCount === 0) {
    progressStatus = 'not-started';
  }

  return {
    ...project,
    task_count: taskCount,
    completed_task_count: completedTaskCount,
    overdue_task_count: overdueTaskCount,
    completion_percentage: taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100),
    is_overdue: isOverdue,
    progress_status: progressStatus,
  };
}

module.exports = {
  normalizeProjectProgress,
};
