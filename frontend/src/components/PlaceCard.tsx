import { Link } from 'react-router-dom';
import { Place } from '../services/places';
import { MapPin, Heart, ArrowLeft, Star } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onFavorite?: (placeId: string) => void;
  distanceKm?: number | null;
}

export default function PlaceCard({ place, onFavorite }: PlaceCardProps) {
  return (
    <div className="glass-panel overflow-hidden group hover:border-primary/50 transition-colors h-full flex flex-col font-outfit">
      {/* Image */}
      <div className="relative h-56 bg-surface overflow-hidden">
        {place.featuredImage || (place.images && place.images.length > 0) ? (
          <img
            src={place.featuredImage || place.images?.[0]?.imageUrl}
            alt={place.nameAr}
            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-damascus flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-500 opacity-50" />
          </div>
        )}
        
        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.(place._id);
          }}
          className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-sm rounded-full shadow-lg hover:bg-black/60 transition-colors text-white z-10"
        >
          <Heart className="w-5 h-5 hover:scale-110 transition-transform" />
        </button>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-4 py-1.5 bg-gradient-gold text-secondary font-bold text-sm rounded-full shadow-lg font-cairo">
          {place.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors font-cairo line-clamp-1">{place.nameAr}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed font-light">{place.descriptionAr}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-white font-medium ml-1">{Number(place.averageRating).toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500 font-light">({place.totalReviews} مراجعة)</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-gray-400 text-sm mb-6 mt-auto font-light">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <div className="flex flex-col">
            <p className="line-clamp-1">{place.addressAr}</p>
            {typeof (place as any).distanceKm === 'number' && (
              <p className="text-xs text-accent mt-1">المسافة: {(place as any).distanceKm.toFixed(1)} كم</p>
            )}
          </div>
        </div>

        {/* View Button */}
        <Link
          to={`/places/${place._id}`}
          className="flex items-center justify-between w-full px-5 py-3 bg-white/5 border border-glassBorder text-white rounded-lg hover:bg-gradient-gold hover:text-secondary font-medium transition-all group/btn font-cairo"
        >
          <span>عرض التفاصيل</span>
          <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
