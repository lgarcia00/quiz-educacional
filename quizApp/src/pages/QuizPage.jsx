import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Heart, ArrowLeft, Clock, Award, CheckCircle, Stethoscope } from 'lucide-react'
import './QuizPage.css'

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [essayAnswer, setEssayAnswer] = useState('')

  useEffect(() => {
    getDoc(doc(db, 'quizzes', id)).then(snapshot => {
      if (snapshot.exists()) {
        setQuiz(snapshot.data())
      } else {
        navigate('/quizzes')
      }
    })
  }, [id, navigate])

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="quiz-decorative-elements">
          <div className="quiz-bubble quiz-bubble-1"></div>
          <div className="quiz-bubble quiz-bubble-2"></div>
          <div className="quiz-bubble quiz-bubble-3"></div>
        </div>

        <div className="quiz-wrapper">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">Carregando quiz...</p>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[current]
  const progress = ((current + 1) / quiz.questions.length) * 100

  const handleOptionSelect = (optionIndex) => {
    if (isAnswered) return
    setSelectedOption(optionIndex)
    setIsAnswered(true)
    setShowExplanation(true)
    const isCorrect = optionIndex === question.correct
    if (isCorrect) {
      setScore(score + 1)
    }
    setAnswers([...answers, optionIndex])
  }

  const handleNext = () => {
    const isLast = current + 1 >= quiz.questions.length
    if (question.type === 'essay') {
      setAnswers([...answers, { type: 'essay', value: essayAnswer, isCorrect: null }])
    }
    if (isLast) {
      navigate('/result', {
        state: {
          score,
          total: quiz.questions.filter(q => q.type !== 'essay').length,
          questions: quiz.questions,
          answers: question.type === 'essay'
            ? [...answers, { type: 'essay', value: essayAnswer, isCorrect: null }]
            : [...answers, selectedOption],
          quizTitle: quiz.title
        }
      })
    } else {
      setCurrent(current + 1)
      setSelectedOption(null)
      setShowExplanation(false)
      setIsAnswered(false)
      setEssayAnswer('')
    }
  }

  return (
    <div className="quiz-container">
      <div className="quiz-decorative-elements">
        <div className="quiz-bubble quiz-bubble-1"></div>
        <div className="quiz-bubble quiz-bubble-2"></div>
        <div className="quiz-bubble quiz-bubble-3"></div>
        <div className="quiz-bubble quiz-bubble-4"></div>
      </div>

      <div className="quiz-wrapper">
        <div className="quiz-header-card">
          <div className="quiz-header-content">
            <div className="quiz-logo-section">
              <div className="quiz-logo-icon">
                <Stethoscope className="stethoscope-icon" />
                <div className="quiz-heart-badge">
                  <Heart className="heart-icon" />
                </div>
              </div>
              <div className="quiz-title-section">
                <h1 className="quiz-app-title">{quiz.title}</h1>
                <p className="quiz-subtitle">
                  Pergunta {current + 1} de {quiz.questions.length}
                </p>
              </div>
            </div>
            <div className="quiz-header-actions">
              <button className="quiz-back-button" onClick={() => navigate('/quizzes')}>
                <ArrowLeft /> Voltar
              </button>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-info">
            <div className="progress-stats">
              <div className="stat-item">
                <Clock className="stat-icon" />
                <span className="stat-text">Questão {current + 1}/{quiz.questions.length}</span>
              </div>
              <div className="stat-item">
                <Award className="stat-icon" />
                <span className="stat-text">Pontuação: {score}</span>
              </div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="question-card">
          <div className="question-content">
            <div className="question-number-badge">
              <span>{current + 1}</span>
            </div>
            <h2 className="question-text">{question.text}</h2>
          </div>

          {question.type === 'multiple' && (
            <div className="options-grid">
              {question.options.map((option, index) => {
                let optionClass = "option-button"
                if (isAnswered) {
                  if (index === question.correct) {
                    optionClass += " option-correct"
                  } else if (index === selectedOption && index !== question.correct) {
                    optionClass += " option-incorrect"
                  } else {
                    optionClass += " option-disabled"
                  }
                } else {
                  optionClass += " option-available"
                }
                return (
                  <button
                    key={index}
                    className={optionClass}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                  >
                    <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                    <span className="option-text">{option}</span>
                    {isAnswered && index === question.correct && <CheckCircle className="option-check-icon" />}
                  </button>
                )
              })}
            </div>
          )}

          {question.type === 'essay' && (
            <div className="essay-question">
              <textarea
  style={{
    width: '100%',
    minHeight: '8rem',
    padding: '1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '1rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    background: '#ffffff',
    color: '#374151',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    resize: 'vertical',
    boxSizing: 'border-box',
    display: 'block',
    margin: '0 auto',
  }}
  placeholder="Digite sua resposta aqui..."
  value={essayAnswer}
  onChange={(e) => setEssayAnswer(e.target.value)}
></textarea>


            </div>
          )}

          {showExplanation && question.explanation && question.type === 'multiple' && (
            <div className="explanation-card">
              <div className="explanation-header">
                <CheckCircle className="explanation-icon" />
                <h3 className="explanation-title">Explicação</h3>
              </div>
              <p className="explanation-text">{question.explanation}</p>
            </div>
          )}

          {(isAnswered || question.type === 'essay') && (
            <div className="next-button-container">
              <button className="next-button" onClick={handleNext}>
                {current + 1 >= quiz.questions.length ? 'Ver Resultado' : 'Próxima Pergunta'}
                <Heart className="next-button-icon" />
              </button>
            </div>
          )}
        </div>

        <div className="floating-hearts">
          <div className="floating-heart heart-1"><Heart /></div>
          <div className="floating-heart heart-2"><Heart /></div>
          <div className="floating-heart heart-3"><Heart /></div>
        </div>
      </div>
    </div>
  )
}
