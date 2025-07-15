import { useContext } from 'react'
import { ToastContext } from './Toast.tsx'

export const useToast = () => useContext(ToastContext)
