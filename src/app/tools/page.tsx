'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calculator, GitCompare, Activity, Percent } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  const tools = [
    {
      title: 'IPO Calculator',
      description: 'Calculate your potential listing gains easily.',
      icon: Calculator,
      href: '/tools/calculator',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'GMP Calculator',
      description: 'Calculate potential listing price based on Grey Market Premium.',
      icon: Calculator,
      href: '/tools/gmp-calculator',
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    },
    {
      title: 'Allotment Calculator',
      description: 'Estimate your chances of getting an IPO allotment.',
      icon: Percent,
      href: '/tools/allotment-calculator',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      title: 'IPO Comparison',
      description: 'Compare multiple IPOs side by side.',
      icon: GitCompare,
      href: '/tools/compare',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Subscription Tracker',
      description: 'Track real-time IPO subscription status.',
      icon: Activity,
      href: '/subscription',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    }
  ];

  return (
    <div className="container mx-auto py-12 space-y-8 max-w-5xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">IPO Tools</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Powerful tools to help you analyze and plan your IPO investments.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.title} className="flex flex-col hover:border-emerald-500/50 transition-colors">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{tool.title}</CardTitle>
              <CardDescription className="text-base">{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-6">
              <Link 
                href={tool.href}
                className="inline-flex items-center justify-center w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                Open Tool <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
