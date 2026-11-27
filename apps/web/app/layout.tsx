import { Geist_Mono, Figtree } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { DevAuthBadge } from "@/components/dev-auth-badge";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", figtree.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=location.pathname.match(/^\\/client\\/([^\\/]+)/);if(!m)return;var t=JSON.parse(localStorage.getItem("clatter-workspace-themes")||"{}")[decodeURIComponent(m[1])];if(t&&t!=="default")document.documentElement.setAttribute("data-workspace-theme",t)}catch(e){}})()` }} />
      </head>
      <body>
        <ThemeProvider><TooltipProvider>{children}</TooltipProvider></ThemeProvider>
        <DevAuthBadge />
      </body>
    </html>
  )
}
