'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminIPOs } from '@/lib/actions/admin-stats';
import { deleteIPO } from '@/lib/actions/ipo-actions';
import { updateGMP } from '@/lib/actions/gmp-actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, TrendingUp, Trash2, BarChart3, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdminIpo {
  id: string;
  ipoName: string;
  companyName: string;
  slug: string;
  status: string;
  ipoType: string;
  priceBandMin: number;
  priceBandMax: number;
  gmp: number;
  previousGmp: number;
  isDeleted: boolean;
  updatedAt: string;
  [key: string]: unknown;
}

export default function ManageIPOs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [ipos, setIpos] = useState<AdminIpo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [gmpDialogOpen, setGmpDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIpo, setSelectedIpo] = useState<AdminIpo | null>(null);
  const [newGmp, setNewGmp] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchIPOs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminIPOs(search, filterStatus);
      setIpos(data.filter(Boolean) as AdminIpo[]);
    } catch {
      toast.error('Failed to load IPOs');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    if (status === 'authenticated') {
      const delayDebounce = setTimeout(() => {
        fetchIPOs();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [status, fetchIPOs]);

  const handleUpdateGMP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIpo) return;
    
    setActionLoading(true);
    try {
      await updateGMP(selectedIpo.id, Number(newGmp));
      toast.success('GMP updated successfully');
      setGmpDialogOpen(false);
      fetchIPOs();
    } catch {
      toast.error('Failed to update GMP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteIPO = async () => {
    if (!selectedIpo) return;
    
    setActionLoading(true);
    try {
      await deleteIPO(selectedIpo.id);
      toast.success('IPO deleted successfully');
      setDeleteDialogOpen(false);
      fetchIPOs();
    } catch {
      toast.error('Failed to delete IPO');
    } finally {
      setActionLoading(false);
    }
  };

  const openGmpDialog = (ipo: AdminIpo) => {
    setSelectedIpo(ipo);
    setNewGmp(ipo.gmp?.toString() || '0');
    setGmpDialogOpen(true);
  };

  const openDeleteDialog = (ipo: AdminIpo) => {
    setSelectedIpo(ipo);
    setDeleteDialogOpen(true);
  };

  if (status === 'loading' || (loading && ipos.length === 0)) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manage IPOs</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search IPOs..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="Open">Open</TabsTrigger>
                <TabsTrigger value="Closed">Closed</TabsTrigger>
                <TabsTrigger value="Listed">Listed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Link href="/admin/ipos/new" className="w-full sm:w-auto">
              <Button className="w-full bg-[#0F3D2E] hover:bg-emerald-800 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add IPO
              </Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">IPO Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Price Band</th>
                <th className="px-6 py-4 font-medium">GMP</th>
                <th className="px-6 py-4 font-medium">Est. Listing</th>
                <th className="px-6 py-4 font-medium">Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo) => {
                const estListing = Number(ipo.priceBandMax || 0) + Number(ipo.gmp || 0);
                
                return (
                  <tr key={ipo.id} className={`border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 ${ipo.isDeleted ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {ipo.isDeleted && <span className="text-red-500 line-through"></span>}
                        <span className={ipo.isDeleted ? 'line-through text-slate-500' : ''}>{ipo.ipoName}</span>
                        {ipo.isDeleted && <Badge variant="destructive" className="text-[10px]">Deleted</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        ipo.status === 'Open' ? 'border-green-500 text-green-700' :
                        ipo.status === 'Upcoming' ? 'border-blue-500 text-blue-700' :
                        ipo.status === 'Listed' ? 'border-purple-500 text-purple-700' :
                        'border-slate-500 text-slate-700'
                      }>
                        {ipo.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      ₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${ipo.gmp > 0 ? 'text-green-600' : ipo.gmp < 0 ? 'text-red-600' : ''}`}>
                        {ipo.gmp > 0 ? '+' : ''}₹{ipo.gmp || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{estListing}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(ipo.updatedAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/ipos/${ipo.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Link href={`/admin/ipos/${ipo.id}/gmp-history`}>
                          <Button variant="ghost" size="icon" title="GMP History">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" size="icon" title="Update GMP" 
                          onClick={() => openGmpDialog(ipo)}
                          disabled={ipo.isDeleted}
                        >
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" title="Delete"
                          onClick={() => openDeleteDialog(ipo)}
                          disabled={ipo.isDeleted}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {ipos.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No IPOs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* GMP Update Dialog */}
      <Dialog open={gmpDialogOpen} onOpenChange={setGmpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update GMP — {selectedIpo?.ipoName}</DialogTitle>
            <DialogDescription>
              Enter the latest grey market premium for this IPO.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateGMP} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gmp">Current GMP (₹)</Label>
              <Input 
                id="gmp" 
                type="number" 
                value={newGmp} 
                onChange={(e) => setNewGmp(e.target.value)} 
                required 
              />
            </div>
            {selectedIpo && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Price (Max):</span>
                  <span className="font-medium">₹{selectedIpo.priceBandMax}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>Estimated Listing:</span>
                  <span>₹{Number(selectedIpo.priceBandMax || 0) + Number(newGmp || 0)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>Estimated Gain:</span>
                  <span>{Number(selectedIpo.priceBandMax) > 0 ? ((Number(newGmp || 0) / Number(selectedIpo.priceBandMax)) * 100).toFixed(2) : 0}%</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={actionLoading} className="bg-[#0F3D2E] hover:bg-emerald-800 text-white">
                {actionLoading ? 'Updating...' : 'Update GMP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete IPO</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIpo?.ipoName}? This will hide it from the public website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteIPO}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
