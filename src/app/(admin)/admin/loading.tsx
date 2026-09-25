export default function AdminLoading() {
  return (
    <div className="flex-1 p-md md:p-lg max-w-container-max mx-auto w-full flex flex-col gap-lg items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-body-md animate-pulse">Memuat data dashboard...</p>
      </div>
    </div>
  );
}
