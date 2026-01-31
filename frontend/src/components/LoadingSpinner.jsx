export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
