import React from 'react';
import { ChefHat, Users, BarChart3, CreditCard } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-red-600" data-testid="landing-page">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-app-title">
              DIMSUM WARUNG
            </h1>
            <p className="text-red-100" data-testid="text-app-subtitle">
              Sistem Manajemen Restoran Modern
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6" data-testid="text-login-title">
              Masuk ke Sistem
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900" data-testid="text-admin-info">
                    Admin: admin@dimsum.com
                  </p>
                  <p className="text-xs text-gray-500">Akses penuh sistem</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900" data-testid="text-employee-info">
                    Karyawan: Daftar dengan email lain
                  </p>
                  <p className="text-xs text-gray-500">Akses terbatas</p>
                </div>
              </div>
            </div>

            <a
              href="/api/login"
              className="w-full bg-primary hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 gojek-hover"
              data-testid="button-login"
            >
              <span>Masuk</span>
            </a>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <BarChart3 className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Laporan Real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <CreditCard className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Point of Sale</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}