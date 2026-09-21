'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createIPO } from '@/lib/actions/ipo-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AddNewIPO() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    ipoName: '',
    companyName: '',
    slug: '',
    ipoType: 'Mainboard',
    status: 'Upcoming',
    openDate: '',
    closeDate: '',
    allotmentDate: '',
    listingDate: '',
    priceBandMin: '',
    priceBandMax: '',
    lotSize: '',
    issueSize: '',
    issueSizeCrore: '',
    faceValue: '10',
    gmp: '0',
    subTotal: '',
    subRetail: '',
    subQib: '',
    subNii: '',
    subEmployee: '',
    listingPrice: '',
    industry: '',
    sector: '',
    about: '',
    promoters: '',
    registrar: '',
    leadManagers: '',
    location: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      companyName: name,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.companyName) ? generateSlug(name) : prev.slug
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      await createIPO(data);
      toast.success('IPO created successfully');
      router.push('/admin/ipos');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create IPO');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/ipos">
            <Button variant="ghost" size="sm" className="text-slate-500">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to IPOs
            </Button>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add New IPO</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ipoName">IPO Name <span className="text-red-500">*</span></Label>
                <Input id="ipoName" name="ipoName" value={formData.ipoName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleNameChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipoType">IPO Type</Label>
                <Select value={formData.ipoType} onValueChange={(v) => handleSelectChange('ipoType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mainboard">Mainboard</SelectItem>
                    <SelectItem value="SME">SME</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Allotment">Allotment</SelectItem>
                    <SelectItem value="Listing">Listing</SelectItem>
                    <SelectItem value="Listed">Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openDate">Open Date</Label>
                <Input id="openDate" name="openDate" type="date" value={formData.openDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeDate">Close Date</Label>
                <Input id="closeDate" name="closeDate" type="date" value={formData.closeDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allotmentDate">Allotment Date</Label>
                <Input id="allotmentDate" name="allotmentDate" type="date" value={formData.allotmentDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listingDate">Listing Date</Label>
                <Input id="listingDate" name="listingDate" type="date" value={formData.listingDate} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Size</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceBandMin">Price Band Min (₹)</Label>
                <Input id="priceBandMin" name="priceBandMin" type="number" value={formData.priceBandMin} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceBandMax">Price Band Max (₹)</Label>
                <Input id="priceBandMax" name="priceBandMax" type="number" value={formData.priceBandMax} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input id="lotSize" name="lotSize" type="number" value={formData.lotSize} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueSize">Issue Size (Text)</Label>
                <Input id="issueSize" name="issueSize" placeholder="e.g. ₹2,980 Cr" value={formData.issueSize} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueSizeCrore">Issue Size (Crores)</Label>
                <Input id="issueSizeCrore" name="issueSizeCrore" type="number" step="0.01" value={formData.issueSizeCrore} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faceValue">Face Value (₹)</Label>
                <Input id="faceValue" name="faceValue" type="number" value={formData.faceValue} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GMP (Grey Market Premium)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gmp">Current GMP (₹)</Label>
                <Input id="gmp" name="gmp" type="number" value={formData.gmp} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Data</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subTotal">Total (x)</Label>
                <Input id="subTotal" name="subTotal" type="number" step="0.01" value={formData.subTotal} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subRetail">Retail (x)</Label>
                <Input id="subRetail" name="subRetail" type="number" step="0.01" value={formData.subRetail} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subQib">QIB (x)</Label>
                <Input id="subQib" name="subQib" type="number" step="0.01" value={formData.subQib} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subNii">NII (x)</Label>
                <Input id="subNii" name="subNii" type="number" step="0.01" value={formData.subNii} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subEmployee">Employee (x)</Label>
                <Input id="subEmployee" name="subEmployee" type="number" step="0.01" value={formData.subEmployee} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" value={formData.industry} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input id="sector" name="sector" value={formData.sector} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <Textarea id="about" name="about" rows={3} value={formData.about} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoters">Promoters (comma-separated)</Label>
                <Textarea id="promoters" name="promoters" rows={2} value={formData.promoters} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrar">Registrar</Label>
                  <Input id="registrar" name="registrar" value={formData.registrar} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadManagers">Lead Managers (comma-separated)</Label>
                <Textarea id="leadManagers" name="leadManagers" rows={2} value={formData.leadManagers} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listingPrice">Listing Price (₹)</Label>
                <Input id="listingPrice" name="listingPrice" type="number" value={formData.listingPrice} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/ipos">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-[#0F3D2E] hover:bg-emerald-800 text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create IPO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
