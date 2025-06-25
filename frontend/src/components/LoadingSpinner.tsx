import { Music } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizeClasses[size]}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Music className={`text-indigo-600 ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'}`} />
        </div>
      </div>
      {message && (
        <p className={`mt-4 text-gray-600 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading your music...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  )
}
