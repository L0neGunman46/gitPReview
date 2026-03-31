import React from 'react'
import { signOut } from '#/lib/auth-client'
import { redirect, useRouter, useNavigate } from '@tanstack/react-router'

const Logout = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string | undefined
}) => {
  // const router = useRouter();
  const navigate = useNavigate()
  return (
    <span
      className={className}
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate({ to: '/auth/login' })
            },
          },
        })
      }
    >
      {children}
    </span>
  )
}

export default Logout
