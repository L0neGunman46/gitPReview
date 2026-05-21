import { reviewPullRequest } from '#/lib/ai/actions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/webhooks/github/$')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const event = request.headers.get('x-github-event')
          console.log(`Recieved Github event: ${event}`)
          if (event === 'ping') {
            return new Response(JSON.stringify({ message: 'Pong' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          if (event === 'pull_request') {
            const action = body.action
            const repo = body.repository.full_name
            const prNum = body.number

            const [owner, repoName] = repo.split('/')

            // if pr is open or we are synching pr
            if (action === 'opened' || action === 'synchronize') {
              reviewPullRequest({ data: { owner, repoName, prNum } })
                .then(() =>
                  console.log(`Review completed for ${repo} #${prNum}`),
                )
                .catch((err) =>
                  console.error(`Review failed for ${repo} #${prNum}`, err),
                )
            }
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
