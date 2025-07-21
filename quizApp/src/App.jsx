import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import QuizListPage from './pages/QuizListPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'
import AdminRoute from './components/AdminRoute'
import ResumoPage from './pages/ResumoPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const docRef = doc(db, "users", user.email)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUserData(docSnap.data())
        } else {
          setUserData(null)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <p className="p-4">Carregando autenticação...</p>

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/admin"
        element={
          <AdminRoute user={user} userData={userData} isLoading={loading}>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route path="/quizzes" element={user ? <QuizListPage /> : <Navigate to="/login" />} />
      <Route path="/quiz/:id" element={user ? <QuizPage /> : <Navigate to="/login" />} />
      <Route path="/result" element={user ? <ResultPage /> : <Navigate to="/login" />} />
      <Route path="/resumo/:id" element={user ? <ResumoPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
