import { Octokit } from 'octokit'

const octokit = new Octokit({
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

interface TreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url: string
}

interface RepoNode {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule'
  size?: number
  children?: RepoNode[]
}

export async function fetchRepositoryStructure(owner: string, repo: string): Promise<RepoNode> {
  try {
    let repoResponse
    try {
      repoResponse = await octokit.request('GET /repos/{owner}/{repo}', {
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
      
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Repository not found. Please check if the repository URL is correct.')
      } else if (error.status === 403) {
        throw new Error('Access forbidden. This might be due to rate limiting or the repository being private.')
      } else if (error.status === 401) {
        throw new Error('Authentication required. This repository might be private.')
      }
      
      throw new Error(`Failed to check repository: ${error.message}`)
    }

    const defaultBranch = repoResponse.data.default_branch
    let treeData
    try {
      const response = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: '1',
      })
      treeData = response.data

      if (!treeData.tree) {
        throw new Error('No tree data received')
      }

      const validTreeItems = treeData.tree.filter((item: { path?: string }): item is TreeItem => {
        return !!item.path
      })

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
      throw new Error('Failed to get repository structure')
    }
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
    
    throw new Error(`Failed to fetch repository structure: ${error.message || 'Unknown error'}`)
  }
}

function processTreeItems(items: TreeItem[], rootNode: RepoNode): void {
  const itemsByPath: Record<string, TreeItem[]> = {}

  items.forEach(item => {
    const pathParts = item.path.split('/')
    const fileName = pathParts.pop() || ''
    const parentPath = pathParts.join('/')

    if (!itemsByPath[parentPath]) {
      itemsByPath[parentPath] = []
    }
    itemsByPath[parentPath].push({
      ...item,
      path: fileName,
    })
  })

  function buildTree(parentPath: string, parentNode: RepoNode): void {
    const children = itemsByPath[parentPath] || []

    children.forEach(item => {
      const fullPath = parentPath ? `${parentPath}/${item.path}` : item.path
      const node: RepoNode = {
        name: item.path,
        path: fullPath,
        type: item.type === 'blob' ? 'file' : 'dir',
        size: item.size,
      }

      if (item.type === 'tree') {
        node.children = []
        buildTree(fullPath, node)
      }

      parentNode.children?.push(node)
    })
  }

  buildTree('', rootNode)
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
        const submodulePath = submodule.path
        const submoduleUrl = submodule.url

        const match = submoduleUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/)
        if (match) {
          const [, subOwner, subRepo] = match

          try {
            const submoduleNode = await fetchRepositoryStructure(subOwner, subRepo)
            
            submoduleNode.name = submodulePath.split('/').pop() || subRepo
            submoduleNode.path = submodulePath
            submoduleNode.type = 'submodule'

            const pathParts = submodulePath.split('/')
            const submoduleName = pathParts.pop() || ''
            const parentPath = pathParts.join('/')

            let parentNode = rootNode
            if (parentPath) {
              parentNode = findOrCreateDirectory(rootNode, parentPath)
            }

            parentNode.children = parentNode.children || []
            parentNode.children.push(submoduleNode)
          } catch (error) {
          }
        }
      }
    }
  } catch (error) {
  }
}

function parseGitmodules(content: string): Array<{ path: string; url: string }> {
  const submodules: Array<{ path: string; url: string }> = []
  const submoduleRegex = /\[submodule "([^"]+)"\]\s+path = ([^\n]+)\s+url = ([^\n]+)/g

  let match
  while ((match = submoduleRegex.exec(content)) !== null) {
    const name = match[1]
    const path = match[2].trim()
    const url = match[3].trim()
    submodules.push({ path, url })
  }

  return submodules
}

function findOrCreateDirectory(rootNode: RepoNode, path: string): RepoNode {
  const pathParts = path.split('/')
  let currentNode = rootNode

  for (const part of pathParts) {
    if (!part) continue

    currentNode.children = currentNode.children || []
    let found = currentNode.children.find(child => child.name === part && child.type === 'dir')

    if (!found) {
      found = {
        name: part,
        path: currentNode.path ? `${currentNode.path}/${part}` : part,
        type: 'dir',
        children: [],
      }
      currentNode.children.push(found)
    }

    currentNode = found
  }

  return currentNode
}