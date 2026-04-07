import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getReviews } from '#/lib/reviews/actions'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/_protected/dashboard/reviews/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      return await getReviews()
    },
  })

  if (isLoading) {
    return <div>Loading Reviews</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
        <p className="text-muted-foreground">View all AI code reviews</p>
      </div>
      {reviews?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reviews yet. Connect a repository and open a PR to see a
                review.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews?.map((review: any) => {
            console.log({ review })
            return (
              <Card
                key={review.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {review.prTitle}
                        </CardTitle>
                        {review.status.toLowerCase() === 'completed' && (
                          <Badge className="gap-1" variant={'default'}>
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {review.status.toLowerCase() === 'failed' && (
                          <Badge className="gap-1" variant={'destructive'}>
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                        {review.status.toLowerCase() === 'pending' && (
                          <Badge className="gap-1" variant={'secondary'}>
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {review.repository.fullName} • PR #{review.prNumber}
                      </CardDescription>
                    </div>
                    <Button variant={'ghost'} asChild size={'icon'}>
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-xs">
                          {review.review.substring(0, 300)}...
                        </pre>
                      </div>
                    </div>
                    <Button variant={'outline'} asChild>
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Full Review on GitHub
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
