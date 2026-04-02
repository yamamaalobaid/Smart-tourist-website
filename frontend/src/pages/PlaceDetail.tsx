import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddReview from '../components/AddReview';
import { placeService, Place } from '../services/places';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';

export default function PlaceDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [gettingDirections, setGettingDirections] = useState(false);

  useEffect(() => {
    if (!id) return;
    placeService.getPlaceById(id)
      .then(setPlace)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/places/${id}/reviews`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => setReviews(data.data || (Array.isArray(data) ? data : [])))
      .catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (!user || !place) { setIsFavorite(false); return; }
    placeService.getFavorites()
      .then(favs => {
        const found = (favs || []).some((f: any) => {
          const pid = f.placeId || f.place?._id || f._id;
          return pid === place._id;
        });
        setIsFavorite(Boolean(found));
      })
      .catch(() => {});
  }, [user, place]);

  const buildMapQuery = () => {
    if (!place) return '';
    if (typeof place.latitude === 'number' && typeof place.longitude === 'number')
      return `${place.latitude},${place.longitude}`;
    return encodeURIComponent(place.addressEn || place.addressAr || place.nameAr || '');
  };

  const openDirections = (mode: 'driving' | 'walking' | 'transit') => {
    if (!place) return;
    setGettingDirections(true);
    const dest = typeof place.latitude === 'number'
      ? `${place.latitude},${place.longitude}`
      : encodeURIComponent(place.addressEn || place.addressAr || place.nameAr || '');
    const open = (origin?: string) => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}${origin ? `&origin=${origin}` : ''}`,
        '_blank'
      );
      setGettingDirections(false);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => open(`${p.coords.latitude},${p.coords.longitude}`),
        () => open(),
        { timeout: 5000 }
      );
    } else {
      open();
    }
  };

  if (loading) return <Loading />;
  if (!place) return <div className="text-center py-20 text-white">المكان غير موجود</div>;

  const images: string[] = [];
  if (place.featuredImage) images.push(place.featuredImage);
  (place.images || []).forEach(img => {
    if (!images.includes(img.imageUrl)) images.push(img.imageUrl);
  });

  return (
    <div className="min-h-screen bg-background text-white font-cairo overflow-x-hidden">
      <Navbar />

      {/* ─── Cinematic Hero ─────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {images[0] ? (
          <img src={images[0]} alt={place.nameAr} className="w-full h-full object-cover scale-110 animate-slow-zoom" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center">
            <span className="text-9xl opacity-20">📍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-widest rounded-full">
                  {place.category}
                </span>
                {place.totalReviews > 10 && (
                  <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded-full">
                    ✓ موثّق
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-2 drop-shadow-2xl">{place.nameAr}</h1>
              <p className="text-gray-400 text-xl font-light tracking-wide font-outfit">{place.nameEn}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              {user && (
                <button
                  onClick={async () => {
                    try {
                      if (isFavorite) { await placeService.removeFavorite(place._id); setIsFavorite(false); }
                      else { await placeService.addFavorite(place._id); setIsFavorite(true); }
                    } catch {}
                  }}
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl transition-all ${
                    isFavorite ? 'bg-red-500/20 border-red-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              )}
              <button
                onClick={() => window.location.replace(`/book/${place._id}`)}
                className="px-8 py-4 bg-accent text-secondary font-black rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
              >
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
        {/* ─── Rating & Nav Bar ──────────────────────────── */}
        <div className="glass-panel p-6 border border-white/5 -mt-8 relative z-10 flex flex-wrap items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-accent font-outfit">{place.averageRating.toFixed(1)}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">من 5</div>
            </div>
            <div>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(place.averageRating) ? 'text-accent' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-400">بناءً على <span className="text-white font-bold">{place.totalReviews}</span> تقييم</p>
            </div>
          </div>
          <div className="flex gap-3">
            {([['driving', '🚗', 'سيارة'], ['walking', '🚶', 'مشي'], ['transit', '🚌', 'باص']] as const).map(
              ([mode, icon, label]) => (
                <button
                  key={mode}
                  onClick={() => openDirections(mode)}
                  disabled={gettingDirections}
                  className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-accent/30 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <span>{icon}</span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ─── Main Column ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Description — Point 3 */}
            <div className="glass-panel p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-accent rounded-full" />عن المكان
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{place.descriptionAr || 'لا يوجد وصف متاح.'}</p>
              {place.descriptionEn && (
                <p className="text-gray-500 leading-relaxed mt-4 font-outfit italic border-t border-white/5 pt-4">{place.descriptionEn}</p>
              )}
            </div>

            {/* Photo Gallery — Point 10 */}
            {images.length > 1 && (
              <div className="glass-panel p-8 border border-white/5">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-accent rounded-full" />معرض الصور
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 group">
                      <img src={img} alt={`${place.nameAr} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                  <button className="aspect-square rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all">
                    <span className="text-3xl">📷</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">أضف صورتك</span>
                  </button>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="glass-panel p-8 border border-white/5">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-accent rounded-full" />الموقع الجغرافي
              </h2>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <iframe
                  title="place-map"
                  src={`https://www.google.com/maps?q=${buildMapQuery()}&z=15&output=embed`}
                  className="w-full h-72 border-0"
                  loading="lazy"
                />
              </div>
              {place.addressAr && (
                <div className="mt-4 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-accent text-xl">📍</span>
                  <p className="text-gray-300">{place.addressAr}</p>
                </div>
              )}
            </div>

            {/* Reviews — Point 10 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="w-1 h-8 bg-accent rounded-full" />آراء الزوار
                </h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(v => !v)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      showReviewForm
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-accent/20 border border-accent/30 text-accent hover:bg-accent hover:text-secondary'
                    }`}
                  >
                    {showReviewForm ? '✕ إغلاق' : '+ أضف تقييمك'}
                  </button>
                )}
              </div>

              {showReviewForm && user && id && (
                <AddReview
                  placeId={id}
                  onReviewAdded={async () => {
                    setShowReviewForm(false);
                    try {
                      const r = await fetch(`/api/places/${id}/reviews`);
                      if (r.ok) { const d = await r.json(); setReviews(d.data || d || []); }
                      setPlace(await placeService.getPlaceById(id));
                    } catch {}
                  }}
                />
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev: any, i: number) => (
                    <div key={i} className="glass-panel p-6 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent font-bold">
                            {(rev.user?.firstName || 'م')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{rev.user?.firstName || 'مستخدم'} {rev.user?.lastName || ''}</p>
                            <p className="text-xs text-gray-500">{new Date(rev.createdAt || Date.now()).toLocaleDateString('ar-SY')}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <svg key={j} className={`w-4 h-4 ${j < rev.rating ? 'text-accent' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {rev.commentAr && <p className="text-gray-300 leading-relaxed">{rev.commentAr}</p>}
                      {rev.commentEn && <p className="text-gray-500 text-sm mt-2 italic font-outfit">{rev.commentEn}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-12 border border-white/5 text-center">
                  <div className="text-6xl mb-4 opacity-30">💬</div>
                  <p className="text-gray-500">كن أول من يشارك تجربته في هذا المكان!</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ──────────────────────────────────── */}
          <div>
            <div className="glass-panel p-6 border border-white/5 sticky top-28 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                <span className="w-1 h-6 bg-accent rounded-full" />معلومات سريعة
              </h3>

              {place.entryFee !== undefined && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3"><span className="text-xl">🎟️</span><span className="text-gray-400 text-sm">رسوم الدخول</span></div>
                  <span className="font-bold text-accent font-outfit">{place.entryFee === 0 ? 'مجاني' : `${place.entryFee} ل.س`}</span>
                </div>
              )}
              {place.contactPhone && (
                <a href={`tel:${place.contactPhone}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3"><span className="text-xl">📞</span><span className="text-gray-400 text-sm">هاتف</span></div>
                  <span className="font-bold text-sm font-outfit group-hover:text-accent transition-colors">{place.contactPhone}</span>
                </a>
              )}
              {place.contactEmail && (
                <a href={`mailto:${place.contactEmail}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3"><span className="text-xl">✉️</span><span className="text-gray-400 text-sm">بريد</span></div>
                  <span className="font-bold text-xs font-outfit group-hover:text-accent transition-colors truncate max-w-[140px]">{place.contactEmail}</span>
                </a>
              )}
              {place.website && (
                <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3"><span className="text-xl">🌐</span><span className="text-gray-400 text-sm">موقع</span></div>
                  <span className="text-xs text-accent font-bold font-outfit">زيارة ←</span>
                </a>
              )}

              <button
                onClick={() => {
                  if (navigator.share) navigator.share({ title: place.nameAr, url: location.href });
                  else { navigator.clipboard.writeText(location.href); }
                }}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                🔗 <span>مشاركة المكان</span>
              </button>

              <button
                onClick={() => window.location.replace(`/book/${place._id}`)}
                className="w-full py-5 bg-accent text-secondary font-black rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all text-lg"
              >
                احجز الآن ←
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
