export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-muted rounded-md"></div>
        <div className="h-9 w-32 bg-muted rounded-md"></div>
      </div>

      <div className="border rounded-lg">
        <div className="h-14 border-b bg-muted/40"></div>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2 sm:flex-row">
            <div className="h-10 bg-muted rounded-md flex-1 max-w-sm"></div>
            <div className="h-10 w-20 bg-muted rounded-md"></div>
            <div className="h-10 w-32 bg-muted rounded-md"></div>
            <div className="h-10 w-32 bg-muted rounded-md"></div>
          </div>

          <div className="border rounded-md">
            <div className="h-12 bg-muted/40 border-b"></div>
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="h-20 border-b flex items-center px-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="ml-4 h-4 bg-muted rounded w-40"></div>
                  <div className="ml-4 h-4 bg-muted rounded w-24"></div>
                  <div className="ml-4 h-6 bg-muted rounded w-16"></div>
                  <div className="ml-4 h-4 bg-muted rounded w-20"></div>
                  <div className="ml-4 h-8 w-8 bg-muted rounded"></div>
                </div>
              ))}
          </div>

          <div className="py-2 flex justify-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
