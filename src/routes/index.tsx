import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
   <div className='flex flex-col items-center justify-center h-screen'>
    <Button>Hello World</Button>
   </div>
  )
}
