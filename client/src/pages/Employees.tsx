import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  MoreVertical,
  Shield,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      // Mock data for now - in real app, this would fetch from /api/users or similar
      return [
        {
          id: '1',
          email: 'admin@dimsum.com',
          firstName: 'Admin',
          lastName: 'Dimsum',
          role: 'admin',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'kasir1@dimsum.com',
          firstName: 'Siti',
          lastName: 'Nurhaliza',
          role: 'employee',
          isActive: true,
          createdAt: '2025-01-15T00:00:00Z'
        },
        {
          id: '3',
          email: 'kasir2@dimsum.com',
          firstName: 'Budi',
          lastName: 'Santoso',
          role: 'employee',
          isActive: true,
          createdAt: '2025-02-01T00:00:00Z'
        },
        {
          id: '4',
          email: 'supervisor@dimsum.com',
          firstName: 'Indira',
          lastName: 'Sari',
          role: 'supervisor',
          isActive: false,
          createdAt: '2025-01-10T00:00:00Z'
        }
      ];
    }
  });

  const filteredEmployees = employees?.filter((employee: Employee) => {
    const matchesSearch = 
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'supervisor': return 'Supervisor';
      case 'employee': return 'Karyawan';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return Users;
      case 'employee': return User;
      default: return User;
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="employees-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-employees-title">
              Manajemen Karyawan
            </h1>
            <p className="text-gray-600">Kelola akses dan data karyawan</p>
          </div>
          <button className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" data-testid="button-add-employee">
            <UserPlus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-search-employees"
            />
          </div>
          
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-role-filter"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Administrator</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Karyawan</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-total-employees">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-employees">
                  {employees?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-active-employees">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-active-employees">
                  {employees?.filter(emp => emp.isActive).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-admin-count">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrator</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-admin-count">
                  {employees?.filter(emp => emp.role === 'admin').length || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-employee-count">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Karyawan</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-employee-count">
                  {employees?.filter(emp => emp.role === 'employee').length || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6" data-testid="employees-grid">
              {filteredEmployees.map((employee: Employee) => {
                const RoleIcon = getRoleIcon(employee.role);
                return (
                  <div
                    key={employee.id}
                    className={`bg-gray-50 rounded-lg p-6 border border-gray-200 ${
                      !employee.isActive ? 'opacity-60' : ''
                    }`}
                    data-testid={`employee-card-${employee.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {employee.profileImageUrl ? (
                            <img
                              src={employee.profileImageUrl}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-semibold text-lg">
                              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900" data-testid={`text-employee-name-${employee.id}`}>
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`} data-testid={`badge-role-${employee.id}`}>
                              {getRoleText(employee.role)}
                            </span>
                            {!employee.isActive && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Nonaktif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          data-testid={`button-edit-employee-${employee.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          data-testid={`button-more-${employee.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Employee Info */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600" data-testid={`text-employee-email-${employee.id}`}>
                          {employee.email}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {getRoleText(employee.role)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Bergabung:</span>
                        <span data-testid={`text-join-date-${employee.id}`}>
                          {formatDate(employee.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs font-medium transition-colors border border-gray-300"
                          data-testid={`button-view-profile-${employee.id}`}
                        >
                          Lihat Profil
                        </button>
                        <button
                          className="flex-1 bg-primary hover:bg-red-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                          data-testid={`button-reset-password-${employee.id}`}
                        >
                          Reset Password
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredEmployees.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500" data-testid="text-no-employees">
                {searchTerm ? 'Tidak ada karyawan yang ditemukan' : 'Belum ada karyawan'}
              </p>
            </div>
          )}
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Matriks Hak Akses</h3>
            <p className="text-sm text-gray-600">Hak akses berdasarkan role karyawan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="permissions-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fitur
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karyawan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { feature: 'Point of Sale', admin: true, supervisor: true, employee: true },
                  { feature: 'Inventory Management', admin: true, supervisor: true, employee: false },
                  { feature: 'Product Management', admin: true, supervisor: true, employee: false },
                  { feature: 'Transaction History', admin: true, supervisor: true, employee: true },
                  { feature: 'Reports', admin: true, supervisor: true, employee: false },
                  { feature: 'Employee Management', admin: true, supervisor: false, employee: false },
                  { feature: 'Cash Flow', admin: true, supervisor: true, employee: false },
                  { feature: 'System Settings', admin: true, supervisor: false, employee: false }
                ].map((permission, index) => (
                  <tr key={permission.feature} className="hover:bg-gray-50" data-testid={`permission-row-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {permission.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block w-4 h-4 rounded-full ${permission.admin ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block w-4 h-4 rounded-full ${permission.supervisor ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block w-4 h-4 rounded-full ${permission.employee ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span>Diizinkan</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span>Tidak Diizinkan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}