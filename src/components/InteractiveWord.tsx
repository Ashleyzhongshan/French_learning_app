'use client'
import { useState } from 'react'
import { Volume2, Plus, Check, Languages } from 'lucide-react'
import { translateText, getCommonsAudioUrlForFrenchWord, pickPreferredFrenchVoice, createNaturalSpeechSettings } from '@/lib/utils'

interface InteractiveWordProps {
  word: string
  onToggleSave: (word: string) => void
  isSaved: boolean
  isActive: boolean
  onActivate: () => void
}

export default function InteractiveWord({ word, onToggleSave, isSaved, isActive, onActivate }: InteractiveWordProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [, setIsTranslating] = useState(false)
  const [translation, setTranslation] = useState<string>('')
  
  const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase()
  
  const pronounceWord = async () => {
    try {
      if (!('speechSynthesis' in window)) return
      const commons = await getCommonsAudioUrlForFrenchWord(cleanWord)
      if (commons) {
        const audio = new Audio(commons)
        audio.play().catch(() => {})
        return
      }
      window.speechSynthesis.cancel()
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(cleanWord)
        utterance.lang = 'fr-FR'
        
        // Apply natural speech settings for individual words
        createNaturalSpeechSettings(utterance)
        
        // Select the best available voice
        const fr = pickPreferredFrenchVoice()
        if (fr) utterance.voice = fr
        
        // Add event listeners for better control
        utterance.onstart = () => {
          console.log('Word pronunciation started with voice:', utterance.voice?.name)
        }
        
        utterance.onerror = (event) => {
          console.log('Word pronunciation error:', event.error)
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

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSave(cleanWord)
  }

  const fetchTranslation = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (translation) {
      setTranslation('')
      return
    }
    setIsTranslating(true)
    const t = await translateText(cleanWord, 'fr', 'en')
    setTranslation(t)
    setIsTranslating(false)
  }

  return (
    <span className="relative inline-block">
      <span
        className={`
          cursor-pointer px-1 py-0.5 rounded transition-all duration-200
          hover:bg-blue-100 hover:text-blue-800
          ${isSaved ? 'bg-green-100 text-green-800' : ''}
        `}
        onClick={() => {
          setShowTooltip(!isActive || !showTooltip)
          onActivate()
        }}
      >
        {word}
      </span>
      
      {isActive && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg min-w-48">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{cleanWord}</span>
              <div className="flex gap-2">
                <button
                  onClick={pronounceWord}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Volume2 size={14} />
                </button>
                <button
                  onClick={fetchTranslation}
                  className="p-1 hover:bg-gray-700 rounded"
                  aria-label="Translate to English"
                >
                  <Languages size={14} />
                </button>
                <button
                  onClick={handleSave}
                  className={`p-1 rounded ${
                    isSaved 
                      ? 'text-green-400 hover:bg-gray-700' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {isSaved ? <Check size={14} /> : <Plus size={14} />}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              {translation ? `English: ${translation}` : 'Click audio to hear, translate for English'}
            </p>
          </div>
        </div>
      )}
    </span>
  )
}


