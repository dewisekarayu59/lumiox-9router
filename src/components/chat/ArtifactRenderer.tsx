'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Code, Eye, RefreshCw, Maximize2, Minimize2, ArrowRightToLine } from 'lucide-react'
import { useChatStore } from '@/lib/store'

export function ArtifactRenderer({ code, language }: { code: string; language: string }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { setActiveArtifact, activeArtifact } = useChatStore()
  
  const isHtml = language.toLowerCase() === 'html' || language.toLowerCase() === 'artifact'
  
  useEffect(() => {
    if (activeTab === 'preview' && isHtml && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        // Inject Tailwind via CDN for preview rendering
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; font-family: system-ui, sans-serif; padding: 1rem; }
              </style>
            </head>
            <body>${code}</body>
          </html>
        `)
        doc.close()
      }
    }
  }, [code, activeTab, isHtml])

  if (!isHtml) {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] my-3 relative">
        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Code className="w-3.5 h-3.5" />
            {language || 'Code'}
          </div>
        </div>
        <div className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
          <pre><code>{code}</code></pre>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border bg-surface my-3 transition-all ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative h-[400px] flex flex-col'}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-black/5 dark:bg-white/5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</span>
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'code' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> Code</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          {activeTab === 'preview' && (
            <button 
              onClick={() => setActiveTab('preview')} // Trigger re-render
              className="p-1.5 text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors" title="Reload">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={() => setActiveArtifact(code)}
            className="p-1.5 text-text-secondary hover:text-accent-600 hover:bg-accent-500/10 rounded-lg transition-colors hidden md:block" title="Open in Split Canvas">
            <ArrowRightToLine className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-[#0d1117] overflow-hidden relative">
        {activeTab === 'preview' ? (
          <iframe 
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            title="Artifact Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-popups"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-auto text-sm text-gray-800 dark:text-gray-300 font-mono">
            <pre><code>{code}</code></pre>
          </div>
        )}
      </div>
    </div>
  )
}
