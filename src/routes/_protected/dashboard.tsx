import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '#/components/ui/sidebar'
import { Separator } from '#/components/ui/separator'
import { AppSideBar } from '#/components/app-sidebar'
import { getSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/_protected/dashboard')({
  loader: async () => {
    const session = await getSession()
    return { session }
  },
  staleTime: 2 * 60 * 1000,
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useLoaderData()

  return (
    <SidebarProvider>
      <AppSideBar session={session} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
