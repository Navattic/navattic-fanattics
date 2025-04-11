'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/shadcn/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/shadcn/ui/dropdown-menu'
import {
  SettingsIcon,
  LogOutIcon,
  ShieldUserIcon,
  TrophyIcon,
  HelpCircleIcon,
  EllipsisIcon,
  LineChartIcon,
  CalendarIcon,
  BookOpenTextIcon,
  HandCoinsIcon,
  UserIcon,
} from 'lucide-react'
import { NavatticLogo } from './NavatticLogo'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User } from '@/payload-types'

const items = [
  {
    group: 'Fannatic Info',
    items: [
      {
        label: 'Rules & Guide',
        href: '/rules-and-guide',
        icon: BookOpenTextIcon,
      },
      {
        label: 'Event Schedule',
        href: '/event-schedule',
        icon: CalendarIcon,
      },
      {
        label: 'Leaderboard',
        href: '/leaderboard',
        icon: LineChartIcon,
      },
    ],
  },
  {
    group: 'Collect Points',
    items: [
      {
        label: 'Challenges',
        href: '/challenges',
        icon: TrophyIcon,
      },
    ],
  },
  {
    group: 'Redeem Rewards',
    items: [
      {
        label: 'Gift Shop',
        href: '/gift-shop',
        icon: HandCoinsIcon,
      },
    ],
  },
]

export function AppSidebar({ user }: { user: User }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const footerItems = [
    {
      label: 'Admin Dashboard',
      href: '/admin',
      icon: ShieldUserIcon,
    },
    {
      label: 'Profile',
      href: `/profile/${user?.slug}`,
      icon: UserIcon,
    },
    {
      label: 'Sign out',
      icon: LogOutIcon,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-5 mb-10">
        <Link href="/">
          <NavatticLogo className="w-24" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarGroup key={item.group} className="px-2 py-0 flex flex-col">
            <SidebarGroupLabel className="px-2.5 py-3 text-xs font-medium leading-none text-gray-500/90">
              {item.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-[1px]">
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.label} className="hover:bg-gray-100 rounded-lg">
                    <SidebarMenuButton
                      asChild
                      className="rounded-lg !h-8 px-3 pr-2.5 py-0"
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="size-4 text-gray-500" />
                        <span className="text-sm leading-none font-medium text-gray-600">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!session ? (
              <button onClick={() => signIn()}>Sign in</button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 capitalize">
                        {user?.avatar && typeof user.avatar !== 'number' && (
                          <Image
                            src={user.avatar.sizes?.thumbnail?.url ?? ''}
                            alt="User"
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        )}
                        {user?.firstName} {user?.lastName}
                      </div>
                      <EllipsisIcon className="size-4 text-gray-500" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  sideOffset={10}
                  align="start"
                  alignOffset={10}
                  className="w-[220px] rounded-xl"
                >
                  {footerItems.map((item) =>
                    item.label === 'Sign out' ? (
                      <DropdownMenuItem
                        key={item.label}
                        onSelect={() => signOut()}
                        className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0 flex items-center gap-2 cursor-pointer"
                      >
                        <item.icon className="size-4 text-gray-500" />
                        <span className="text-sm leading-none font-medium text-gray-600">
                          {item.label}
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {item.label === 'Admin' && session?.user.roles?.includes('admin') ? (
                          <>
                            <DropdownMenuItem
                              key={item.label}
                              className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0"
                              asChild
                            >
                              <Link href={item.href ?? ''} className="flex items-center gap-2">
                                <item.icon className="size-4 text-gray-500" />
                                <span className="text-sm leading-none font-medium text-gray-600">
                                  {item.label}
                                </span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        ) : (
                          <DropdownMenuItem
                            key={item.label}
                            className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0"
                            asChild
                          >
                            <Link href={item.href ?? ''} className="flex items-center gap-2">
                              <item.icon className="size-4 text-gray-500" />
                              <span className="text-sm leading-none font-medium text-gray-600">
                                {item.label}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
