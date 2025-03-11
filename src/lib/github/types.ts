export interface TreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url: string
}

export interface RepoNode {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule'
  size?: number
  children?: RepoNode[]
}

export interface GitHubError {
  status: number
  message: string
  response?: {
    data?: any
    headers?: any
  }
} 