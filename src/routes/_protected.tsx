import { getSession } from '#/lib/auth.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/auth/login',
      })
    }
    return { session }
  },
  component: () => <Outlet />,
})
