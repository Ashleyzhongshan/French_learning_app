'use client'
import { useState, useEffect } from 'react'
import { RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react'
import vocabularyJson from '@/data/vocabulary.json'

interface Flashcard {
  id: number
  word: string
  createdAt: string
}

export default function FlashcardDeck() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  type VocabularyEntry = {
    english: string
    pronunciation: string
    example: string
  }
  const vocabulary = (vocabularyJson as { vocabulary: Record<string, VocabularyEntry> }).vocabulary

  const cleanWord = (word: string) => word.replace(/[.,!?;:]/g, '').toLowerCase()

  const loadFlashcards = () => {
    const saved = localStorage.getItem('flashcards')
    if (saved) setFlashcards(JSON.parse(saved))
    else setFlashcards([])
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
  }, [])

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
  const currentKey = cleanWord(currentCard.word)
  const currentTranslation = vocabulary[currentKey]

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
            {currentCard.word}
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
                {currentTranslation ? currentTranslation.english : 'No translation found'}
              </p>
              {currentTranslation && (
                <>
                  <p className="text-sm mt-3 opacity-90">Pronunciation: {currentTranslation.pronunciation}</p>
                  <p className="text-sm mt-2 opacity-90 italic">Example: {currentTranslation.example}</p>
                </>
              )}
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


