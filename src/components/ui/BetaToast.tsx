'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Icon, Badge } from '@/components/ui'
import { NavatticLogo } from './NavatticLogo'

export function BetaToast() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('beta-toast-dismissed')
    if (!isDismissed) {
      setIsVisible(true)
    }
  }, [])

  function handleDismiss() {
    setIsVisible(false)
    localStorage.setItem('beta-toast-dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
          className="fixed right-4 bottom-4 z-50 max-w-sm"
        >
          <div className="inset-shadow bg-white/90 shadow-xs flex flex-col gap-2 rounded-xl border border-blue-100 backdrop-blur-md">
            <div className="flex flex-shrink-0 items-center justify-between pr-1.5 pb-4 pl-4">
              <div className="pl-2 pt-6 flex items-center gap-2">
                <NavatticLogo />
                <Badge variant="default" size="xs" colorScheme="brand">Beta</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                aria-label="Dismiss notification"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div className="flex-1 p-5 pt-0">
              <p className="my-1 text-sm text-gray-700">
                The Fanattic Portal is currently in Beta. You may encounter bugs or unexpected
                behavior.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
