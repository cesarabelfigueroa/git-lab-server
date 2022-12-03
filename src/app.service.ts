import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import { writeFile, readFileSync } from 'fs';

const octokit = new Octokit();

@Injectable()
export class AppService {
  async getCommits(): Promise<Array<any>> {
    let results = [];
    let result = await octokit
      .request('GET /repos/{owner}/{repo}/commits', {
        owner: 'cesarabelfigueroa',
        repo: 'git-lab-server',
        page: 1,
      })
      .then(async (response) => {
        if (response && response.status === 200) {
          let commits = response?.data;
          for (let commit of commits) {
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
                id: detail.data.sha,
                author: {
                  username: detail.data.author.login,
                  avatar: detail.data.author.avatar_url,
                  url: detail.data.author.url,
                },
                commitUrl: detail.data.html_url,
                datetime: detail.data.commit.committer.date,
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

          writeFile('./cache.json', JSON.stringify(results), (err) => {
            if (err) {
              console.log('Error writing file', err);
            } else {
              console.log('Successfully wrote file');
            }
          });

          return results;
        }
      })
      .catch((): any => {
        try {
          const jsonString = readFileSync('./cache.json');
          results = JSON.parse(jsonString.toString());
          return result;
        } catch (err) {
          return [{
            message: "Error reading file."
          }];
        }
      });

    return results;
  }
}
