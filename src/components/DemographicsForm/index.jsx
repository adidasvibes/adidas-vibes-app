import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export const DemographicsForm = ({ onSubmit, eventData }) => {
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');

  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
  const genders = ['Male', 'Female'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ageRange && gender) {
      onSubmit({ ageRange, gender });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col justify-center min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-[4px_4px_0px_#1d248a] mb-3 italic leading-[1.1]">
          Tentang <br/> <span className="text-[#f4b337]">Diri Mu</span>
        </h1>
        <p className="text-white/80 text-sm font-semibold tracking-widest uppercase mt-4">
          {eventData ? `Event: ${eventData.name}` : 'Sebelum memulai...'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Age Range */}
        <div className="space-y-3">
          <label className="text-white font-bold uppercase text-sm tracking-wider block">
            🎂 Usia Kamu
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ageRanges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setAgeRange(range)}
                className={`py-3 px-4 rounded-lg font-bold transition-all border-2 ${
                  ageRange === range
                    ? 'bg-[#f4b337] text-[#1d248a] border-white shadow-[4px_4px_0px_#1d248a]'
                    : 'bg-white/10 text-white border-white/30 hover:border-white/60'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className="text-white font-bold uppercase text-sm tracking-wider block">
            ✨ Gender
          </label>
          <div className="space-y-2">
            {genders.map((gen) => (
              <button
                key={gen}
                type="button"
                onClick={() => setGender(gen)}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all border-2 text-left ${
                  gender === gen
                    ? 'bg-[#db2777] text-white border-white shadow-[4px_4px_0px_#1d248a]'
                    : 'bg-white/10 text-white border-white/30 hover:border-white/60'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!ageRange || !gender}
          className={`w-full py-4 px-6 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-lg mt-8 ${
            ageRange && gender
              ? 'bg-gradient-to-r from-[#f4b337] to-[#f58362] text-[#1d248a] shadow-[6px_6px_0px_#1d248a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d248a]'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          Lanjut ke Hasil <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
