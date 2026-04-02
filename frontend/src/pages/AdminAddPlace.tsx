import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, MapPin, AlignLeft, Image as ImageIcon, Tag, DollarSign, Phone, Mail, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../services/api';

export default function AdminAddPlace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'معالم تاريخية',
    addressAr: '',
    addressEn: '',
    latitude: 33.5138,
    longitude: 36.2765,
    openingHours: '',
    entryFee: 0,
    contactPhone: '',
    contactEmail: '',
    website: '',
    featuredImage: '',
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/admin/places', formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إضافة المكان');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'معالم تاريخية',
    'متاحف',
    'أسواق شعبية',
    'مطاعم ومقاهي',
    'أماكن ترفيهية',
    'أماكن دينية',
    'فنادق',
  ];

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
                <h1 className="text-3xl font-bold">إضافة مكان جديد</h1>
                <p className="text-gray-400">إدخال بيانات معلم سياحي جديد في دمشق</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Names Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">اسم المكان (بالعربية)</label>
                <input 
                  type="text" 
                  name="nameAr"
                  required
                  value={formData.nameAr}
                  onChange={handleChange}
                  className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
                  placeholder="مثال: الجامع الأموي"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">Place Name (English)</label>
                <input 
                  type="text" 
                  name="nameEn"
                  required
                  value={formData.nameEn}
                  onChange={handleChange}
                  className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all font-outfit"
                  placeholder="Example: Umayyad Mosque"
                />
              </div>
            </div>

            {/* Descriptions Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 pr-2">الوصف (بالعربية)</label>
              <textarea 
                name="descriptionAr"
                rows={4}
                value={formData.descriptionAr}
                onChange={handleChange}
                className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 pr-2">Description (English)</label>
              <textarea 
                name="descriptionEn"
                rows={4}
                value={formData.descriptionEn}
                onChange={handleChange}
                className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all font-outfit"
              />
            </div>

            {/* Category and Image */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">الفئة</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-surface border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 pr-2">رابط الصورة الرئيسية</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input 
                    type="url" 
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-glassBorder rounded-xl focus:outline-none focus:border-accent transition-all font-outfit"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-glassBorder">
              <div className="space-y-2">
                  <label className="text-xs text-gray-500 pr-1">رسوم الدخول ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input type="number" name="entryFee" value={formData.entryFee} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white/5 border border-glassBorder rounded-lg focus:border-accent" />
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs text-gray-500 pr-1">ساعات العمل</label>
                  <input type="text" name="openingHours" value={formData.openingHours} onChange={handleChange} className="w-full px-3 py-2 bg-white/5 border border-glassBorder rounded-lg focus:border-accent" placeholder="8:00 AM - 10:00 PM" />
              </div>
              <div className="space-y-2">
                  <label className="text-xs text-gray-500 pr-1">رقم التواصل</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white/5 border border-glassBorder rounded-lg focus:border-accent" />
                  </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'جاري الحفظ...' : 'حفظ المكان الجديد'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
