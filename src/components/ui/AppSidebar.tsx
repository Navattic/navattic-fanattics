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
  MessageCircleIcon,
  UsersIcon,
  LucideIcon,
} from 'lucide-react'
import { NavatticLogo } from '@/components/ui/NavatticLogo'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Avatar } from '@/components/ui'
import { useUser } from '../Providers'

interface FooterItem {
  label: string
  href?: string
  icon: LucideIcon
}

const items = [
  {
    group: 'Fannatics Info',
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
    group: 'Community',
    items: [
      {
        label: 'Discussions',
        href: '/discussions',
        icon: MessageCircleIcon,
      },
      {
        label: 'Fanattics',
        href: '/fanattics',
        icon: UsersIcon,
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
  const { data: session, status: authStatus } = useSession()
  const pathname = usePathname()
  const { user, isLoading: userLoading } = useUser()
  const isLoading = authStatus === 'loading' || userLoading

  const footerItems = [
    session?.user.roles?.includes('admin') && {
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
  ].filter((item): item is FooterItem => Boolean(item))

  return (
    <Sidebar>
      <SidebarHeader className="mb-10 p-5">
        <Link href="/">
          <NavatticLogo />
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
            {isLoading ? (
              <SidebarMenuButton>
                <div className="flex w-full items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </SidebarMenuButton>
            ) : !session ? (
              <SidebarMenuButton onClick={() => signIn()} className="w-full">
                <span className="text-sm font-medium text-gray-600">Sign in</span>
              </SidebarMenuButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <div className="flex w-full cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Avatar user={user} size="sm" showCompany={false} />
                        <span className="block max-w-[15ch] truncate capitalize">
                          {user?.firstName} {user?.lastName}
                        </span>
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
                  {footerItems.map((item) => (
                    <div key={item.label}>
                      <DropdownMenuItem
                        className="!h-8 cursor-pointer rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
                        asChild={!item.label.includes('Sign out')}
                        onSelect={() => item.label.includes('Sign out') && signOut()}
                      >
                        {item.label.includes('Sign out') ? (
                          <div className="flex items-center gap-2">
                            <item.icon className="size-4 text-gray-500" />
                            <span className="text-sm leading-none font-medium text-gray-600">
                              {item.label}
                            </span>
                          </div>
                        ) : (
                          <Link href={item.href ?? ''} className="flex items-center gap-2">
                            <item.icon className="size-4 text-gray-500" />
                            <span className="text-sm leading-none font-medium text-gray-600">
                              {item.label}
                            </span>
                          </Link>
                        )}
                      </DropdownMenuItem>
                      {item.label === 'Admin Dashboard' && <DropdownMenuSeparator />}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
