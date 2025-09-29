'use client'
import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, ArrowLeft, ArrowRight, Volume2 } from 'lucide-react'
import { translateText, getCommonsAudioUrlForFrenchWord, pickPreferredFrenchVoice, createNaturalSpeechSettings } from '@/lib/utils'

interface Flashcard {
  id: number
  word: string
  createdAt: string
}

export default function FlashcardDeck() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)

  const loadFlashcards = () => {
    const saved = localStorage.getItem('flashcards')
    if (saved) setFlashcards(JSON.parse(saved))
    else setFlashcards([])
  }

  const fetchTranslation = useCallback(async (word: string) => {
    if (translations[word]) return
    setIsTranslating(true)
    try {
      const translation = await translateText(word, 'fr', 'en')
      setTranslations(prev => ({ ...prev, [word]: translation }))
            } catch {
              setTranslations(prev => ({ ...prev, [word]: 'Translation not available' }))
            }
    setIsTranslating(false)
  }, [translations])

  const pronounceWord = async () => {
    try {
      if (!('speechSynthesis' in window)) return
      const commons = await getCommonsAudioUrlForFrenchWord(currentWord)
      if (commons) {
        const audio = new Audio(commons)
        audio.play().catch(() => {})
        return
      }
      window.speechSynthesis.cancel()
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(currentWord)
        utterance.lang = 'fr-FR'
        
        // Apply natural speech settings for flashcards
        createNaturalSpeechSettings(utterance)
        
        // Select the best available voice
        const fr = pickPreferredFrenchVoice()
        if (fr) utterance.voice = fr
        
        // Add event listeners for better control
        utterance.onstart = () => {
          console.log('Flashcard pronunciation started with voice:', utterance.voice?.name)
        }
        
        utterance.onerror = (event) => {
          console.log('Flashcard pronunciation error:', event.error)
        }
        
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

  useEffect(() => {
    loadFlashcards()
    const onUpdate = () => {
      const prevWord = flashcards[currentIndex]?.word
      loadFlashcards()
      if (prevWord) {
        const idx = (JSON.parse(localStorage.getItem('flashcards') || '[]') as Flashcard[]).findIndex(fc => fc.word === prevWord)
        setCurrentIndex(idx >= 0 ? idx : 0)
      } else {
        setCurrentIndex(0)
      }
      setIsFlipped(false)
    }
    window.addEventListener('flashcards:updated', onUpdate)
    return () => window.removeEventListener('flashcards:updated', onUpdate)
  }, [currentIndex, flashcards])

  useEffect(() => {
    if (flashcards.length > 0 && isFlipped) {
      const currentCard = flashcards[currentIndex]
      const currentWord = currentCard?.word
      if (currentWord && !translations[currentWord]) {
        fetchTranslation(currentWord)
      }
    }
  }, [isFlipped, currentIndex, flashcards, translations, fetchTranslation])

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Flashcards Yet</h2>
        <p className="text-gray-600">
          Read some articles and save words to create flashcards!
        </p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  const currentWord = currentCard.word
  const currentTranslation = translations[currentWord]

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
    setIsFlipped(false)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setIsFlipped(false)
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Flashcard Review</h2>
      
      <p className="text-center text-gray-600 mb-6">
        Card {currentIndex + 1} of {flashcards.length}
      </p>

      <div className="relative mx-auto w-80 h-48 mb-8">
        <div
          className={`
            absolute inset-0 w-full h-full cursor-pointer
            transition-transform duration-700 transform-gpu
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={flipCard}
        >
          <div
            className="absolute inset-0 w-full h-full bg-blue-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="mb-2">{currentCard.word}</p>
              <button
                onClick={pronounceWord}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                aria-label="Pronounce word"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
          
          <div
            className="absolute inset-0 w-full h-full bg-green-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="text-center px-4">
              <p className="mb-1">English meaning:</p>
              <p className="font-bold text-2xl">
                {isTranslating ? 'Translating...' : currentTranslation || 'Click to translate'}
              </p>
              <button
                onClick={pronounceWord}
                className="mt-3 p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                aria-label="Pronounce word"
              >
                <Volume2 size={18} />
              </button>
              <p className="text-sm mt-4 opacity-80">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={prevCard}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          <ArrowLeft size={18} />
          Previous
        </button>
        
        <button
          onClick={flipCard}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <RotateCcw size={18} />
          Flip Card
        </button>
        
        <button
          onClick={nextCard}
          className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}


