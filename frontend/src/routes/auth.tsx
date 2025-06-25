import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { LogIn, UserPlus, Music, Eye, EyeOff } from 'lucide-react'
import { authApi, type LoginRequest, type RegisterRequest } from '../services/api'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: ''
  })

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!registerData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!registerData.password) {
      newErrors.password = 'Password is required'
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) return
    
    setLoading(true)
    setErrors({})
    
    try {
      await authApi.login(loginData)
      navigate({ to: '/' })
    } catch (error: any) {
      console.error('Login error:', error)
      setErrors({ 
        general: error.response?.data?.error || 'Login failed. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRegisterForm()) return
    
    setLoading(true)
    setErrors({})
    
    try {
      await authApi.register(registerData)
      // Auto-login after successful registration
      await authApi.login({
        email: registerData.email,
        password: registerData.password
      })
      navigate({ to: '/' })
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({ 
        general: error.response?.data?.error || 'Registration failed. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (isLogin) {
      setLoginData(prev => ({ ...prev, [field]: value }))
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setLoginData({ email: '', password: '' })
    setRegisterData({ full_name: '', email: '', password: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Gotify</h1>
          </div>
          <h2 className="text-xl text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin 
              ? 'Sign in to access your music collection' 
              : 'Join us to start your music journey'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={isLogin ? loginData.email : registerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={isLogin ? loginData.password : registerData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="h-5 w-5" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={toggleMode}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
