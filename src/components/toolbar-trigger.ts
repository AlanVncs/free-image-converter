import { cn } from '../lib/utils'

export const toolbarTriggerClass = cn(
  'group inline-flex items-center gap-2 rounded-xl border px-3 py-2',
  'border-zinc-200 bg-white/80 text-sm font-medium text-zinc-800 shadow-lg shadow-black/5 backdrop-blur-md',
  'transition-all hover:border-zinc-300 hover:bg-white/95',
  'focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40',
  'data-[state=open]:border-violet-500/50 data-[state=open]:ring-2 data-[state=open]:ring-violet-500/20',
  'dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:shadow-black/20',
  'dark:hover:border-zinc-700 dark:hover:bg-zinc-800/90',
  'dark:data-[state=open]:border-violet-500/50 dark:data-[state=open]:bg-zinc-800/90',
)
