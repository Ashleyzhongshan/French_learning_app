'use client'
import Link from 'next/link'
import { BookOpen, Brain, Award, ChevronRight, X, Play, Clock } from 'lucide-react'
import { useState } from 'react'

import modulesJson from '@/data/modules.json'
import articlesJson from '@/data/articles.json'

export default function HomePage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  
  const modules = (modulesJson as { modules: Array<{ id: string; title: string; description: string; articles: string[]; delfLevel: string; totalArticles: number }> }).modules.map(moduleData => ({
    id: moduleData.id,
    title: moduleData.title,
    description: moduleData.description,
    articleCount: moduleData.totalArticles,
    articles: moduleData.articles,
    delfLevel: moduleData.delfLevel
  }))

  const allArticles = (articlesJson as { articles: Array<{ id: string; title: string; level: string; delfLevel: string; topic: string }> }).articles

  const getModuleArticles = (moduleId: string) => {
    const moduleData = modules.find(m => m.id === moduleId)
    if (!moduleData) return []
    return moduleData.articles.map(articleId => 
      allArticles.find(article => article.id === articleId)
    ).filter(Boolean)
  }

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
              <Award size={16} />
              For your DELF Preparation
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
              Master French with
              <br />
              <span className="text-7xl">Confidence</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your French learning journey with interactive articles, 
              smart flashcards, and AI-powered pronunciation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/article/a1-01"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <Play size={24} />
                Start Learning Now
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/flashcards"
                className="group bg-white text-gray-800 px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <Brain size={24} />
                Review Flashcards
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of language learning with cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Reading</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Click any word to hear natural pronunciation and get instant translations. 
              Learn at your own pace with our smart reading system.
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
              Learn More <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
          
          <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Flashcards</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              AI-generated flashcards from your saved words. Spaced repetition 
              algorithm ensures you never forget what you&apos;ve learned.
            </p>
            <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
              Explore <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
          
          <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Progress</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Visual progress tracking with detailed analytics. See your vocabulary 
              growth and celebrate your achievements along the way.
            </p>
            <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
              Discover <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* DELF Levels Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your DELF Level
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your journey from beginner to advanced with structured learning paths
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module) => (
            <div key={module.id} className="group">
              <div 
                className={`bg-white rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2 ${
                  selectedModule === module.id 
                    ? 'border-blue-500 shadow-2xl transform scale-105' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      module.delfLevel === 'A1' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      module.delfLevel === 'A2' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      module.delfLevel === 'B1' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      'bg-gradient-to-br from-red-500 to-pink-500'
                    }`}>
                      <span className="text-white font-bold text-xl">{module.delfLevel}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{module.title}</h3>
                      <p className="text-gray-600">{module.articleCount} articles</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`transition-all duration-300 text-gray-400 ${
                      selectedModule === module.id ? 'rotate-90 text-blue-600' : 'group-hover:text-blue-600'
                    }`} 
                    size={24} 
                  />
                </div>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>~{module.articleCount * 3} minutes</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    module.delfLevel === 'A1' ? 'bg-green-100 text-green-800' :
                    module.delfLevel === 'A2' ? 'bg-blue-100 text-blue-800' :
                    module.delfLevel === 'B1' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedModule === module.id ? 'Click to close' : 'Click to explore'}
                  </span>
                </div>
              </div>

              {/* Article List */}
              {selectedModule === module.id && (
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-2xl font-bold text-gray-800">
                      Articles in {module.title}
                    </h4>
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {getModuleArticles(module.id).map((article, index) => (
                      article && (
                        <Link
                          key={article.id}
                          href={`/article/${article.id}`}
                          className="group block p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {article.title}
                                </h5>
                                <p className="text-sm text-gray-500 capitalize">
                                  {article.topic}
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master French?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of learners who have successfully passed their DELF exams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/article/a1-01"
              className="group bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Play size={24} />
              Start Your Journey
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/flashcards"
              className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-blue-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Brain size={24} />
              Review Flashcards
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}