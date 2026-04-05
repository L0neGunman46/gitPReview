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
      description = '',
      language,
      stars,
    }: {
      owner: string
      repo: string
      githubId: number
      description: string
      language: string
      stars: number
    }) => {
      console.log('Stars', stars)
      console.log('Language', language)
      console.log('description', description)
      return await connectRepository({
        data: { owner, repo, githubId, description, language, stars },
      })
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
