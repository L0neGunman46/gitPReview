import { Button } from '#/components/ui/button'
import Logout from '#/module/auth/components/logout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/')({ component: App })

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Logout>
        <Button>Hello World</Button>
      </Logout>
    </div>
  )
}
