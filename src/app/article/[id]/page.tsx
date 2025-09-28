import ArticleReader from '@/components/ArticleReader'
import articlesJson from '@/data/articles.json'

type Article = {
  id: string
  title: string
  content: string
  level: string
  estimatedTime: number
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const list = (articlesJson as { articles: Article[] }).articles
  const article = list.find(a => a.id === params.id)
  if (!article) {
    return <div className="max-w-3xl mx-auto p-6">Article not found</div>
  }
  return <ArticleReader article={article} />
}


