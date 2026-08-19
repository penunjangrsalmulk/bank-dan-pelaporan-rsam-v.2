import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Mail, 
  CheckCircle, 
  Key, 
  Building, 
  UserCheck, 
  Shield, 
  Trash2,
  Edit3
} from 'lucide-react';
import { AppUser, UserRole } from '../../types/database';
import Swal from 'sweetalert2';

interface UserManagementProps {
  currentUser: AppUser | null;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: 'usr-1',
      name: 'Super Admin RSUD Al-Mulk',
      email: 'admin.rsam@sukabumikota.go.id',
      role: 'super_admin',
      unit: 'Instalasi TI & SIMRS',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      last_login: '2026-08-18T10:30:00Z'
    },
    {
      id: 'usr-2',
      name: 'Admin Seksi Penunjang',
      email: 'penunjangrsam@gmail.com',
      role: 'seksi_penunjang',
      unit: 'Seksi Penunjang RS',
      is_active: true,
      created_at: '2025-01-05T00:00:00Z',
      last_login: '2026-08-18T09:15:00Z'
    },
    {
      id: 'usr-3',
      name: 'Admin Pelayanan & Rekam Medis',
      email: 'pelayanan.rsam@sukabumikota.go.id',
      role: 'admin_rs',
      unit: 'Pelayanan Medis',
      is_active: true,
      created_at: '2025-01-10T00:00:00Z',
      last_login: '2026-08-17T14:20:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin_rs');
  const [unit, setUnit] = useState('Instalasi TI & SIMRS');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      unit,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    setName('');
    setEmail('');
    Swal.fire({
      icon: 'success',
      title: 'Pengguna Ditambahkan',
      text: `Akun administrator untuk ${name} berhasil dibuat.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDeleteUser = (user: AppUser) => {
    if (user.role === 'super_admin' || user.role === 'superadmin') {
      Swal.fire({ icon: 'error', title: 'Tidak Dapat Dihapus', text: 'Super Admin utama tidak dapat dihapus.' });
      return;
    }

    Swal.fire({
      title: `Hapus Akses ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus'
    }).then((res) => {
      if (res.isConfirmed) {
        setUsers(users.filter(u => u.id !== user.id));
        Swal.fire({ icon: 'success', title: 'Akses Dihapus', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">SUPER ADMIN</span>;
      case 'seksi_penunjang':
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">SEKSI PENUNJANG</span>;
      case 'admin_rs':
        return <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">ADMIN RUMAH SAKIT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">VIEWER</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            MANAJEMEN PENGGUNA & RBAC
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Hak Akses Administrator RSUD Al-Mulk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun petugas TI, Seksi Penunjang, dan administrator sistem portal
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Administrator</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Email Login</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Unit Faskes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{u.unit}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'super_admin' && u.role !== 'superadmin' && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Tambah Akun Administrator Baru
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Petugas</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petugas@rsudalmulk.sukabumikota.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-purple-500 outline-none"
                >
                  <option value="admin_rs">Admin Rumah Sakit (Full Modul)</option>
                  <option value="seksi_penunjang">Admin Seksi Penunjang</option>
                  <option value="viewer">Viewer (Hanya Melihat)</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Pengelola</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-purple-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
