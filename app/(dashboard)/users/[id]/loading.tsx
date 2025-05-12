import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function UserDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[250px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="mt-1 h-4 w-[100px]" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-5 w-[80px]" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-[100px]" />
                    <Skeleton className="mt-1 h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border p-3 text-center">
                  <Skeleton className="mx-auto h-4 w-[80px]" />
                  <Skeleton className="mx-auto mt-2 h-8 w-[50px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-3/4" />
              </div>

              <Separator />

              <div>
                <Skeleton className="h-6 w-[200px]" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-[100px]" />
                          <Skeleton className="mt-1 h-4 w-[150px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Skeleton className="h-6 w-[200px]" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="mt-2 h-5 w-[100px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
