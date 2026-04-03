import { useMutation, useQueryClient } from '@tanstack/react-query'
import { connectRepository } from '#/lib/repository/actions'
import { toast } from 'sonner'

export const useConnectRepository = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string
      repo: string
      githubId: number
    }) => {
      return await connectRepository({ data: { owner, repo, githubId } })
    },
    onSuccess: () => {
      toast.success('Repository connected successfully')
      queryClient.invalidateQueries({ queryKey: ['repositories'] })
    },
    onError: (error) => {
      toast.error('Failed to connect to repository')
      console.error(error)
    },
  })
}
