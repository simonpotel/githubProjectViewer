import { Octokit } from 'octokit'

export const octokit = new Octokit({
  baseUrl: 'https://api.github.com',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
    accept: 'application/vnd.github.v3+json',
  },
  request: {
    timeout: 5000,
  },
  retry: {
    enabled: true,
    retries: 3
  },
  throttle: {
    onRateLimit: (retryAfter: number, options: any) => {
      if (options.request.retryCount <= 2) {
        return true
      }
    },
    onSecondaryRateLimit: (retryAfter: number, options: any) => {
      if (options.request.retryCount <= 2) {
        return true
      }
    },
  }
}) 