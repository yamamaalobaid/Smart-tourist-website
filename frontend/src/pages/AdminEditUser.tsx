import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, User as UserIcon, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../services/api';

export default function AdminEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/admin/users`);
      const users = response.data.data || response.data;
      const user = users.find((u: any) => u._id === id || u.id === id);
      if (user) setFormData(user);
      else setError('المستخدم غير موجود');
    } catch (err) {
      setError('فشل في تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.put(`/admin/users/${id}`, formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحديث المستخدم');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white font-cairo">
      <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
      <p>جاري تحميل البيانات...</p>
    </div>
  );

  if (error || !formData) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white font-cairo">
      <p className="text-red-400 mb-6">{error || 'المستخدم غير موجود'}</p>
      <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-surface border border-glassBorder rounded-xl">العودة للوحة الإدارة</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-10 border border-glassBorder"
        >
          <div className="flex items-center justify-between mb-10 border-b border-glassBorder pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-surface border border-glassBorder rounded-2xl">
                <UserIcon size={24} className="text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">تعديل المستخدم</h1>
                <p className="text-gray-400">{formData.firstName} {formData.lastName}</p>
              </div>
            </div>
            <button onClick={() => navigate('/admin')} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-wider pr-1">الاسم الأول</label>
                 <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-3 focus:border-accent" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-wider pr-1">الاسم الأخير</label>
                 <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-3 focus:border-accent" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs text-gray-500 uppercase tracking-wider pr-1">البريد الإلكتروني</label>
               <input type="email" value={formData.email} disabled className="w-full bg-black/40 border border-glassBorder rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-outfit" />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-glassBorder">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-wider pr-1">دور المستخدم</label>
                 <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:border-accent">
                   <option value="user">مستكشف (User)</option>
                   <option value="admin">مدير (Admin)</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-wider pr-1">حالة الحساب</label>
                 <div className="flex items-center gap-3 h-[52px]">
                   <input type="checkbox" id="isVerified" name="isVerified" checked={formData.isVerified} onChange={(e) => setFormData((prev:any) => ({...prev, isVerified: e.target.checked}))} className="w-6 h-6 accent-accent" />
                   <label htmlFor="isVerified" className="text-sm">حساب فاعل ومؤكد</label>
                 </div>
               </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
              >
                <Save size={20} />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
