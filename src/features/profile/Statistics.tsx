import { User } from '@/payload-types'
import { CoinsIcon, HandCoinsIcon, BicepsFlexed, MessageCircleReplyIcon } from 'lucide-react'
import { calculateUserPoints } from '@/lib/users/points'
const StatisticCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 px-6 shadow-xs flex gap-4">
      <span className="text-gray-500 mt-1">{icon}</span>
      <div className="flex flex-col">
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

const Statistics = async ({ user }: { user: User }) => {
  const userPoints = await calculateUserPoints({ user })

  const StatisticData = [
    {
      icon: <CoinsIcon />,
      label: 'Total points',
      value: userPoints,
    },
    {
      icon: <BicepsFlexed />,
      label: 'Challenges completed',
      value: 10,
    },
    {
      icon: <HandCoinsIcon />,
      label: 'Items redeemed',
      value: 1,
    },
    {
      icon: <MessageCircleReplyIcon />,
      label: 'Comments written',
      value: 24,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {StatisticData.map((statistic) => (
        <StatisticCard key={statistic.label} {...statistic} />
      ))}
    </div>
  )
}

export default Statistics
