import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Star, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  LayoutDashboard,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

type Tab = 'users' | 'places' | 'reviews' | 'bookings';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [activeTab, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'users': endpoint = '/admin/users'; break;
        case 'places': endpoint = '/admin/places'; break;
        case 'reviews': endpoint = '/admin/reviews'; break;
        case 'bookings': endpoint = '/admin/bookings'; break;
      }
      const response = await apiClient.get(endpoint);
      setData(response.data.data || response.data);
    } catch (err: any) {
      setError('فشل في جلب البيانات من الخادم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'users': endpoint = `/admin/users/${id}`; break;
        case 'places': endpoint = `/admin/places/${id}`; break;
        case 'reviews': endpoint = `/admin/reviews/${id}`; break;
      }
      await apiClient.delete(endpoint);
      setData(data.filter(item => item._id !== id && item.id !== id));
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      if (activeTab === 'bookings') {
        await apiClient.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      } else if (activeTab === 'users') {
        await apiClient.put(`/admin/users/${id}`, { isVerified: newStatus === 'verified' });
      }
      fetchData();
    } catch (err) {
      alert('فشل التحديث');
    }
  };

  const tabs = [
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'places', label: 'الأماكن', icon: MapPin },
    { id: 'reviews', label: 'التقييمات', icon: Star },
    { id: 'bookings', label: 'الحجوزات', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-surface border border-glassBorder rounded-2xl shadow-premium">
              <LayoutDashboard size={32} className="text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">لوحة الإدارة</h1>
              <p className="text-gray-400 mt-1 font-light">تحكم كامل في محتوى وتفاعل المنصة</p>
            </div>
          </div>

          <div className="flex bg-surface/50 backdrop-blur-md border border-glassBorder p-1.5 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-gradient-gold text-secondary shadow-lg font-bold' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel min-h-[600px] overflow-hidden">
          <div className="p-6 border-b border-glassBorder bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={`بحث في ${tabs.find(t => t.id === activeTab)?.label}...`}
                className="w-full bg-background/50 border border-glassBorder rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-accent transition-all font-outfit"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === 'places' && (
              <Link to="/admin/places/add" className="flex items-center gap-2 px-6 py-3 bg-accent text-secondary rounded-xl font-bold hover:scale-105 transition-transform">
                <Plus size={20} />
                إضافة مكان جديد
              </Link>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.table 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full text-right"
              >
                <thead className="bg-white/5 text-gray-400 text-sm border-b border-glassBorder">
                  <tr>
                    {activeTab === 'users' && (
                      <>
                        <th className="px-6 py-4 font-medium">المستخدم</th>
                        <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                        <th className="px-6 py-4 font-medium">الحالة</th>
                        <th className="px-6 py-4 font-medium">تاريخ الانضمام</th>
                        <th className="px-6 py-4 font-medium">الإجراءات</th>
                      </>
                    )}
                    {activeTab === 'places' && (
                      <>
                        <th className="px-6 py-4 font-medium">المكان</th>
                        <th className="px-6 py-4 font-medium">الفئة</th>
                        <th className="px-6 py-4 font-medium">التقييم</th>
                        <th className="px-6 py-4 font-medium">الحالة</th>
                        <th className="px-6 py-4 font-medium">الإجراءات</th>
                      </>
                    )}
                    {activeTab === 'reviews' && (
                      <>
                        <th className="px-6 py-4 font-medium">المستخدم</th>
                        <th className="px-6 py-4 font-medium">المكان</th>
                        <th className="px-6 py-4 font-medium">التقييم</th>
                        <th className="px-6 py-4 font-medium">التعليق</th>
                        <th className="px-6 py-4 font-medium">الإجراءات</th>
                      </>
                    )}
                    {activeTab === 'bookings' && (
                      <>
                        <th className="px-6 py-4 font-medium">المستخدم</th>
                        <th className="px-6 py-4 font-medium">الموقع</th>
                        <th className="px-6 py-4 font-medium">التاريخ</th>
                        <th className="px-6 py-4 font-medium">الحالة</th>
                        <th className="px-6 py-4 font-medium">الإجراءات</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-glassBorder">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                        جاري تحميل البيانات...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-500">
                        لا توجد بيانات متاحة حالياً
                      </td>
                    </tr>
                  ) : (
                    data.filter(item => {
                      const searchStr = (item.nameAr || item.firstName || item.subject || item.comment || '').toLowerCase();
                      return searchStr.includes(searchTerm.toLowerCase());
                    }).map((item) => (
                      <tr key={item._id || item.id} className="hover:bg-white/5 transition-colors group">
                        {activeTab === 'users' && (
                          <>
                            <td className="px-6 py-4 font-bold">{item.firstName || 'بدون اسم'} {item.lastName || ''}</td>
                            <td className="px-6 py-4 text-gray-400 font-outfit">{item.email || 'بدون بريد'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${item.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {item.isVerified ? 'مفعّل' : 'قيد الانتظار'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SY') : '---'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={`/admin/users/edit/${item._id || item.id}`} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit size={16} /></Link>
                                <button onClick={() => handleDelete(item._id || item.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'places' && (
                          <>
                            <td className="px-6 py-4 font-bold">
                              <div className="flex items-center gap-3">
                                {item.featuredImage ? (
                                  <img src={item.featuredImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center border border-glassBorder text-gray-500">
                                    <MapPin size={16} />
                                  </div>
                                )}
                                {item.nameAr || item.nameEn || 'مكان غير معروف'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{item.category || 'بدون فئة'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-accent">
                                <Star size={14} fill="currentColor" />
                                {typeof item.averageRating === 'number' ? item.averageRating.toFixed(1) : '0.0'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.isActive ? 'نشط' : 'متوقف'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === 'reviews' && (
                          <>
                            <td className="px-6 py-4 font-bold">{item.userId?.firstName || 'مستخدم'} {item.userId?.lastName || ''}</td>
                            <td className="px-6 py-4 text-gray-400">{item.placeId?.nameAr || 'مكان غير معروف'}</td>
                            <td className="px-6 py-4 text-accent">{item.rating || 0}/5</td>
                            <td className="px-6 py-4 text-sm max-w-xs truncate">{item.comment || 'بدون تعليق'}</td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                            </td>
                          </>
                        )}
                        {activeTab === 'bookings' && (
                          <>
                            <td className="px-6 py-4 font-bold">{item.userId?.firstName || 'مستخدم'} {item.userId?.lastName || ''}</td>
                            <td className="px-6 py-4 text-gray-400">{item.placeId?.nameAr || 'مكان غير معروف'}</td>
                            <td className="px-6 py-4 text-sm font-outfit">{item.date ? new Date(item.date).toLocaleDateString() : '---'}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={item.status} 
                                onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                                className="bg-surface border border-glassBorder rounded-lg px-2 py-1 text-xs focus:outline-none"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="cancelled">ملغى</option>
                                <option value="completed">مكتمل</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                               {item.status === 'pending' && (
                                 <div className="flex gap-2">
                                     <button onClick={() => handleUpdateStatus(item._id, 'confirmed')} className="text-green-500 hover:scale-110 transition-transform"><CheckCircle size={18} /></button>
                                     <button onClick={() => handleUpdateStatus(item._id, 'cancelled')} className="text-red-500 hover:scale-110 transition-transform"><XCircle size={18} /></button>
                                 </div>
                               )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </motion.table>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
