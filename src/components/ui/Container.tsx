import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container = ({ className, ...props }: ContainerProps) => {
  return <div className={cn('mx-auto w-full max-w-6xl px-2.5 md:px-20', className)} {...props} />
}
