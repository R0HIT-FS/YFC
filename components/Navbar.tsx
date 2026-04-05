// 'use client'
// import React from 'react'
// import { MobileMenu } from './MobileMenu'
// import { usePathname } from 'next/navigation'
// import Link from 'next/link'

// const links = [
//   { href: '/',       label: 'Delegates' },
//   { href: '/rooms',  label: 'Rooms'     },
//   { href: '/groups', label: 'Groups'    },
//   { href: '/sync',   label: 'Sync'      },
// ]

// const Navbar = () => {
//   const pathname = usePathname()

//   return (
//     <div className='w-full bg-zinc-900 p-4 px-10 border-b-[1px] border-zinc-600 flex items-center justify-between sticky top-0 z-50'>
//       <div className='text-3xl text-white font-semibold'>S.O.S.</div>

//       <div className='menu hidden md:flex items-center gap-4'>
//         {links.map(({ href, label }) => {
//           const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={`transition-colors ${
//                 isActive
//                   ? 'text-white font-medium'
//                   : 'text-zinc-400 hover:text-zinc-200'
//               }`}
//             >
//               {label}
//             </Link>
//           )
//         })}
//       </div>

//       <div className='block md:hidden'>
//         <MobileMenu />
//       </div>
//     </div>
//   )
// }

// export default Navbar


'use client'
import React, { useEffect, useRef, useState } from 'react'
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

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setVisible(true)
    setProgress(10)

    let current = 10

    // 🔥 Fake progressive loading
    const animate = () => {
      current += (100 - current) * 0.05 // smooth ease

      if (current < 95) {
        setProgress(current)
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    // 🔥 Complete on next frame
    const done = requestAnimationFrame(() => {
      setProgress(100)

      // small delay for smooth finish
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(done)
    }
  }, [pathname])

  return (
    <>
      {/* 🔥 REAL PROGRESS BAR */}
      {visible && (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[100] bg-transparent">
          <div
            className="h-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className='w-full bg-zinc-900 p-4 px-10 border-b-[1px] border-zinc-600 flex items-center justify-between sticky top-0 z-50'>
        <div className='text-3xl text-white font-semibold'>S.O.S.</div>

        <div className='menu hidden md:flex items-center gap-4'>
          {links.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                prefetch
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
    </>
  )
}

export default Navbar