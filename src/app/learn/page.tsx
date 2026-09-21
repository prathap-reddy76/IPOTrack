'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLearnArticles } from '@/lib/api';
import { LearnArticle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, TrendingUp, Users, Building2, Store, Briefcase, ShoppingCart, BarChart3, Calculator, HelpCircle, FileText } from 'lucide-react';

const IconMap: Record<string, React.ElementType> = {
  BookOpen, TrendingUp, Users, Building2, Store, Briefcase, ShoppingCart, BarChart3, Calculator, HelpCircle, FileText
};

export default function LearnPage() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getLearnArticles();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (category !== 'All') {
      result = result.filter(a => a.category === category);
    }
    if (search) {
      result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [search, category, articles]);

  const categories = ['All', 'Basics', 'GMP', 'Analysis', 'Strategies', 'FAQ'];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50">Learn About IPOs</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Simple guides to help you invest better.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Search guides..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900"
          />
        </div>
        <Tabs defaultValue="All" value={category} onValueChange={setCategory} className="w-full overflow-auto md:w-auto">
          <TabsList className="inline-flex min-w-max">
            {categories.map(c => (
              <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => {
          const IconComponent = IconMap[article.icon] || BookOpen;
          
          return (
            <Link key={article.id} href={`/learn/${article.slug}`}>
              <Card className="h-full hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {article.excerpt}
                  </CardDescription>
                  <div className="flex items-center text-sm font-medium text-slate-500 mt-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {article.readTime}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No guides found</h3>
          <p className="text-slate-500">We couldn&apos;t find any articles matching your search.</p>
        </div>
      )}
    </div>
  );
}
