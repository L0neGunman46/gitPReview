import { ProfileForm } from '#/components/settings/profile-form'
import { RepositortyList } from '#/components/settings/repository-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard/settings/')({
  component: RouteComponent,
  staleTime: 2 * 1000 * 60,
})

/**
 * 
edit user profile
manage connected repos

*/

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your settings and connections
        </p>
      </div>
      <ProfileForm />
      <RepositortyList />
    </div>
  )
}
