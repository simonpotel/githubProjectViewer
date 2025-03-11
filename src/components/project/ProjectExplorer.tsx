'use client'

import { useState, useEffect } from 'react'
import { fetchRepositoryStructure } from '@/lib/github'
import { ProjectExplorerProps } from './types'
import { ProjectVisualization } from './ProjectVisualization'
import { ProjectTree } from './ProjectTree'
import { Tabs, Tab, Spinner, Card, CardBody, Chip } from '@heroui/react'

export function ProjectExplorer({ repoUrl }: ProjectExplorerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'visualization'>('visualization')
  const [repoInfo, setRepoInfo] = useState({ owner: '', repo: '' })

  useEffect(() => {
    const loadRepositoryData = async () => {
      if (!repoUrl) return

      try {
        setIsLoading(true)
        setError(null)
        
        const urlParts = repoUrl.replace('https://github.com/', '').split('/')
        if (urlParts.length < 2) {
          throw new Error('Invalid GitHub URL format')
        }
        
        const [owner, repo] = urlParts
        setRepoInfo({ owner, repo })
        
        const data = await fetchRepositoryStructure(owner, repo)
        setProjectData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load repository data')
        setProjectData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadRepositoryData()
  }, [repoUrl])

  if (isLoading) {
    return (
      <Card className="bg-background/60 backdrop-blur-sm border border-foreground/10 shadow-xl">
        <CardBody className="flex flex-col justify-center items-center h-64 gap-4">
          <Spinner size="lg" color="primary" />
          <div className="text-center">
            <p className="text-foreground/80 font-medium">Loading repository structure</p>
            <p className="text-sm text-foreground/60 mt-1">Retrieving files, folders, and submodules...</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-danger-100 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
        <CardBody className="text-danger-700 dark:text-danger-400">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Error loading repository</h3>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!projectData) {
    return (
      <Card className="bg-warning-100 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
        <CardBody className="text-warning-700 dark:text-warning-400">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">No Data Available</h3>
              <p className="mt-2">No repository data could be loaded. Please try again.</p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {repoInfo.owner}
              <span className="text-foreground/50">/</span>
              {repoInfo.repo}
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-2 text-primary hover:text-primary-400"
                aria-label="Open repository in GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </h2>
            <p className="text-sm text-foreground/70">GitHub Repository Structure</p>
          </div>
        </div>
        <Chip color="primary" variant="flat" className="hidden sm:flex">
          {projectData?.children?.length || 0} items
        </Chip>
      </div>
      
      <Tabs 
        aria-label="Project visualization options" 
        color="primary" 
        variant="underlined"
        selectedKey={viewMode}
        onSelectionChange={(key) => setViewMode(key as 'tree' | 'visualization')}
        classNames={{
          base: "bg-background/60 backdrop-blur-sm border border-foreground/10 shadow-xl rounded-xl overflow-hidden",
          tabList: "bg-background/80 border-b border-foreground/10 px-4",
          tab: "text-foreground/70 data-[selected=true]:text-primary font-medium",
          panel: "p-0"
        }}
      >
        <Tab 
          key="visualization" 
          title={
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Visualization
            </div>
          }
        >
          <ProjectVisualization data={projectData} />
        </Tab>
        <Tab 
          key="tree" 
          title={
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Tree View
            </div>
          }
        >
          <ProjectTree data={projectData} />
        </Tab>
      </Tabs>
    </div>
  )
} 