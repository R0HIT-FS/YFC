import React from 'react'
import { MobileMenu } from './MobileMenu'

const Navbar = () => {
  return (
    <div className='w-full bg-zinc-900 p-4 px-10 border-b-[1px] border-zinc-600 flex items-center justify-between sticky top-0 z-50'>
        <div className='text-3xl text-white font-semibold'>S.O.S.</div>
        <div className='menu hidden md:flex flex items-center gap-4 '>
            <a href="/" className='text-zinc-400 hover:text-zinc-200 transition-colors'>Delegates</a>
            <a href="/rooms" className='text-zinc-400 hover:text-zinc-200 transition-colors'>Rooms</a>
            <a href="/groups" className='text-zinc-400 hover:text-zinc-200 transition-colors'>Groups</a>
            <a href="/sync" className='text-zinc-400 hover:text-zinc-200 transition-colors'>Sync</a>
        </div>
        <div className='block md:hidden'>
            <MobileMenu/>
        </div>
    </div>
  )
}

export default Navbar