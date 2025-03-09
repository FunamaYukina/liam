// migration-web/app/api/github-pr-comment/route.ts
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/core';
import { NextResponse } from 'next/server';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    pr_number: number;
    file_path: string;
    line_number: number;
    comment: string;
    [key: string]: any;
  };
}

// GitHub Appの認証を行う関数
async function getAuthenticatedOctokit() {
  const appIdStr = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  const installationIdStr = process.env.GITHUB_INSTALLATION_ID;
  console.log(appIdStr, privateKey, installationIdStr);

  if (!appIdStr || !privateKey || !installationIdStr) {
    throw new Error('Required GitHub App credentials are not set');
  }

  const appId = parseInt(appIdStr);
  const installationId = parseInt(installationIdStr);

  const auth = createAppAuth({
    appId,
    privateKey
  });

  const installationAuthentication = await auth({
    type: "installation",
    installationId
  });

  return new Octokit({
    auth: installationAuthentication.token
  });
}

// GitHub APIにコメントを投稿する関数
async function createPRComment(
  owner: string,
  repo: string,
  prNumber: number,
  filePath: string,
  lineNumber: number,
  comment: string
) {
  const octokit = await getAuthenticatedOctokit();

  // PRの最新のcommit SHAを取得
  const { data: prData } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber
  });

  // インラインコメントを作成
  const { data: commentData } = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
    owner,
    repo,
    pull_number: prNumber,
    body: comment,
    commit_id: prData.head.sha,
    path: filePath,
    position: lineNumber,
    side: 'RIGHT'
  });

  return commentData;
}

export async function POST(req: Request) {
  console.log('Received webhook request');
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type === 'INSERT') {
      const { pr_number, file_path, line_number, comment } = payload.record;

      // GitHub organization/user名とリポジトリ名を環境変数から取得
      const owner = process.env.GITHUB_OWNER;
      const repo = process.env.GITHUB_REPO;

      if (!owner || !repo) {
        throw new Error('GITHUB_OWNER or GITHUB_REPO is not set');
      }

      // GitHub PRにコメントを投稿
      await createPRComment(
        owner,
        repo,
        pr_number,
        file_path,
        line_number,
        comment
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'No action required' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
