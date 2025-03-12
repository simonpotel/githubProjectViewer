'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card, CardBody, CardHeader, Divider, Chip, Button } from '@heroui/react'
import { ProjectVisualizationProps } from './types'
import { RepoNode } from '@/lib/github/types'
import { getFileColor, getLightFileColor, getBorderFileColor } from '@/lib/github/fileColors'

export function ProjectVisualization({ data }: ProjectVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<d3.HierarchyNode<RepoNode> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect()
      setDimensions({ width, height: Math.max(height, 600) })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!data || !svgRef.current) return

    d3.select(svgRef.current).selectAll('*').remove()
    const root = d3.hierarchy<RepoNode>(data)

    const nodeWidth = 180
    const nodeHeight = 40
    const horizontalSpacing = 220
    const verticalSpacing = 50

    const treeLayout = d3.tree<RepoNode>()
      .nodeSize([verticalSpacing, horizontalSpacing])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5))

    treeLayout(root)

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    root.each(d => {
      minX = Math.min(minX, d.x || 0)
      maxX = Math.max(maxX, d.x || 0)
      minY = Math.min(minY, d.y || 0)
      maxY = Math.max(maxY, d.y || 0)
    })

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', [0, 0, dimensions.width, dimensions.height])
      .attr('style', 'max-width: 100%; height: auto; font: 12px sans-serif; background-color: rgb(17, 24, 39);')

    const g = svg.append('g')
      .attr('transform', `translate(${50}, ${dimensions.height / 2 - (maxX - minX) / 2})`)

    const generateLinkPath = (d: d3.HierarchyLink<RepoNode>) => {
      const sourceX = d.source.x || 0
      const sourceY = d.source.y || 0
      const targetX = d.target.x || 0
      const targetY = d.target.y || 0
      
      const midY = (sourceY + targetY) / 2
      return `M${sourceY},${sourceX} C${midY},${sourceX} ${midY},${targetX} ${targetY},${targetX}`
    }

    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', 'rgb(55, 65, 81)')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', generateLinkPath)
      .attr('stroke-dasharray', '4,4')

    const nodeGroups = g.append('g')
      .selectAll('g.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y || 0},${d.x || 0})`)
      .attr('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: d3.HierarchyNode<RepoNode>) => {
        event.stopPropagation()
        setSelectedNode(d)
      })

    nodeGroups.append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (d.data.type === 'dir') {
          return 'rgba(16, 185, 129, 0.15)' // Directory color
        } else if (d.data.type === 'submodule') {
          return 'rgba(139, 92, 246, 0.15)' // Submodule color
        } else {
          return getLightFileColor(d.data.name) // File color based on extension
        }
      })
      .attr('stroke', d => {
        if (d.data.type === 'dir') {
          return 'rgb(16, 185, 129)' // Directory border
        } else if (d.data.type === 'submodule') {
          return 'rgb(139, 92, 246)' // Submodule border
        } else {
          return getFileColor(d.data.name) // File border based on extension
        }
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3)

    nodeGroups.append('text')
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgb(229, 231, 235)')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => {
        const name = d.data.name
        return name.length > 20 ? name.substring(0, 17) + '...' : name
      })
      .append('title')
      .text(d => d.data.path)

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const bounds = { 
      x: minY - nodeWidth,
      y: minX - nodeHeight,
      width: maxY - minY + nodeWidth * 2,
      height: maxX - minX + nodeHeight * 2
    }

    const fullWidth = dimensions.width - 100
    const fullHeight = dimensions.height - 100
    const scale = Math.min(
      fullWidth / bounds.width,
      fullHeight / bounds.height,
      1
    )

    const transform = d3.zoomIdentity
      .translate(
        fullWidth / 2 - (bounds.x + bounds.width / 2) * scale,
        fullHeight / 2 - (bounds.y + bounds.height / 2) * scale
      )
      .scale(scale)

    svg.transition()
      .duration(750)
      .call(zoom.transform, transform)

  }, [data, dimensions])

  const formatBytes = (bytes?: number): string => {
    if (bytes === undefined) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div ref={containerRef} className="w-full h-[75vh] relative">
      <svg ref={svgRef} className="w-full h-full" />
      
      {selectedNode && (
        <Card className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-lg border border-gray-700 text-white max-w-xs shadow-2xl">
          <CardHeader className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: selectedNode.data.type === 'file' 
                  ? getLightFileColor(selectedNode.data.name)
                  : selectedNode.data.type === 'dir'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(139, 92, 246, 0.15)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedNode.data.type === 'file'
                  ? getBorderFileColor(selectedNode.data.name)
                  : selectedNode.data.type === 'dir'
                  ? 'rgb(16, 185, 129)'
                  : 'rgb(139, 92, 246)'
              }}>
                {selectedNode.data.type === 'file' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
                    color: selectedNode.data.type === 'file' ? getFileColor(selectedNode.data.name) : 'currentColor'
                  }}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                ) : selectedNode.data.type === 'dir' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgb(16, 185, 129)' }}>
                    <path d="M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgb(139, 92, 246)' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                )}
              </div>
              <h3 className="font-medium truncate flex-1">{selectedNode.data.name}</h3>
            </div>
            <Button 
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </Button>
          </CardHeader>
          <Divider className="opacity-20" />
          <CardBody className="text-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-400">Type: </span>
              <Chip 
                size="sm" 
                variant="flat" 
                className={`
                  ${selectedNode.data.type === 'dir' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    selectedNode.data.type === 'file' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'}
                  border
                `}
              >
                {selectedNode.data.type}
              </Chip>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-gray-400">Path: </span>
              <div className="px-3 py-2 rounded-lg bg-gray-950/50 border border-gray-800 break-all text-gray-300 font-mono text-xs">
                {selectedNode.data.path}
              </div>
            </div>
            {selectedNode.data.type === 'file' && selectedNode.data.size !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">Size: </span>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-gray-700/50 border border-gray-600"
                >
                  {formatBytes(selectedNode.data.size)}
                </Chip>
              </div>
            )}
            {selectedNode.data.type === 'dir' && selectedNode.data.children && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">Contains: </span>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-gray-700/50 border border-gray-600"
                >
                  {selectedNode.data.children.length} items
                </Chip>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
} 