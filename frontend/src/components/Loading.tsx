export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 text-primary animate-spin mx-auto mb-4">⏳</div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
