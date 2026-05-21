import { createFileRoute } from '@tanstack/react-router'
import { serve } from 'inngest/edge'
import { inngest } from '../../inngest/client'
import { IndexRepo } from '#/inngest/functions/indexRepo'
import { generateReview } from '#/inngest/functions/review'

const handler = serve({
  client: inngest,
  functions: [IndexRepo, generateReview],
  
})

// export const maxDuration = 300;

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
      GET: async ({ request }) => handler(request),
      POST: async ({ request }) => handler(request),
      PUT: async ({ request }) => handler(request),
    },
  },
})
