'use client'

import { useState, useCallback } from 'react'

export interface UseDisclosureProps {
  defaultIsOpen?: boolean
}

export interface UseDisclosureReturnProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}

export const useDisclosure = (props?: UseDisclosureProps): UseDisclosureReturnProps => {
  const { defaultIsOpen = false } = props || {}
  const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const onToggle = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen)
  }, [])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  }
}
