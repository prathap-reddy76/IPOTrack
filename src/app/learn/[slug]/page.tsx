'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getLearnArticles } from '@/lib/api';
import { LearnArticle } from '@/types';
import { ArrowLeft, Clock, BookOpen, TrendingUp, Users, Building2, Store, Briefcase, ShoppingCart, BarChart3, Calculator, HelpCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const IconMap: Record<string, React.ElementType> = {
  BookOpen, TrendingUp, Users, Building2, Store, Briefcase, ShoppingCart, BarChart3, Calculator, HelpCircle, FileText
};

export default function LearnArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<LearnArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const data = await getLearnArticles();
      const found = data.find(a => a.slug === slug);
      if (found) {
        setArticle(found);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto py-12 text-center">Loading guide...</div>;
  }

  if (!article) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
        <p className="text-slate-600 mb-8">The learning material you are looking for does not exist.</p>
        <Link href="/learn" className="text-emerald-700 hover:underline">
          &larr; Back to Learning Center
        </Link>
      </div>
    );
  }

  const IconComponent = IconMap[article.icon] || BookOpen;

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link href="/learn" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-700 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Learning Center
      </Link>
      
      <article>
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
            {article.category}
          </Badge>
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="h-4 w-4 mr-1" />
            {article.readTime}
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-8 leading-tight flex items-center gap-4">
          <IconComponent className="h-10 w-10 text-emerald-700 dark:text-emerald-500 flex-shrink-0" />
          {article.title}
        </h1>
        
        <div className="bg-slate-50 dark:bg-slate-900 border-l-4 border-emerald-500 p-6 rounded-r-lg mb-10 text-lg text-slate-700 dark:text-slate-300 font-medium">
          {article.excerpt}
        </div>
        
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-50 prose-a:text-emerald-600">
          {article.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
