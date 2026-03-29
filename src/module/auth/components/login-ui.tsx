import React, { useState } from 'react'
import { signIn } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false)


  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn.social({
        provider: 'github',
      })
    } catch (err) {
      console.error('Login Error: ', err)
      setIsLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4 font-sans">
      <Card className="w-full max-w-[500px]  border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        {/* Header - Overriding default shadcn padding with pt-8 px-8 */}
        <CardHeader className="px-8 pt-8 pb-6 space-y-3 text-center">
          <CardTitle className="text-[30px] font-semibold tracking-tight text-gray-900">
            SignIn to GitPReview
          </CardTitle>
          <CardDescription className="text-[20px]">
            Please login to continue
          </CardDescription>
        </CardHeader>

        {/* Content - Overriding default shadcn padding */}
        <CardContent className="px-8 pb-6 space-y-5">
          {/* Error Message Display */}
          {/* {error && (
            <div className="p-3 text-[20px] text-red-600 bg-red-50 rounded-md border border-red-100 text-center font-medium">
              {error}
            </div>
          )} */}

          {/* Social Auth (GitHub Only) */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full h-14 border-gray-200 text-gray-600 font-medium transition-colors"
            >
              {isLoading ? (
                <svg
                  className="animate-spin mr-2 h-4 w-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <img
                  src="/GitHub_Invertocat_Black.svg"
                  alt="GitHub"
                  className="mr-4 h-6 w-6"
                />
              )}
              <p className="font-bold text-[20px]">
                {isLoading ? 'Connecting...' : 'Continue with GitHub'}
              </p>
            </Button>
          </div>
        </CardContent>

        {/* Card Bottom Links */}
        <div className="text-center pb-5">
          <p className="text-[16px] text-gray-500">
            Don't have an account?{' '}
            <a
              href="#"
              className="font-medium text-[#6C47FF] hover:text-[#5839db] hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LoginUI
