// "use client"

// import { useTheme } from "next-themes"
// import { Toaster as Sonner, type ToasterProps } from "sonner"
// import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme()

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       icons={{
//         success: (
//           <CircleCheckIcon className="size-4" />
//         ),
//         info: (
//           <InfoIcon className="size-4" />
//         ),
//         warning: (
//           <TriangleAlertIcon className="size-4" />
//         ),
//         error: (
//           <OctagonXIcon className="size-4" />
//         ),
//         loading: (
//           <Loader2Icon className="size-4 animate-spin" />
//         ),
//       }}
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//           "--border-radius": "var(--radius)",
//         } as React.CSSProperties
//       }
//       toastOptions={{
//         classNames: {
//           toast: "cn-toast",
//         },
//       }}
//       {...props}
//     />
//   )
// }

// export { Toaster }


"use client"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-zinc-400" />,
      }}
      style={
        {
          "--normal-bg": "#09090b",          /* zinc-950 - toast background */
          "--normal-text": "#f4f4f5",        /* zinc-100 - text color */
          "--normal-border": "#27272a",      /* zinc-800 - border */
          "--success-bg": "#09090b",
          "--success-text": "#34d399",       /* emerald-400 */
          "--success-border": "#27272a",
          "--error-bg": "#09090b",
          "--error-text": "#f87171",         /* red-400 */
          "--error-border": "#27272a",
          "--warning-bg": "#09090b",
          "--warning-text": "#facc15",       /* yellow-400 */
          "--warning-border": "#27272a",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !shadow-xl !shadow-black/50",
          title: "!text-zinc-100 !font-medium",
          description: "!text-zinc-400",
          actionButton: "!bg-zinc-700 !text-white hover:!bg-zinc-600",
          cancelButton: "!bg-zinc-800 !text-zinc-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }