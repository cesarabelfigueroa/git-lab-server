import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

const octokit = new Octokit();

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    let response = await octokit.request(
      'GET /repos/{owner}/{repo}/events{?per_page,page}',
      {
        owner: 'cesarabelfigueroa',
        repo: 'git-lab-server',
        page: 1,
      },
    );

    if (response && response.status === 200) {
      let pushEvents  = response?.data?.filter((event) => event.type === 'PushEvent')
      return JSON.stringify(pushEvents || []);
    }

    return JSON.stringify(response);
  }
}
