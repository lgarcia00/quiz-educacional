// src/components/AdminRoute.jsx
import React from "react"
import { Navigate } from "react-router-dom"

export default function AdminRoute({ user, userData, isLoading, children }) {
  if (isLoading) {
    return <p className="p-4">Verificando permissões...</p>
  }

  const isSuperAdmin = user?.email === "00lorenzogarcia@gmail.com"
  const isAdmin = isSuperAdmin || userData?.isAdmin === true

  return user && isAdmin ? children : <Navigate to="/quizzes" />
}
