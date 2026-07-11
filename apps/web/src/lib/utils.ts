// Local app-level utilities. Mirrors packages/ui/src/lib/utils.ts so that
// the web app can use the same `cn` helper without depending on the UI
// package being built.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
