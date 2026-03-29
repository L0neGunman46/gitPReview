import { getSession } from '#/lib/auth.functions'
import LoginUI from '#/module/auth/components/login-ui'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <LoginUI />
    </div>
  )
}
