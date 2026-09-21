'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function GMPCalculatorPage() {
  const [formData, setFormData] = useState({
    upperPriceBand: '217',
    gmp: '65',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{
    estListingPrice: number;
    gainPercent: number;
    gainPerShare: number;
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    ['upperPriceBand', 'gmp'].forEach((key) => {
      const val = formData[key as keyof typeof formData];
      if (!val) {
        newErrors[key] = 'Required field';
        isValid = false;
      } else if (isNaN(Number(val))) {
        newErrors[key] = 'Must be a valid number';
        isValid = false;
      } else if (Number(val) < 0 && key !== 'gmp') {
        newErrors[key] = 'Cannot be negative';
        isValid = false;
      } else if (Number(val) === 0 && key !== 'gmp') {
        newErrors[key] = 'Cannot be zero';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validate()) return;

    const price = Number(formData.upperPriceBand);
    const gmp = Number(formData.gmp);

    const estListingPrice = price + gmp;
    const gainPercent = (gmp / price) * 100;
    const gainPerShare = gmp;

    setResults({
      estListingPrice,
      gainPercent,
      gainPerShare
    });
  };

  const handleReset = () => {
    setFormData({ upperPriceBand: '', gmp: '' });
    setErrors({});
    setResults(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/tools" className="text-emerald-600 hover:underline text-sm mb-1 block">
            &larr; Back to Tools
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Calculator className="w-8 h-8 text-emerald-600" />
          GMP Calculator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Calculate potential listing price and gains based on Grey Market Premium.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Details</CardTitle>
              <CardDescription>Fill in the IPO price and GMP</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upperPriceBand">Upper Price Band (₹)</Label>
                  <Input 
                    id="upperPriceBand" 
                    name="upperPriceBand" 
                    value={formData.upperPriceBand} 
                    onChange={handleChange}
                    placeholder="e.g. 217" 
                    className={errors.upperPriceBand ? "border-red-500" : ""}
                  />
                  {errors.upperPriceBand && <p className="text-xs text-red-500">{errors.upperPriceBand}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gmp">Current GMP (₹)</Label>
                  <Input 
                    id="gmp" 
                    name="gmp" 
                    value={formData.gmp} 
                    onChange={handleChange}
                    placeholder="e.g. 65" 
                    className={errors.gmp ? "border-red-500" : ""}
                  />
                  {errors.gmp && <p className="text-xs text-red-500">{errors.gmp}</p>}
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white">
                    Calculate
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6">
              <Card className="bg-slate-50 dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Calculation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Est. Listing Price</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{results.estListingPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Gain Per Share</p>
                      <p className={`text-2xl font-bold ${results.gainPerShare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.gainPerShare >= 0 ? '+' : ''}₹{results.gainPerShare.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-slate-700 dark:text-slate-300">Expected Gain %</p>
                      <div className={`px-4 py-1.5 rounded-full font-bold text-lg ${
                        results.gainPercent >= 0 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {results.gainPercent >= 0 ? '+' : ''}{results.gainPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-50/50 dark:bg-slate-900/20">
              <Calculator className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-lg font-medium mb-1">No Results Yet</p>
              <p className="text-sm">Enter details and click calculate to see your potential returns.</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How this calculation works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p><strong>Est. Listing Price:</strong> Upper Price Band + Current GMP</p>
              <p><strong>Expected Gain %:</strong> (GMP / Upper Price Band) × 100</p>
            </CardContent>
            <CardFooter>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg flex items-start gap-2 w-full mt-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>Disclaimer:</strong> Estimated listing price based on GMP is only an indication and not a guaranteed result. GMP may change without notice.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
