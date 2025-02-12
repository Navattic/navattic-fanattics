'use client'

import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'


const AuthButton = () => {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session?.user?.image && (
            <Image
              src={session?.user?.image}
              alt="User"
              width={28}
              height={28}
              className="rounded-full"
            />
          )}
          {session?.user?.name}
        </div>
        <button onClick={() => signOut()} className="bg-blue-500 text-white px-2 py-1 rounded-md">
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn()} className="bg-blue-500 text-white px-2 py-1 rounded-md">
      Sign in
    </button>
  )
}

export default AuthButton
