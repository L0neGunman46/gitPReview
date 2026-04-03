import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchRepositories } from '#/lib/repository/actions'

const PER_PAGE = 10

export const useRepositories = () => {
  return useInfiniteQuery({
    queryKey: ['repositories'],
    queryFn: async ({ pageParam }) => {
      const data = await fetchRepositories({
        data: { page: pageParam, perPage: PER_PAGE },
      })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
  })
}
