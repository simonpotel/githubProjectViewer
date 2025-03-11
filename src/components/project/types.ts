import { RepoNode } from '@/lib/github'

export interface ProjectExplorerProps {
  repoUrl: string
}

export interface ProjectVisualizationProps {
  data: RepoNode
}

export interface ProjectTreeProps {
  data: RepoNode
} 