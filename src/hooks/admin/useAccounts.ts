
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Account } from '@/types/admin/account.types';
import { useToast } from '@/hooks/use-toast';

export const useAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles directly without trying to join with auth.users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      const formattedAccounts: Account[] = profiles.map(profile => ({
        id: profile.id,
        name: profile.name || profile.nickname || 'No Name',
        email: profile.email || '',
        type: profile.user_type || 'Customer',
        registered: new Date(profile.created_at).toLocaleString('ja-JP'),
        status: profile.status || 'アクティブ',
        phone: profile.phone || '',
        address: profile.address || '',
      }));

      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "エラー",
        description: "アカウント情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const filtered = accounts.filter(
      account => 
        account.name.toLowerCase().includes(term.toLowerCase()) || 
        account.id.includes(term) ||
        account.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAccounts(filtered);
  };

  const handleSortChange = (value: string) => {
    let sorted = [...filteredAccounts];
    
    switch(value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.registered).getTime() - new Date(a.registered).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.registered).getTime() - new Date(b.registered).getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }
    
    setFilteredAccounts(sorted);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      const updatedAccounts = accounts.map(account => 
        account.id === userId ? { ...account, status: newStatus } : account
      );
      
      const updatedFiltered = filteredAccounts.map(account => 
        account.id === userId ? { ...account, status: newStatus } : account
      );
      
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedFiltered);
      
      toast({
        title: "ステータスを更新しました",
        description: `ユーザーID: ${userId}のステータスを${newStatus}に変更しました`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    try {
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update local state
      const updatedAccounts = accounts.filter(account => account.id !== userId);
      setAccounts(updatedAccounts);
      setFilteredAccounts(filteredAccounts.filter(account => account.id !== userId));

      toast({
        title: "アカウントを削除しました",
        description: `ユーザーID: ${userId}のアカウントを削除しました`,
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "エラー",
        description: "アカウントの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    accounts,
    filteredAccounts,
    isLoading,
    fetchAccounts,
    handleSearch,
    handleSortChange,
    handleStatusChange,
    handleDeleteAccount
  };
};
