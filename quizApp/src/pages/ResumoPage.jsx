import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ArrowLeft, BookOpenCheck, Heart } from 'lucide-react'
import './ResumoPage.css'

export default function ResumoPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [resumo, setResumo] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResumo = async () => {
            const docRef = doc(db, 'resumos', id)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setResumo(docSnap.data())
            }
            setLoading(false)
        }
        fetchResumo()
    }, [id])

    if (loading) {
        return <div className="loading-container">Carregando resumo...</div>
    }

    if (!resumo) {
        return <div className="not-found">Resumo não encontrado.</div>
    }

    return (
        <div className="resumo-page-container">
            <div className="resumo-glow-top"></div>
            <div className="resumo-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft /> Voltar
                </button>
                <h1 className="resumo-title">
                    <BookOpenCheck /> {resumo.title}
                </h1>
            </div>
            <div className="resumo-content" style={{ color: '#000' }}>
                <h2 style={{ marginBottom: '1rem' }}>{resumo.title}</h2>
                <div dangerouslySetInnerHTML={{
                    __html: resumo.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                }} />
            </div>

            <div className="resumo-footer">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft /> Voltar
                </button>
                <Heart /> Estude com foco!
            </div>
        </div>
    )
}
