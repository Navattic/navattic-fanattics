'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Comment, User, Challenge } from '@/payload-types'

export interface OptimisticComment extends Omit<Comment, 'id' | 'createdAt' | 'updatedAt'> {
  id: string // Use string for optimistic IDs
  createdAt: string
  updatedAt: string
  isOptimistic: true
}

interface OptimisticCommentsContextType {
  optimisticComments: OptimisticComment[]
  addOptimisticComment: (
    comment: Omit<OptimisticComment, 'id' | 'isOptimistic' | 'createdAt' | 'updatedAt'>,
  ) => string
  removeOptimisticComment: (optimisticId: string) => void
  replaceOptimisticComment: (optimisticId: string, realComment: Comment) => void
}

const OptimisticCommentsContext = createContext<OptimisticCommentsContextType | null>(null)

export function OptimisticCommentsProvider({ children }: { children: ReactNode }) {
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([])

  const addOptimisticComment = (
    commentData: Omit<OptimisticComment, 'id' | 'isOptimistic' | 'createdAt' | 'updatedAt'>,
  ) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const optimisticComment: OptimisticComment = {
      ...commentData,
      id: optimisticId,
      createdAt: now,
      updatedAt: now,
      isOptimistic: true,
    }

    console.log('Adding optimistic comment to state:', optimisticComment)

    setOptimisticComments((prev) => {
      const newState = [...prev, optimisticComment]
      console.log('New optimistic comments state:', newState)
      return newState
    })

    return optimisticId
  }

  const removeOptimisticComment = (optimisticId: string) => {
    setOptimisticComments((prev) => prev.filter((comment) => comment.id !== optimisticId))
  }

  const replaceOptimisticComment = (optimisticId: string, realComment: Comment) => {
    setOptimisticComments((prev) => prev.filter((comment) => comment.id !== optimisticId))
  }

  return (
    <OptimisticCommentsContext.Provider
      value={{
        optimisticComments,
        addOptimisticComment,
        removeOptimisticComment,
        replaceOptimisticComment,
      }}
    >
      {children}
    </OptimisticCommentsContext.Provider>
  )
}

export function useOptimisticComments() {
  const context = useContext(OptimisticCommentsContext)
  if (!context) {
    throw new Error('useOptimisticComments must be used within OptimisticCommentsProvider')
  }
  return context
}
