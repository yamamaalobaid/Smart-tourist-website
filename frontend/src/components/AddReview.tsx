import { useState } from 'react';
import apiClient from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface ReviewProps {
  placeId: string;
  onReviewAdded?: () => void;
}

export default function AddReview({ placeId, onReviewAdded }: ReviewProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [commentAr, setCommentAr] = useState('');
  const [commentEn, setCommentEn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post(`/places/${placeId}/reviews`, {
        rating: parseInt(rating.toString()),
        commentAr,
        commentEn,
      });

      setSuccess('تم إضافة مراجعتك بنجاح! شكراً لك.');
      setRating(5);
      setCommentAr('');
      setCommentEn('');

      if (onReviewAdded) {
        setTimeout(onReviewAdded, 1500);
      }

      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال المراجعة. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 border border-white/10 font-cairo shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-accent/20 rounded-2xl text-accent">
            <Star size={24} fill="currentColor" />
         </div>
         <div>
            <h3 className="text-2xl font-bold text-white">أضف تجربتك</h3>
            <p className="text-gray-400 text-sm">ساهم في مساعدة المسافرين الآخرين بتقييمك الصادق</p>
         </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-green-400 text-sm font-bold">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating Selector */}
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">ما هو تقييمك للمكان؟</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="relative p-1"
              >
                <Star 
                  size={40} 
                  className={`transition-all duration-300 ${
                    star <= (hoveredRating || rating) ? 'text-accent fill-accent shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-gray-700'
                  }`}
                  strokeWidth={1.5}
                />
              </motion.button>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-accent">
            {rating === 5 ? 'ممتاز جداً' : rating === 4 ? 'جيد جداً' : rating === 3 ? 'جيد' : rating === 2 ? 'مقبول' : 'سيء'}
          </p>
        </div>

        {/* Dynamic Text Areas */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">رأيك بالعربية</label>
            <textarea
              value={commentAr}
              onChange={(e) => setCommentAr(e.target.value)}
              placeholder="اكتب تجربتك هنا..."
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent outline-none transition-all resize-none h-32 leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Comment in English</label>
            <textarea
              value={commentEn}
              onChange={(e) => setCommentEn(e.target.value)}
              placeholder="Tell us about your visit..."
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent outline-none transition-all resize-none h-32 leading-relaxed font-outfit"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
           <button
             type="submit"
             disabled={loading || (!commentAr && !commentEn)}
             className="flex-1 py-5 bg-accent text-secondary font-black rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {loading ? (
                <div className="w-5 h-5 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
              ) : (
                <>
                   <Send size={20} />
                   <span>إرسال المراجعة</span>
                </>
              )}
           </button>
           
           <button
             type="button"
             className="px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-2"
           >
              <ImageIcon size={20} />
              <span>إضافة صور (UGC)</span>
           </button>
        </div>
      </form>
    </motion.div>
  );
}
