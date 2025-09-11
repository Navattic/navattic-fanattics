import { Icon } from '@/components/ui'

export const StatisticCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) => {
  return (
    <div className="inset-shadow flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 px-8 shadow-xs">
      <span className="mt-1 text-gray-500">{icon}</span>
      <div className="flex flex-col">
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

export const Statistics = ({ userStats }: { userStats: UserStats }) => {
  const StatisticData = [
    {
      icon: <Icon name="coins" />,
      label: 'Total points earned',
      value: userStats.points,
    },
    {
      icon: <Icon name="biceps-flexed" />,
      label: 'Challenges completed',
      value: userStats.challengesCompleted,
    },
    {
      icon: <Icon name="hand-coins" />,
      label: 'Items redeemed',
      value: userStats.itemsRedeemed,
    },
    {
      icon: <Icon name="message-circle-reply" />,
      label: 'Comments written',
      value: userStats.commentsWritten,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {StatisticData.map((statistic) => (
        <StatisticCard key={statistic.label} {...statistic} />
      ))}
    </div>
  )
}
