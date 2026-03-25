import fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
const API_URL = `https://api.github.com/repos/${REPO}`;

async function fetchAll(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'ISP-Simulator-Bot'
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.json();
}

async function getPRReviewStatus(prNumber) {
  const reviews = await fetchAll(`/pulls/${prNumber}/reviews`);
  if (reviews.some(r => r.state === 'CHANGES_REQUESTED')) return 'BLOCKED';
  if (reviews.some(r => r.state === 'APPROVED')) return 'READY';
  return 'PENDING';
}

async function run() {
  try {
    console.log(`Fetching issues and PRs for ${REPO}...`);
    
    // Fetch all open items (GitHub includes both issues and PRs in this API)
    const items = await fetchAll('/issues?state=open&per_page=100');
    
    // Sort deterministically by number descending (idempotency)
    items.sort((a, b) => b.number - a.number);

    const blockers = [];
    const inProgress = [];
    const backlog = [];
    const prsReady = [];
    const prsAwaiting = [];

    for (const item of items) {
      const isPR = !!item.pull_request;
      const labels = item.labels ? item.labels.map(l => l.name) : [];
      
      if (isPR) {
        const status = await getPRReviewStatus(item.number);
        if (status === 'READY') {
          prsReady.push(item);
        } else {
          // Both PENDING and BLOCKED go here for now, marked in the table
          item.reviewStatus = status;
          prsAwaiting.push(item);
        }
      } else {
        if (labels.includes('P0-blocker')) {
          blockers.push(item);
        } else if (labels.includes('in-progress')) {
          inProgress.push(item);
        } else {
          backlog.push(item);
        }
      }
    }

    let markdown = `# 🏃 SPRINT BOARD\n\n`;
    markdown += `> Last updated: ${new Date().toUTCString()} (UTC)\n\n`;

    const renderTable = (title, itemsList) => {
      if (itemsList.length === 0) return '';
      let section = `## ${title}\n\n`;
      section += `| Type | #ID | Task/PR Title | Status/Problem |\n`;
      section += `| :--- | :--- | :--- | :--- |\n`;
      itemsList.forEach(item => {
        const typeIcon = item.pull_request ? '📦' : '📌';
        const typeText = item.pull_request ? 'PR' : 'Issue';
        
        let status = 'No blockers identified';
        if (item.pull_request) {
          if (item.reviewStatus === 'BLOCKED') status = '❌ Changes Requested';
          else if (item.reviewStatus === 'READY') status = '✅ Approved';
          else status = '⏳ Awaiting Review';
        } else {
          const labels = item.labels.map(l => `\`${l.name}\``).join(', ');
          status = labels || '📌 Backlog';
        }

        section += `| ${typeIcon} ${typeText} | #${item.number} | [${item.title.replace(/\|/g, '\\|')}](${item.html_url}) | ${status} |\n`;
      });
      section += '\n';
      return section;
    };

    markdown += renderTable('🚨 Open Blockers', blockers);
    markdown += renderTable('⚙️ In Progress', inProgress);
    markdown += renderTable('✅ Ready to Merge', prsReady);
    markdown += renderTable('⏳ Awaiting Review', prsAwaiting);
    markdown += renderTable('📌 Backlog', backlog);

    fs.writeFileSync('SPRINT.md', markdown);
    console.log('SPRINT.md generated successfully and deterministically!');

    if (process.env.SPRINT_ISSUE_ID) {
      console.log(`Updating Sprint Board Issue #${process.env.SPRINT_ISSUE_ID}...`);
      const updateResponse = await fetch(`${API_URL}/issues/${process.env.SPRINT_ISSUE_ID}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ISP-Simulator-Bot'
        },
        body: JSON.stringify({ body: markdown }),
      });
      if (!updateResponse.ok) {
        console.error(`Failed to update issue: ${updateResponse.status} ${updateResponse.statusText}`);
        const errorBody = await updateResponse.text();
        console.error(`Error details: ${errorBody}`);
      } else {
        console.log('Sprint Board Issue updated successfully!');
      }
    }

  } catch (error) {
    console.error('Error syncing board:', error);
    process.exit(1);
  }
}

run();
