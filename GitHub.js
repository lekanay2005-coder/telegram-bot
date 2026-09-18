import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export function parseRepo(repoFullName) {
  const [owner, repo] = repoFullName.split('/');
  return { owner, repo };
}

// Fetch open issues (excluding pull requests) for a repo.
export async function listOpenIssues(repoFullName) {
  const { owner, repo } = parseRepo(repoFullName);
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    per_page: 30,
  });
  return data.filter((issue) => !issue.pull_request);
}

// Create a new branch off the repo's default branch.
export async function createBranch(repoFullName, branchName) {
  const { owner, repo } = parseRepo(repoFullName);

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: refData.object.sha,
  });

  return { defaultBranch, sha: refData.object.sha };
}

// Check whether a branch already exists (used to give a clean error instead
// of letting the GitHub API 422 bubble up).
export async function branchExists(repoFullName, branchName) {
  const { owner, repo } = parseRepo(repoFullName);
  try {
    await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branchName}` });
    return true;
  } catch (err) {
    if (err.status === 404) return false;
    throw err;
  }
}
