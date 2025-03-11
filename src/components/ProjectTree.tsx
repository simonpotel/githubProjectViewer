'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Divider, Accordion, AccordionItem, Chip, Tooltip } from '@heroui/react'

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule'
  size?: number
  children?: TreeNode[]
}

interface ProjectTreeProps {
  data: TreeNode
}

export default function ProjectTree({ data }: ProjectTreeProps) {
  return (
    <Card className="bg-background/40 border-none shadow-none">
      <CardHeader className="flex justify-between items-center px-6 py-4">
        <h3 className="text-lg font-medium">Project Structure</h3>
        <div className="flex gap-2">
          <Tooltip content="Files">
            <Chip
              variant="flat"
              color="default"
              className="bg-background/60"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              }
            >
              Files
            </Chip>
          </Tooltip>
          <Tooltip content="Folders">
            <Chip
              variant="flat"
              color="primary"
              className="bg-primary/10"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              }
            >
              Folders
            </Chip>
          </Tooltip>
          <Tooltip content="Submodules">
            <Chip
              variant="flat"
              color="secondary"
              className="bg-secondary/10"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                  <path d="M10 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="13" height="14" rx="2"></rect>
                </svg>
              }
            >
              Submodules
            </Chip>
          </Tooltip>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-0 py-0 max-h-[70vh] overflow-auto">
        <div className="p-4">
          <TreeNodeComponent node={data} level={0} />
        </div>
      </CardBody>
    </Card>
  )
}

interface TreeNodeProps {
  node: TreeNode
  level: number
}

function TreeNodeComponent({ node, level }: TreeNodeProps) {
  const getIcon = () => {
    if (node.type === 'file') {
      // Determine file type by extension
      const extension = node.name.split('.').pop()?.toLowerCase() || ''
      
      if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 4v16H4V4h16z" />
            <path d="M14 10v4c0 1.1-.9 2-2 2s-2-.9-2-2" />
            <path d="M8 10v4" />
            <path d="M16 10v4" />
          </svg>
        )
      } else if (['md', 'txt'].includes(extension)) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      } else {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        )
      }
    } else if (node.type === 'submodule') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
          <path d="M10 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="13" height="14" rx="2"></rect>
        </svg>
      )
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }
  }
  
  const getFileSize = () => {
    if (node.type !== 'file' || !node.size) return null
    
    const kb = node.size / 1024
    if (kb < 1) {
      return `${node.size} B`
    } else if (kb < 1024) {
      return `${kb.toFixed(1)} KB`
    } else {
      return `${(kb / 1024).toFixed(1)} MB`
    }
  }
  
  const fileSize = getFileSize()
  
  if (node.type === 'dir' && node.children && node.children.length > 0) {
    return (
      <Accordion>
        <AccordionItem
          key={node.path}
          aria-label={`Folder: ${node.name}`}
          title={
            <div className="flex items-center">
              {getIcon()}
              <span className="ml-2 font-medium">{node.name}</span>
              <Chip size="sm" variant="flat" color="primary" className="ml-2 bg-primary/5 text-xs">
                {node.children.length}
              </Chip>
            </div>
          }
          classNames={{
            base: "border-b-0",
            title: "text-foreground/90 font-medium",
            trigger: "py-2 px-0 data-[hover=true]:bg-transparent",
            content: "pl-4 border-l border-foreground/10 ml-2",
          }}
          className="mb-1"
        >
          <div className="space-y-1 mt-1">
            {node.children.map((child) => (
              <TreeNodeComponent key={child.path} node={child} level={level + 1} />
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    )
  }
  
  return (
    <div className="flex items-center py-1.5 px-1 rounded-md hover:bg-foreground/5 transition-colors">
      {getIcon()}
      <span className="ml-2 text-foreground/90">{node.name}</span>
      {fileSize && (
        <span className="ml-auto text-xs text-foreground/50">{fileSize}</span>
      )}
    </div>
  )
} 