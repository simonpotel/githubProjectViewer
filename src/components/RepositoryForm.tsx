'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Divider } from '@heroui/react'

interface RepositoryFormProps {
  onExplore: (url: string) => void
  isLoading: boolean
}

export default function RepositoryForm({ onExplore, isLoading }: RepositoryFormProps) {
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      return 'Please enter a GitHub repository URL'
    }
    
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+/
    if (!githubUrlPattern.test(url)) {
      return 'Please enter a valid GitHub URL (e.g., https://github.com/username/repo)'
    }
    
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateUrl(url)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    onExplore(url)
  }

  const handleExampleClick = () => {
    setUrl('https://github.com/vercel/next.js')
    setError('')
  }

  return (
    <Card className="w-full backdrop-blur-lg backdrop-saturate-150 bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="p-8 bg-zinc-900/50">
        <div className="flex items-start gap-5">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 backdrop-blur-md shadow-sm border border-blue-500/20">
            <svg 
              className="w-7 h-7 text-blue-500"
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
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2 text-white">Explore GitHub Repository</h2>
            <p className="text-sm text-zinc-400">
              Enter a GitHub repository URL to visualize its structure
            </p>
          </div>
        </div>
      </CardHeader>

      <Divider className="opacity-20" />
      
      <CardBody className="p-8 bg-zinc-900/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="repo-url" className="text-sm font-medium text-zinc-300 px-1">
              Repository URL
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="p-2 rounded-xl bg-zinc-800/80">
                  <svg 
                    className="w-5 h-5 text-zinc-300"
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
              </div>
              <Input
                id="repo-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                variant="bordered"
                radius="lg"
                color={error ? "danger" : "default"}
                errorMessage={error}
                className="w-full"
                classNames={{
                  input: "bg-zinc-800/50 h-12 text-white placeholder:text-zinc-500 px-14",
                  inputWrapper: "h-12 bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-150 shadow-sm hover:shadow backdrop-blur-sm rounded-xl border-zinc-700 hover:border-zinc-600",
                  errorMessage: "px-1 mt-2 font-medium text-red-500"
                }}
                aria-label="Repository URL"
                aria-describedby="url-error"
              />
              {error && <span id="url-error" className="sr-only">{error}</span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              isDisabled={isLoading}
              className="flex-1 h-12 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-150 rounded-xl
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                active:scale-[0.98] active:from-blue-700 active:to-blue-800 text-white"
              aria-label={isLoading ? "Loading..." : "Explore Repository"}
            >
              {isLoading ? 'Loading...' : 'Explore Repository'}
            </Button>
            
            <Button
              type="button"
              variant="flat"
              color="default"
              onClick={handleExampleClick}
              className="h-12 px-8 font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 rounded-xl
                bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600
                active:scale-[0.98] text-zinc-300 hover:text-white border border-zinc-700"
              aria-label="Use example repository: Next.js"
            >
              Example
            </Button>
          </div>
        </form>
      </CardBody>

      <Divider className="opacity-20" />
      
      <CardFooter className="px-8 py-4 bg-zinc-900/50">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <svg 
            className="w-4 h-4 text-blue-500/70 flex-shrink-0"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Works only with public GitHub repositories</span>
        </div>
      </CardFooter>
    </Card>
  )
} 