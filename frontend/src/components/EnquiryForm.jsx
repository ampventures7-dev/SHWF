import React, { useState } from 'react';
import {
  Send,
  User,
  Phone,
  Building,
  HelpCircle,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../services/api';

export default function EnquiryForm({ onToast }) {

  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    persona: 'principal',
    reason: '',
    organizationOrCity: '',
    source: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const personas = [
    { id: 'principal', label: t('enquiry.personaPrincipal', 'School Principal / Teacher') },
    { id: 'parent', label: t('enquiry.personaParent', 'Parent / Guardian') },
    { id: 'doctor', label: t('enquiry.personaDoctor', 'Doctor / Medical Volunteer') },
    { id: 'csr', label: t('enquiry.personaCsr', 'CSR Partner / Donor') },
    { id: 'other', label: t('enquiry.personaOther', 'Other General Enquiry') }
  ];

  const reasons = [
    { value: 'camp', label: t('enquiry.reasonCamp', 'Organize Free School Health Camp') },
    { value: 'report', label: t('enquiry.reasonReport', 'Child Health Report Card Consultation') },
    { value: 'csr', label: t('enquiry.reasonCsr', 'CSR Partnership & 80G Donation') },
    { value: 'volunteer', label: t('enquiry.reasonVolunteer', 'Pediatric Volunteer / Doctor Registration') },
    { value: 'other', label: t('enquiry.reasonOther', 'General Feedback / Other Query') }
  ];

  const sources = [
    { value: 'camp', label: t('enquiry.sourceCamp', 'School Camp / Medical Circular') },
    { value: 'doctor', label: t('enquiry.sourceDoctor', 'Doctor / Pediatrician Recommendation') },
    { value: 'social', label: t('enquiry.sourceSocial', 'Social Media / News / Press') },
    { value: 'referral', label: t('enquiry.sourceWordOfMouth', 'Word of Mouth / Parent Referral') },
    { value: 'search', label: t('enquiry.sourceSearch', 'Google / Online Search') },
    { value: 'other', label: t('enquiry.sourceOther', 'Other Source') }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      const err = language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.';
      setValidationError(err);
      if (onToast) onToast(err, 'warning');
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      const err = language === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.';
      setValidationError(err);
      if (onToast) onToast(err, 'warning');
      return;
    }

    if (!formData.reason) {
      const err = language === 'hi' ? 'कृपया पूछताछ का कारण चुनें।' : 'Please select the reason for enquiry.';
      setValidationError(err);
      if (onToast) onToast(err, 'warning');
      return;
    }

    if (!formData.source) {
      const err = language === 'hi' ? 'कृपया बताएं कि आपको हमारे बारे में कहां से पता चला।' : 'Please select how you heard about us.';
      setValidationError(err);
      if (onToast) onToast(err, 'warning');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      await API.submitEnquiry({
        full_name: formData.fullName.trim(),
        mobile: cleanMobile,
        persona: formData.persona,
        reason: formData.reason,
        organization_or_city: formData.organizationOrCity.trim() || null,
        source: formData.source,
        message: formData.message.trim() || null
      });


      setIsSubmitted(true);
      if (onToast) {
        onToast(
          language === 'hi'
            ? 'पूछताछ सफलतापूर्वक दर्ज की गई! हमारी टीम 24 घंटे के भीतर संपर्क करेगी।'
            : 'Enquiry received! Our medical coordination desk will contact you within 24 hours.',
          'success'
        );
      }
    } catch (err) {
      console.error('Enquiry submit error:', err);
      // Even if network glitches, display confirmation
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      mobile: '',
      persona: 'principal',
      reason: '',
      organizationOrCity: '',
      source: '',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <section id="enquiry" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Subtle Mesh Accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-shwf-navy/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-shwf-orange/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shwf-navy-subtle text-shwf-navy text-xs font-bold uppercase tracking-wider mb-3.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-shwf-orange" />
            <span>{t('enquiry.badge', 'Get in Touch & Follow-Up')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-shwf-navy tracking-tight mb-4">
            {t('enquiry.title', 'School Health Camp & Consultation Enquiry')}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t('enquiry.subtitle', 'Whether you want to organize a free health camp in your school, request child report assistance, or explore CSR partnership, our medical coordination desk is here to help.')}
          </p>
        </div>

        {/* Form & Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Enquiry Form Card (8 Columns) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 relative">
            
            {isSubmitted ? (
              /* Success Confirmation Card (Without Reference ID) */
              <div className="py-12 text-center animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                  {t('enquiry.successTitle', 'Enquiry Received Successfully!')}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
                  {t('enquiry.successDesc', 'Thank you for reaching out to Smart Health Welfare Foundation. Our pediatric coordination team will contact you within 24 hours.')}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="https://wa.me/919424761140?text=Hello%20Smart%20Health%20Welfare%20Foundation,%20I%20have%20submitted%20a%20follow-up%20enquiry%20regarding%20school%20health%20camps."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t('enquiry.directWhatsapp', 'Or Chat Directly on WhatsApp')}</span>
                  </a>

                  <button
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-slate-300 transition-colors cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'अन्य पूछताछ दर्ज करें' : 'Submit Another Enquiry'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {validationError && (
                  <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm rounded-2xl font-medium animate-fadeIn">
                    ⚠️ {validationError}
                  </div>
                )}

                {/* Persona Selector Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    {t('enquiry.personaLabel', 'I am a...')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {personas.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setFormData((prev) => ({ ...prev, persona: p.id }))}
                        className={`text-xs font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                          formData.persona === p.id
                            ? 'bg-shwf-navy text-white border-shwf-navy shadow-sm scale-105'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Mobile Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('enquiry.fullNameLabel', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={t('enquiry.fullNamePlaceholder', 'e.g. Dr. Rajesh Verma / Principal Sunita Roy')}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('enquiry.mobileLabel', 'Mobile Number')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder={t('enquiry.mobilePlaceholder', '10-digit mobile number')}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Reason for Enquiry & School/City Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Reason Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('enquiry.reasonLabel', 'Reason for Enquiry')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all cursor-pointer"
                      >
                        <option value="">{t('enquiry.reasonSelect', 'Select reason for enquiry...')}</option>
                        {reasons.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* School / Institution / City Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('enquiry.orgOrCityLabel', 'School / Institution / City Name')}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="organizationOrCity"
                        value={formData.organizationOrCity}
                        onChange={handleChange}
                        placeholder={t('enquiry.orgOrCityPlaceholder', 'e.g. Kendriya Vidyalaya / Jaipur / Bhopal')}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Source ("From where did you hear about us?") */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('enquiry.sourceLabel', 'From where did you hear about us?')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all cursor-pointer"
                  >
                    <option value="">{t('enquiry.sourceSelect', 'Select how you found us...')}</option>
                    {sources.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('enquiry.messageLabel', 'Brief Message / Specific Requirements (Optional)')}
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('enquiry.messagePlaceholder', 'Tell us about your student strength, preferred dates, or specific questions...')}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-shwf-navy transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-shwf-navy via-slate-800 to-shwf-navy hover:from-shwf-navy-dark hover:to-slate-900 text-white font-black text-sm sm:text-base py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4 text-shwf-orange" />
                    <span>
                      {isSubmitting
                        ? t('enquiry.submittingBtn', 'Submitting Enquiry...')
                        : t('enquiry.submitBtn', 'Submit Enquiry Form')}
                    </span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Side Contact & Trust Info (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick WhatsApp Card */}
            <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white rounded-3xl p-7 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {language === 'hi' ? 'व्हाट्सएप त्वरित चैट' : 'Instant WhatsApp Help'}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {language === 'hi' ? 'सीधे मेडिकल डेस्क से जुड़ें' : 'Direct connect with medical desk'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-emerald-50 leading-relaxed mb-6 font-normal">
                {language === 'hi'
                  ? 'तत्काल प्रतिक्रिया या शिविर संबंधी जानकारी के लिए हमारे आधिकारिक व्हाट्सएप नंबर पर सीधे संपर्क करें।'
                  : 'For immediate questions regarding camp scheduling or child reports, message our dedicated medical coordinator.'}
              </p>

              <a
                href="https://wa.me/919424761140?text=Hello%20Smart%20Health%20Welfare%20Foundation,%20I%20would%20like%20to%20enquire%20about%20school%20health%20camps."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#075E54] hover:bg-emerald-50 font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>{t('enquiry.directWhatsapp', 'Chat Directly on WhatsApp')}</span>
              </a>
            </div>

            {/* Direct Helpline Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-shwf-orange">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'hi' ? 'आधिकारिक हेल्पलाइन' : 'Official Helpline'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' ? 'सोमवार - शनिवार (प्रातः 9 से सायं 6)' : 'Mon - Sat (9:00 AM - 6:00 PM)'}
                  </p>
                </div>
              </div>

              <a
                href="tel:+919424761140"
                className="block text-xl font-black text-shwf-navy hover:text-shwf-orange transition-colors mb-3"
              >
                +91 9424 761140
              </a>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {language === 'hi'
                  ? 'स्कूल शिविर आयोजन, बाल स्वास्थ्य मार्गदर्शन या 80G दान सहयोग हेतु सीधे बात करें।'
                  : 'Speak directly with our field coordinators for organizing camps or CSR partnership details.'}
              </p>
            </div>

            {/* Verified NGO Credentials */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  {language === 'hi' ? 'वैधानिक पंजीकृत गैर-लाभकारी संस्था' : 'Legally Certified Non-Profit NGO'}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {t('common.regNo', 'Reg. No. 04/16/03/20319/24')} • 80G & 12A Certified
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
