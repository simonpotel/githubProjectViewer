'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card, CardBody, CardHeader, Divider, Chip, Button, Tooltip } from '@heroui/react'

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule'
  size?: number
  children?: TreeNode[]
}

interface ProjectVisualizationProps {
  data: TreeNode
}

const MAX_DEPTH = 3
const MAX_CHILDREN = 20
const LOAD_MORE_INCREMENT = 15

interface FileExtensionColor {
  color: string
  name: string
}

const FILE_EXTENSION_COLORS: Record<string, FileExtensionColor> = {
  'py': { color: '#F7DF1E', name: 'Python' },
  'js': { color: '#F7DF1E', name: 'JavaScript' },
  'ts': { color: '#3178C6', name: 'TypeScript' },
  'jsx': { color: '#61DAFB', name: 'React JSX' },
  'tsx': { color: '#61DAFB', name: 'React TSX' },
  'html': { color: '#E34F26', name: 'HTML' },
  'css': { color: '#1572B6', name: 'CSS' },
  'scss': { color: '#CC6699', name: 'SCSS' },
  'java': { color: '#ED8B00', name: 'Java' },
  'cpp': { color: '#00599C', name: 'C++' },
  'c': { color: '#A8B9CC', name: 'C' },
  'go': { color: '#00ADD8', name: 'Go' },
  'rs': { color: '#DEA584', name: 'Rust' },
  'php': { color: '#777BB4', name: 'PHP' },
  'rb': { color: '#CC342D', name: 'Ruby' },
  'swift': { color: '#FA7343', name: 'Swift' },
  'kt': { color: '#7F52FF', name: 'Kotlin' },
  'json': { color: '#5C5C5C', name: 'JSON' },
  'yaml': { color: '#CB171E', name: 'YAML' },
  'yml': { color: '#CB171E', name: 'YAML' },
  'xml': { color: '#5C5C5C', name: 'XML' },
  'toml': { color: '#5C5C5C', name: 'TOML' },
  'ini': { color: '#5C5C5C', name: 'INI' },
  'env': { color: '#5C5C5C', name: 'ENV' },
  'md': { color: '#757575', name: 'Markdown' },
  'txt': { color: '#757575', name: 'Text' },
  'pdf': { color: '#FF0000', name: 'PDF' },
  'doc': { color: '#2B579A', name: 'Word' },
  'docx': { color: '#2B579A', name: 'Word' },
  'sh': { color: '#89E051', name: 'Shell' },
  'bash': { color: '#89E051', name: 'Bash' },
  'zsh': { color: '#89E051', name: 'ZSH' },
  'bat': { color: '#89E051', name: 'Batch' },
  'ps1': { color: '#012456', name: 'PowerShell' },
  'png': { color: '#FFB13B', name: 'PNG' },
  'jpg': { color: '#FFB13B', name: 'JPEG' },
  'jpeg': { color: '#FFB13B', name: 'JPEG' },
  'gif': { color: '#FFB13B', name: 'GIF' },
  'svg': { color: '#FFB13B', name: 'SVG' },
  'ico': { color: '#FFB13B', name: 'Icon' },
  'zip': { color: '#6B6B6B', name: 'ZIP' },
  'tar': { color: '#6B6B6B', name: 'TAR' },
  'gz': { color: '#6B6B6B', name: 'GZIP' },
  'rar': { color: '#6B6B6B', name: 'RAR' },
  '7z': { color: '#6B6B6B', name: '7-Zip' },
}

const NODE_COLORS = {
  dir: {
    from: 'rgba(16, 185, 129, 0.15)',
    to: 'rgba(16, 185, 129, 0.05)',
    border: '#10B981',
    text: '#10B981'
  },
  submodule: {
    from: 'rgba(167, 139, 250, 0.15)',
    to: 'rgba(167, 139, 250, 0.05)',
    border: '#A78BFA',
    text: '#A78BFA'
  }
}

export default function ProjectVisualization({ data }: ProjectVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<d3.HierarchyNode<TreeNode> | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const getFileColor = (filename: string): FileExtensionColor => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    return FILE_EXTENSION_COLORS[extension] || { color: '#6B7280', name: 'File' }
  }

  const processTreeData = (node: TreeNode): TreeNode => {
    if (!node.children) return node

    return {
      ...node,
      children: node.children.map(child => processTreeData(child))
    }
  }

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height: Math.max(height, 600) })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [containerRef])

  useEffect(() => {
    if (!data || !svgRef.current) return

    const processedData = processTreeData(data)
    d3.select(svgRef.current).selectAll('*').remove()
    const root = d3.hierarchy(processedData)

    const nodeWidth = 180
    const nodeHeight = 40
    const horizontalSpacing = 220
    const verticalSpacing = 50

    const treeLayout = d3.tree<TreeNode>()
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

    const defs = svg.append('defs')

    const dropShadow = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%')

    dropShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur')

    dropShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 0)
      .attr('dy', 1)
      .attr('result', 'offsetBlur')

    const feMerge = dropShadow.append('feMerge')
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('height', '130%')

    glowFilter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', 2)
      .attr('result', 'glow')

    const glowMerge = glowFilter.append('feMerge')
    glowMerge.append('feMergeNode')
      .attr('in', 'glow')
    glowMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

    Object.entries(FILE_EXTENSION_COLORS).forEach(([ext, { color }]) => {
      const gradientId = `file-${ext}-gradient`
      defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: `${color}15` },
          { offset: '100%', color: `${color}05` }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
    })

    const g = svg.append('g')
      .attr('transform', `translate(${50}, ${dimensions.height / 2 - (maxX - minX) / 2})`)

    const getNodeColor = (type: string) => {
      switch (type) {
        case 'dir': return '#10B981'
        case 'file': return '#3B82F6'
        case 'submodule': return '#A78BFA'
        default: return '#6B7280'
      }
    }

    const links = g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 1)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkHorizontal<d3.HierarchyLink<TreeNode>, d3.DefaultLinkObject>()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .attr('stroke-dasharray', '4,4')

    const nodeGroups = g.append('g')
      .selectAll('g.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y || 0},${d.x || 0})`)
      .attr('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('filter', 'url(#glow)')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('filter', 'url(#drop-shadow)')
      })
      .on('click', (event, d) => {
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
        if (d.data.type === 'file') {
          const extension = d.data.name.split('.').pop()?.toLowerCase() || ''
          return `url(#file-${extension}-gradient)` || 'rgba(75, 85, 99, 0.3)'
        }
        return `url(#${d.data.type}-gradient)`
      })
      .attr('stroke', d => {
        if (d.data.type === 'file') {
          return getFileColor(d.data.name).color
        }
        return NODE_COLORS[d.data.type as keyof typeof NODE_COLORS].border
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('filter', 'url(#drop-shadow)')

    nodeGroups.append('rect')
      .attr('x', -nodeWidth / 2 + 10)
      .attr('y', -12)
      .attr('width', nodeWidth - 20)
      .attr('height', 24)
      .attr('rx', 4)
      .attr('fill', 'rgba(17, 24, 39, 0.7)')
      .attr('opacity', 0)

    nodeGroups.append('text')
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5E7EB')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => {
        const name = d.data.name
        return name.length > 20 ? name.substring(0, 17) + '...' : name
      })
      .append('title')
      .text(d => d.data.path)

    nodeGroups.append('circle')
      .attr('cx', -nodeWidth / 2 + 12)
      .attr('cy', 0)
      .attr('r', 3)
      .attr('fill', d => {
        if (d.data.type === 'file') {
          return getFileColor(d.data.name).color
        }
        return NODE_COLORS[d.data.type as keyof typeof NODE_COLORS].text
      })

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
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
    <Card className="bg-gray-900/95 border border-gray-800 shadow-xl backdrop-blur-xl rounded-xl overflow-hidden">
      <CardHeader className="flex justify-between items-center p-4 bg-gray-900/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-100">Project Structure</h2>
          <div className="flex gap-2">
            <Tooltip content="Directories">
              <Chip color="success" variant="flat" size="sm" className="bg-emerald-500/10">
                <span className="text-emerald-400">Directories</span>
              </Chip>
            </Tooltip>
            <Tooltip content="Files">
              <div className="flex gap-1">
                {Object.entries(FILE_EXTENSION_COLORS)
                  .filter(([ext]) => ['py', 'js', 'ts', 'md', 'json'].includes(ext))
                  .map(([ext, { color, name }]) => (
                    <Tooltip key={ext} content={name}>
                      <Chip 
                        variant="flat" 
                        size="sm" 
                        className="bg-opacity-10 border border-opacity-20"
                        style={{ 
                          backgroundColor: `${color}10`,
                          borderColor: color,
                          color: color
                        }}
                      >
                        .{ext}
                      </Chip>
                    </Tooltip>
                  ))}
                <Tooltip content="And more...">
                  <Chip 
                    variant="flat" 
                    size="sm" 
                    className="bg-gray-500/10 border border-gray-500/20 text-gray-400"
                  >
                    ...
                  </Chip>
                </Tooltip>
              </div>
            </Tooltip>
            <Tooltip content="Submodules">
              <Chip color="secondary" variant="flat" size="sm" className="bg-purple-500/10">
                <span className="text-purple-400">Submodules</span>
              </Chip>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1.5">
            <Tooltip content="Current zoom level">
              <Chip 
                variant="flat" 
                size="sm" 
                className="bg-gray-800/80 border border-gray-700"
              >
                {Math.round(zoomLevel * 100)}%
              </Chip>
            </Tooltip>
            <Tooltip content="Reset view position and zoom">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={() => {
                  if (svgRef.current) {
                    d3.select(svgRef.current)
                      .transition()
                      .duration(750)
                      .call(
                        d3.zoom<SVGSVGElement, unknown>().transform,
                        d3.zoomIdentity.translate(50, dimensions.height / 2).scale(1)
                      )
                  }
                }}
                className="bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700 h-7 w-7 min-w-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
                  <path d="M3 12h18"/>
                  <path d="M12 3v18"/>
                </svg>
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <Divider className="opacity-20" />
      <CardBody className="relative p-0 h-[75vh]">
        <div ref={containerRef} className="w-full h-full">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
        
        {selectedNode && (
          <Card className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-lg border border-gray-700 text-white max-w-xs shadow-2xl">
            <CardHeader className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gray-700/50">
                  {selectedNode.data.type === 'file' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  ) : selectedNode.data.type === 'dir' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </CardBody>
      <Divider className="opacity-20" />
      <CardBody className="py-3 bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>
            Tip: Click nodes to expand/collapse, scroll to zoom, drag to pan
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"/>
              Directories
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"/>
              Files
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"/>
              Submodules
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
} 