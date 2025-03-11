'use client'

import { useState } from 'react'
import { ProjectExplorer } from '@/components/project'
import RepositoryForm from '@/components/RepositoryForm'
import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'

export default function Home() {
  const [repoUrl, setRepoUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExploring, setIsExploring] = useState<boolean>(false)

  const handleExplore = async (url: string) => {
    setIsLoading(true)
    setRepoUrl(url)
    setIsExploring(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 relative overflow-hidden">
      {/* Animated side glows */}
      <div className="absolute -left-64 top-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -right-64 top-2/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      
      <div className="container relative mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-md border border-zinc-800/50 shadow-xl">
              <div className="p-3.5 rounded-xl bg-blue-500/10 backdrop-blur-md shadow-sm border border-blue-500/20">
                <svg 
                  className="w-8 h-8 text-blue-500"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-500/10 backdrop-blur-md shadow-sm border border-indigo-500/20">
                <svg 
                  className="w-8 h-8 text-indigo-500"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8.7V18H9.4" />
                  <path d="M3 8.7h5.2" />
                  <path d="M3 13.7h5.2" />
                  <path d="M13.5 13.7h5.2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl opacity-20" />
            <h1 className="relative text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
              GitHub Project Viewer
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Visualize the structure of any GitHub repository with an interactive graphical representation and a detailed tree view.
          </p>
        </header>
        
        {!isExploring ? (
          <div className="max-w-3xl mx-auto space-y-16">
            <RepositoryForm onExplore={handleExplore} isLoading={isLoading} />
            
            <Card className="w-full backdrop-blur-lg backdrop-saturate-150 bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="p-8 bg-zinc-900/50">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Features</h2>
              </CardHeader>
              
              <Divider className="opacity-20" />
              
              <CardBody className="p-8 bg-zinc-900/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 shadow-lg hover:shadow-xl hover:border-zinc-700 transition-all duration-200">
                    <div className="p-3 rounded-xl bg-blue-500/10 backdrop-blur-md w-fit mb-4 group-hover:bg-blue-500/20 transition-colors duration-200 border border-blue-500/20">
                      <svg 
                        className="w-6 h-6 text-blue-500"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors duration-200">Complete Structure</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Explore all files, folders, and submodules in the repository.
                    </p>
                  </div>

                  <div className="group p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 shadow-lg hover:shadow-xl hover:border-zinc-700 transition-all duration-200">
                    <div className="p-3 rounded-xl bg-indigo-500/10 backdrop-blur-md w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors duration-200 border border-indigo-500/20">
                      <svg 
                        className="w-6 h-6 text-indigo-500"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-indigo-400 transition-colors duration-200">Interactive Visualization</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Navigate visually with zoom, pan, and selection capabilities.
                    </p>
                  </div>

                  <div className="group p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 shadow-lg hover:shadow-xl hover:border-zinc-700 transition-all duration-200">
                    <div className="p-3 rounded-xl bg-purple-500/10 backdrop-blur-md w-fit mb-4 group-hover:bg-purple-500/20 transition-colors duration-200 border border-purple-500/20">
                      <svg 
                        className="w-6 h-6 text-purple-500"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors duration-200">Complete Details</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Access detailed information about each project element.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <Button 
              onPress={() => {
                setIsExploring(false)
                setRepoUrl('')
                setIsLoading(false)
              }}
              className="mb-6 h-11 px-6 font-medium shadow-md hover:shadow-lg transition-all duration-150 rounded-xl
                bg-zinc-900/50 hover:bg-zinc-800/50 active:bg-zinc-700/50 backdrop-blur-sm
                border border-zinc-800 hover:border-zinc-700 group"
              variant="flat"
              color="default"
              startContent={
                <svg 
                  className="w-5 h-5 mr-2 text-zinc-400 group-hover:text-white transition-colors duration-150"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              }
            >
              Back to Home
            </Button>
            <ProjectExplorer repoUrl={repoUrl} />
          </div>
        )}
      </div>
      
      <footer className="py-6 border-t border-zinc-800 mt-12 relative z-10 bg-zinc-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center text-sm text-zinc-500">
          <p>GitHub Project Viewer — Visualize GitHub repository structures interactively</p>
        </div>
      </footer>
    </div>
  )
} 