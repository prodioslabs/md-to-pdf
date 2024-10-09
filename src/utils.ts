import { twMerge } from 'tw-merge'
import clsx from 'clsx'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return twMerge(clsx(...classes))
}
