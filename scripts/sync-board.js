const fs = require('fs');
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
  
  // 1. Blockers (P0 or v1-blocker)
  if (names.some(n => ['P0-blocker', 'v1-blocker'].includes(n))) return 0;
  
  // 2. Phase 1 issues
  if (names.includes('phase-1')) {
    if (names.includes('P1-high')) return 10;
    return 20;
  }
  
  // 3. P1-high without phase label
  if (names.includes('P1-high') && !names.some(n => n.startsWith('phase-'))) {
    return 30;
  }
  
  // 4. Phase 2 with P1-high
  if (names.includes('phase-2') && names.includes('P1-high')) {
    return 40;
  }
  
  // 5. P2-medium (default range)
  if (names.includes('P2-medium')) return 50;
  
  // 6. Phase 3/4 or other tasks go to backlog
  if (names.some(n => ['phase-3', 'phase-4'].includes(n))) return 1000;
  
  return 100; // General backlog
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

async function closeIssue(issueNumber) {
  console.log(`Closing Issue #${issueNumber}...`);
  await gh(`/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({ state: 'closed' }),
  });
  console.log(`Issue #${issueNumber} closed successfully.`);
}

async function handleAutoClosing() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return;

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  
  // Only trigger on merged pull requests
  if (event.action === 'closed' && event.pull_request && event.pull_request.merged) {
    const body = event.pull_request.body || "";
    const issueRegex = /(?:close|closes|fixes|fix|resolve|resolves)\s+#(\d+)/gi;
    let match;
    const closedIssues = new Set();

    while ((match = issueRegex.exec(body)) !== null) {
      closedIssues.add(match[1]);
    }

    if (closedIssues.size > 0) {
      console.log(`Detected PR merge with issue closing keywords. Processing: ${Array.from(closedIssues).join(', ')}`);
      for (const issueId of closedIssues) {
        await closeIssue(issueId);
      }
    }
  }
}

async function main() {
  try {
    await handleAutoClosing();
  } catch (autoCloseError) {
    console.error('Non-critical error in handleAutoClosing:', autoCloseError.message);
  }

  const [issues, prs] = await Promise.all([
    gh('/issues?state=open&per_page=100'),
    gh('/pulls?state=open&per_page=100'),
  ]);

  const onlyIssues = issues
    .filter(i => !i.pull_request && i.number !== SPRINT_ISSUE_NUMBER);

  // Grouping by priority
  const allSorted = onlyIssues.sort((a, b) => priorityOrder(a) - priorityOrder(b));

  const blockers = allSorted.filter(isBlocker);
  const others = allSorted.filter(i => !isBlocker(i));

  // Determine Up Next vs Backlog
  // Phase 3 and 4 are strictly Backlog even if P is high
  const upNextCandidate = others.filter(i => !i.labels.some(l => ['phase-3', 'phase-4'].includes(l.name)));
  const strictlyBacklog = others.filter(i => i.labels.some(l => ['phase-3', 'phase-4'].includes(l.name)));

  const upNext = upNextCandidate.slice(0, 5);
  const backlog = [...upNextCandidate.slice(5), ...strictlyBacklog];

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
