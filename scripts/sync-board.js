import fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY; // e.g., "owner/repo"
const API_URL = `https://api.github.com/repos/${REPO}`;

async function fetchAll(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.json();
}

async function getPRReviews(prNumber) {
  const reviews = await fetchAll(`/pulls/${prNumber}/reviews`);
  return reviews;
}

async function run() {
  try {
    console.log(`Fetching issues and PRs for ${REPO}...`);
    
    const issues = await fetchAll('/issues?state=open&per_page=100');
    
    const blockers = [];
    const inProgress = [];
    const backlog = [];
    const prsReady = [];
    const prsAwaiting = [];

    for (const item of issues) {
      const isPR = !!item.pull_request;
      const labels = item.labels.map(l => l.name);
      
      if (isPR) {
        const reviews = await getPRReviews(item.number);
        const isApproved = reviews.some(r => r.state === 'APPROVED');
        
        if (isApproved) {
          prsReady.push(item);
        } else {
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
    markdown += `Last updated: ${new Date().toISOString()}\n\n`;

    const renderTable = (title, items) => {
      if (items.length === 0) return '';
      let section = `## ${title}\n\n`;
      section += `| Type | #ID | Task/PR Title | Status/Problem |\n`;
      section += `| :--- | :--- | :--- | :--- |\n`;
      items.forEach(item => {
        const type = item.pull_request ? '📦 PR' : '📌 Issue';
        const labels = item.labels.map(l => l.name).join(', ');
        const status = labels || 'No blockers identified';
        section += `| ${type} | #${item.number} | [${item.title}](${item.html_url}) | ${status} |\n`;
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
    console.log('SPRINT.md generated successfully!');

  } catch (error) {
    console.error('Error syncing board:', error);
    process.exit(1);
  }
}

run();
