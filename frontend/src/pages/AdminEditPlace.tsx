import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, MapPin, Image as ImageIcon, Star, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../services/api';

export default function AdminEditPlace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    try {
      const response = await apiClient.get(`/places/${id}`);
      setFormData(response.data.data || response.data);
    } catch (err) {
      setError('فشل في تحميل بيانات المكان');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.put(`/admin/places/${id}`, formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحديث المكان');
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

  if (!formData) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white font-cairo">
      <p className="text-red-400 mb-6">المكان غير موجود</p>
      <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-surface border border-glassBorder rounded-xl">العودة للوحة الإدارة</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 border border-glassBorder"
        >
          <div className="flex items-center justify-between mb-10 border-b border-glassBorder pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-surface border border-glassBorder rounded-2xl">
                <MapPin size={24} className="text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">تعديل: {formData.nameAr}</h1>
                <p className="text-gray-400">تحديث تفاصيل المعلم السياحي</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">اسم المكان (بالعربية)</label>
                <input type="text" name="nameAr" required value={formData.nameAr} onChange={handleChange} className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">Name (English)</label>
                <input type="text" name="nameEn" required value={formData.nameEn} onChange={handleChange} className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent font-outfit" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 pr-2">الوصف (بالعربية)</label>
              <textarea name="descriptionAr" rows={4} value={formData.descriptionAr} onChange={handleChange} className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">الفئة</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">رابط الصورة الرئيسية</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input type="url" name="featuredImage" value={formData.featuredImage} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-surface border border-glassBorder rounded-xl focus:outline-none focus:border-accent font-outfit" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-glassBorder">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    name="isActive" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev:any) => ({...prev, isActive: e.target.checked}))}
                    className="w-5 h-5 accent-accent"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">مكان مفعّل وسوف يظهر للزوار</label>
                </div>
            </div>

            <div className="pt-10">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
              >
                <Save size={20} />
                <span>{saving ? 'جاري التحديث...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
