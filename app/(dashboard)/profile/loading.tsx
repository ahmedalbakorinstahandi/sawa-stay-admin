"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الملف الشخصي</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-24 w-24 bg-gray-200 rounded-full" />
              <div className="w-40 h-6 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>

            <div className="h-1 w-full bg-gray-200 rounded" />

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 bg-gray-200 rounded" />
                <div className="space-y-1 flex-1">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 bg-gray-200 rounded" />
                <div className="space-y-1 flex-1">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 bg-gray-200 rounded" />
                <div className="space-y-1 flex-1">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            <div className="h-1 w-full bg-gray-200 rounded" />

            <div className="flex justify-between">
              <div className="rounded-lg border p-3 text-center flex-1">
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-6 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 animate-pulse">
          <CardHeader>
            <div className="h-10 w-full bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 grid-cols-2">
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
