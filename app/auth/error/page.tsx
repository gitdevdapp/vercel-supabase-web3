import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Code error: {params.error}
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                    <p className="font-medium mb-2">🔍 Debug Information:</p>
                    <p>• Time: {new Date().toLocaleString()}</p>
                    <p>• This error has been logged for investigation</p>
                    <p>• Check console for additional details</p>
                  </div>
                  <div className="text-xs text-blue-600">
                    <p>💡 Check Vercel logs for detailed error information</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unspecified error occurred.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
