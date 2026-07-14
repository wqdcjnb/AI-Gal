'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    router.replace(`/editor/outline${id ? `?id=${id}` : ''}`)
  }, [router, id])

  return <div className="min-h-screen bg-background" />
}
