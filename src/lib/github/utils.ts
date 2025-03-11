import { TreeItem, RepoNode } from './types'

export function processTreeItems(items: TreeItem[], rootNode: RepoNode): void {
  const itemsByPath = items.reduce<Record<string, TreeItem[]>>((acc, item) => {
    const pathParts = item.path.split('/')
    const fileName = pathParts.pop() || ''
    const parentPath = pathParts.join('/')
    
    if (!acc[parentPath]) {
      acc[parentPath] = []
    }
    acc[parentPath].push({ ...item, path: fileName })
    return acc
  }, {})

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

export function findOrCreateDirectory(rootNode: RepoNode, path: string): RepoNode {
  return path.split('/').reduce((node, part) => {
    if (!part) return node

    node.children = node.children || []
    let found = node.children.find(child => child.name === part && child.type === 'dir')

    if (!found) {
      found = {
        name: part,
        path: node.path ? `${node.path}/${part}` : part,
        type: 'dir',
        children: [],
      }
      node.children.push(found)
    }

    return found
  }, rootNode)
}

export function parseGitmodules(content: string): Array<{ path: string; url: string }> {
  const submodules: Array<{ path: string; url: string }> = []
  const submoduleRegex = /\[submodule "([^"]+)"\]\s+path = ([^\n]+)\s+url = ([^\n]+)/g
  let match

  while ((match = submoduleRegex.exec(content)) !== null) {
    const [, , path, url] = match
    submodules.push({ path: path.trim(), url: url.trim() })
  }

  return submodules
} 