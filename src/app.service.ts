import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

const octokit = new Octokit();

@Injectable()
export class AppService {
  async getCommits(): Promise<Array<any>> {
    let results = [];
    let response = await octokit.request(
      'GET /repos/{owner}/{repo}/events{?per_page,page}',
      {
        owner: 'cesarabelfigueroa',
        repo: 'git-lab-server',
        page: 1,
      },
    );

    if (response && response.status === 200) {
      let pushEvents = response?.data?.filter(
        (event) => event.type === 'PushEvent',
      );
      for (let element of pushEvents) {
        for (let commit of element.payload.commits) {
          let detail = await octokit.request(
            'GET /repos/{owner}/{repo}/commits/{commit_id}',
            {
              owner: 'cesarabelfigueroa',
              repo: 'git-lab-server',
              commit_id: commit.sha,
            },
          );

          if (detail.status && detail.status === 200) {
            results.push({
              sha: detail.data.sha,
              author: {
                username: detail.data.author.login,
                avatar: detail.data.author.avatar_url,
                url: detail.data.author.url,
              },
              commitUrl: detail.data.html_url,
              datetime: detail.data.commit.date,
              message: detail.data.commit.message,
              files: detail.data.files.map((file) => {
                return {
                  filename: file.filename,
                  status: file.status,
                  additions: file.additions,
                  deletions: file.deletions,
                  changes: file.changes,
                  htmlUrl: file.html,
                };
              }),
            });
          }
        }
      }
      return results;
    }
  }
}
