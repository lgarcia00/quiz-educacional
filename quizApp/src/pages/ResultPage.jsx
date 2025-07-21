import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Award, CheckCircle, XCircle, Lightbulb, Heart } from 'lucide-react'
import './ResultPage.css'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const questions = state?.questions ?? []
  const total = questions.length
  const userAnswers = state?.answers ?? []
  const [score, setScore] = useState(state?.score ?? 0)
  const [manualScore] = useState(0)
  const [manuallyCorrectedIndexes, setManuallyCorrectedIndexes] = useState([])

  const percentage = total > 0 ? Math.round(((score + manualScore) / total) * 100) : 0


  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Excelente! Você domina o assunto!", color: "text-green-600" }
    if (percentage >= 70) return { message: "Muito bom! Continue estudando!", color: "text-blue-600" }
    if (percentage >= 50) return { message: "Bom trabalho! Há espaço para melhorar.", color: "text-yellow-600" }
    return { message: "Continue estudando! Você vai conseguir!", color: "text-pink-600" }
  }

  const handleMarkCorrect = (index) => {
    setManuallyCorrectedIndexes(prev => {
      if (prev.includes(index)) {
        // Se já está marcado, não faz nada
        return prev
      }
      // Se não está marcado, adiciona o índice
      return [...prev, index]
    })

    setScore(prevScore => {
      // Se já tinha o índice, não aumenta score
      if (manuallyCorrectedIndexes.includes(index)) {
        return prevScore
      }
      return prevScore + 1
    })
  }




  const performanceData = getPerformanceMessage()

  return (
    <div className="result-container">
      {/* Elementos decorativos de fundo */}
      <div className="result-decorative-elements">
        <div className="result-bubble result-bubble-1"></div>
        <div className="result-bubble result-bubble-2"></div>
        <div className="result-bubble result-bubble-3"></div>
        <div className="result-bubble result-bubble-4"></div>
      </div>

      {/* Corações flutuantes */}
      <div className="floating-hearts">
        <Heart className="floating-heart heart-1" size={24} />
        <Heart className="floating-heart heart-2" size={20} />
        <Heart className="floating-heart heart-3" size={18} />
      </div>

      <div className="result-wrapper">
        {/* Header */}
        <div className="result-header-card">
          <div className="result-header-content">
            <div className="result-logo-section">
              <div className="result-logo-icon">
                <Award className="award-icon" />
                <div className="result-heart-badge">
                  <Heart className="heart-icon" fill="currentColor" />
                </div>
              </div>
              <div className="result-title-section">
                <h1 className="result-app-title">Resultados do Quiz</h1>
                <p className="result-subtitle">Veja seu desempenho detalhado</p>
              </div>
            </div>
            <button
              className="result-back-button"
              onClick={() => navigate('/quizzes')}
            >
              <ArrowLeft className="back-icon" />
              Voltar aos Quizzes
            </button>
          </div>
        </div>

        {/* Score Card */}
        <div className="score-card">
          <div className="score-content">
            <div className="score-badge">
              <div className="score-number">{score}</div>
              <div className="score-total">/{total}</div>
            </div>
            <div className="score-details">
              <h2 className="score-title">Sua Pontuação</h2>
              <div className="score-percentage">{percentage}%</div>
              <p className={`performance-message ${performanceData.color}`}>
                {performanceData.message}
              </p>
            </div>
          </div>
          <div className="score-progress">
            <div className="score-progress-bar">
              <div
                className="score-progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-review">
          <h3 className="review-title">Revisão das Questões</h3>

          {questions.map((q, i) => {
            const userAnswer = userAnswers[i]
            const isMultipleChoice = q.type !== 'essay'
            const isCorrect = isMultipleChoice ? userAnswer === q.correct : null

            return (
              <div key={i} className="question-review-card">

                <div className="question-review-header">
                  <div className="question-review-number">
                    <span>Questão {i + 1}</span>
                  </div>
                  {q.type === 'essay' ? (
                    <div className="question-result-badge essay-badge">
                      <Lightbulb className="result-icon" />
                      Dissertativa – autoavaliação
                    </div>
                  ) : (
                    <div className={`question-result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle className="result-icon" />
                          Correto
                        </>
                      ) : (
                        <>
                          <XCircle className="result-icon" />
                          Incorreto
                        </>
                      )}
                    </div>
                  )}

                </div>

                <div className="question-review-text">
                  {q.text}
                </div>

                {q.type === 'essay' && (
                  <div className="essay-review-section" style={{ color: '#333', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                    <p><strong>Sua resposta:</strong> {userAnswer?.value || 'Não respondida.'}</p>
                    <button
                      onClick={() => handleMarkCorrect(i)}
                      disabled={manuallyCorrectedIndexes.includes(i)}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: manuallyCorrectedIndexes.includes(i) ? '#9E9E9E' : '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: manuallyCorrectedIndexes.includes(i) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {manuallyCorrectedIndexes.includes(i) ? 'Marcada como correta' : 'Marcar como correta'}
                    </button>


                  </div>
                )}

                {q.type !== 'essay' && (
                  <div className="options-review">
                    {q.options.map((opt, j) => {
                      const selected = j === userAnswer
                      const correct = j === q.correct

                      return (
                        <div
                          key={j}
                          className={`
                          option-review
                          ${correct ? 'option-review-correct' : ''}
                          ${selected && !correct ? 'option-review-incorrect' : ''}
                          ${selected ? 'option-review-selected' : ''}
                        `}
                        >
                          <div className={`
                          option-review-letter
                          ${correct ? 'letter-correct' : ''}
                          ${selected && !correct ? 'letter-incorrect' : ''}
                        `}>
                            {String.fromCharCode(65 + j)}
                          </div>
                          <div className="option-review-text">
                            {opt}
                          </div>
                          <div className="option-review-indicators">
                            {correct && <CheckCircle className="option-check-icon" />}
                            {selected && !correct && <XCircle className="option-x-icon" />}
                            {selected && (
                              <span className="user-answer-label">
                                Sua resposta
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {q.type === 'essay' && q.expectedAnswer && (
                  <div className="explanation-review-card">
                    <div className="explanation-review-header">
                      <Lightbulb className="explanation-review-icon" />
                      <h4 className="explanation-review-title">Resposta esperada</h4>
                    </div>
                    <p className="explanation-review-text">{q.expectedAnswer}</p>
                  </div>
                )}

                {q.type !== 'essay' && q.explanation && (
                  <div className="explanation-review-card">
                    <div className="explanation-review-header">
                      <Lightbulb className="explanation-review-icon" />
                      <h4 className="explanation-review-title">Explicação</h4>
                    </div>
                    <p className="explanation-review-text">{q.explanation}</p>
                  </div>
                )}

              </div>
            )
          })}
            <div className="resumo-footer">
                <button className="back-button" onClick={() => navigate('/quizzes')}>
                    <ArrowLeft /> Voltar aos Quizzes
                </button>
                <Heart /> Estude com foco!
            </div>
        </div>
      </div>
    </div>
  )
}