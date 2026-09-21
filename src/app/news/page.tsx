'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getNews } from '@/lib/api';
import { NewsArticle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchNews = async () => {
      const data = await getNews();
      setArticles(data);
    };
    fetchNews();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (category !== 'All') {
      result = result.filter(a => a.category === category);
    }
    if (search) {
      result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || (a.excerpt || a.summary || '').toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [search, category, articles]);

  const categories = ['All', 'IPO', 'GMP', 'Market', 'Companies', 'Regulations', 'SME'];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-50">Latest IPO News</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Search news..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs defaultValue="All" value={category} onValueChange={setCategory} className="w-full overflow-auto">
          <TabsList className="inline-flex min-w-max">
            {categories.map(c => (
              <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <Card key={article.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                  {article.category}
                </Badge>
                <span className="text-xs text-slate-500">{article.date}</span>
              </div>
              <CardTitle className="line-clamp-2 text-xl leading-tight">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                {article.excerpt || article.summary || ''}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 mt-4 p-4">
              <span className="text-xs text-slate-500">{article.author}</span>
              <Link href={`/news/${article.slug}`} className="text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:underline">
                Read More &rarr;
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No news articles found matching your criteria.
        </div>
      )}
    </div>
  );
}
