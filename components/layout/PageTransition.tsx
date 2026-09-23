'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Crossfade leve entre páginas dentro do mesmo shell (sidebar/header ficam
 * parados, só o conteúdo troca). React's ViewTransition nativo não está
 * disponível na versão de `react` instalada aqui (verificado em runtime),
 * por isso usamos o framer-motion que já é dependência do projeto.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
