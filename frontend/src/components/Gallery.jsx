import React, { useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  HeartPulse,
  Apple,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  School,
  ImagePlus,
  UploadCloud
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Camp Gallery Data Architecture
 * All generated placeholder photos removed.
 * As soon as you share your camp photos, we will add them directly to this array!
 */
export const CAMP_GALLERY_ITEMS = [
  // Awaiting user's real school health camp photos
];

export default function Gallery() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const categories = [
    { id: 'all', label: t('gallery.filterAll', 'All Photos'), icon: Camera },
    { id: 'camps', label: t('gallery.filterCamps', 'Health Camps'), icon: HeartPulse },
    { id: 'screening', label: t('gallery.filterScreening', 'Vision & Dental'), icon: Eye },
    { id: 'nutrition', label: t('gallery.filterNutrition', 'Nutrition & Cards'), icon: Apple }
  ];

  const filteredPhotos = activeCategory === 'all'
    ? CAMP_GALLERY_ITEMS
    : CAMP_GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos]);

  const handleOpenLightbox = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const activePhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background Subtle Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-shwf-navy-subtle/40 via-emerald-50/30 to-amber-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-shwf-green" />
            <span>{t('gallery.badge', 'On-Ground Visual Impact')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-shwf-navy tracking-tight mb-4">
            {t('gallery.title', 'School Health Camp Gallery')}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t('gallery.subtitle', 'Glimpses of pediatric screenings, dental & vision checkups, and nutritional card distributions across partnering schools in India.')}
          </p>
        </div>

        {/* Filter Tabs */}
        {CAMP_GALLERY_ITEMS.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all'
                ? CAMP_GALLERY_ITEMS.length
                : CAMP_GALLERY_ITEMS.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                    isActive
                      ? 'bg-shwf-navy text-white shadow-md scale-105 ring-2 ring-shwf-navy/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-shwf-navy border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Photo Grid OR Empty Placeholder Container */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPhotos.map((photo, index) => {
              const title = language === 'hi' ? photo.title_hi : photo.title_en;
              const location = language === 'hi' ? photo.location_hi : photo.location_en;
              const note = language === 'hi' ? photo.doctor_note_hi : photo.doctor_note_en;

              return (
                <div
                  key={photo.id}
                  onClick={() => handleOpenLightbox(index)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col"
                >
                  {/* Image Container with Hover Zoom */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={photo.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Category Pill Overlay */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="inline-flex items-center gap-1.5 bg-shwf-navy/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                        {photo.category === 'camps' && <HeartPulse className="w-3 h-3 text-emerald-400" />}
                        {photo.category === 'screening' && <Eye className="w-3 h-3 text-cyan-300" />}
                        {photo.category === 'nutrition' && <Apple className="w-3 h-3 text-amber-400" />}
                        <span className="capitalize">
                          {photo.category === 'camps' && (language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camp')}
                          {photo.category === 'screening' && (language === 'hi' ? 'नेत्र व दंत' : 'Screening')}
                          {photo.category === 'nutrition' && (language === 'hi' ? 'पोषण वितरण' : 'Nutrition')}
                        </span>
                      </span>
                    </div>

                    {/* Expand Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 bg-white/95 text-shwf-navy font-bold text-xs px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="w-3.5 h-3.5 text-shwf-orange" />
                        <span>{t('gallery.viewLarger', 'Click to enlarge')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Meta Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Location & Date */}
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5 gap-2">
                        <span className="inline-flex items-center gap-1 text-slate-600 truncate">
                          <MapPin className="w-3.5 h-3.5 text-shwf-orange shrink-0" />
                          <span className="truncate">{location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{photo.date}</span>
                        </span>
                      </div>

                      {/* Photo Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-shwf-navy transition-colors line-clamp-2 mb-2">
                        {title}
                      </h3>

                      {/* Doctor Clinical Note */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                        {note}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty / Awaiting Photos State */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-shwf-orange" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {language === 'hi' ? 'स्वास्थ्य शिविर फोटो गैलरी' : 'School Camp Photo Gallery'}
            </h3>
            
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              {language === 'hi'
                ? 'आधिकारिक विद्यालय स्वास्थ्य शिविर एवं बाल परीक्षण की वास्तविक तस्वीरें शीघ्र ही यहां प्रदर्शित की जाएंगी।'
                : 'Official school health camp photographs and pediatric screening drives will be displayed here.'}
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-full border border-slate-200">
              <UploadCloud className="w-4 h-4 text-shwf-green" />
              <span>
                {language === 'hi' ? 'तस्वीरें अपलोड के लिए तैयार' : 'Ready for your camp photos'}
              </span>
            </div>
          </div>
        )}

        {/* Partner School Camp Callout Footer */}
        <div className="mt-16 bg-gradient-to-r from-shwf-navy to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-shwf-orange">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold">
                {language === 'hi' ? 'क्या आप अपने विद्यालय में निःशुल्क स्वास्थ्य शिविर आयोजित करना चाहते हैं?' : 'Want to Organize a Free Health Camp in Your School?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {language === 'hi' ? 'स्मार्ट हेल्थ वेलफेयर फाउंडेशन की मेडिकल टीम से संपर्क करें।' : 'Contact Smart Health Welfare Foundation medical team for verified school checkup drives.'}
              </p>
            </div>
          </div>

          <a
            href="tel:+919424761140"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-shwf-orange to-amber-500 hover:from-shwf-orange-dark hover:to-shwf-orange text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer"
          >
            <span>{language === 'hi' ? 'हेल्पलाइन पर कॉल करें (+91 9424 761140)' : 'Call Camp Helpline (+91 9424 761140)'}</span>
          </a>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Full-Screen Lightbox Modal */}
      {/* ========================================================================= */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-20 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left / Prev Button */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right / Next Button */}
          <button
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Main Container */}
          <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh]">
            {/* Image Box */}
            <div className="relative aspect-video sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.image}
                alt={language === 'hi' ? activePhoto.title_hi : activePhoto.title_en}
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full border border-white/20">
                {selectedPhotoIndex + 1} / {filteredPhotos.length}
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white border-t border-white/10 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="inline-flex items-center gap-1.5 text-shwf-orange font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'hi' ? activePhoto.location_hi : activePhoto.location_en}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activePhoto.date}</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                {language === 'hi' ? activePhoto.title_hi : activePhoto.title_en}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi' ? activePhoto.doctor_note_hi : activePhoto.doctor_note_en}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
