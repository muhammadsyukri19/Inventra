'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Card } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { getUsers, updateUserStatus, User } from '@/features/user/services/user.service';
import { Check, X, Ban, RefreshCw } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers({ limit: 50 });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateUserStatus(id, status);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded-full">Menunggu Persetujuan</span>;
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">Aktif</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-danger-100 text-danger-800 text-xs rounded-full">Ditolak</span>;
      case 'INACTIVE':
        return <span className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full">Nonaktif</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1">Manajemen Pengguna</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Kelola persetujuan pendaftaran dan status akun pengguna
          </Typography>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Nama / Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-tertiary">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-tertiary">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{user.name}</div>
                      <div className="text-text-tertiary text-xs">{user.email} | @{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{user.role.name.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.status === 'PENDING' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(user.id, 'ACTIVE')} title="Setujui">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(user.id, 'REJECTED')} title="Tolak">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {user.status === 'ACTIVE' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(user.id, 'INACTIVE')} title="Nonaktifkan">
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {(user.status === 'INACTIVE' || user.status === 'REJECTED') && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(user.id, 'ACTIVE')} title="Aktifkan">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
