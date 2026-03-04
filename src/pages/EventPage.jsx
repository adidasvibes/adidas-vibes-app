import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Calendar, Globe, ArrowLeft, Loader } from 'lucide-react';
import { db } from '../config/firebase';
import { APP_ID } from '../constants/firebase';

export const EventPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventDoc = await getDoc(
                    doc(db, 'artifacts', APP_ID, 'public', 'data', 'events', eventId)
                );

                if (eventDoc.exists()) {
                    setEvent({ id: eventDoc.id, ...eventDoc.data() });
                } else {
                    console.error("Event not found");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1d248a] flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-white font-black uppercase tracking-widest animate-pulse">Loading Event...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <h1 className="text-4xl font-black text-gray-800 mb-4">Event Not Found</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#4338ca] text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[#3730a3] transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-[#a3e635] selection:text-[#1d248a]">

            {/* Header */}
            <div className="bg-[#4338ca] pt-12 pb-24 px-6 relative overflow-hidden rounded-b-[4rem] shadow-xl border-b-8 border-[#a3e635]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#db2777] rounded-full blur-[100px] opacity-30 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a3e635] rounded-full blur-[80px] opacity-20 -ml-10 -mb-10"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/insights/')}
                        className="group bg-white/10 hover:bg-white text-white hover:text-[#4338ca] px-5 py-2 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-white/20 mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[4px_4px_0px_#1d248a]">
                        {event.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">

                {/* Event Card */}
                <div className="bg-white p-8 rounded-[2rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#4338ca] mb-8">

                    {/* Event Details */}
                    <div className="space-y-6 mb-8">
                        <div className="flex items-start justify-between">
                            <h2 className="text-3xl font-black text-[#1d248a] uppercase italic tracking-tighter mb-2">
                                Event Details
                            </h2>
                            <span className={`text-sm font-black px-4 py-2 rounded-full uppercase tracking-wide ${event.type === 'online'
                                ? 'bg-[#db2777] text-white'
                                : event.type === 'offline'
                                    ? 'bg-[#a3e635] text-[#1d248a]'
                                    : 'bg-[#4338ca] text-white'
                                }`}>
                                {event.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <MapPin className="w-5 h-5 text-[#db2777]" />
                                    <h3 className="font-black text-[#1d248a] uppercase tracking-wide">Location</h3>
                                </div>
                                <p className="text-gray-700 text-lg font-bold">{event.location}</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <Globe className="w-5 h-5 text-[#db2777]" />
                                    <h3 className="font-black text-[#1d248a] uppercase tracking-wide">Type</h3>
                                </div>
                                <p className="text-gray-700 text-lg font-bold capitalize">{event.type}</p>
                            </div>
                        </div>

                        {event.description && (
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                                <h3 className="font-black text-[#1d248a] uppercase tracking-wide mb-3">Description</h3>
                                <p className="text-gray-700 text-base leading-relaxed">{event.description}</p>
                            </div>
                        )}

                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <Calendar className="w-5 h-5 text-[#db2777]" />
                                <h3 className="font-black text-[#1d248a] uppercase tracking-wide">Event ID</h3>
                            </div>
                            <p className="text-gray-700 text-sm font-mono bg-white p-3 rounded-lg border border-gray-200">{event.id}</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="border-t-2 border-gray-200 pt-8">
                        <h3 className="text-lg font-black text-[#1d248a] uppercase tracking-tight mb-4">
                            Check Your Vibe
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Take the Adidas Vibes quiz to discover your personality and get a unique voucher code!
                        </p>
                        <button
                            onClick={() => navigate(`/?eventId=${event.id}`)}
                            className="w-full bg-[#a3e635] hover:bg-[#8cc63f] text-[#1d248a] px-6 py-4 rounded-full font-bold uppercase tracking-widest text-lg transition-all shadow-lg hover:shadow-xl active:translate-y-1"
                        >
                            Start Quiz →
                        </button>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="text-center py-8 opacity-60">
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Adidas Vibes • Event Experience</p>
                </div>
            </div>
        </div>
    );
};
