'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Heart, Settings, LogOut, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name, email });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update password');
      }
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'watchlist', label: 'Watchlist', icon: Heart, href: '/watchlist' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">Account Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => (
              tab.href ? (
                <Link key={tab.id} href={tab.href} className="flex items-center px-4 py-3 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </Link>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              )
            ))}
            
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Log Out
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6 mb-8">
                  <Avatar className="h-24 w-24 border-2 border-emerald-100 dark:border-emerald-900">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-emerald-700 text-white text-3xl font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveProfile} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Manage how the app looks and behaves.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-slate-500">Select your preferred color theme</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`px-3 py-1 text-sm rounded-md ${theme === 'light' ? 'bg-white shadow-sm dark:text-slate-900' : 'text-slate-500'}`}
                      >
                        Light
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`px-3 py-1 text-sm rounded-md ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        Dark
                      </button>
                      <button 
                        onClick={() => setTheme('system')}
                        className={`px-3 py-1 text-sm rounded-md ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-slate-500">Receive alerts on your device for GMP updates</p>
                    </div>
                    <Switch 
                      checked={pushEnabled} 
                      onCheckedChange={(c) => {
                        setPushEnabled(c);
                        toast.success(`Push notifications ${c ? 'enabled' : 'disabled'}`);
                      }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-slate-500">Get daily summary emails of open IPOs</p>
                    </div>
                    <Switch 
                      checked={emailEnabled} 
                      onCheckedChange={(c) => {
                        setEmailEnabled(c);
                        toast.success(`Email alerts ${c ? 'enabled' : 'disabled'}`);
                      }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="pt-4">
                  <Button onClick={handlePasswordChange} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
