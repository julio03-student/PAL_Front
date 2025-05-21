import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-lg text-gray-600">Cargando exámenes...</p>
    </div>
  )
}
