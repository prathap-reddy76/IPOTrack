'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    ipoPrice: '217',
    gmp: '65',
    lots: '2',
    sharesPerLot: '69'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{
    investment: number;
    estListingPrice: number;
    estValue: number;
    estGain: number;
    gainPercent: number;
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    ['ipoPrice', 'gmp', 'lots', 'sharesPerLot'].forEach((key) => {
      const val = formData[key as keyof typeof formData];
      if (!val) {
        newErrors[key] = 'Required field';
        isValid = false;
      } else if (isNaN(Number(val))) {
        newErrors[key] = 'Must be a valid number';
        isValid = false;
      } else if (Number(val) < 0) {
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

    const price = Number(formData.ipoPrice);
    const gmp = Number(formData.gmp);
    const lots = Number(formData.lots);
    const shares = Number(formData.sharesPerLot);

    const investment = price * lots * shares;
    const estListingPrice = price + gmp;
    const estValue = estListingPrice * lots * shares;
    const estGain = estValue - investment;
    const gainPercent = (estGain / investment) * 100;

    setResults({
      investment,
      estListingPrice,
      estValue,
      estGain,
      gainPercent
    });
  };

  const handleReset = () => {
    setFormData({ ipoPrice: '', gmp: '', lots: '1', sharesPerLot: '' });
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
          IPO Calculator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Calculate your potential listing gains easily.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Details</CardTitle>
              <CardDescription>Fill in the IPO details to calculate potential returns</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ipoPrice">IPO Price (₹)</Label>
                  <Input 
                    id="ipoPrice" 
                    name="ipoPrice" 
                    value={formData.ipoPrice} 
                    onChange={handleChange}
                    placeholder="e.g. 217" 
                    className={errors.ipoPrice ? "border-red-500" : ""}
                  />
                  {errors.ipoPrice && <p className="text-xs text-red-500">{errors.ipoPrice}</p>}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lots">Number of Lots</Label>
                    <Input 
                      id="lots" 
                      name="lots" 
                      value={formData.lots} 
                      onChange={handleChange}
                      placeholder="e.g. 2" 
                      className={errors.lots ? "border-red-500" : ""}
                    />
                    {errors.lots && <p className="text-xs text-red-500">{errors.lots}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sharesPerLot">Shares Per Lot</Label>
                    <Input 
                      id="sharesPerLot" 
                      name="sharesPerLot" 
                      value={formData.sharesPerLot} 
                      onChange={handleChange}
                      placeholder="e.g. 69" 
                      className={errors.sharesPerLot ? "border-red-500" : ""}
                    />
                    {errors.sharesPerLot && <p className="text-xs text-red-500">{errors.sharesPerLot}</p>}
                  </div>
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
                      <p className="text-sm font-medium text-slate-500 mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{results.investment.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Est. Listing Price</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{results.estListingPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Est. Total Value</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{results.estValue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Estimated Gain</p>
                      <p className={`text-2xl font-bold ${results.estGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.estGain >= 0 ? '+' : ''}₹{results.estGain.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-slate-700 dark:text-slate-300">Gain Percentage</p>
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
              <p><strong>Investment:</strong> IPO Price × Lots × Shares Per Lot</p>
              <p><strong>Est. Listing Price:</strong> IPO Price + Current GMP</p>
              <p><strong>Est. Gain:</strong> Est. Total Value - Total Investment</p>
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
