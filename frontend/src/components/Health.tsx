import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, Shield, Heart, MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { travelAssistantService, HealthFacility, Vaccination, MedicationSchedule } from '../services/travelAssistant';
import { useAuthStore } from '../store/authStore';
import Navbar from './Navbar';

export default function Health() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medData, setMedData] = useState({
    medicationName: '',
    dosage: '',
    schedule: {},
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    loadHealthData();
    if (user) {
      loadMedications();
    }
  }, [user]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const [facilitiesData, vaccinationsData] = await Promise.all([
        travelAssistantService.getNearbyHealthFacilities(),
        travelAssistantService.getRequiredVaccinations('syria'),
      ]);
      setFacilities(facilitiesData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      const data = await travelAssistantService.getMedicationSchedules(user?.id);
      setMedications(data);
    } catch (error) {
      console.error('Failed to load medications:', error);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await travelAssistantService.addMedicationSchedule({
        userId: user.id,
        medicationName: medData.medicationName,
        dosage: medData.dosage,
        schedule: medData.schedule,
        timezone: medData.timezone
      });
      setShowMedForm(false);
      setMedData({ medicationName: '', dosage: '', schedule: {}, timezone: medData.timezone });
      loadMedications();
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent mb-4">
            <Heart size={18} fill="currentColor" />
            <span className="text-sm font-bold uppercase tracking-wider">صحة وسلامة المسافر</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cairo">عافيتك تهمنا</h1>
          <p className="text-gray-400 max-w-xl mx-auto">نقدم لك الدعم الصحي المتكامل، من مرافق قريبة إلى تنظيم مواعيد الأدوية بدقة.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Health Facilities */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-panel p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <MapPin size={24} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold">المرافق الصحية القريبة</h2>
                </div>
                <div className="text-accent text-sm font-bold">دمشق، سوريا</div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500">جاري البحث عن أقرب المرافق...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {facilities.map((facility, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className="p-5 bg-white/5 border border-glassBorder rounded-2xl group hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${facility.type === 'hospital' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          <Activity size={20} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          facility.insuranceAccepted ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'
                        }`}>
                          {facility.insuranceAccepted ? 'تأمين مقبول' : 'خاص / نقدي'}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-1">{facility.name}</h4>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={14} />
                        <span>{facility.distance}</span>
                        <span className="mx-1">•</span>
                        <span>{facility.type === 'hospital' ? 'مستشفى' : 'صيدلية'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Vaccinations */}
            <div className="glass-panel p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Shield size={24} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold">التطعيمات والإشعارات الصحية</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {vaccinations.map((vac, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-glassBorder rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-bold">{vac.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${vac.recommended ? 'text-accent' : 'text-gray-500'}`}>
                      {vac.recommended ? 'موصى به بشدة' : 'اختياري'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Medication Schedule */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                    <Clock size={24} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold font-cairo text-sm">مواعيد الأدوية</h2>
                </div>
                <button 
                  onClick={() => setShowMedForm(!showMedForm)}
                  className="p-2 bg-accent text-secondary rounded-lg hover:scale-110 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>

              <AnimatePresence>
                {showMedForm && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddMedication}
                    className="mb-8 space-y-4 overflow-hidden border-b border-glassBorder pb-8"
                  >
                    <input 
                      type="text" 
                      placeholder="اسم الدواء"
                      required
                      value={medData.medicationName}
                      onChange={(e) => setMedData({...medData, medicationName: e.target.value})}
                      className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                    />
                    <input 
                      type="text" 
                      placeholder="الجرعة (مثال: 500 ملغ)"
                      required
                      value={medData.dosage}
                      onChange={(e) => setMedData({...medData, dosage: e.target.value})}
                      className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                    />
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        disabled
                        value={medData.timezone}
                        className="flex-1 bg-white/5 border border-glassBorder rounded-xl px-4 py-3 text-gray-500 text-xs"
                      />
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-gold text-secondary font-bold rounded-xl active:scale-95 transition-transform">
                      تأكيد الإضافة
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {medications.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-glassBorder">
                      <AlertCircle size={24} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">لم يتم تسجيل أي أدوية بعد</p>
                  </div>
                ) : (
                  medications.map((med) => (
                    <div key={med.id} className="p-4 bg-white/5 border border-glassBorder rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                          <Activity size={18} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="font-bold">{med.medicationName}</h4>
                          <span className="text-xs text-gray-500">{med.dosage}</span>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 italic text-[10px]">حذف</button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-xl flex gap-3">
                <AlertCircle size={20} className="text-accent shrink-0" />
                <p className="text-[10px] leading-relaxed text-accent/80 font-bold">
                  تنبيه: سيقوم التطبيق بتعديل مواعيد التنبيهات تلقائياً عند تغيير المناطق الزمنية لضمان استمرارية جرعاتك بدقة.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
