'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getNews } from '@/lib/api';
import { NewsArticle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const data = await getNews();
      const found = data.find(a => a.slug === slug);
      if (found) {
        setArticle(found);
        setRelatedArticles(data.filter(a => a.category === found.category && a.id !== found.id).slice(0, 3));
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto py-12 text-center">Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-slate-600 mb-8">The news article you are looking for does not exist.</p>
        <Link href="/news" className="text-emerald-700 hover:underline">
          &larr; Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/news" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to News
      </Link>
      
      <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10 mb-12">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 hover:bg-emerald-200">
            {article.category}
          </Badge>
          <span className="text-sm text-slate-500">{article.date}</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold mr-4">
            {article.author.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{article.author}</p>
            <p className="text-sm text-slate-500">Author</p>
          </div>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-6">
          {article.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">Related News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map(related => (
              <Card key={related.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{related.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/news/${related.slug}`} className="text-emerald-700 text-sm font-medium hover:underline">
                    Read Article &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
