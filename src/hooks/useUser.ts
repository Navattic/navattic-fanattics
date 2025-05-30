import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { payload } from '@/lib/payloadClient'
import type { User } from '@/payload-types'

export function useUser() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.email) {
      setIsLoading(false)
      return
    }

    // Only fetch if we don't have the user data yet
    if (!user) {
      payload
        .find({
          collection: 'users',
          where: {
            email: { equals: session.user.email },
          },
        })
        .then((response) => {
          setUser(response.docs[0] as User)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [user, session?.user?.email])

  return { user, isLoading }
}
