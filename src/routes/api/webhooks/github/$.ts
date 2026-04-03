import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/webhooks/github/$')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const event = request.headers.get('x-github-event')
          console.log('Recieved Github event: ${event}')
          if (event === 'ping') {
            return new Response(JSON.stringify({ message: 'Pong' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify({ message: 'Event Processed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          console.error('Error processing webhook:', err)
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
