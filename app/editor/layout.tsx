'use client'

import { Suspense } from 'react'
import { ProjectProvider } from '@/app/editor/_components/project-provider'
import { EditorLayoutInner } from '@/app/editor/_components/editor-layout-inner'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProjectProvider>
        <EditorLayoutInner>
          {children}
        </EditorLayoutInner>
      </ProjectProvider>
    </Suspense>
  )
}
