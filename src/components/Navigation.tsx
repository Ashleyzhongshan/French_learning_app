import Link from 'next/link'
import { Home, BookOpen, Brain } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          FrenchApp
        </Link>
        
        <div className="flex gap-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <Home size={18} />
            Home
          </Link>
          
          <Link href="/article/intro-1" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <BookOpen size={18} />
            Read
          </Link>
          
          <Link href="/flashcards" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <Brain size={18} />
            Flashcards
          </Link>
        </div>
      </div>
    </nav>
  )
}


