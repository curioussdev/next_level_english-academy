'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

/**
 * Alterna entre light/dark. Só renderiza o ícone real após montar, para não
 * desalinhar com o tema resolvido no cliente. `colorClassName` não tem
 * default: fica sempre a cargo de quem usa, para nunca colidir em
 * especificidade com uma cor passada via `className` (duas classes Tailwind
 * distintas para a mesma propriedade não têm ordem de precedência garantida
 * pela ordem no JSX).
 */
export function ThemeToggle({ className = '', colorClassName = 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' }: { className?: string; colorClassName?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${colorClassName} ${className}`}
    >
      {mounted && resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
