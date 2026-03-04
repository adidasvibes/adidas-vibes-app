import React from 'react';
import { ArrowRight, Search, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCodeLookup } from '../../hooks/useCodeLookup';

export const StaffDashboard = ({ user }) => {
  const {
    inputCode,
    setInputCode,
    lookupResult,
    error,
    loading,
    checkCode,
    redeemCode
  } = useCodeLookup(user);

  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative z-10">
      <button 
        onClick={() => navigate('/')} 
        className="text-xs font-black uppercase tracking-widest text-white mb-8 hover:text-white/80 transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit border border-white/20"
      >
        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
      </button>
      
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden border-4 border-white">
        <div className="bg-[#1d248a] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f58362] rounded-full blur-3xl opacity-50 -mr-10 -mt-10 animate-pulse"></div>
          <div className="relative z-10">
            <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase mb-1 drop-shadow-md">
              Staff Portal
            </h2>
            <p className="text-blue-200 text-xs font-mono uppercase tracking-widest">Vibe Check System v2.0</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Input Code</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="VIBE-XXXX"
                className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl font-mono text-xl uppercase font-bold text-[#1d248a] focus:border-[#1d248a] focus:shadow-[4px_4px_0px_#1d248a] focus:outline-none transition-all placeholder-gray-300"
              />
              <button 
                onClick={checkCode}
                disabled={loading}
                className="h-14 bg-[#1d248a] text-white rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none border-2 border-transparent flex justify-center items-center gap-2 sm:w-auto sm:px-6"
              >
                {loading ? <Activity className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                <span className="font-black uppercase tracking-widest text-sm">Search</span>
              </button>
            </div>
            
            {error && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 border-2 shadow-md ${error.includes("ALREADY") ? "bg-red-500 text-white border-red-700 animate-pulse" : "bg-red-50 text-red-500 border-red-100"}`}>
                <AlertTriangle className="w-6 h-6" /> 
                <span className="font-bold text-xs uppercase tracking-wide">{error}</span>
              </div>
            )}
          </div>

          {lookupResult && (
            <div className={`bg-gray-50 rounded-2xl p-5 border-2 ${lookupResult.redeemed ? "border-red-200 opacity-75" : "border-green-200"} animate-fade-in`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-xl italic text-gray-900 uppercase tracking-tight">{lookupResult.details.title}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">Status</p>
                </div>
                {lookupResult.redeemed ? (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border-2 border-red-200">
                    REDEEMED
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border-2 border-green-200">
                    VALID
                  </span>
                )}
              </div>

              <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] items-center">
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 p-1 border border-gray-100">
                  <img src={lookupResult.details.img} className="w-full h-full object-contain mix-blend-multiply" alt="product" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-[#1d248a] leading-tight text-lg">{lookupResult.details.scent}</p>
                  <p className="text-gray-400 text-xs mt-1 font-mono">ID: {lookupResult.code}</p>
                </div>
              </div>

              {!lookupResult.redeemed ? (
                <button 
                  onClick={redeemCode}
                  disabled={loading}
                  className="w-full bg-[#f58362] text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#e06d4d] transition-all shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-[4px] border-2 border-transparent"
                >
                  Confirm & Give Item
                </button>
              ) : (
                <div className="w-full bg-gray-200 text-gray-400 font-bold uppercase tracking-widest py-4 rounded-xl text-center cursor-not-allowed text-xs flex items-center justify-center gap-2 border-2 border-gray-300">
                  <CheckCircle className="w-4 h-4" /> Code Used
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-100 pt-4">
            <button 
              onClick={() => navigate('/insights')} 
              className="text-[10px] text-gray-400 hover:text-[#1d248a] font-bold uppercase tracking-widest flex items-center gap-1 mx-auto"
            >
              <Activity className="w-3 h-3" /> View Data Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
