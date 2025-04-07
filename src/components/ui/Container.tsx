import { cn } from '@/lib/utils'

export const Container = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('mx-auto w-full max-w-5xl px-2.5 md:px-20', className)} {...props} />
}
