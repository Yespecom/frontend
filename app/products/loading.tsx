import AdminLayout from "@/components/admin-layout"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-800"></div>
          <p className="text-gray-500 text-sm">Loading products...</p>
        </div>
      </div>
    </AdminLayout>
  )
}
