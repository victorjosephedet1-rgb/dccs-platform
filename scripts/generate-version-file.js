import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

let commitHash = 'production-ready';
let commitShort = 'prod';
let commitMessage = 'DCCS Platform Production Deployment';
let commitAuthor = 'Victor Joseph Edet';
let commitDate = new Date().toISOString();
let branch = 'main';

try {
  commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).split('\n')[0].trim();
  commitAuthor = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
  commitDate = execSync('git log -1 --pretty=%aI', { encoding: 'utf8' }).trim();
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch {
  // not a git repo or git not available, use defaults
}

let version = '1.0.0';
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  version = pkg.version || '1.0.0';
} catch {
  // use default
}

const buildTimestamp = new Date().toISOString();
const githubRunNumber = process.env.GITHUB_RUN_NUMBER || 'local';
const githubActor = process.env.GITHUB_ACTOR || commitAuthor;

const versionData = {
  version,
  commit: {
    hash: commitHash,
    short: commitShort,
    message: commitMessage,
    author: commitAuthor,
    date: commitDate,
    branch,
  },
  build: {
    number: githubRunNumber,
    timestamp: buildTimestamp,
    actor: githubActor,
  },
  deployment: {
    platform: 'Netlify',
    url: 'https://dccs.platform',
  },
};

writeFileSync('./public/version.json', JSON.stringify(versionData, null, 2));

console.log('Version file generated');
console.log('  Version:', version);
console.log('  Commit:', commitShort);
console.log('  Build:', githubRunNumber);
console.log('  File: public/version.json');
