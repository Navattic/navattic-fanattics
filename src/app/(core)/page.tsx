import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const Home = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return (
      <div className="mx-auto text-center mt-20">
        <h1 className="text-xl font-medium">Please sign in to view challenges</h1>
      </div>
    )
  }
  const payload = await getPayload({ config })

  const challenges = await payload.find({
    collection: 'challenges',
  })

  // const users = await payload.find({
  //   collection: 'users',
  // })

  const challengesData = challenges.docs
  // const usersData = users

  // console.log(usersData)

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div key="challenges-list">
        <h1 className="text-2xl font-medium border-b border-gray-200 pb-2">Challenges</h1>
        <div className="flex flex-col gap-4 mt-4">
          {challengesData?.map((challenge) => (
            <Link
              key={challenge.id}
              className="text-xl ml-1 text-blue-800 flex flex-col"
              href={`challenges/${challenge.slug}`}
            >
              <div className="text-xl hover:underline">{challenge.title}</div>
              <div className="text-sm text-gray-500">Earn {challenge.points} points</div>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-4 mt-4">
          {/* {usersData?.map((user) => (
                <div
                  key={user.id}
                  className="text-xl ml-1 text-blue-800 flex flex-col"
                >
                </div>
              ))} */}
        </div>
      </div>
    </div>
  )
}

export default Home
