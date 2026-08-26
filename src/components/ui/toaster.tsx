"use client"

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <div className="fixed top-4 right-6 z-[9999] pointer-events-none flex flex-col gap-2 max-w-xs">
        {toasts.map(function ({ id, title, description, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="flex flex-col gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </Toast>
          )
        })}
      </div>
    </ToastProvider>
  )
}