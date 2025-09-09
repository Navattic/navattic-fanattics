'use client'

import React from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

export interface CollapseProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  isOpen: boolean
  children: React.ReactNode
  motionKey?: string
  'data-test-id'?: string
}

/**
 * A component that animates content expanding and collapsing. {@link https://compass-ui.dev/?path=/docs/display-collapse |  **Storybook docs**}
 * @param isOpen - Whether the content is expanded/visible or collapsed/hidden.
 * @param children - The content to show or hide.
 * @param motionKey - Optional unique key for the Framer Motion animation.
 */
export const Collapse = ({
  isOpen,
  className,
  children,
  motionKey = 'collapse-content',
  'data-test-id': dataTestId,
  ...props
}: CollapseProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={motionKey}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: 'auto',
            opacity: 1,
          }}
          exit={{
            height: 0,
            opacity: 0,
          }}
          transition={{
            ease: [0.175, 0.885, 0.32, 1.1],
          }}
          data-test-id={dataTestId}
          className={cn('overflow-hidden', className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
