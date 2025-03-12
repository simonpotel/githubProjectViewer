'use client'

import { useState } from 'react'
import { ProjectTreeProps } from './types'
import { Card, CardBody, Button } from '@heroui/react'
import { RepoNode } from '@/lib/github/types'
import { getFileColor, getLightFileColor } from '@/lib/github/fileColors'

interface TreeNodeProps {
  node: RepoNode
  level: number
  onToggle: (path: string) => void
  expandedNodes: Set<string>
}

function TreeNode({ node, level, onToggle, expandedNodes }: TreeNodeProps) {
  const isExpanded = expandedNodes.has(node.path)
  const hasChildren = node.children && node.children.length > 0
  const indent = level * 16

  const formatBytes = (bytes?: number): string => {
    if (bytes === undefined) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div 
        className="flex items-center py-1 px-2 hover:bg-gray-800/50 rounded-lg cursor-pointer group"
        onClick={() => hasChildren && onToggle(node.path)}
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren ? (
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''} text-gray-400`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 mr-2" />
          )}

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div 
              className="p-1.5 rounded"
              style={{
                backgroundColor: node.type === 'file' 
                  ? getLightFileColor(node.name)
                  : node.type === 'dir'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(139, 92, 246, 0.15)',
                color: node.type === 'file'
                  ? getFileColor(node.name)
                  : node.type === 'dir'
                  ? 'rgb(16, 185, 129)'
                  : 'rgb(139, 92, 246)'
              }}
            >
              {node.type === 'file' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              ) : node.type === 'dir' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              )}
            </div>
            
            <span className="truncate text-sm text-gray-200">{node.name}</span>
            
            {node.type === 'file' && node.size !== undefined && (
              <span className="text-xs text-gray-500 hidden group-hover:block">
                {formatBytes(node.size)}
              </span>
            )}
            {node.type === 'dir' && node.children && (
              <span className="text-xs text-gray-500 hidden group-hover:block">
                {node.children.length} items
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={child.path || index}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectTree({ data }: ProjectTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.path]))

  const handleToggle = (path: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800">
      <CardBody className="p-4">
        <div className="space-y-1">
          <TreeNode
            node={data}
            level={0}
            onToggle={handleToggle}
            expandedNodes={expandedNodes}
          />
        </div>
      </CardBody>
    </Card>
  )
} 