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
  LogOutIcon,
  ShieldUserIcon,
  TrophyIcon,
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
import { usePathname } from 'next/navigation'
import React from 'react'
import Avatar from './Avatar'
import { useUser } from '../Providers'

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

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = useUser()

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
      <SidebarHeader className="mb-10 p-5">
        <Link href="/">
          <NavatticLogo className="w-24" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarGroup key={item.group} className="flex flex-col px-2 py-0">
            <SidebarGroupLabel className="px-2.5 py-3 text-xs leading-none font-medium text-gray-500/90">
              {item.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-[1px]">
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.label} className="rounded-lg hover:bg-gray-100">
                    <SidebarMenuButton
                      asChild
                      className="!h-8 rounded-lg px-3 py-0 pr-2.5"
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
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 capitalize">
                        {user?.avatar && typeof user.avatar !== 'number' && (
                          <Avatar user={user} size="sm" showCompany={false} />
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
                        className="flex !h-8 cursor-pointer items-center gap-2 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
                      >
                        <item.icon className="size-4 text-gray-500" />
                        <span className="text-sm leading-none font-medium text-gray-600">
                          {item.label}
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <React.Fragment key={item.label}>
                        {item.label === 'Admin Dashboard' &&
                        session?.user.roles?.includes('admin') ? (
                          <>
                            <DropdownMenuItem
                              className="!h-8 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
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
                            className="!h-8 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
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
                      </React.Fragment>
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
