import { Icon } from './Icon'
import { IconName } from './Icon'

export interface IconButtonProps {
  href: string
  iconName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  target?: string
  rel?: string
}

const sizeMap = {
  sm: { container: 'h-8 w-8', icon: 'h-5 w-5' },
  md: { container: 'h-10 w-10', icon: 'h-6 w-6' },
  lg: { container: 'h-12 w-12', icon: 'h-7 w-7' },
}

export function IconButton({
  href, 
  iconName,
  size = 'md',
  className = '',
  target,
  rel,
  ...props
}: IconButtonProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center justify-center ${sizeMap[size].container} rounded-xl border border-solid border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
      {...props}
    >
      <Icon name={iconName as IconName} className={sizeMap[size].icon} />
    </a>
  )
}

export default IconButton
