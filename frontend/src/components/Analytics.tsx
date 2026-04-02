import { useState, useEffect } from 'react';
import { travelAssistantService, AnalyticsReport, Recommendation } from '../services/travelAssistant';
import { useAuthStore } from '../store/authStore';

export default function Analytics() {
  const { user } = useAuthStore();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('monthly');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, range]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [reportData, recData] = await Promise.all([
        travelAssistantService.getAnalyticsReport(range),
        travelAssistantService.getPersonalRecommendations(),
      ]);
      setReport(reportData);
      setRecommendations(recData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-8">يرجى تسجيل الدخول لعرض التحليلات</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">📊 التقارير والتحليلات الشخصية</h2>

      {/* Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">الفترة الزمنية:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">جاري تحميل التحليلات...</div>
      ) : report ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary mb-4">تقرير {range === 'monthly' ? 'شهري' : 'سنوي'}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">المصروفات</span>
                <span className="font-bold text-primary">{report.expenses} ريال</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">الأماكن المزورة</span>
                <span className="font-bold text-primary">{report.placesVisited}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">التقييمات المكتوبة</span>
                <span className="font-bold text-primary">{report.reviewsWritten}</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary mb-4">توصيات شخصية</h3>
            {recommendations.length === 0 ? (
              <p className="text-gray-600 text-center py-4">لا توجد توصيات متاحة</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <h4 className="font-semibold text-gray-800 mb-2">{rec.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">الفئة: {rec.category}</p>
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">لا توجد بيانات متاحة</div>
      )}

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-bold text-primary mb-4">💡 نصائح لتحسين تجربة السفر</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">نصيحة 1</h4>
            <p className="text-sm text-blue-700">بناءً على نشاطك، جرب زيارة الأماكن التاريخية في الصباح الباكر لتجنب الازدحام.</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">نصيحة 2</h4>
            <p className="text-sm text-green-700">وفر المال من خلال استخدام وسائل النقل العام بدلاً من التاكسي في الرحلات القصيرة.</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">نصيحة 3</h4>
            <p className="text-sm text-purple-700">شارك رحلاتك مع الأصدقاء للحصول على توصيات إضافية وتجارب مشتركة.</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">نصيحة 4</h4>
            <p className="text-sm text-orange-700">استخدم تطبيق الصحة لتتبع أدويتك وضمان عدم نسيان الجرعات أثناء السفر.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
