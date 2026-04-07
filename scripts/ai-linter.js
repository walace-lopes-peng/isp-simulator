import fs from 'fs';
import path from 'path';

/**
 * AI Governance Linter
 * Ensures PR descriptions and workflow follow the Mandatory Templates.
 */

const TEMPLATE_PATH = '.github/PULL_REQUEST_TEMPLATE.md';
const PR_FILE = 'PR_DESCRIPTION.md'; // Temporary file where AI stores the planned PR body

function validatePRBody(body) {
  const requirements = [
    /\[Feature\/Fix\]:/,
    /Closes #\d+/,
    /## Context/,
    /## What was Changed/,
    /## QA Checklist/
  ];

  const missing = requirements.filter(reg => !reg.test(body));
  
  if (missing.length > 0) {
    console.error('FATAL: AI Governance Violation. Missing required headers/fields.');
    console.error('Missing patterns:', missing.map(r => r.toString()));
    process.exit(1);
  }

  console.log('✅ PR Governance Validation Passed.');
}

// Logic: Check if PR_DESCRIPTION.md exists and validate it
if (fs.existsSync(PR_FILE)) {
  const content = fs.readFileSync(PR_FILE, 'utf8');
  validatePRBody(content);
} else {
  console.log('NOTE: No PR_DESCRIPTION.md found to lint. Skipping validation.');
}
