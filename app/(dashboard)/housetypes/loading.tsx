import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HouseTypesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-10 w-[300px]" />

            <div className="rounded-md border">
              <div className="h-10 border-b px-4 py-2">
                <div className="flex justify-between">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-[100px]" />
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex justify-between items-center">
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <Skeleton key={cellIndex} className="h-4 w-[100px]" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Skeleton className="h-10 w-[300px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
