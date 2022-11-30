import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

const octokit = new Octokit();

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    let value = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: 'octocat',
      repo: 'Spoon-Knife',
    });

    console.log(value);
    return 'Hello World2!';
  }
}
