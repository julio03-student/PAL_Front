import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )
}
