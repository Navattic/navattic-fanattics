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
            delay: 2,
          }}
          className="fixed right-4 bottom-4 z-50 max-w-sm"
        >
          <div className="rounded-2xl border border-gray-200 p-0.5 bg-gray-50/20 backdrop-blur-lg">
            <div className="inset-shadow flex flex-col gap-2 rounded-xl border border-blue-100 bg-gradient-to-b from-white/90 to-white/70 shadow-xs backdrop-blur-md">
              <div className="flex flex-shrink-0 items-center justify-between pr-1.5 pb-3 pl-4">
                <div className="flex items-center gap-2 pt-5 pl-2">
                  <NavatticLogo />
                  <Badge variant="default" size="xs" colorScheme="brand">
                    Beta
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="mt-1"
                  aria-label="Dismiss notification"
                >
                  <Icon name="x" />
                </Button>
              </div>
              <div className="flex-1 p-5 pt-0">
                <p className="text-sm text-balance text-gray-700">
                  Thank you for being part of our fanattic beta program. Please reach out to{' '}
                  <a href="mailto:fanattic@navattic.com" className="text-blue-600 hover:underline">
                    fanattic@navattic.com
                  </a>{' '}
                  if you encounter any bugs or unexpected behavior.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
