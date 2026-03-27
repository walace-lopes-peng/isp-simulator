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

async function closeIssue(issueNumber) {
  console.log(`Closing Issue #${issueNumber}...`);
  const response = await fetch(`${API_URL}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ISP-Simulator-Bot'
    },
    body: JSON.stringify({ state: 'closed' }),
  });
  if (!response.ok) {
    console.error(`Failed to close issue #${issueNumber}: ${response.statusText}`);
  } else {
    console.log(`Issue #${issueNumber} closed successfully.`);
  }
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

async function getPRReviewStatus(prNumber) {
  const reviews = await fetchAll(`/pulls/${prNumber}/reviews`);
  if (reviews.some(r => r.state === 'CHANGES_REQUESTED')) return 'BLOCKED';
  if (reviews.some(r => r.state === 'APPROVED')) return 'READY';
  return 'PENDING';
}

async function run() {
  try {
    console.log(`Starting Board Sync for ${REPO}...`);
    if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is missing");
    if (!REPO) throw new Error("GITHUB_REPOSITORY is missing");

    try {
      await handleAutoClosing();
    } catch (autoCloseError) {
      console.error('Non-critical error in handleAutoClosing:', autoCloseError.message);
    }

    console.log(`Fetching issues and PRs for ${REPO}...`);
    const items = await fetchAll('/issues?state=open&per_page=100');
    
    if (!Array.isArray(items)) {
      console.error('Unexpected response from GitHub API (not an array):', items);
      throw new Error('GitHub API did not return an array of issues');
    }
    
    // Smart Priority Sync: Weight calculation
    items.forEach(item => {
      const labels = item.labels ? item.labels.map(l => l.name) : [];
      item.weight = 0;
      if (labels.some(l => ['blueprint', 'north-star', 'foundation', 'store', 'logic'].includes(l))) {
        item.weight = 10;
      } else if (labels.some(l => ['ui', 'immersion', 'dev-tools'].includes(l))) {
        item.weight = 5;
      } else if (labels.some(l => ['vfx', 'audio'].includes(l))) {
        item.weight = 1;
      }
    });

    // Sort deterministically by weight descending, then number descending (idempotency)
    items.sort((a, b) => b.weight - a.weight || b.number - a.number);

    const strategicCore = [];
    const blockers = [];
    const milestoneKernel = [];
    const milestoneGarage = [];
    const inProgress = [];
    const backlog = [];
    const prsReady = [];
    const prsAwaiting = [];

    for (const item of items) {
      // Exclude the Sprint Board issue itself from the backlog
      if (item.number === parseInt(process.env.SPRINT_ISSUE_ID)) continue;

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
        if (labels.includes('blueprint') || labels.includes('north-star')) {
          strategicCore.push(item);
        } else if (labels.includes('P0-blocker') || labels.includes('v1-blocker') || labels.includes('bug')) {
          blockers.push(item);
        } else if (labels.includes('in-progress')) {
          inProgress.push(item);
        } else if (labels.includes('topology-engine') || labels.includes('store') || labels.includes('logic')) {
          milestoneKernel.push(item);
        } else if (labels.includes('immersion') || labels.includes('ui-theme') || labels.includes('ui') || labels.includes('vfx')) {
          milestoneGarage.push(item);
        } else {
          backlog.push(item);
        }
      }
    }

    let markdown = `# 🏃 SPRINT BOARD\n\n`;
    markdown += `> Last updated: ${new Date().toUTCString()} (UTC)\n\n`;

    const hasBlueprintBlocker = items.some(item => item.number === 49 && !item.pull_request);
    if (hasBlueprintBlocker) {
      markdown += `> ⚠️ **CRITICAL: Project logic is unanchored. Finish the Blueprint first.**\n\n`;
    }

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

    markdown += renderTable('🎯 Strategic Core', strategicCore);
    markdown += renderTable('🚨 Critical Path (Blockers)', blockers);
    markdown += renderTable('⚙️ In Progress', inProgress);
    markdown += renderTable('🏗️ Phase 1: The Kernel', milestoneKernel);
    markdown += renderTable('🏠 Phase 2: The Garage & Immersion', milestoneGarage);
    markdown += renderTable('✅ Ready to Merge', prsReady);
    markdown += renderTable('⏳ Awaiting Review', prsAwaiting);
    markdown += renderTable('📌 Future Expansion (Backlog)', backlog);

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
