const { execSync } = require('child_process');
const fs = require('fs');

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;

async function gh(path) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
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
  const labelNames = item.labels.map(l => l.name);
  if (labelNames.includes('P0-blocker')) return 0;
  if (labelNames.includes('P1-high')) return 1;
  if (labelNames.includes('P2-medium')) return 2;
  return 3;
}

function isBlocker(item) {
  return item.labels.some(l => ['P0-blocker', 'v1-blocker'].includes(l.name));
}

function row(item, type) {
  const title = `[${item.title}](${item.html_url})`;
  if (type === 'pr') {
    return `| #${item.number} | ${title} | ${prStatus(item)} |`;
  }
  return `| #${item.number} | ${title} | ${labels(item)} |`;
}

function inject(content, tag, rows) {
  const block = rows.length
    ? rows.join('\n')
    : '| — | No items | — |';
  return content.replace(
    new RegExp(`<!-- ${tag}_START -->([\\s\\S]*?)<!-- ${tag}_END -->`),
    `<!-- ${tag}_START -->\n${block}\n<!-- ${tag}_END -->`
  );
}

async function main() {
  const [issues, prs] = await Promise.all([
    gh('/issues?state=open&per_page=100'),
    gh('/pulls?state=open&per_page=100'),
  ]);

  const onlyIssues = issues.filter(i => !i.pull_request);

  const blockers = onlyIssues
    .filter(isBlocker)
    .sort((a, b) => priorityOrder(a) - priorityOrder(b));

  const rest = onlyIssues
    .filter(i => !isBlocker(i))
    .sort((a, b) => priorityOrder(a) - priorityOrder(b));

  const upNext = rest.slice(0, 5);
  const backlog = rest.slice(5);

  let content = fs.readFileSync('SPRINT.md', 'utf8');
  content = content.replace(
    /> Last updated: .*/,
    `> Last updated: ${new Date().toUTCString()}`
  );

  content = inject(content, 'BLOCKERS', blockers.map(i => row(i, 'issue')));
  content = inject(content, 'PRS', prs.map(p => row(p, 'pr')));
  content = inject(content, 'UPNEXT', upNext.map(i => row(i, 'issue')));
  content = inject(content, 'BACKLOG', backlog.map(i => row(i, 'issue')));

  fs.writeFileSync('SPRINT.md', content);
  console.log('SPRINT.md updated.');
}

main().catch(e => { console.error(e); process.exit(1); });
