import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Shield, AlertCircle, MapPin, Info, ArrowRight, Activity, LifeBuoy } from 'lucide-react';
import { travelAssistantService, EmergencyInfo } from '../services/travelAssistant';
import Navbar from './Navbar';

export default function Emergency() {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [country, setCountry] = useState('syria');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmergencyInfo();
  }, [country]);

  const loadEmergencyInfo = async () => {
    setLoading(true);
    try {
      const info = await travelAssistantService.getEmergencyInfo(country);
      setEmergencyInfo(info);
    } catch (error) {
      console.error('Failed to load emergency info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = async (type: string) => {
    try {
      const callData = await travelAssistantService.getEmergencyCallLink(type, country);
      window.open(callData.telLink, '_self');
    } catch (error) {
      console.error('Failed to get call link:', error);
    }
  };

  const emergencyActions = [
    { id: 'police', label: 'الشرطة', icon: Shield, color: 'blue', number: emergencyInfo?.police },
    { id: 'ambulance', label: 'الإسعاف', icon: Activity, color: 'red', number: emergencyInfo?.ambulance },
    { id: 'fire', label: 'الإطفاء', icon: LifeBuoy, color: 'orange', number: emergencyInfo?.fire },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4">
            <AlertCircle size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">مركز الطوارئ والسلامة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">نحن هنا للمساعدة</h1>
          <p className="text-gray-400 max-w-xl mx-auto">أرقام الطوارئ والمعلومات الطبية الهامة في متناول يدك دائماً لضمان سلامتك أثناء رحلتك.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {emergencyActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleEmergencyCall(action.id)}
              className={`glass-panel p-8 flex flex-col items-center gap-4 group interactive-hover border-${action.color}-500/20`}
            >
              <div className={`p-5 rounded-2xl bg-${action.color}-500/10 border border-${action.color}-500/20 group-hover:bg-${action.color}-500/20 transition-all`}>
                <action.icon size={32} className={`text-${action.color}-500`} />
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold mb-1">{action.label}</span>
                <span className="block text-2xl font-outfit text-gray-300">{action.number || '---'}</span>
              </div>
              <div className={`mt-2 px-4 py-1.5 rounded-full bg-${action.color}-500/10 text-${action.color}-500 text-xs font-bold`}>
                اتصال فوري
              </div>
            </motion.button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Medical Tips */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                <Info size={20} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold">إرشادات طبية</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400 leading-relaxed italic">"{emergencyInfo?.medicalTips}"</p>
              <div className="flex flex-wrap gap-2 pt-4">
                {emergencyInfo?.languages.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-white/5 border border-glassBorder rounded-lg text-xs font-medium text-gray-400">{lang}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Location & Embassy */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <MapPin size={20} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">الموقع الحالي والسفارة</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-glassBorder rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img src="https://flagcdn.com/w80/sy.png" alt="Syria" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold">دمشق، سوريا</span>
                    <span className="block text-xs text-gray-500">موقعك الحالي</span>
                  </div>
                </div>
                <button className="text-accent hover:underline text-sm font-bold">تغيير</button>
              </div>
              
              <div className="p-4 bg-surface rounded-xl border border-glassBorder">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-gray-500" />
                  <span className="text-xs uppercase tracking-tighter text-gray-500 font-bold">معلومات السفارة</span>
                </div>
                <p className="text-sm font-medium">{emergencyInfo?.embassy}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
