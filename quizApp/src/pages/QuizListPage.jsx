import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  Heart, User, LogOut, Settings, Play,
  Stethoscope, Shield, BookOpenCheck, ArrowLeft
} from 'lucide-react'
import './QuizListPage.css'

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([])
  const [resumos, setResumos] = useState([])
  const [userEmail, setUserEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email)

        const usersSnapshot = await getDocs(collection(db, 'users'))
        const currentUser = usersSnapshot.docs.find(doc => doc.id === user.email)
        if (currentUser?.data().isAdmin) {
          setIsAdmin(true)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      const quizSnapshot = await getDocs(collection(db, 'quizzes'))
      const quizData = quizSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setQuizzes(quizData)

      const resumoSnapshot = await getDocs(collection(db, 'resumos'))
      const resumoData = resumoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setResumos(resumoData)

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'))
  }

  const renderDashboardUser = () => (
    <div className="quiz-list-wrapper">
      <div className="content-card">
        <div className="content-header">
          <h2 className="content-title">O que você deseja fazer?</h2>
          <p className="content-subtitle">Escolha uma das opções abaixo</p>
        </div>

        <div className="quiz-grid">
          <div className="quiz-card" onClick={() => setCurrentView('quizzes')}>
            <div className="quiz-icon"><Play /></div>
            <h3 className="quiz-title">Fazer Simulados</h3>
            <p className="quiz-description">Testes rápidos com correção automática</p>
            <div className="quiz-footer">
              <span className="quiz-questions">{quizzes.length} quizzes</span>
              <Heart className="quiz-heart" />
            </div>
          </div>

          <div className="quiz-card" onClick={() => setCurrentView('resumos')}>
            <div className="quiz-icon"><BookOpenCheck /></div>
            <h3 className="quiz-title">Ler Resumos</h3>
            <p className="quiz-description">Conteúdos rápidos para revisão</p>
            <div className="quiz-footer">
              <span className="quiz-questions">{resumos.length} resumos</span>
              <Heart className="quiz-heart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderQuizList = () => (
    <div className="quiz-list-wrapper">
      <div className="content-card">
        <div className="content-header">
          <h2 className="content-title">Simulados disponíveis</h2>
          <p className="content-subtitle">Escolha um para começar</p>
        </div>

        <div className="quiz-grid">
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <Heart className="empty-icon" />
              <h3>Nenhum quiz disponível</h3>
              <p>Aguarde novos quizzes serem adicionados!</p>
            </div>
          ) : (
            [...quizzes]
              .sort((a, b) =>
                a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
              )
              .map(q => (
                <div key={q.id} className="quiz-card" onClick={() => navigate(`/quiz/${q.id}`)}>
                  <div className="quiz-icon"><Play /></div>
                  <h3 className="quiz-title">{q.title}</h3>
                  <p className="quiz-description">{q.description || 'Clique para iniciar o quiz'}</p>
                  <div className="quiz-footer">
                    <span className="quiz-questions">{q.questions?.length || 0} questões</span>
                    <Heart className="quiz-heart" />
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="action-buttons">
          <button className="secondary-btn" onClick={() => setCurrentView('dashboard')}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )

  const renderResumoList = () => {
    // Extrai o número inicial do título, ignorando emojis e espaços
    const extractNumber = (str) => {
      const match = str.match(/\d+/); // pega o primeiro número encontrado
      return match ? parseInt(match[0], 10) : 0; // se não achar, assume 0
    };

    return (
      <div className="quiz-list-wrapper">
        <div className="content-card">
          <div className="content-header">
            <h2 className="content-title">Resumos disponíveis</h2>
            <p className="content-subtitle">Leitura rápida para revisão</p>
          </div>

          <div className="quiz-grid">
            {resumos.length === 0 ? (
              <div className="empty-state">
                <Shield className="empty-icon" />
                <h3>Nenhum resumo disponível</h3>
                <p>Aguarde conteúdos serem adicionados!</p>
              </div>
            ) : (
              [...resumos]
                .sort((a, b) => extractNumber(a.title) - extractNumber(b.title))
                .map((r) => (
                  <div
                    key={r.id}
                    className="quiz-card resumo-card"
                    onClick={() => navigate(`/resumo/${r.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="quiz-icon">
                      <BookOpenCheck />
                    </div>
                    <h3 className="quiz-title">{r.title}</h3>
                    <p className="quiz-description">
                      {r.content.length > 200
                        ? r.content.slice(0, 200) + '...'
                        : r.content}
                    </p>
                    <div className="quiz-footer">
                      <span className="quiz-questions">Resumo</span>
                      <Heart className="quiz-heart" />
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="action-buttons">
            <button
              className="secondary-btn"
              onClick={() => setCurrentView('dashboard')}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="quiz-list-container">
      <div className="decorative-elements">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>

      {/* Cabeçalho fixo */}
      <div className="header-card">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Stethoscope className="stethoscope-icon" />
              <div className="heart-badge"><Heart className="heart-icon" /></div>
            </div>
            <div className="title-section">
              <h1 className="app-title">Enf+</h1>
              <p className="welcome-text">
                <User className="user-icon" /> Bem-vindo, {userEmail}
              </p>
            </div>
          </div>

          <div className="header-actions">
            {isAdmin && (
              <button className="admin-button" onClick={() => navigate('/admin')}>
                <Settings /> Painel Admin
              </button>
            )}
            <button className="logout-button" onClick={handleLogout}>
              <LogOut /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Views baseadas no estado atual */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      ) : currentView === 'dashboard' ? (
        renderDashboardUser()
      ) : currentView === 'quizzes' ? (
        renderQuizList()
      ) : (
        renderResumoList()
      )}
    </div>
  )
}
