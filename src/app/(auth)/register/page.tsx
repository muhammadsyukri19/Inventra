'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Typography } from '@/components/atoms/typography';
import { Card } from '@/components/atoms/card';
import { FormField } from '@/components/molecules/form-field';
import {
  Package,
  Eye,
  EyeOff,
  UserPlus,
  BarChart3,
  Bell,
  ShieldCheck,
} from 'lucide-react';

const registerSchema = z.object({
  name: z.string({ required_error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  username: z.string({ required_error: 'Username wajib diisi' }).min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(6, 'Password minimal 6 karakter'),
  roleId: z.string({ required_error: 'Role wajib dipilih' }), // In real scenario, roles are fetched from API
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const registerMutation = useRegister();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get(API_ENDPOINTS.USERS_ROLES);
        // Filter out admin so users cannot register as admin directly
        setRoles(data.data.filter((r: any) => r.name !== 'admin'));
      } catch (error) {
        console.error('Failed to fetch roles', error);
      }
    };
    fetchRoles();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <Card className="flex w-full max-w-[960px] overflow-hidden animate-scale-in">
      <div className="hidden w-[440px] shrink-0 flex-col justify-between bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Package className="h-6 w-6" />
            </div>
            <Typography variant="h2" as="span" className="text-white">
              Inventaris
            </Typography>
          </div>
        </div>

        <div className="space-y-6">
          <Typography variant="h1" as="h2" className="text-white leading-tight">
            Daftar Sekarang
            <br />
            Lebih Cerdas
          </Typography>
          <Typography variant="body" className="text-primary-200 leading-relaxed">
            Bergabung dengan Inventra. Kelola inventaris dengan AI Predictive Analytics dan Computer Vision.
          </Typography>

          <div className="space-y-3">
            <FeatureItem
              icon={<BarChart3 className="h-4 w-4" />}
              text="Analitik penjualan real-time"
            />
            <FeatureItem
              icon={<Bell className="h-4 w-4" />}
              text="Notifikasi stok otomatis"
            />
            <FeatureItem
              icon={<ShieldCheck className="h-4 w-4" />}
              text="Rekomendasi restock cerdas"
            />
          </div>
        </div>

        <Typography variant="body-sm" className="text-primary-300">
          © 2026 Inventra — PLBK
        </Typography>
      </div>

      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Package className="h-6 w-6" />
            </div>
            <Typography variant="h2" as="span">Inventaris</Typography>
          </div>

          <Typography variant="h1">Buat Akun Baru</Typography>
          <Typography variant="body" color="secondary" className="mt-2">
            Isi formulir di bawah ini untuk mendaftar
          </Typography>

          {registerMutation.isError && (
            <div
              className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 animate-fade-in"
              role="alert"
            >
              <Typography variant="body" color="danger">
                {registerMutation.error instanceof Error
                  ? (registerMutation.error as { response?: { data?: { message?: string } } })
                      .response?.data?.message ?? registerMutation.error.message
                  : 'Terjadi kesalahan. Silakan coba lagi.'}
              </Typography>
            </div>
          )}
          
          {registerMutation.isSuccess && (
            <div
              className="mt-4 rounded-lg border border-success-500/20 bg-success-50 px-4 py-3 animate-fade-in"
              role="alert"
            >
              <Typography variant="body" color="success">
                Pendaftaran berhasil! Silakan login setelah akun disetujui Admin.
              </Typography>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              label="Nama Lengkap"
              type="text"
              placeholder="Budi Santoso"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <FormField
              label="Email"
              type="email"
              placeholder="budi@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <FormField
              label="Username"
              type="text"
              placeholder="budisantoso"
              error={errors.username?.message}
              required
              {...register('username')}
            />

            <div className="space-y-1.5">
              <Label htmlFor="roleId" required>Role (Peran)</Label>
              <select
                id="roleId"
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-tertiary ${
                  errors.roleId ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : 'border-default hover:border-text-tertiary'
                }`}
                {...register('roleId')}
              >
                <option value="">Pilih Role...</option>
                {roles.map((role) => (
                   <option key={role.id} value={role.id}>{role.name === 'staff_gudang' ? 'Staff Gudang' : role.name === 'owner' ? 'Owner' : role.name}</option>
                ))}
              </select>
              {errors.roleId && (
                <Typography variant="body-sm" color="danger" as="p">{errors.roleId.message}</Typography>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Buat password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register('password')}
              />
              {errors.password && (
                <Typography variant="body-sm" color="danger" as="p">
                  {errors.password.message}
                </Typography>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={registerMutation.isPending}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              {registerMutation.isPending ? 'Memproses...' : 'Daftar Akun'}
            </Button>
            
            <div className="text-center mt-4">
              <Typography variant="body-sm" color="secondary">
                Sudah punya akun?{' '}
                <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                  Masuk di sini
                </a>
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
        {icon}
      </div>
      <Typography variant="body" className="text-white">
        {text}
      </Typography>
    </div>
  );
}
