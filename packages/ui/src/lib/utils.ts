// Utility helper shared by UI components.
// This is the standard `cn` helper expected by shadcn/ui.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
