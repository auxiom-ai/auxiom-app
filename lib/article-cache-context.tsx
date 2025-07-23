import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getArticles, getRecommendedArticles } from '@/lib/db/queries'
import { useAuth } from '@/lib/auth-context'
import { Article } from '@/app/dashboard/feed'

// Cache will expire after 60 minutes
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000

interface ArticleCacheContextType {
  articles: Article[]
  filteredArticles: Article[]
  setFilteredArticles: React.Dispatch<React.SetStateAction<Article[]>>
  loading: boolean
  refreshArticles: () => Promise<void>
  lastFetchTime: number | null
  isCacheExpired: () => boolean
  getCacheStatus: () => { lastFetchTime: string; ageInMinutes: number; isExpired: boolean } | 'No cache'
}

const ArticleCacheContext = createContext<ArticleCacheContextType | undefined>(undefined)

export function useArticleCache() {
  const context = useContext(ArticleCacheContext)
  if (context === undefined) {
    throw new Error('useArticleCache must be used within an ArticleCacheProvider')
  }
  return context
}

export function ArticleCacheProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  
  const isCacheExpired = () => {
    if (!lastFetchTime) return true
    const now = Date.now()
    return now - lastFetchTime > CACHE_EXPIRATION_TIME
  }
  
  const fetchArticles = async () => {
    try {
      setLoading(true)
      let articlesData: Article[] = []
      
      if (user && user.embedding) {
        articlesData = await getRecommendedArticles(user.embedding)
      } else {
        articlesData = await getArticles()
      }
      
      setArticles(articlesData as Article[])
      setFilteredArticles(articlesData as Article[])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error("Error fetching articles:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch articles when the user changes, when the app loads initially, or when the cache expires
  useEffect(() => {
    // Only fetch if we don't have articles, user has changed, or cache is expired
    if (articles.length === 0 || !lastFetchTime || isCacheExpired()) {
      fetchArticles()
    }
  }, [user])
  
  // Set up a timer to check for cache expiration
  useEffect(() => {
    // Check every minute if the cache should be refreshed when the app is active
    const cacheCheckInterval = setInterval(() => {
      if (isCacheExpired() && !loading) {
        fetchArticles()
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(cacheCheckInterval)
  }, [lastFetchTime, loading])

  // Function to manually refresh articles if needed
  const refreshArticles = async () => {
    await fetchArticles()
  }
  
  // Get cache status information
  const getCacheStatus = () => {
    if (!lastFetchTime) return 'No cache'
    
    const now = Date.now()
    const ageInMinutes = Math.floor((now - lastFetchTime) / 60000)
    const isExpired = isCacheExpired()
    
    return {
      lastFetchTime: new Date(lastFetchTime).toLocaleTimeString(),
      ageInMinutes,
      isExpired
    }
  }

  const value = {
    articles,
    filteredArticles,
    setFilteredArticles,
    loading,
    refreshArticles,
    lastFetchTime,
    isCacheExpired,
    getCacheStatus
  }

  return (
    <ArticleCacheContext.Provider value={value}>
      {children}
    </ArticleCacheContext.Provider>
  )
}
