import Link from 'next/link'
import { BookOpen, Brain, Award } from 'lucide-react'

export default function HomePage() {
  const modules = [
    {
      id: 'a1-1',
      title: 'A1.1 - Basic Introductions',
      description: 'Learn to introduce yourself in French',
      articleCount: 3
    },
    {
      id: 'a1-2', 
      title: 'A1.2 - Family & Friends',
      description: 'Talk about your family and friends',
      articleCount: 3
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Learn French Step by Step
        </h1>
        <p className="text-xl text-gray-600">
          Read articles, save words, and practice with flashcards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <BookOpen className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-lg font-semibold mb-2">Interactive Reading</h3>
          <p className="text-gray-600">Click any word to hear pronunciation</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <Brain className="mx-auto mb-4 text-green-600" size={48} />
          <h3 className="text-lg font-semibold mb-2">Smart Flashcards</h3>
          <p className="text-gray-600">Auto-created from words you save</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <Award className="mx-auto mb-4 text-purple-600" size={48} />
          <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600">See your vocabulary growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">{module.title}</h3>
            <p className="text-gray-600 mb-4">{module.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {module.articleCount} articles
              </span>
              <Link 
                href={module.id === 'a1-1' ? '/article/intro-1' : '/article/intro-2'}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Reading
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/flashcards"
          className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600 transition-colors"
        >
          Review Flashcards
        </Link>
      </div>
    </div>
  )
}
