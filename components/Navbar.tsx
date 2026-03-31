'use client'
import React from 'react'
import { MobileMenu } from './MobileMenu'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { href: '/',       label: 'Delegates' },
  { href: '/rooms',  label: 'Rooms'     },
  { href: '/groups', label: 'Groups'    },
  { href: '/sync',   label: 'Sync'      },
]

const Navbar = () => {
  const pathname = usePathname()

  return (
    <div className='w-full bg-zinc-900 p-4 px-10 border-b-[1px] border-zinc-600 flex items-center justify-between sticky top-0 z-50'>
      <div className='text-3xl text-white font-semibold'>S.O.S.</div>

      <div className='menu hidden md:flex items-center gap-4'>
        {links.map(({ href, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className='block md:hidden'>
        <MobileMenu />
      </div>
    </div>
  )
}

export default Navbar