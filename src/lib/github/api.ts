import { octokit } from './client'
import { RepoNode, TreeItem } from './types'
import { processTreeItems, findOrCreateDirectory, parseGitmodules } from './utils'

export async function fetchRepositoryStructure(owner: string, repo: string): Promise<RepoNode> {
  try {
    const repoResponse = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        accept: 'application/vnd.github.v3+json',
      }
    })
    
    if (repoResponse.data.private) {
      throw new Error('This repository is private. Please make sure the repository is public.')
    }

    const defaultBranch = repoResponse.data.default_branch
    const response = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: '1',
    })

    if (!response.data.tree) {
      throw new Error('No tree data received')
    }

    const validTreeItems = response.data.tree.filter((item: { path?: string }): item is TreeItem => !!item.path)
    if (validTreeItems.length === 0) {
      throw new Error('No valid tree items found')
    }

    const rootNode: RepoNode = {
      name: repo,
      path: '',
      type: 'dir',
      children: [],
    }

    processTreeItems(validTreeItems, rootNode)
    await processSubmodules(owner, repo, defaultBranch, rootNode)

    return rootNode
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('Repository not found or is private. Please check the URL and make sure the repository is public.')
    } else if (error.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later.')
    } else if (error.status === 401) {
      throw new Error('Authentication error. Please make sure you have access to this repository.')
    } else if (error.status === 409) {
      throw new Error('Repository is empty or the default branch is not available.')
    }
    
    throw new Error(error.message || 'Failed to fetch repository structure')
  }
}

async function processSubmodules(
  owner: string,
  repo: string,
  branch: string,
  rootNode: RepoNode
): Promise<void> {
  try {
    const { data: gitmodulesContent } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '.gitmodules',
      ref: branch,
    })

    if ('content' in gitmodulesContent) {
      const content = Buffer.from(gitmodulesContent.content, 'base64').toString()
      const submodules = parseGitmodules(content)

      for (const submodule of submodules) {
        const match = submodule.url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/)
        if (match) {
          const [, subOwner, subRepo] = match
          try {
            const submoduleNode = await fetchRepositoryStructure(subOwner, subRepo)
            submoduleNode.name = submodule.path.split('/').pop() || subRepo
            submoduleNode.path = submodule.path
            submoduleNode.type = 'submodule'

            const pathParts = submodule.path.split('/')
            const parentPath = pathParts.slice(0, -1).join('/')
            const parentNode = parentPath ? findOrCreateDirectory(rootNode, parentPath) : rootNode

            parentNode.children = parentNode.children || []
            parentNode.children.push(submoduleNode)
          } catch {
            // ignore submodule errors to prevent blocking the main repository structure
          }
        }
      }
    }
  } catch {
    // ignore .gitmodules errors as they are not critical
  }
} 