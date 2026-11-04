// Replace base label with "<base>:<suffix>" using a value from the issue form.
// Called from action.yml via actions/github-script.
module.exports = async ({ github, context, core }) => {
  const { BASE, FIELD, REMOVE_BASE } = process.env;
  const issue = context.payload.issue;
  if (!issue) {
    core.info('Not an issue event. Skipped.');
    return;
  }
  if (!issue.labels.some(l => l.name === BASE)) {
    core.info(`Label "${BASE}" not found. Skipped.`);
    return;
  }

  const esc = FIELD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = (issue.body || '').match(new RegExp(`^###\\s+${esc}\\s*\\r?\\n+([^\\r\\n]+)`, 'm'));
  const raw = m?.[1].trim();
  if (!raw || raw === '_No response_') {
    core.info(`Field "${FIELD}" is empty. Skipped.`);
    return;
  }
  const suffix = raw.toLowerCase();

  const params = { ...context.repo, issue_number: issue.number };
  const target = `${BASE}:${suffix}`;
  // GitHub label names are limited to 50 characters
  if (target.length > 50) {
    core.setFailed(`Label "${target}" exceeds 50 characters.`);
    return;
  }
  await github.rest.issues.addLabels({ ...params, labels: [target] });
  if (REMOVE_BASE === 'true') {
    await github.rest.issues.removeLabel({ ...params, name: BASE });
  }
  core.info(`Labeled: ${target}`);
};
