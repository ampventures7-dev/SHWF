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
  Newspaper,
  PlayCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Camp Gallery Data Architecture
 * Note: These photos are structured for instant replacement with user-uploaded high-res camp photos.
 */
export const CAMP_GALLERY_ITEMS = [
  {
    id: 'foundation-banner',
    category: 'camps',
    image: '/gallery/foundation_banner.png',
    title_en: 'Smart Health Welfare Foundation - Registered Mission',
    title_hi: 'स्मार्ट हेल्थ वेलफेयर फाउंडेशन - पंजीकृत संस्था',
    location_en: 'Amgaon Bada, Kareli Dist. Narsinghpur',
    location_hi: 'आमगांव बड़ा, करेली जिला नरसिंहपुर',
    date: 'Reg. No. 04/16/03/20319/24',
    doctor_note_en: 'Official mission banner of Smart Health Welfare Foundation dedicated to rural healthcare and health checkups under Swasth Bharat Mission (Contact: +91 9424761140, +91 9713673141).',
    doctor_note_hi: 'स्वस्थ भारत मिशन के तहत ग्रामीण स्वास्थ्य सेवाओं व निःशुल्क जांच शिविरों को समर्पित स्मार्ट हेल्थ वेलफेयर फाउंडेशन का आधिकारिक बैनर (संपर्क: +91 9424761140, +91 9713673141)।'
  },
  {
    id: 'camp-1',
    category: 'camps',
    image: '/gallery/img1.jpg',
    title_en: 'Rural Health Awareness Campaign',
    title_hi: 'ग्रामीण स्वास्थ्य जागरूकता अभियान',
    location_en: 'Village Community Camp',
    location_hi: 'ग्राम सामुदायिक शिविर',
    date: 'Recent Camp',
    doctor_note_en: 'The foundation team organizing a health awareness drive in remote rural areas, crossing geographical barriers to provide care.',
    doctor_note_hi: 'दूरस्थ ग्रामीण क्षेत्रों में स्वास्थ्य जागरूकता अभियान का आयोजन, जहां टीम ने भौगोलिक बाधाओं को पार कर सेवाएं प्रदान कीं।'
  },
  {
    id: 'camp-2',
    category: 'camps',
    image: '/gallery/img2.jpg',
    title_en: 'Environmental Health & Plantation Drive',
    title_hi: 'पर्यावरण संरक्षण एवं वृक्षारोपण अभियान',
    location_en: 'Community Ground',
    location_hi: 'सामुदायिक मैदान',
    date: 'Recent Camp',
    doctor_note_en: 'Promoting a healthier environment alongside healthcare by planting saplings with community members and volunteers.',
    doctor_note_hi: 'स्वास्थ्य देखभाल के साथ-साथ स्वच्छ पर्यावरण को बढ़ावा देने के लिए स्थानीय समुदाय और स्वयंसेवकों के साथ वृक्षारोपण।'
  },
  {
    id: 'camp-3',
    category: 'camps',
    image: '/gallery/img3.jpg',
    title_en: 'Green Initiative & Community Engagement',
    title_hi: 'हरित पहल एवं सामुदायिक सहभागिता',
    location_en: 'Foundation Initiative',
    location_hi: 'फाउंडेशन पहल',
    date: 'Recent Camp',
    doctor_note_en: 'Team members and local volunteers participating in our green initiative, symbolizing the growth and nurturing of community health.',
    doctor_note_hi: 'टीम के सदस्यों और स्थानीय स्वयंसेवकों ने हरित पहल में भाग लिया, जो सामुदायिक स्वास्थ्य के विकास और पोषण का प्रतीक है।'
  },
  {
    id: 'camp-4',
    category: 'camps',
    image: '/gallery/img4.jpg',
    title_en: 'Health Camp Registration & Support Desk',
    title_hi: 'स्वास्थ्य शिविर पंजीकरण एवं सहायता डेस्क',
    location_en: 'Local Community Area',
    location_hi: 'स्थानीय सामुदायिक क्षेत्र',
    date: 'Recent Camp',
    doctor_note_en: 'Engaging with the local community to provide information, register participants for health checkups, and gather support for our cause.',
    doctor_note_hi: 'स्थानीय समुदाय को जानकारी प्रदान करने, स्वास्थ्य जांच के लिए प्रतिभागियों को पंजीकृत करने और हमारे अभियान के लिए समर्थन जुटाने का कार्य।'
  },
  {
    id: 'camp-5',
    category: 'screening',
    image: '/gallery/img5.jpg',
    title_en: 'Free Vision Screening & Refraction Test',
    title_hi: 'निःशुल्क नेत्र दृष्टि जांच एवं अपवर्तन परीक्षण',
    location_en: 'Village Health Camp',
    location_hi: 'ग्राम स्वास्थ्य शिविर',
    date: 'Recent Camp',
    doctor_note_en: 'An elderly patient receiving comprehensive vision test from our specialist to provide accurate corrective glasses and improve quality of life.',
    doctor_note_hi: 'हमारे विशेषज्ञ द्वारा बुजुर्ग महिलाओ की गहन दृष्टि जांच, ताकि उन्हें सही चश्मा उपलब्ध कराकर उनके जीवन स्तर में सुधार किया जा सके।'
  },
  {
    id: 'camp-cataract-1',
    category: 'screening',
    image: '/gallery/cataract_patients.jpg',
    title_en: 'Successful Cataract Surgeries & IOL Implants',
    title_hi: 'सफलतापूर्वक मोतियाबिंद ऑपरेशन एवं IOL प्रत्यारोपण',
    location_en: 'Smart Health Foundation, Aamgaon Bada',
    location_hi: 'स्मार्ट हेल्थ फाउंडेशन, आमगांव बड़ा',
    date: 'Recent',
    doctor_note_en: 'Successful treatment of all cataract patients under our free health camp. Patients underwent Phacoemulsification (laser technique) surgery with modern Foldable IOL (artificial lens) implantation. The Foldable IOL lenses, costing ₹16,500 per patient, were provided completely free of charge. Always dedicated to your service: Smart Health Foundation, Aamgaon Bada.',
    doctor_note_hi: 'निशुल्क स्वास्थ्य शिविर के अंतर्गत 👁️ सभी मोतियाबिंद मरीजों का सफलतापूर्वक उपचार। 🙏 मरीजों के मोतियाबिंद ऑपरेशन में Phacoemulsification (फेको लेजर तकनीक) द्वारा ऑपरेशन के साथ आधुनिक Foldable IOL (कृत्रिम लेंस) का प्रत्यारोपण किया गया। Foldable IOL लेंस की कीमत – ₹16,500 प्रति मरीज निशुल्क डाला गया। आपकी सेवा में हमेशा समर्पित :- स्मार्ट हेल्थ फाउंडेशन, आमगांव बड़ा।'
  },
  {
    id: 'camp-cataract-2',
    category: 'screening',
    image: '/gallery/post_op_care.jpg',
    title_en: 'Post-Operative Care & Patient Support',
    title_hi: 'ऑपरेशन के बाद मरीजों की देखभाल एवं सहायता',
    location_en: 'Smart Health Foundation, Aamgaon Bada',
    location_hi: 'स्मार्ट हेल्थ फाउंडेशन, आमगांव बड़ा',
    date: 'Recent',
    doctor_note_en: 'Providing continuous care and support to elderly patients resting in the ward after their successful cataract surgeries. Our dedicated volunteers ensure their comfort, recovery, and overall well-being throughout the healing process.',
    doctor_note_hi: 'सफलतापूर्वक मोतियाबिंद ऑपरेशन के बाद वार्ड में आराम कर रहे बुजुर्ग मरीजों की निरंतर देखभाल एवं सहायता। हमारे स्वयंसेवक यह सुनिश्चित करते हैं कि मरीजों को स्वास्थ्य लाभ के दौरान पूरा आराम और सुविधाएं मिलें।'
  },
  {
    id: 'camp-hospital',
    category: 'camps',
    image: '/gallery/hospital.jpg',
    title_en: 'Partner Hospital - Sukh Sagar Medical College',
    title_hi: 'सहयोगी अस्पताल - सुख सागर मेडिकल कॉलेज',
    location_en: 'Jabalpur',
    location_hi: 'जबलपुर',
    date: 'Partner Institution',
    doctor_note_en: 'Our esteemed partner institution, Sukh Sagar Medical College & Hospital, where all our referred patients receive state-of-the-art medical treatments and free surgeries.',
    doctor_note_hi: 'हमारा सहयोगी संस्थान, सुख सागर मेडिकल कॉलेज एवं अस्पताल, जहां हमारे द्वारा रेफर किए गए सभी मरीजों को अत्याधुनिक चिकित्सा सुविधा और निःशुल्क ऑपरेशन की सुविधा प्रदान की जाती है।'
  },
  {
    id: 'camp-video-1',
    category: 'media',
    type: 'video',
    image: '/gallery/shwf_video.mp4',
    title_en: 'SHWF Health Camp Documentary',
    title_hi: 'SHWF स्वास्थ्य शिविर डॉक्यूमेंट्री',
    location_en: 'Foundation Overview',
    location_hi: 'संस्था का अवलोकन',
    date: 'Recent',
    doctor_note_en: 'Patients availing health services at the free health camp in Aamgaon-Bada, with the Smart Health Foundation team arriving for supervision and care. 🙏💐',
    doctor_note_hi: 'आमगांव- बड़ा के निःशुल्क स्वास्थ्य शिविर में मरीज ले रहे स्वास्थ्य सेवाओं का लाभ, देखरेख के लिए पहुंची स्मार्ट हेल्थ फाउंडेशन की टीम 🙏💐'
  },
  {
    id: 'news-1',
    category: 'media',
    image: '/gallery/news1.jpg',
    title_en: 'Health Camp Coverage - 230 Examined',
    title_hi: 'स्मार्ट हेल्थ फाउंडेशन शिविर: 230 का स्वास्थ्य परीक्षण',
    location_en: 'Local News',
    location_hi: 'स्थानीय समाचार',
    date: 'Recent',
    doctor_note_en: 'Newspaper coverage of our recent health camp where 230 people were examined and 60 patients were identified for cataract surgery.',
    doctor_note_hi: 'हाल ही में आयोजित स्वास्थ्य शिविर की समाचार पत्र में कवरेज, जहां 230 लोगों की जांच की गई और 60 मरीजों को मोतियाबिंद ऑपरेशन के लिए चिन्हित किया गया।'
  },
  {
    id: 'news-2',
    category: 'media',
    image: '/gallery/news2.jpg',
    title_en: 'Ekta Kali Mandal Joint Health Camp',
    title_hi: 'एकता काली मंडल के साथ संयुक्त स्वास्थ्य शिविर',
    location_en: 'Local News',
    location_hi: 'स्थानीय समाचार',
    date: 'Recent',
    doctor_note_en: 'Press report highlighting the joint health camp organized by Smart Health Foundation and Ekta Kali Mandal.',
    doctor_note_hi: 'स्मार्ट हेल्थ फाउंडेशन और एकता काली मंडल द्वारा आयोजित संयुक्त स्वास्थ्य शिविर को उजागर करने वाली प्रेस रिपोर्ट।'
  }
];

export default function Gallery() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const categories = [
    { id: 'all', label: t('gallery.filterAll', 'All Photos'), icon: Camera },
    { id: 'camps', label: t('gallery.filterCamps', 'Health Camps'), icon: HeartPulse },
    { id: 'screening', label: t('gallery.filterScreening', 'Vision & Dental'), icon: Eye },
    { id: 'media', label: t('gallery.filterMedia', 'Media Coverage'), icon: Newspaper }
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
            {language === 'hi' 
              ? 'स्कूली बच्चों से लेकर वरिष्ठ नागरिकों तक — भारत भर में हर जरूरतमंद व्यक्ति को समर्पित निःशुल्क नेत्र जांच, स्वास्थ्य शिविर एवं सेवा की झलकियां।'
              : 'From School Children to Senior Citizens — Serving Every Life in Need with Compassionate Healthcare, Free Eye Screenings, and Clinical Diagnostics across India.'}
          </p>
        </div>

        {/* Filter Tabs */}
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
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${isActive
                  ? 'bg-shwf-navy text-white shadow-md scale-105 ring-2 ring-shwf-navy/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-shwf-navy border border-slate-200'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Photo Grid */}
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
                {/* Image/Video Container with Hover Zoom */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {photo.type === 'video' ? (
                    <>
                      <video
                        src={photo.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                        <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={photo.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect fill="%230f284e" width="600" height="450"/><circle cx="300" cy="200" r="48" fill="%23f97316" opacity="0.85"/><path d="M280 200 C280 185, 320 185, 320 200 C320 215, 300 225, 300 235" stroke="%23ffffff" stroke-width="4" fill="none" stroke-linecap="round"/><text fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" x="300" y="290" text-anchor="middle">Smart Health Foundation</text><text fill="%2394a3b8" font-family="sans-serif" font-size="14" x="300" y="320" text-anchor="middle">Camp Photo Archive</text></svg>';
                      }}
                    />
                  )}

                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-shwf-navy/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                      {photo.category === 'camps' && <HeartPulse className="w-3 h-3 text-emerald-400" />}
                      {photo.category === 'screening' && <Eye className="w-3 h-3 text-cyan-300" />}
                      {photo.category === 'nutrition' && <Apple className="w-3 h-3 text-amber-400" />}
                      {photo.category === 'media' && <Newspaper className="w-3 h-3 text-purple-400" />}
                      <span className="capitalize">
                        {photo.category === 'camps' && (language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camp')}
                        {photo.category === 'screening' && (language === 'hi' ? 'नेत्र व दंत' : 'Screening')}
                        {photo.category === 'nutrition' && (language === 'hi' ? 'पोषण वितरण' : 'Nutrition')}
                        {photo.category === 'media' && (language === 'hi' ? 'मीडिया कवरेज' : 'Media')}
                      </span>
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 bg-white/95 text-shwf-navy font-bold text-xs px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Maximize2 className="w-3.5 h-3.5 text-shwf-orange" />
                      <span>{t('gallery.viewLarger', 'Click to enlarge')}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
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

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-shwf-navy transition-colors line-clamp-2 mb-2">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                      {note}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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

      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-20 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrevPhoto}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all z-20 cursor-pointer"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh]">
            <div className="relative aspect-video sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              {activePhoto.type === 'video' ? (
                <video
                  src={activePhoto.image}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={activePhoto.image}
                  alt={language === 'hi' ? activePhoto.title_hi : activePhoto.title_en}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect fill="%230f284e" width="800" height="500"/><circle cx="400" cy="220" r="56" fill="%23f97316" opacity="0.85"/><text fill="%23ffffff" font-family="sans-serif" font-size="24" font-weight="bold" x="400" y="320" text-anchor="middle">Smart Health Foundation</text><text fill="%2394a3b8" font-family="sans-serif" font-size="16" x="400" y="355" text-anchor="middle">Photo Pending Archive</text></svg>';
                  }}
                />
              )}

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full border border-white/20">
                {selectedPhotoIndex + 1} / {filteredPhotos.length}
              </div>
            </div>

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
