'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InteractiveWord from '@/components/InteractiveWord'
import { BookOpen, Clock, Volume2, X, Languages } from 'lucide-react'
import { translateText, pickPreferredFrenchVoice } from '@/lib/utils'

interface Article {
  id: string
  title: string
  content: string
  level: string
  estimatedTime: number
}

export default function ArticleReader({ article }: { article: Article }) {
  const [savedWords, setSavedWords] = useState<string[]>([])
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)
  const router = useRouter()
  const [isTranslating, setIsTranslating] = useState(false)
  const [translation, setTranslation] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('savedWords')
    if (saved) setSavedWords(JSON.parse(saved))
  }, [])

  const toggleSaveWord = (word: string) => {
    const normalized = word.toLowerCase()
    if (savedWords.includes(normalized)) {
      const newSaved = savedWords.filter(w => w !== normalized)
      setSavedWords(newSaved)
      localStorage.setItem('savedWords', JSON.stringify(newSaved))

      const existing: Array<{ id: number; word: string; createdAt: string }> = JSON.parse(localStorage.getItem('flashcards') || '[]')
      const filtered = existing.filter(fc => fc.word.toLowerCase() !== normalized)
      localStorage.setItem('flashcards', JSON.stringify(filtered))
    } else {
      const newSavedWords = [...savedWords, normalized]
      setSavedWords(newSavedWords)
      localStorage.setItem('savedWords', JSON.stringify(newSavedWords))

      const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]')
      if (!flashcards.some((fc: any) => fc.word.toLowerCase() === normalized)) {
        flashcards.push({
          id: Date.now(),
          word: normalized,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('flashcards', JSON.stringify(flashcards))
      }
    }
    window.dispatchEvent(new Event('flashcards:updated'))
  }

  const readArticle = () => {
    try {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(article.content)
        utterance.lang = 'fr-FR'
        utterance.rate = 0.95
        const fr = pickPreferredFrenchVoice()
        if (fr) utterance.voice = fr
        window.speechSynthesis.speak(utterance)
      }
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) {
        const onVoices = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
          speak()
        }
        window.speechSynthesis.addEventListener('voiceschanged', onVoices)
      } else {
        speak()
      }
    } catch (_) {
      // noop
    }
  }

  const translateArticle = async () => {
    if (translation) {
      setTranslation('')
      return
    }
    setIsTranslating(true)
    const t = await translateText(article.content, 'fr', 'en')
    setTranslation(t)
    setIsTranslating(false)
  }

  useEffect(() => {
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch (_) {
        // noop
      }
    }
  }, [])

  const exitArticle = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } catch (_) {
      // noop
    }
    router.push('/')
  }

  const renderInteractiveText = (text: string) => {
    return text.split(' ').map((word, index) => (
      <InteractiveWord 
        key={index}
        word={word}
        onToggleSave={toggleSaveWord}
        isSaved={savedWords.includes(word.replace(/[.,!?;:]/g, '').toLowerCase())}
        isActive={activeWordIndex === index}
        onActivate={() => setActiveWordIndex(prev => (prev === index ? null : index))}
      />
    ))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {article.level}
          </span>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span>{article.estimatedTime} min read</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={readArticle}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Volume2 size={18} />
              Read Article Aloud
            </button>
            <button
              onClick={translateArticle}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Languages size={18} />
              {translation ? 'Hide English' : isTranslating ? 'Translating…' : 'Show English'}
            </button>
            <button 
              onClick={exitArticle}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              aria-label="Exit article"
            >
              <X size={18} />
              Exit
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl leading-relaxed text-gray-800 select-none">
          {renderInteractiveText(article.content)}
        </p>
        {translation && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-gray-800">
            <p className="text-base leading-relaxed">{translation}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <BookOpen className="inline mr-2" size={18} />
          You've saved {savedWords.length} words for flashcard review!
        </p>
      </div>
    </div>
  )
}


