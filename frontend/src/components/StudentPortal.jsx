import React, { useState, useEffect } from 'react';
import { Search, School, MapPin, Building, Lock, Loader2, UserCheck, AlertCircle } from 'lucide-react';
import { API } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function StudentPortal({ onSelectStudent, onToast }) {
  const { t } = useLanguage();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [nameQuery, setNameQuery] = useState('');

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [searching, setSearching] = useState(false);

  const [students, setStudents] = useState(null);

  // Load States on mount
  useEffect(() => {
    async function fetchStates() {
      try {
        const data = await API.getStates();
        setStates(data);
      } catch (err) {
        console.warn('Could not fetch states:', err);
      }
    }
    fetchStates();
  }, []);

  // When state changes, fetch districts
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedDistrict('');
    setSelectedSchool('');
    setDistricts([]);
    setSchools([]);
    setStudents(null);

    if (!stateId) return;

    setLoadingDistricts(true);
    try {
      const data = await API.getDistricts(stateId);
      setDistricts(data);
    } catch (err) {
      if (onToast) onToast('Failed to load districts', 'error');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // When district changes, fetch schools
  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedSchool('');
    setSchools([]);
    setStudents(null);

    if (!districtId) return;

    setLoadingSchools(true);
    try {
      const selectedDistObj = districts.find((d) => d.id === districtId);
      const data = await API.getSchools(districtId, selectedDistObj ? selectedDistObj.name : '');
      setSchools(data);
    } catch (err) {
      if (onToast) onToast('Failed to load schools', 'error');
    } finally {
      setLoadingSchools(false);
    }
  };

  // Perform Student Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!selectedSchool) {
      if (onToast) onToast('Please select State, District, and School first', 'warning');
      return;
    }

    setSearching(true);
    try {
      const results = await API.searchStudents(selectedSchool, nameQuery);
      setStudents(results || []);
    } catch (err) {
      if (onToast) onToast(err.message || 'Error searching students', 'error');
      setStudents([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section id="portal" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-shwf-navy-subtle text-shwf-navy font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            {t('portal.badge', 'Parent & Student Access')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-shwf-navy tracking-tight mb-3">
            {t('portal.title', 'Digital Health Report Card Portal')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            {t('portal.subtitle', 'Select your child\'s school and enter their name to retrieve certified WHO growth report cards via secure parent OTP authentication.')}
          </p>
        </div>

        {/* Search Portal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 max-w-4xl mx-auto">
          
          {/* Cascading Dropdowns Form */}
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* 1. State Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-shwf-navy" />
                    {t('portal.step1', '1. Select State')}
                  </span>
                  {states.length > 0 && (
                    <span className="text-[10px] text-shwf-navy bg-shwf-navy-subtle px-2 py-0.5 rounded-full font-bold">
                      {states.length} States & UTs
                    </span>
                  )}
                </label>
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-navy focus:bg-white transition-all"
                >
                  <option value="">{t('portal.selectStatePlaceholder', '-- Choose State --')}</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.type === 'Union Territory' ? '(UT)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-shwf-green" />
                    {t('portal.step2', '2. Select District')}
                  </span>
                  {districts.length > 0 && (
                    <span className="text-[10px] text-shwf-green bg-green-50 px-2 py-0.5 rounded-full font-bold">
                      {districts.length} Districts
                    </span>
                  )}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedState || loadingDistricts}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-green focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">
                    {loadingDistricts
                      ? 'Loading Districts...'
                      : districts.length > 0
                      ? `-- ${t('portal.selectDistrictPlaceholder', 'Choose District')} (${districts.length} Districts) --`
                      : t('portal.selectDistrictPlaceholder', '-- Choose District --')}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. School Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-shwf-orange" />
                    {t('portal.step3', '3. Select School')}
                  </span>
                  {schools.length > 0 && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      {schools.length} Schools
                    </span>
                  )}
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  disabled={!selectedDistrict || loadingSchools}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-shwf-orange focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">
                    {loadingSchools
                      ? 'Loading Schools...'
                      : schools.length > 0
                      ? `-- ${t('portal.selectSchoolPlaceholder', 'Choose School')} (${schools.length} Available) --`
                      : t('portal.selectSchoolPlaceholder', '-- Choose School --')}
                  </option>
                  {schools.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.school_code})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Student Name Query & Search Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder={t('portal.searchStudentPlaceholder', 'Enter Student Name or leave blank for all...')}
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-shwf-navy focus:bg-white transition-all"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              
              <button
                type="submit"
                disabled={searching || !selectedSchool}
                className="inline-flex items-center justify-center gap-2 bg-shwf-navy hover:bg-shwf-navy-light text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('portal.searching', 'Searching...')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('portal.step4', 'Search Records')}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Table */}
          {students !== null && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold text-shwf-navy flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-shwf-green" />
                  <span>Matching Student Records ({students.length})</span>
                </h4>
                <span className="text-xs text-slate-500">{t('portal.privacyNotice', 'Showing non-sensitive public index')}</span>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-semibold">{t('portal.noStudentsFound', 'No students found matching your query.')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-shwf-navy-subtle text-shwf-navy text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">{t('portal.studentId', 'Student ID')}</th>
                        <th className="py-3.5 px-4">{t('dashboard.studentName', 'Full Name')}</th>
                        <th className="py-3.5 px-4">{t('dashboard.school', 'School')}</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium">
                      {students.map((st) => (
                        <tr key={st.id || st.student_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-shwf-navy">{st.student_id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{st.full_name}</td>
                          <td className="py-3.5 px-4 text-slate-600">{st.school_name || 'Partner School'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onSelectStudent(st)}
                              className="inline-flex items-center gap-1.5 bg-shwf-navy hover:bg-shwf-navy-light text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                            >
                              <Lock className="w-3.5 h-3.5 text-shwf-orange-light" />
                              <span>{t('portal.viewHealthCard', 'View Health Report')}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

