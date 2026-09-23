'use client'

import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

/** Cena animada para 404/erro — só SVG/CSS desenhado à mão, sem assets externos. */
export function NotFoundScene() {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-violet-300/50 dark:border-violet-500/30"
          style={{ width: `${100 + i * 55}px`, height: `${100 + i * 55}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14 + i * 6, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-xl shadow-violet-500/30"
      >
        <motion.div
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
        >
          <Compass size={44} />
        </motion.div>
      </motion.div>

      {[
        { top: '4%', left: '10%', delay: 0 },
        { top: '15%', right: '6%', delay: 0.3 },
        { bottom: '10%', left: '4%', delay: 0.6 },
      ].map((pos, i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-2.5 rounded-full bg-violet-400 dark:bg-violet-400/80"
          style={pos}
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: pos.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
