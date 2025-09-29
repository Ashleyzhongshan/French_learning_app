'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InteractiveWord from '@/components/InteractiveWord'
import { BookOpen, Clock, X, Languages, Play, Pause, Square } from 'lucide-react'
import { translateText, pickPreferredFrenchVoice, createNaturalSpeechSettings } from '@/lib/utils'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('savedWords')
    if (saved) setSavedWords(JSON.parse(saved))
  }, [])

  // Track audio progress
  useEffect(() => {
    if (isPlaying && audioDuration > 0 && !isDragging) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          const increment = 100 / (audioDuration / 100) // Update every 100ms
          return Math.min(prev + increment, 100)
        })
      }, 100)
      setProgressInterval(interval)
    } else if (progressInterval) {
      clearInterval(progressInterval)
      setProgressInterval(null)
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [isPlaying, audioDuration, isDragging, progressInterval])

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
      if (!flashcards.some((fc: { id: number; word: string; createdAt: string }) => fc.word.toLowerCase() === normalized)) {
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
      
      if (isPlaying) {
        // Pause current speech
        window.speechSynthesis.pause()
        setIsPlaying(false)
        setIsPaused(true)
        return
      }
      
      if (isPaused) {
        // Resume paused speech
        window.speechSynthesis.resume()
        setIsPlaying(true)
        setIsPaused(false)
        return
      }
      
      // Start new speech from current progress
      window.speechSynthesis.cancel()
      
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(article.content)
        utterance.lang = 'fr-FR'
        
        // Apply natural speech settings
        createNaturalSpeechSettings(utterance)
        
        // Select the best available voice
        const fr = pickPreferredFrenchVoice()
        if (fr) utterance.voice = fr
        
        // Store current utterance for control
        setCurrentUtterance(utterance)
        
        // Add event listeners for progress tracking
        utterance.onstart = () => {
          console.log('Speech started with voice:', utterance.voice?.name)
          setIsPlaying(true)
          setIsPaused(false)
          if (audioProgress === 0) {
            setAudioProgress(0)
          }
        }
        
        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          setAudioProgress(100)
          setCurrentUtterance(null)
        }
        
        utterance.onerror = (event) => {
          console.log('Speech error:', event.error)
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentUtterance(null)
        }
        
        // Estimate duration based on text length and speech rate
        const estimatedDuration = (article.content.length / 15) * 1000 // Rough estimate
        setAudioDuration(estimatedDuration)
        
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
            } catch {
              // noop
            }
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setAudioProgress(0)
      setCurrentUtterance(null)
      if (progressInterval) {
        clearInterval(progressInterval)
        setProgressInterval(null)
      }
    }
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    if (progressInterval) {
      clearInterval(progressInterval)
      setProgressInterval(null)
    }
    handleProgressUpdate(e)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressUpdate(e)
    }
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
    // Restart progress tracking if playing
    if (isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          const increment = 100 / (audioDuration / 100)
          return Math.min(prev + increment, 100)
        })
      }, 100)
      setProgressInterval(interval)
    }
  }

  const handleProgressUpdate = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    setAudioProgress(percentage * 100)
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
            } catch {
              // noop
            }
    }
  }, [])

  const exitArticle = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
            } catch {
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
        
        {/* Audio Progress Bar */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <button 
              onClick={readArticle}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'} Article
            </button>
            <button 
              onClick={stopAudio}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
              disabled={!isPlaying && audioProgress === 0}
            >
              <Square size={16} />
              Stop
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div 
              className="w-full bg-gray-300 rounded-full h-3 cursor-pointer hover:h-4 transition-all select-none"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
              onMouseLeave={handleProgressMouseUp}
            >
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-100 ease-out"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span>{Math.round(audioDuration / 1000 / 60)}:{(Math.round(audioDuration / 1000) % 60).toString().padStart(2, '0')}</span>
            </div>
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
          You&apos;ve saved {savedWords.length} words for flashcard review!
        </p>
      </div>
    </div>
  )
}


