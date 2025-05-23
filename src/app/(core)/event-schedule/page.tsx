import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import PageTitle from '@/components/ui/PageTitle'
import { Container } from '@/components/ui/Container'
import { Event, Media } from '@/payload-types'
import Image from 'next/image'
import { Badge, Button, Icon, Link } from '@/components/ui'
import { ArrowUpRightIcon } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'
import Empty from '@/components/ui/Empty'
import { calculateUserPoints } from '@/lib/users/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const EventEntry = ({ event, isPastEvent }: { event: Event; isPastEvent?: boolean }) => {
  return (
    <div className="inset-shadow flex justify-between rounded-3xl border border-gray-100 bg-white p-4 pl-6 [:last-child]:mb-20">
      <div className="flex flex-col justify-between p-2 pr-8">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-gray-800">{event.title}</div>
          {!isPastEvent && (
            <Button variant="solid" colorScheme="brand" size="xs">
              View event
              <Icon name="arrow-right" className="size-4" />
            </Button>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="grid aspect-square h-full min-h-8 w-auto min-w-8 place-items-center rounded-md border border-gray-200">
              <Icon name="map-pin" className="size- 4 text-gray-400" />
            </div>
            <div className="text-sm text-gray-500">
              <div className="font-semibold text-gray-800">
                <Link href={event.location.link ?? ''} target="_blank" className="group flex">
                  {event.location.name}
                  <ArrowUpRightIcon className="size-4 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                </Link>
              </div>
              <div className="whitespace-nowrap">
                {event.location.address ? (
                  event.location.address
                ) : (
                  <Badge colorScheme="yellow" size="sm">
                    Webinar (virtual)
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid aspect-square h-full min-h-8 w-auto min-w-8 place-items-center rounded-md border border-gray-200">
              <Icon name="calendar" className="size-4 text-gray-400" />
            </div>
            <div className="text-sm text-gray-500">
              <div className="font-semibold text-gray-800">{event.date.displayDate}</div>
              <div className="whitespace-nowrap">
                {formatDate(event.date.startTime, {
                  includeMonth: false,
                  includeDay: false,
                  includeYear: false,
                  includeTime: true,
                })}
                {event.date.endTime && (
                  <>
                    {' '}
                    -{' '}
                    {formatDate(event.date.endTime, {
                      includeMonth: false,
                      includeDay: false,
                      includeYear: false,
                      includeTime: true,
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Image
        src={(event.image as Media)?.url ?? '/event-placeholder.png'}
        alt={(event.image as Media)?.alt ?? event.title}
        width={200}
        height={200}
        className="h-fit min-h-[175px] min-w-[175px] rounded-xl border border-gray-100 object-cover"
      />
    </div>
  )
}

const EventSchedule = async () => {
  const events = await payload.find({
    collection: 'Events',
  })

  const upcomingEvents = events.docs.filter(
    (event) => new Date(event.date.endTime ?? event.date.startTime) > new Date(),
  )
  const pastEvents = events.docs.filter(
    (event) => new Date(event.date.endTime ?? event.date.startTime) < new Date(),
  )

  const session = await getServerSession(authOptions)
  const sessionUser = (
    await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session?.user?.email,
        },
      },
    })
  ).docs[0]

  const userPoints = await calculateUserPoints({ user: sessionUser })

  return (
    <>
      <PageHeader title="Event Schedule" userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container>
          <PageTitle title="Event Schedule" />
          <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Upcoming Events</div>
          {upcomingEvents.length > 0 ? (
            <div className="flex flex-col gap-4">
              {upcomingEvents.map((event) => (
                <EventEntry key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Empty title="No upcoming events" iconName="calendar" />
          )}
          <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Past Events</div>
          {pastEvents.length > 0 ? (
            <div className="flex flex-col gap-4">
              {pastEvents.map((event) => (
                <EventEntry key={event.id} isPastEvent event={event} />
              ))}
            </div>
          ) : (
            <Empty title="No past events" iconName="calendar" />
          )}
        </Container>
      </div>
    </>
  )
}

export default EventSchedule
