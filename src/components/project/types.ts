import { RepoNode } from '@/lib/github/types'

export interface ProjectExplorerProps {
  repoUrl: string
}

export interface ProjectVisualizationProps {
  data: RepoNode
}

export interface ProjectTreeProps {
  data: RepoNode
} 