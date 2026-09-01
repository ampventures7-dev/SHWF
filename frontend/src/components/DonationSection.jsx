import React, { useState } from 'react';
import { QrCode, Copy, Check, Building2, User, CreditCard, MapPin, Phone, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function DonationSection({ onToast }) {
  const [copiedField, setCopiedField] = useState(null);

  const bankDetails = {
    accountName: 'SMART HEALTH WELFARE FOUNDATION',
    accountNumber: '418502010224987',
    bankName: 'UNION BANK OF INDIA',
    branch: 'AMGAONBADA',
    ifscCode: 'UBIN0541851',
    phone: '9424 761140',
  };

  const handleCopy = (text, label, fieldKey) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedField(fieldKey);
        if (onToast) onToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedField(null), 2500);
      },
      () => {
        if (onToast) onToast(`Could not copy ${label}`, 'error');
      }
    );
  };

  return (
    <section id="donate" className="py-20 bg-gradient-to-b from-white via-shwf-navy-subtle/50 to-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Headlines */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-shwf-orange-subtle text-shwf-orange-dark font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Your Contribution Shapes a Child's Future
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-shwf-navy uppercase tracking-tight mb-3">
            DONATE / SUPPORT <span className="text-shwf-green">A HEALTHY LIFE..</span>
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-slate-700 font-medium">
            "Let's join hands for a healthy, educated and compassionate society."
          </p>
        </div>

        {/* Side-by-Side Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Card 1: SCAN TO DONATE (Left Column) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-shwf-green shadow-xl p-6 sm:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-full">
              {/* Header Pill */}
              <div className="bg-shwf-green-dark text-white font-extrabold text-base uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md mb-6 inline-block w-full">
                SCAN TO DONATE
              </div>

              {/* QR Code Container */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-inner inline-flex flex-col items-center justify-center mb-6 max-w-[260px] mx-auto group hover:border-shwf-green transition-all duration-300">
                <img
                  src="/donation_qr.png"
                  alt="PhonePe UPI QR Code - Smart Health Welfare Foundation"
                  className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {/* Supported UPI Apps */}
              <div className="mb-5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  PAY WITH ANY UPI APP
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700">GPay</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-[#5f259f]/10 border border-[#5f259f]/30 rounded text-[#5f259f]">PhonePe</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-[#00baf2]/10 border border-[#00baf2]/30 rounded text-[#002970]">Paytm</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-[#ff9900]/10 border border-[#ff9900]/30 rounded text-slate-800">amazon pay</span>
                </div>
              </div>
            </div>

            {/* Helpline / Contact Phone */}
            <div className="w-full bg-shwf-navy-subtle border border-shwf-navy/20 rounded-2xl p-3.5 flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full bg-shwf-navy text-white flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase">CONTACT / PHONE NO.</div>
                <div className="text-base font-black text-shwf-navy tracking-wide">
                  {bankDetails.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: BANK ACCOUNT DETAILS (Right Column) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-shwf-navy shadow-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Header Pill */}
              <div className="bg-shwf-navy-dark text-white font-extrabold text-base uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md mb-6 text-center">
                BANK ACCOUNT DETAILS
              </div>

              {/* Bank Details Rows */}
              <div className="space-y-4">
                
                {/* 1. Account Name */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-shwf-navy-subtle text-shwf-navy flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ACCOUNT NAME</div>
                    <div className="text-sm sm:text-base font-black text-shwf-orange-dark">
                      {bankDetails.accountName}
                    </div>
                  </div>
                </div>

                {/* 2. Account Number */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-shwf-green-subtle text-shwf-green flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ACCOUNT NUMBER</div>
                    <div className="text-base sm:text-lg font-black text-shwf-navy tracking-wider">
                      {bankDetails.accountNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(bankDetails.accountNumber, 'Account Number', 'accNum')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-shwf-navy text-shwf-navy hover:bg-shwf-navy hover:text-white transition-all shadow-sm flex-shrink-0"
                  >
                    {copiedField === 'accNum' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-shwf-green" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Bank Name */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-shwf-navy-subtle text-shwf-navy flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">BANK NAME</div>
                    <div className="text-sm sm:text-base font-black text-shwf-orange-dark">
                      {bankDetails.bankName}
                    </div>
                  </div>
                </div>

                {/* 4. Branch */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-shwf-green-subtle text-shwf-green flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">BRANCH</div>
                    <div className="text-sm sm:text-base font-black text-shwf-green-dark">
                      {bankDetails.branch}
                    </div>
                  </div>
                </div>

                {/* 5. IFSC Code */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-shwf-orange-subtle text-shwf-orange flex items-center justify-center flex-shrink-0">
                    <span className="font-black text-xs">IFSC</span>
                  </div>
                  <div className="flex-grow">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">IFSC CODE</div>
                    <div className="text-base sm:text-lg font-black text-shwf-orange-dark tracking-wider">
                      {bankDetails.ifscCode}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(bankDetails.ifscCode, 'IFSC Code', 'ifsc')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-shwf-orange text-shwf-orange-dark hover:bg-shwf-orange hover:text-white transition-all shadow-sm flex-shrink-0"
                  >
                    {copiedField === 'ifsc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-shwf-green" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Tax Exemption & Assurance Pill */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2.5 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-shwf-green flex-shrink-0" />
              <span>
                All donations are audited and directly empower underprivileged school children. Reg. No. <b>04/16/03/20319/24</b>
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
