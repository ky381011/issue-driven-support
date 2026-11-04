// Remove "<base>:*" labels when the issue is closed.
// Called from action.yml via actions/github-script.
module.exports = async ({ github, context, core }) => {
  const { CLOSE_BASE_LABEL: BASE } = process.env;
  const issue = context.payload.issue;
  if (!issue) {
    core.info('Not an issue event. Skipped.');
    return;
  }

  const prefix = `${BASE}:`;
  const targets = issue.labels.map(l => l.name).filter(n => n.startsWith(prefix));
  if (targets.length === 0) {
    core.info(`No "${prefix}*" label. Skipped.`);
    return;
  }

  const params = { ...context.repo, issue_number: issue.number };
  for (const name of targets) {
    await github.rest.issues.removeLabel({ ...params, name });
    core.info(`Removed: ${name}`);
  }
};
