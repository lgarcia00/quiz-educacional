import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const SUPER_ADMIN_EMAIL = '00lorenzogarcia@gmail.com'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [currentEmail, setCurrentEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentEmail(user.email)
      } else {
        navigate('/login')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
    }

    if (currentEmail === SUPER_ADMIN_EMAIL) {
      fetchUsers()
    }
  }, [currentEmail])

  const toggleAdmin = async (user) => {
    const ref = doc(db, 'users', user.id)
    await updateDoc(ref, { isAdmin: !user.isAdmin })
    setUsers(users.map(u => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u))
  }

  if (currentEmail !== SUPER_ADMIN_EMAIL) {
    return <div className="p-4 text-red-500">Acesso negado.</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gerenciar Usuários</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Admin</th>
            <th className="p-2 border">Ação</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.isAdmin ? 'Sim' : 'Não'}</td>
              <td className="p-2 border">
                <button
                  className={`px-2 py-1 text-white ${user.isAdmin ? 'bg-red-500' : 'bg-green-500'}`}
                  onClick={() => toggleAdmin(user)}
                >
                  {user.isAdmin ? 'Remover Admin' : 'Promover a Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => navigate('/quizzes')}
        className="mt-4 bg-gray-600 text-white px-4 py-2"
      >
        Voltar
      </button>
    </div>
  )
}
