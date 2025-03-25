import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTableFix'; // Use fixed DataTable
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface FormattedAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_type: string;
  status: string;
  created_at: string;
  is_verified: boolean;
  verification_document: string;
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<FormattedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<FormattedAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<FormattedAccount | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, initializeAdminSession } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAccounts();
    }
  }, [isAdminAuthenticated]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAccounts: FormattedAccount[] = data.map((account) => ({
        id: account.id,
        name: account.name || 'N/A',
        email: account.email || 'N/A',
        phone: account.phone || 'N/A',
        address: account.address || 'N/A',
        user_type: account.user_type || 'user',
        status: account.status || 'active',
        created_at: new Date(account.created_at).toLocaleDateString(),
        is_verified: account.is_verified || false,
        verification_document: account.verification_document || '',
      }));

      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const filtered = accounts.filter((account) =>
      Object.values(account).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredAccounts(filtered);
  };

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split(':');
    const sorted = [...filteredAccounts].sort((a: any, b: any) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      }
      return a[column] < b[column] ? 1 : -1;
    });
    setFilteredAccounts(sorted);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User status updated to ${newStatus}`);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const openUserProfile = (user: FormattedAccount) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      accessorKey: 'id',
      render: (data: { row: any }) => {
        if (!data || !data.row) return null;
        return (
          <div className="max-w-[100px] truncate" title={data.row.id}>
            {data.row.id}
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Name',
      accessorKey: 'name',
    },
    {
      key: 'email',
      label: 'Email',
      accessorKey: 'email',
    },
    {
      key: 'created_at',
      label: 'Registered',
      accessorKey: 'created_at',
    },
    {
      key: 'status',
      label: 'Status',
      accessorKey: 'status',
      render: (data: { row: any }) => {
        if (!data || !data.row) return null;
        return <StatusBadge status={data.row.status} />;
      },
    },
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name:asc' },
    { label: 'Name (Z-A)', value: 'name:desc' },
    { label: 'Email (A-Z)', value: 'email:asc' },
    { label: 'Email (Z-A)', value: 'email:desc' },
    { label: 'Newest First', value: 'created_at:desc' },
    { label: 'Oldest First', value: 'created_at:asc' },
  ];

  const actionMenuItems = [
    {
      label: 'View',
      onClick: (row: FormattedAccount) => openUserProfile(row),
    },
    {
      label: 'Change Status',
      onClick: (row: FormattedAccount) => handleStatusChange(row.id, row.status === 'active' ? 'inactive' : 'active'),
    },
    {
      label: 'Delete',
      onClick: (row: FormattedAccount) => handleDeleteAccount(row.id),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="Search by name, email, or ID..."
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        actionMenuItems={actionMenuItems}
        isLoading={loading}
      />

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={selectedUser.name} readOnly />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={selectedUser.email} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={selectedUser.phone} readOnly />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={selectedUser.address} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Type</Label>
                  <Input value={selectedUser.user_type} readOnly />
                </div>
                <div>
                  <Label>Status</Label>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
              <div>
                <Label>Verification Status</Label>
                <div className="mt-1">
                  {selectedUser.is_verified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Not Verified</span>
                  )}
                </div>
              </div>
              {selectedUser.verification_document && (
                <div>
                  <Label>Verification Document</Label>
                  <div className="mt-1">
                    <a
                      href={selectedUser.verification_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 