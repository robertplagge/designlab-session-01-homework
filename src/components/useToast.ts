import { createContext, useContext } from 'react'
import type { Undo } from '../lib/actions'

export interface ToastInput {
  message: string
  undo?: Undo
}

export const ToastContext = createContext<(t: ToastInput) => void>(() => {})
export const useToast = () => useContext(ToastContext)
