import { Sparkles, Activity, ShoppingBag, Heart } from 'lucide-react';
import { MARKETPLACES } from '../../constants/assets';
import { RESULTS } from '../../constants/results';

const MARKETPLACE_COLORS = {
    tokopedia: { bg: '#00AA00', light: '#E8F5E9' },
    shopee: { bg: '#EE1D1D', light: '#FFEBEE' },
    tiktokshop: { bg: '#000000', light: '#F5F5F5' }
};

export const CustomerResult = ({ result, code, eventData }) => {
    // Get result code for vibe-specific links
    const resultCode = Object.entries(RESULTS).find(([key, val]) => val.title === result.title)?.[1]?.code;
    return (
        <div className="max-w-sm md:max-w-md mx-auto px-4 py-8 animate-fade-in relative z-10">

            <div className="text-center mb-8 animate-float relative">
                <span className="inline-block bg-white text-[#1d248a] font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full shadow-[3px_3px_0px_rgba(0,0,0,0.2)] mb-4 border-2 border-white">
                    ✨ Your Special Scent ✨
                </span>
                <h1 className="text-5xl md:text-5xl font-black text-white italic tracking-tight uppercase drop-shadow-[4px_4px_0px_#1d248a] leading-[0.9] mb-2">
                    {result.titleId || result.title}
                </h1>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0px_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-[6px] border-white relative">

                <div className={`relative pt-8 pb-6 px-8 flex justify-center bg-gradient-to-b ${result.gradient.includes('blue') ? 'from-blue-50 to-indigo-50' :
                    result.gradient.includes('orange') ? 'from-orange-50 to-red-50' :
                        result.gradient.includes('teal') ? 'from-teal-50 to-green-50' :
                            result.gradient.includes('purple') ? 'from-purple-50 to-indigo-50' :
                                'from-yellow-50 to-orange-50'
                    }`}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 ${result.color} rounded-full filter blur-3xl opacity-20`}></div>

                    <div className="relative w-40 h-40 bg-white rounded-[2rem] p-3 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] border-2 border-gray-100 transform hover:scale-105 transition-transform duration-500">
                        <img
                            src={result.img}
                            alt={result.title}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <div className="p-6 text-center relative z-10">
                    <p className={`text-2xl font-black uppercase mb-5 ${result.text} tracking-tight leading-tight drop-shadow-sm italic`}>
                        {result.vibesId || result.vibes}
                    </p>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 mb-5 text-left border-2 border-dashed border-[#1d248a]/30 relative overflow-hidden">
                        <div className="absolute top-3 right-3 text-gray-200/30">
                            <Heart className="w-6 h-6" />
                        </div>
                        <p className="text-gray-700 font-bold text-sm mb-4 leading-relaxed whitespace-break-spaces">
                            {result.descId || result.desc}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${result.color} text-white shadow-[2px_2px_0px_#000] flex-shrink-0`}>
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase block tracking-wider">Aroma Keberuntunganmu</span>
                                    <span className="font-bold text-gray-900 text-sm">{result.scentId || result.scent}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${result.color} text-white shadow-[2px_2px_0px_#000] flex-shrink-0`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase block tracking-wider">Cocok Untuk</span>
                                    <span className="font-bold text-gray-900 text-sm">{result.bestForId || result.bestFor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br ${result.gradient} rounded-xl p-1 shadow-[6px_6px_0px_#1d248a] transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d248a] transition-all cursor-default`}>
                        <div className="border-2 border-white/40 rounded-lg p-4 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white/10 rotate-12">
                                <ShoppingBag className="w-16 h-16" />
                            </div>
                            <p className="text-[8px] font-bold text-white/90 uppercase tracking-widest mb-2 relative z-10">Tunjukkan Kode Ini</p>
                            <div className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] relative z-10 mb-3">
                                {code}
                            </div>
                            <p className="text-[8px] font-bold text-white/80 uppercase tracking-widest relative z-10">Untuk Klaim Free Vial Parfume</p>
                        </div>
                    </div>

                    {/* Marketplace Vouchers - Only show if event has marketplace data */}
                    {eventData?.marketplaces && eventData.marketplaces.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {eventData.marketplaces.map((marketplace) => {
                                const mpInfo = MARKETPLACES.find(m => m.id === marketplace.id);
                                const mpColors = MARKETPLACE_COLORS[marketplace.id];
                                const vibeLink = marketplace.links?.[resultCode] || marketplace.link;

                                // If there's a link, make the entire card clickable
                                if (vibeLink) {
                                    return (
                                        <a
                                            key={marketplace.id}
                                            href={vibeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-xl p-1 shadow-[6px_6px_0px_#1d248a] transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d248a] transition-all cursor-pointer group"
                                            style={{
                                                background: `linear-gradient(to bottom right, ${mpColors.bg}99, ${mpColors.bg}66)`
                                            }}
                                        >
                                            <div className="border-2 border-white/40 rounded-lg p-4 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm relative overflow-hidden group-hover:from-white/20 transition-colors">
                                                <div className="absolute -right-4 -top-4 text-white/10 rotate-12 group-hover:text-white/20 transition-colors">
                                                    <ShoppingBag className="w-16 h-16" />
                                                </div>

                                                {/* Marketplace Logo and Name */}
                                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                                    {mpInfo && (
                                                        <>
                                                            <img
                                                                src={mpInfo.logo}
                                                                alt={mpInfo.name}
                                                                className="h-4 object-contain max-w-[50px]"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                            <p className="text-[8px] font-bold text-white/90 uppercase tracking-widest">
                                                                {mpInfo.name} Voucher
                                                            </p>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Voucher Code */}
                                                <div className="text-2xl font-black font-mono tracking-widest text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] relative z-10">
                                                    {marketplace.code}
                                                </div>

                                                {/* Marketplace Link Button */}
                                                <div className="text-[8px] font-bold text-white/90 uppercase tracking-widest mt-2 relative z-10 flex items-center whitespace-break-spaces gap-1">
                                                    {marketplace.description || `✓ Klik untuk Buka Toko →`}
                                                </div>
                                            </div>
                                        </a>
                                    );
                                }

                                // If no link, show non-clickable card
                                return (
                                    <div
                                        key={marketplace.id}
                                        className="rounded-xl p-1 shadow-[6px_6px_0px_#1d248a] transform transition-all"
                                        style={{
                                            background: `linear-gradient(to bottom right, ${mpColors.bg}99, ${mpColors.bg}66)`
                                        }}
                                    >
                                        <div className="border-2 border-white/40 rounded-lg p-4 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 text-white/10 rotate-12">
                                                <ShoppingBag className="w-16 h-16" />
                                            </div>

                                            {/* Marketplace Logo and Name */}
                                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                                {mpInfo && (
                                                    <>
                                                        <img
                                                            src={mpInfo.logo}
                                                            alt={mpInfo.name}
                                                            className="h-4 object-contain max-w-[50px]"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                        <p className="text-[8px] font-bold text-white/90 uppercase tracking-widest">
                                                            {mpInfo.name} Voucher
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Voucher Code */}
                                            <div className="text-2xl font-black font-mono tracking-widest text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] relative z-10">
                                                {marketplace.code}
                                            </div>

                                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-2 relative z-10">
                                                Link tidak tersedia
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
