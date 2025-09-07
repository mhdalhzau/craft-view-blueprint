import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Settings, 
  Shield, 
  Database, 
  Download, 
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'Sistem', icon: Settings },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-page">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-admin-title">
            Administrasi Sistem
          </h1>
          <p className="text-gray-600">Kelola pengaturan sistem dan keamanan</p>
        </div>

        {/* Admin Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Perhatian</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Halaman ini hanya dapat diakses oleh Administrator. Perubahan yang dilakukan dapat mempengaruhi seluruh sistem.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'system' && (
          <div className="space-y-6" data-testid="system-settings">
            {/* System Information */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Versi Aplikasi</label>
                  <p className="text-sm text-gray-900" data-testid="text-app-version">v1.0.0</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Database</label>
                  <p className="text-sm text-gray-900" data-testid="text-database-status">PostgreSQL - Aktif</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900" data-testid="text-last-updated">
                    {new Date().toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Server Status</label>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600" data-testid="text-server-status">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Sistem</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Nonaktifkan akses pengguna sementara</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" data-testid="toggle-maintenance" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto Backup</h4>
                    <p className="text-sm text-gray-500">Backup otomatis setiap hari</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" data-testid="toggle-auto-backup" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Logging</h4>
                    <p className="text-sm text-gray-500">Catat aktivitas sistem</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" data-testid="toggle-logging" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-restart-system">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Restart Sistem</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-clear-cache">
                  <Trash2 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Clear Cache</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6" data-testid="security-settings">
            {/* Security Status */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Keamanan</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-900">SSL Certificate Valid</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-900">Database Encryption Enabled</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-900">Two-Factor Authentication Ready</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-900">Last Security Scan: 7 days ago</span>
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kebijakan Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Panjang Password
                  </label>
                  <input
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="20"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    data-testid="input-min-password-length"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      data-testid="checkbox-require-uppercase"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Wajib huruf besar
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      data-testid="checkbox-require-numbers"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Wajib angka
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      data-testid="checkbox-require-special"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Wajib karakter khusus
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manajemen Session</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (menit)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    min="15"
                    max="480"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    data-testid="input-session-timeout"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Login Attempts
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    min="3"
                    max="10"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    data-testid="input-max-login-attempts"
                  />
                </div>
                
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors" data-testid="button-terminate-sessions">
                  Terminate All Active Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6" data-testid="database-settings">
            {/* Database Status */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Database</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Connection Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600" data-testid="text-db-connection">Connected</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Database Size</label>
                  <p className="text-sm text-gray-900 mt-1" data-testid="text-db-size">45.2 MB</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Records</label>
                  <p className="text-sm text-gray-900 mt-1" data-testid="text-total-records">1,247</p>
                </div>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Backups</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'backup_2025_09_07.sql', size: '42.1 MB', date: '7 Sep 2025, 10:30' },
                      { name: 'backup_2025_09_06.sql', size: '41.8 MB', date: '6 Sep 2025, 10:30' },
                      { name: 'backup_2025_09_05.sql', size: '41.2 MB', date: '5 Sep 2025, 10:30' }
                    ].map((backup, index) => (
                      <div key={backup.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`backup-item-${index}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{backup.name}</p>
                          <p className="text-xs text-gray-500">{backup.size} • {backup.date}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm" data-testid={`button-download-backup-${index}`}>
                            Download
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm" data-testid={`button-delete-backup-${index}`}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" data-testid="button-create-backup">
                    <Download className="w-4 h-4" />
                    <span>Create Backup</span>
                  </button>
                  
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" data-testid="button-restore-backup">
                    <Upload className="w-4 h-4" />
                    <span>Restore Backup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Database Maintenance */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Database</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Peringatan</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Operasi maintenance dapat mempengaruhi performa sistem. Lakukan di luar jam operasional.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-optimize-database">
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Optimize Database</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-repair-tables">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Repair Tables</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 p-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors" data-testid="button-reset-database">
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Reset Database</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-vacuum-database">
                    <Database className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Vacuum Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}