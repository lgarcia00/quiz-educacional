// LoginPage.jsx
import { useState } from 'react'
import { Heart, User, Lock, Eye, EyeOff, Stethoscope, X } from 'lucide-react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore' // ⬅️ novo
import { db } from '../firebase' // ⬅️ novo
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setError('')
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/quizzes')
    } catch (err) {
      setError('Erro ao entrar: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setError('')
    setIsLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)

      // Novo: salva o usuário no Firestore com papel 'user'
      await setDoc(doc(db, 'users', email), {
        email,
        role: 'user'
      })

      navigate('/quizzes')
    } catch (err) {
      setError('Erro ao registrar: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Elementos decorativos */}
      <div className="decorative-elements">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <Stethoscope className="stethoscope-icon" />
                <div className="heart-badge">
                  <Heart className="heart-icon" />
                </div>
              </div>
            </div>
            <h1 className="app-title">Enf+</h1>
            <p className="app-subtitle">
              {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta'}
            </p>
          </div>

          <div className="login-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <div className="error-icon">
                  <X />
                </div>
                <p>{error}</p>
              </div>
            )}

            <div className="button-group">
              <button
                onClick={isSignUp ? handleSignUp : handleSignIn}
                disabled={isLoading}
                className="primary-button"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" />
                      <span style={{ opacity: 0 }}>
                        {isSignUp ? 'Criar Conta' : 'Entrar'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Heart />
                      {isSignUp ? 'Criar Conta' : 'Entrar'}
                    </>
                  )}
                </div>
              </button>






              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="secondary-button"
              >
                {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
              </button>
            </div>
          </div>

          <div className="login-footer">
            <p>
              Feito para estudantes de enfermagem!
            </p>
          </div>
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
