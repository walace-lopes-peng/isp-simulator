const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const SPRINT_ISSUE_NUMBER = 27;

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return res.json();
}

function labels(item) {
  return item.labels.map(l => `\`${l.name}\``).join(' ');
}

function prStatus(pr) {
  if (pr.draft) return '`draft`';
  if (pr.requested_reviewers?.length > 0) return '`review requested`';
  return '`open`';
}

function priorityOrder(item) {
  const names = item.labels.map(l => l.name);
  if (names.includes('P0-blocker')) return 0;
  if (names.includes('P1-high')) return 1;
  if (names.includes('P2-medium')) return 2;
  return 3;
}

function isBlocker(item) {
  return item.labels.some(l => ['P0-blocker', 'v1-blocker'].includes(l.name));
}

function issueRow(item) {
  return `| #${item.number} | [${item.title}](${item.html_url}) | ${labels(item)} |`;
}

function prRow(pr) {
  return `| #${pr.number} | [${pr.title}](${pr.html_url}) | ${prStatus(pr)} |`;
}

async function main() {
  const [issues, prs] = await Promise.all([
    gh('/issues?state=open&per_page=100'),
    gh('/pulls?state=open&per_page=100'),
  ]);

  const onlyIssues = issues
    .filter(i => !i.pull_request && i.number !== SPRINT_ISSUE_NUMBER);

  const blockers = onlyIssues
    .filter(isBlocker)
    .sort((a, b) => priorityOrder(a) - priorityOrder(b));

  const rest = onlyIssues
    .filter(i => !isBlocker(i))
    .sort((a, b) => priorityOrder(a) - priorityOrder(b));

  const upNext = rest.slice(0, 5);
  const backlog = rest.slice(5);

  const issueHeader = '| # | Title | Labels |\n| :--- | :--- | :--- |';
  const prHeader   = '| # | Title | Status |\n| :--- | :--- | :--- |';

  const updated = new Date().toUTCString();

  const body = `# Sprint Board

> Last updated: ${updated}

---

## Blockers

> Must be resolved before anything else.

${issueHeader}
${blockers.length ? blockers.map(issueRow).join('\n') : '| — | No blockers | — |'}

---

## Pull Requests

${prHeader}
${prs.length ? prs.map(prRow).join('\n') : '| — | No open PRs | — |'}

---

## Up Next

> Top ${upNext.length} ready issues, sorted by priority.

${issueHeader}
${upNext.length ? upNext.map(issueRow).join('\n') : '| — | No items | — |'}

---

## Backlog

${issueHeader}
${backlog.length ? backlog.map(issueRow).join('\n') : '| — | Empty | — |'}
`;

  await gh(`/issues/${SPRINT_ISSUE_NUMBER}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });

  console.log(`Sprint board (issue #${SPRINT_ISSUE_NUMBER}) updated.`);
}

main().catch(e => { console.error(e); process.exit(1); });
