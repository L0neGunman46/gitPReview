import { inngest } from '../client'

export const helloWorld = inngest.createFunction(
  { id: 'hello-world', triggers: [{ event: 'test/hello.world' }] },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    console.log(Object.keys(event.data))
    return { message: `Hello ${event.data?.email}` }
  },
)
