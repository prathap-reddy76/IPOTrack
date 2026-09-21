'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Percent } from 'lucide-react';
import Link from 'next/link';

export default function AllotmentCalculatorPage() {
  const [formData, setFormData] = useState({
    totalApplications: '1000000',
    sharesAvailable: '5000000',
    lotSize: '100',
    lotsApplied: '1'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{
    probability: number;
    expectedLots: number;
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    ['totalApplications', 'sharesAvailable', 'lotSize', 'lotsApplied'].forEach((key) => {
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
      } else if (Number(val) === 0) {
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

    const totalApp = Number(formData.totalApplications);
    const sharesAvailable = Number(formData.sharesAvailable);
    const lotSize = Number(formData.lotSize);
    const lotsApplied = Number(formData.lotsApplied);

    const totalLotsAvailable = sharesAvailable / lotSize;
    let prob = (totalLotsAvailable / totalApp) * 100;
    if (prob > 100) prob = 100;

    const probability = prob;
    const expectedLots = (probability / 100) * lotsApplied;

    setResults({
      probability,
      expectedLots
    });
  };

  const handleReset = () => {
    setFormData({ totalApplications: '', sharesAvailable: '', lotSize: '', lotsApplied: '1' });
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
          <Percent className="w-8 h-8 text-emerald-600" />
          Allotment Probability Calculator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Estimate your chances of getting an IPO allotment.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Details</CardTitle>
              <CardDescription>Fill in the IPO application details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalApplications">Total Applications Received</Label>
                  <Input 
                    id="totalApplications" 
                    name="totalApplications" 
                    value={formData.totalApplications} 
                    onChange={handleChange}
                    placeholder="e.g. 1000000" 
                    className={errors.totalApplications ? "border-red-500" : ""}
                  />
                  {errors.totalApplications && <p className="text-xs text-red-500">{errors.totalApplications}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharesAvailable">Shares Available for Retail</Label>
                  <Input 
                    id="sharesAvailable" 
                    name="sharesAvailable" 
                    value={formData.sharesAvailable} 
                    onChange={handleChange}
                    placeholder="e.g. 5000000" 
                    className={errors.sharesAvailable ? "border-red-500" : ""}
                  />
                  {errors.sharesAvailable && <p className="text-xs text-red-500">{errors.sharesAvailable}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lotSize">Lot Size</Label>
                    <Input 
                      id="lotSize" 
                      name="lotSize" 
                      value={formData.lotSize} 
                      onChange={handleChange}
                      placeholder="e.g. 100" 
                      className={errors.lotSize ? "border-red-500" : ""}
                    />
                    {errors.lotSize && <p className="text-xs text-red-500">{errors.lotSize}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lotsApplied">Lots Applied</Label>
                    <Input 
                      id="lotsApplied" 
                      name="lotsApplied" 
                      value={formData.lotsApplied} 
                      onChange={handleChange}
                      placeholder="e.g. 1" 
                      className={errors.lotsApplied ? "border-red-500" : ""}
                    />
                    {errors.lotsApplied && <p className="text-xs text-red-500">{errors.lotsApplied}</p>}
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
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Probability of Allotment</p>
                      <div className={`px-4 py-1.5 rounded-full font-bold text-lg ${
                        results.probability >= 50 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : results.probability >= 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {results.probability.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Expected Lots</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {results.expectedLots.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-50/50 dark:bg-slate-900/20">
              <Percent className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-lg font-medium mb-1">No Results Yet</p>
              <p className="text-sm">Enter details and click calculate to see your potential allotment probability.</p>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How this calculation works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p><strong>Probability:</strong> (Shares Available / (Total Applications × Lot Size)) × 100</p>
              <p>Capped at a maximum of 100%.</p>
            </CardContent>
            <CardFooter>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg flex items-start gap-2 w-full mt-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>Disclaimer:</strong> Estimated probability. Actual allotment depends on the final allotment process and registrar rules.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
