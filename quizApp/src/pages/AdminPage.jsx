import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Heart, User, LogOut, Settings, Plus, List, Edit, Trash2, Stethoscope, ArrowLeft, BookOpenCheck } from 'lucide-react'
import { setDoc, serverTimestamp } from 'firebase/firestore'
import './AdminPage.css'

export default function AdminPage() {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => ({
      type: 'multiple',
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: '',
      expectedAnswer: ""
    }))
  )
  const [quizzes, setQuizzes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'create', 'manage'
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingResumoId, setEditingResumoId] = useState(null)
  const [resumoTitle, setResumoTitle] = useState('')
  const [resumoContent, setResumoContent] = useState('')
  const [resumos, setResumos] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchResumos = async () => {
      const snapshot = await getDocs(collection(db, 'resumos'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setResumos(data)
    }
    fetchResumos()
  }, [])


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setUserEmail(user.email)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    getDocs(collection(db, 'quizzes')).then(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setQuizzes(data)
      setIsLoading(false)
    })
  }, [])

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login')
    })
  }

  const handleDeleteResumo = async (id) => {
    if (confirm('Tem certeza que deseja excluir este resumo?')) {
      await deleteDoc(doc(db, 'resumos', id))
      setResumos(resumos.filter(r => r.id !== id))
    }
  }

  // Essa é uma versão simples que só exibe o conteúdo no console.
  // Podemos expandir pra editar no mesmo formulário que cria:
  const handleEditResumo = (resumo) => {
    setEditingResumoId(resumo.id)
    setResumoTitle(resumo.title)
    setResumoContent(resumo.content)
    setCurrentView('create-resumo')
  }



  const handleAddOrUpdate = async () => {
    // salva apenas perguntas válidas
    const validQuestions = questions.filter(q =>
      q.text.trim() !== '' &&
      (
        (q.type === 'multiple' && q.options.every(opt => opt.trim() !== '')) ||
        (q.type === 'essay' && q.expectedAnswer.trim() !== '')
      )
    )


    if (validQuestions.length === 0) {
      alert('Crie pelo menos uma pergunta completa.')
      return
    }

    const quizData = {
      title,
      questions: validQuestions
    }

    if (editingId) {
      await updateDoc(doc(db, 'quizzes', editingId), quizData)
      alert('Quiz atualizado!')
      setEditingId(null)
    } else {
      const quizRef = await addDoc(collection(db, 'quizzes'), quizData)
      alert('Quiz criado: ' + quizRef.id)
    }

    // Reset form
    setTitle('')
    setQuestions(
      Array.from({ length: 10 }, () => ({
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: ''
      }))
    )

    // Refresh quizzes list
    const snapshot = await getDocs(collection(db, 'quizzes'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setQuizzes(data)

    setCurrentView('dashboard')
  }

  /*const handleCreateResumo = async () => {
    if (!resumoTitle.trim() || !resumoContent.trim()) {
      alert('Preencha título e conteúdo do resumo.')
      return
    }

    await addDoc(collection(db, 'resumos'), {
      title: resumoTitle,
      content: resumoContent,
      createdAt: new Date()
    })

    alert('Resumo criado com sucesso!')
    setResumoTitle('')
    setResumoContent('')
    setCurrentView('dashboard')
  }*/


  const handleEdit = (quiz) => {
    setEditingId(quiz.id)
    setTitle(quiz.title)
    setQuestions(
      quiz.questions.map(q => ({
        type: q.type || 'multiple', // <- FORÇA TIPO MÚLTIPLA SE AUSENTE
        text: q.text || '',
        options: q.options || ['', '', '', ''],
        correct: q.correct ?? 0,
        explanation: q.explanation || '',
        expectedAnswer: q.expectedAnswer || ''
      })).concat(
        Array.from({ length: 10 - quiz.questions.length }, () => ({
          type: 'multiple',
          text: '',
          options: ['', '', '', ''],
          correct: 0,
          explanation: '',
          expectedAnswer: ''
        }))
      )
    )

    setCurrentView('create')
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este quiz?')) {
      await deleteDoc(doc(db, 'quizzes', id))
      setQuizzes(quizzes.filter(q => q.id !== id))
    }
  }

  const handleAddOrUpdateResumo = async () => {
    if (!resumoTitle.trim() || !resumoContent.trim()) {
      alert('Preencha título e conteúdo.')
      return
    }

    const resumoData = {
      title: resumoTitle.trim(),
      content: resumoContent.trim(),
      createdAt: serverTimestamp(),
    }

    try {
      if (editingResumoId) {
        await setDoc(doc(db, 'resumos', editingResumoId), resumoData)
        alert('Resumo atualizado com sucesso!')
      } else {
        await addDoc(collection(db, 'resumos'), resumoData)
        alert('Resumo criado com sucesso!')
      }

      // Limpa formulário e estado
      setResumoTitle('')
      setResumoContent('')
      setEditingResumoId(null)

      // Atualiza lista
      const snapshot = await getDocs(collection(db, 'resumos'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setResumos(data)

      setCurrentView('dashboard')
    } catch (error) {
      console.error('Erro ao salvar resumo:', error)
      alert('Erro ao salvar resumo.')
    }
  }


  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions]
    const options = [...updated[qIndex].options]
    options[oIndex] = value
    updated[qIndex].options = options
    setQuestions(updated)
  }

  const handleCorrectAnswer = (qIndex, correctIndex) => {
    const updated = [...questions]
    updated[qIndex].correct = correctIndex
    setQuestions(updated)
  }

  const resetCreateForm = () => {
    setTitle('')
    setQuestions(
      Array.from({ length: 10 }, () => ({
        type: 'multiple', // Corrigido aqui!
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: '',
        expectedAnswer: ''
      }))
    )
    setEditingId(null)
  }


  // Dashboard View
  const renderDashboard = () => (
    <div className="admin-container">
      {/* Elementos decorativos */}
      <div className="admin-decorative-elements">
        <div className="admin-bubble admin-bubble-1"></div>
        <div className="admin-bubble admin-bubble-2"></div>
        <div className="admin-bubble admin-bubble-3"></div>
        <div className="admin-bubble admin-bubble-4"></div>
      </div>

      <div className="admin-wrapper">
        {/* Header Card */}
        <div className="header-card">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Stethoscope className="stethoscope-icon" />
                <div className="heart-badge">
                  <Settings className="heart-icon" />
                </div>
              </div>
              <div className="title-section">
                <h1 className="app-title">Painel Administrativo</h1>
                <p className="welcome-text">
                  <User className="user-icon" />
                  Administrador: {userEmail}
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="admin-button"
                onClick={() => navigate('/quizzes')}
              >
                <ArrowLeft />
                Voltar aos Quizzes
              </button>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="content-card">
          <div className="content-header">
            <h2 className="content-title">Gerenciamento de Quizzes</h2>
            <p className="content-subtitle">
              Escolha uma opção para gerenciar seus quizzes médicos
            </p>
          </div>

          {/* Admin Options Grid */}
          <div className="quiz-grid">
            <div
              className="quiz-card"
              onClick={() => {
                resetCreateForm()
                setCurrentView('create')
              }}
            >
              <div className="quiz-icon">
                <Plus />
              </div>
              <h3 className="quiz-title">Criar Novo Quiz</h3>
              <p className="quiz-description">
                Adicione um novo quiz com perguntas e respostas
              </p>
              <div className="quiz-footer">
                <span className="quiz-questions">
                  Até 10 questões
                </span>
                <Heart className="quiz-heart" />
              </div>
            </div>

            <div
              className="quiz-card"
              onClick={() => setCurrentView('manage')}
            >
              <div className="quiz-icon">
                <List />
              </div>
              <h3 className="quiz-title">Gerenciar Quizzes</h3>
              <p className="quiz-description">
                Edite ou exclua quizzes existentes
              </p>
              <div className="quiz-footer">
                <span className="quiz-questions">
                  {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} criado{quizzes.length !== 1 ? 's' : ''}
                </span>
                <Heart className="quiz-heart" />
              </div>
            </div>
            <div
              className="quiz-card"
              onClick={() => setCurrentView('resumo')}
            >
              <div className="quiz-icon">
                <Edit />
              </div>
              <h3 className="quiz-title">Criar Resumo</h3>
              <p className="quiz-description">
                Adicione um resumo para os usuários visualizarem
              </p>
              <div className="quiz-footer">
                <span className="quiz-questions">Novo conteúdo</span>
                <Heart className="quiz-heart" />
              </div>
            </div>
            <div
              className="quiz-card"
              onClick={() => setCurrentView('manage-resumos')}
            >
              <div className="quiz-icon">
                <BookOpenCheck />
              </div>
              <h3 className="quiz-title">Gerenciar Resumos</h3>
              <p className="quiz-description">
                Edite ou exclua resumos existentes
              </p>
              <div className="quiz-footer">
                <span className="quiz-questions">
                  {resumos.length} resumo{resumos.length !== 1 ? 's' : ''}
                </span>
                <Heart className="quiz-heart" />
              </div>
            </div>

          </div>
        </div>

        {/* Floating Hearts Animation */}
        <div className="floating-hearts">
          <div className="floating-heart heart-1">
            <Heart />
          </div>
          <div className="floating-heart heart-2">
            <Heart />
          </div>
          <div className="floating-heart heart-3">
            <Heart />
          </div>
          <div className="floating-heart heart-4">
            <Heart />
          </div>
        </div>
      </div>
    </div>
  )
  // Create Quiz View
  const renderCreateQuiz = () => (



    <div className="admin-container">
      {/* Elementos decorativos */}
      <div className="admin-decorative-elements">
        <div className="admin-bubble admin-bubble-1"></div>
        <div className="admin-bubble admin-bubble-2"></div>
        <div className="admin-bubble admin-bubble-3"></div>
        <div className="admin-bubble admin-bubble-4"></div>
      </div>

      <div className="admin-wrapper">
        <div className="admin-card">
          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-title">
              {editingId ? 'Editar Quiz' : 'Criar Novo Quiz'}
            </h1>
            <p className="admin-subtitle">
              {editingId ? 'Atualize as informações do quiz' : 'Crie e gerencie suas perguntas médicas'}
            </p>
          </div>

          {/* Campo título do quiz */}
          <div className="quiz-title-section">
            <label className="quiz-title-label">Título do Quiz</label>
            <input
              className="quiz-title-input"
              placeholder="Digite o título do seu quiz..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Seção de perguntas */}
          <div className="questions-section">
            {questions.map((q, i) => (
              <div key={i} className="question-card">
                <div className="question-header">
                  <div className="question-number">{i + 1}</div>
                  <span>Pergunta {i + 1}</span>
                </div>



                <input
                  className="question-input"
                  placeholder="Digite o texto da pergunta..."
                  value={q.text}
                  onChange={e => handleQuestionChange(i, 'text', e.target.value)}
                />

                <div className="question-type-selector">
                  <label>Tipo da Pergunta:</label>
                  <select
                    value={q.type}
                    onChange={e => handleQuestionChange(i, 'type', e.target.value)}
                  >
                    <option value="multiple">Múltipla Escolha</option>
                    <option value="essay">Dissertativa</option>
                  </select>
                </div>


                {q.type === 'multiple' ? (
                  <div className="options-container">
                    {q.options.map((opt, j) => (
                      <div key={j} className="option-row">
                        <input
                          className="option-input"
                          placeholder={`Opção ${j + 1}`}
                          value={opt}
                          onChange={e => handleOptionChange(i, j, e.target.value)}
                        />
                        <div className="correct-option">
                          <input
                            className="radio-input"
                            type="radio"
                            id={`q${i}-opt${j}`}
                            name={`question-${i}`}
                            checked={q.correct === j}
                            onChange={() => handleCorrectAnswer(i, j)}
                          />
                          <label htmlFor={`q${i}-opt${j}`} className="radio-label">
                            Correta
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="essay-answer-container">
                    <label>Resposta Esperada</label>
                    <textarea
                      className="explanation-textarea"
                      placeholder="Digite a resposta que você espera do usuário..."
                      value={q.expectedAnswer}
                      onChange={e => handleQuestionChange(i, 'expectedAnswer', e.target.value)}
                    />
                  </div>
                )}

                {q.type === 'multiple' && (
                  <textarea
                    className="explanation-textarea"
                    placeholder="Explicação da resposta correta (opcional)..."
                    value={q.explanation || ''}
                    onChange={e => handleQuestionChange(i, 'explanation', e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="action-buttons">
            <button className="primary-btn" onClick={handleAddOrUpdate}>
              {editingId ? 'Atualizar Quiz' : 'Criar Quiz'}
            </button>
            <button
              className="secondary-btn"
              onClick={() => setCurrentView('dashboard')}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )



  // Manage Quizzes View
  const renderManageQuizzes = () => (
    <div className="admin-container">
      {/* Elementos decorativos */}
      <div className="admin-decorative-elements">
        <div className="admin-bubble admin-bubble-1"></div>
        <div className="admin-bubble admin-bubble-2"></div>
        <div className="admin-bubble admin-bubble-3"></div>
        <div className="admin-bubble admin-bubble-4"></div>
      </div>

      <div className="admin-wrapper">
        <div className="admin-card">
          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-title">Gerenciar Quizzes</h1>
            <p className="admin-subtitle">Edite ou exclua seus quizzes existentes</p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando quizzes...</p>
            </div>
          ) : (
            /* Lista de quizzes criados */
            <div className="quizzes-section">
              <div className="quizzes-list">
                {quizzes.length === 0 ? (
                  <div className="empty-state">
                    <Heart className="empty-icon" />
                    <h3>Nenhum quiz encontrado</h3>
                    <p>Crie seu primeiro quiz para começar!</p>
                  </div>
                ) : (
                  [...quizzes]
                    .sort((a, b) =>
                      a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
                    )
                    .map(quiz => (
                      <div key={quiz.id} className="quiz-item">
                        <div className="quiz-info">
                          <span className="quiz-name">{quiz.title}</span>
                          <span className="quiz-questions-count">
                            {quiz.questions?.length || 0} questões
                          </span>
                        </div>
                        <div className="quiz-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(quiz)}
                            title="Editar quiz"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(quiz.id)}
                            title="Excluir quiz"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

            </div>
          )}

          {/* Botão voltar */}
          <div className="action-buttons">
            <button
              className="secondary-btn"
              onClick={() => setCurrentView('dashboard')}
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )

 const renderManageResumos = () => {
  // Função para extrair o número do título
  const extractNumber = (str) => {
    const match = str.match(/\d+/); // extrai o primeiro número
    return match ? parseInt(match[0], 10) : 0;
  };

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="admin-card">
          <div className="admin-header">
            <h1 className="admin-title">Gerenciar Resumos</h1>
            <p className="admin-subtitle">Edite ou exclua os resumos criados</p>
          </div>

          <div className="quizzes-section">
            <div className="quizzes-list">
              {resumos.length === 0 ? (
                <div className="empty-state">
                  <Heart className="empty-icon" />
                  <h3>Nenhum resumo encontrado</h3>
                  <p>Adicione novos resumos no painel</p>
                </div>
              ) : (
                [...resumos]
                  .sort((a, b) => extractNumber(a.title) - extractNumber(b.title))
                  .map((resumo) => (
                    <div key={resumo.id} className="quiz-item">
                      <div className="quiz-info">
                        <span className="quiz-name">{resumo.title}</span>
                        <span className="quiz-questions-count">
                          {resumo.content.length} caracteres
                        </span>
                      </div>
                      <div className="quiz-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditResumo(resumo)}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteResumo(resumo.id)}
                        >
                          <Trash2 size={16} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => setCurrentView('dashboard')}>
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




  const renderCreateResumo = () => (
    <div className="admin-container">
      <div className="admin-wrapper">
        <div className="admin-card">
          <div className="admin-header">
            <h1 className="admin-title">
              {editingResumoId ? 'Editar Resumo' : 'Criar Novo Resumo'}
            </h1>
            <p className="admin-subtitle">
              {editingResumoId ? 'Atualize o conteúdo do resumo' : 'Adicione um novo material de estudo'}
            </p>
          </div>

          <div className="quiz-title-section">
            <label className="quiz-title-label">Título do Resumo</label>
            <input
              className="quiz-title-input"
              placeholder="Digite o título do resumo..."
              value={resumoTitle}
              onChange={(e) => setResumoTitle(e.target.value)}
            />
          </div>

          <div className="questions-section">
            <label className="quiz-title-label">Conteúdo do Resumo</label>
            <textarea
              className="explanation-textarea"
              placeholder="Digite o conteúdo do resumo..."
              rows={10}
              value={resumoContent}
              onChange={(e) => setResumoContent(e.target.value)}
            />
          </div>

          <div className="action-buttons">
            <button className="primary-btn" onClick={handleAddOrUpdateResumo}>
              {editingResumoId ? 'Atualizar Resumo' : 'Criar Resumo'}
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                setResumoTitle('')
                setResumoContent('')
                setEditingResumoId(null)
                setCurrentView('dashboard')
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )



  // Main render function
  switch (currentView) {
    case 'create':
      return renderCreateQuiz()
    case 'manage':
      return renderManageQuizzes()
    default:
      return renderDashboard()
    case 'resumo':
      return renderCreateResumo()
    case 'manage-resumos':
      return renderManageResumos()
    case 'create-resumo':
      return renderCreateResumo()

  }
}