'use client'

import React, { useMemo } from 'react'
import * as ModalPrimitive from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '../Compass/Button'
import { Icon } from '@/components/ui/Compass/Icon'

// ------ Modal ------
export type ModalProps = {
  isFullScreen?: boolean
  trigger?: React.ReactNode
  title?: ModalDefaultHeaderProps['title']
  description?: ModalDefaultHeaderProps['description']
  header?: ModalHeaderProps
  children?: ModalBodyProps['children']
  primaryButton?: ModalDefaultFooterProps['primaryButton']
  secondaryButton?: ModalDefaultFooterProps['secondaryButton']
  footer?: ModalFooterProps
  className?: string
  showCloseButton?: boolean
  showScrollSuggestions?: boolean
  bodyClassName?: string
  overlayClassName?: string
  'data-test-id'?: string
} & Omit<ModalPrimitive.DialogProps, 'children'>

/**
 * A popup that opens on top of the entire page. {@link https://compass-ui.dev/?path=/docs-overlay-modal |  **Storybook docs**}
 * @param trigger - The element that triggers the modal to open. You can also control the modal using the `open` and `onOpenChange` props.
 * @param children - Content to display in the modal body. You can also use this to bypass all default header, body, and footer components.
 * @param title - Title text for the modal when using the default header.
 * @param description - Description text for the modal when using the default header.
 * @param header - Custom header component (alternative to title/description).
 * @param primaryButton - Configuration for the primary action button when using the default footer.
 * @param secondaryButton - Configuration for the secondary action button when using the default footer (defaults to "Cancel").
 * @param footer - Custom footer component (alternative to primaryButton/secondaryButton).
 * @param isFullScreen - Whether the modal should take up the full screen.
 * @param showCloseButton - Whether to show a close button in the top right corner.
 * @param showScrollSuggestions - Whether to show scroll indicators when content overflows.
 * @param bodyClassName - Additional CSS classes to apply to the modal body.
 * @param overlayClassName - Additional CSS classes to apply to the modal overlay.
 * @param open - Controls whether the modal is open or closed.
 * @param onOpenChange - Callback function triggered when the open state changes.
 */
export const Modal: React.FC<ModalProps> = ({
  trigger,
  children,
  title,
  description,
  header,
  primaryButton,
  secondaryButton = { children: 'Cancel' },
  footer,
  isFullScreen,
  open,
  onOpenChange,
  className,
  showCloseButton,
  showScrollSuggestions,
  bodyClassName,
  overlayClassName,
  'data-test-id': dataTestId,
  ...props
}) => {
  const modalHeader = useMemo(() => {
    if (header) {
      return <ModalHeader {...header} />
    }
    if (title || description) {
      return <ModalDefaultHeader title={title} description={description} />
    }
    return null
  }, [header, title, description])

  const modalFooter = useMemo(() => {
    if (footer) {
      return <ModalFooter {...footer} />
    }
    if (primaryButton) {
      return <ModalDefaultFooter primaryButton={primaryButton} secondaryButton={secondaryButton} />
    }
    return null
  }, [footer, primaryButton, secondaryButton])

  return (
    <ModalRoot data-test-id={dataTestId} open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent
        aria-describedby={undefined}
        isFullScreen={isFullScreen}
        showCloseButton={showCloseButton}
        className={className}
        overlayClassName={overlayClassName}
      >
        {modalHeader}

        {children && (
          <ModalBody showScrollSuggestions={showScrollSuggestions} className={bodyClassName}>
            {children}
          </ModalBody>
        )}

        {modalFooter}
      </ModalContent>
    </ModalRoot>
  )
}

// ------ Modal Composition styles ------
export const modalContentVariants = cva(
  [
    'relative bg-white w-full overflow-clip rounded-2xl shadow-lg duration-200 outline-hidden',
    // Animation
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
  ],
  {
    variants: {
      isFullScreen: {
        true: 'flex h-full max-h-[95dvh] max-w-[95dvw] flex-col',
        false: 'flex max-h-[95dvh] max-w-[540px] flex-col',
      },
    },
  },
)

export const modalOverlayVariants = cva([
  'fixed inset-0 z-50 flex items-center justify-center w-screen h-screen bg-gray-800/50 backdrop-blur-sm',
  // Animation
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
])

export const modalTitleStyles = 'text-lg font-semibold text-gray-900'
export const modalDescriptionStyles = 'text-sm text-gray-500'

// ------ Modal Composition Components ------

export const ModalRoot = ModalPrimitive.Root
export const ModalTrigger = ModalPrimitive.Trigger
export const ModalPortal = ModalPrimitive.Portal
export const ModalClose = ModalPrimitive.Close

export const ModalCloseButton = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ModalClose ref={ref} asChild className={cn(className)} {...props}>
    <Button className="absolute top-2 right-2 bg-red-500" variant="ghost" aria-label="Close button">
      <Icon name="x" size="sm" />
    </Button>
  </ModalClose>
))
ModalCloseButton.displayName = ModalPrimitive.Close.displayName

export const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Overlay ref={ref} className={cn(modalOverlayVariants(), className)} {...props} />
))
ModalOverlay.displayName = ModalPrimitive.Overlay.displayName

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof ModalPrimitive.Content> {
  isFullScreen?: boolean
  showCloseButton?: boolean
  overlayClassName?: string
}

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Content>,
  ModalContentProps
>(
  (
    {
      isFullScreen = false,
      showCloseButton = true,
      className,
      overlayClassName,
      children,
      ...props
    },
    ref,
  ) => (
    <ModalPortal>
      <ModalOverlay className={overlayClassName}>
        <ModalPrimitive.Content
          ref={ref}
          className={cn(modalContentVariants({ isFullScreen }), className)}
          {...props}
        >
          {showCloseButton && <ModalCloseButton className="absolute top-2 right-2" />}
          {children}
        </ModalPrimitive.Content>
      </ModalOverlay>
    </ModalPortal>
  ),
)
ModalContent.displayName = ModalPrimitive.Content.displayName

export type ModalHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>

export const ModalHeader = ({ className, ...props }: ModalHeaderProps) => (
  <div className={cn('px-6 py-4 text-lg', className)} {...props} />
)
ModalHeader.displayName = 'ModalHeader'

export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>

export const ModalFooter = ({ className, ...props }: ModalFooterProps) => (
  <div className={cn('px-6 py-4', className)} {...props} />
)
ModalFooter.displayName = 'ModalFooter'

export interface ModalBodyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode
  showScrollSuggestions?: boolean
}
export const ModalBody = ({
  className,
  showScrollSuggestions = true,
  children,
  ...props
}: ModalBodyProps) => (
  <div className={cn('relative grow overflow-y-auto px-6', className)} {...props}>
    {showScrollSuggestions && (
      <div className="sticky top-0 z-2 h-6 w-full bg-linear-to-b from-white to-white/25" />
    )}
    {children}
    {showScrollSuggestions && (
      <div className="sticky bottom-0 z-2 h-6 w-full bg-linear-to-t from-white to-white/25" />
    )}
  </div>
)
ModalBody.displayName = 'ModalBody'

export const ModalTitle = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Title ref={ref} className={cn(modalTitleStyles, className)} {...props} />
))
ModalTitle.displayName = ModalPrimitive.Title.displayName

export const ModalDescription = React.forwardRef<
  React.ElementRef<typeof ModalPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ModalPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ModalPrimitive.Description
    ref={ref}
    className={cn(modalDescriptionStyles, className)}
    {...props}
  />
))
ModalDescription.displayName = ModalPrimitive.Description.displayName

// ------ Default Modal Components ------

export interface ModalDefaultHeaderProps extends ModalHeaderProps {
  title: ModalPrimitive.DialogTitleProps['children']
  description?: ModalPrimitive.DialogDescriptionProps['children']
}

export const ModalDefaultHeader = ({ title, description }: ModalDefaultHeaderProps) => (
  <ModalHeader className="border-b border-gray-300 bg-white">
    <ModalTitle className="mr-10">{title}</ModalTitle>
    {description && <ModalDescription className="mr-10">{description}</ModalDescription>}
  </ModalHeader>
)

export interface ModalDefaultFooterProps extends ModalFooterProps {
  primaryButton: ButtonProps
  secondaryButton?: ButtonProps | null
}

export const ModalDefaultFooter = ({
  primaryButton,
  secondaryButton = { children: 'Cancel' },
}: ModalDefaultFooterProps) => (
  <ModalFooter className="flex items-center justify-end gap-2 border-t border-gray-300 bg-gray-100">
    {secondaryButton?.onClick ? (
      <Button variant="ghost" {...secondaryButton} />
    ) : (
      <ModalClose asChild>
        <Button variant="ghost" {...secondaryButton} />
      </ModalClose>
    )}
    {primaryButton && <Button {...primaryButton} />}
  </ModalFooter>
)
