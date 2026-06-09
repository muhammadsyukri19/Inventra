'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/hooks/useAuth';
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
  LogIn,
  BarChart3,
  Bell,
  ShieldCheck,
} from 'lucide-react';

/**
 * Login form validation schema.
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page.
 *
 * Menggunakan:
 * - Atoms: Button, Input, Label, Typography, Card
 * - Molecules: FormField (Label + Input + error)
 *
 * Tidak menggunakan raw HTML <button>, <input>, <label> secara langsung.
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card className="flex w-full max-w-[960px] overflow-hidden animate-scale-in">
      {/* ================================================================
          LEFT PANEL — BRANDING (uses Typography atom)
          ================================================================ */}
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
            Kelola Inventaris
            <br />
            Lebih Cerdas
          </Typography>
          <Typography variant="body" className="text-primary-200 leading-relaxed">
            Sistem manajemen inventaris modular dengan analitik penjualan dan
            notifikasi real-time untuk UMKM dan toko retail.
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
          © 2026 Sistem Manajemen Inventaris — PLBK
        </Typography>
      </div>

      {/* ================================================================
          RIGHT PANEL — LOGIN FORM (uses FormField molecule + Button atom)
          ================================================================ */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Package className="h-6 w-6" />
            </div>
            <Typography variant="h2" as="span">Inventaris</Typography>
          </div>

          <Typography variant="h1">Masuk ke akun Anda</Typography>
          <Typography variant="body" color="secondary" className="mt-2">
            Masukkan email dan password untuk melanjutkan
          </Typography>

          {/* Error message */}
          {loginMutation.isError && (
            <div
              className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 animate-fade-in"
              role="alert"
            >
              <Typography variant="body" color="danger">
                {loginMutation.error instanceof Error
                  ? (loginMutation.error as { response?: { data?: { message?: string } } })
                      .response?.data?.message ?? loginMutation.error.message
                  : 'Terjadi kesalahan. Silakan coba lagi.'}
              </Typography>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Email — uses FormField molecule (Label + Input + error) */}
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="admin@inventaris.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            {/* Password — uses Label atom + Input atom with custom toggle */}
            <div className="space-y-1.5">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <Typography variant="body-sm" color="danger" as="p" id="password-error">
                  {errors.password.message}
                </Typography>
              )}
            </div>

            {/* Submit — uses Button atom */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loginMutation.isPending}
              leftIcon={<LogIn className="h-4 w-4" />}
            >
              {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Demo credentials — uses Card + Typography atoms */}
          <Card className="mt-8 p-4 bg-surface-secondary">
            <Typography variant="body-sm" weight="medium" color="secondary" className="mb-2">
              Demo Credentials:
            </Typography>
            <div className="space-y-1">
              <Typography variant="body-sm" color="tertiary">
                <Typography as="span" variant="body-sm" weight="medium" color="secondary">
                  Admin:
                </Typography>{' '}
                admin@inventaris.com
              </Typography>
              <Typography variant="body-sm" color="tertiary">
                <Typography as="span" variant="body-sm" weight="medium" color="secondary">
                  Staff:
                </Typography>{' '}
                staff@inventaris.com
              </Typography>
              <Typography variant="body-sm" color="tertiary">
                <Typography as="span" variant="body-sm" weight="medium" color="secondary">
                  Owner:
                </Typography>{' '}
                owner@inventaris.com
              </Typography>
              <Typography variant="body-sm" color="tertiary" className="mt-1">
                <Typography as="span" variant="body-sm" weight="medium" color="secondary">
                  Password:
                </Typography>{' '}
                password123
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}

/**
 * Feature list item — uses Typography atom.
 */
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
