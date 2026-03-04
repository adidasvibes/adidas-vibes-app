import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, MapPin, Loader } from 'lucide-react';
import { db } from '../../config/firebase';
import { APP_ID } from '../../constants/firebase';

export const EventSelectionPortal = ({ onSelectEvent }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveEvents = async () => {
            try {
                const eventsSnapshot = await getDocs(
                    collection(db, 'artifacts', APP_ID, 'public', 'data', 'events')
                );

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const activeEventsList = [];
                eventsSnapshot.forEach((doc) => {
                    const event = { id: doc.id, ...doc.data() };

                    // Check if event is active
                    let isActive = true;

                    if (event.startDate) {
                        const startDate = new Date(event.startDate);
                        if (startDate > today) isActive = false;
                    }

                    if (event.endDate) {
                        const endDate = new Date(event.endDate);
                        if (endDate < today) isActive = false;
                    }

                    if (isActive) {
                        activeEventsList.push(event);
                    }
                });

                setEvents(activeEventsList);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveEvents();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center relative z-10">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader className="relative w-24 h-24 text-white animate-spin drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase animate-bounce drop-shadow-[4px_4px_0px_#f58362]">
                    Loading Events...
                </h2>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] px-4 py-16 relative z-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight drop-shadow-[4px_4px_0px_#1d248a]">
                        Select <br />
                        <span className="text-[#f4b337]">Your Event</span>
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Choose an active event to discover your personality vibe
                    </p>
                </div>

                {/* Events Grid */}
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {events.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => onSelectEvent(event.id)}
                                className="group relative bg-white rounded-[2rem] p-8 shadow-[0px_20px_50px_rgba(0,0,0,0.3)] border-[6px] border-white overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.4)] text-left active:translate-y-1"
                            >
                                {/* Background gradient glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#f4b337]/10 to-[#db2777]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Event Name */}
                                    <h3 className="text-2xl md:text-3xl font-black text-[#1d248a] uppercase italic tracking-tight mb-4 group-hover:text-[#f58362] transition-colors line-clamp-2">
                                        {event.name}
                                    </h3>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 mb-6 text-gray-700">
                                        <MapPin className="w-5 h-5 text-[#db2777] flex-shrink-0" />
                                        <span className="font-bold text-sm">{event.location}</span>
                                    </div>

                                    {/* Description */}
                                    {event.description && (
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}

                                    {/* Status Badge & CTA */}
                                    <div className="flex items-center justify-between">
                                        <span className="inline-block bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                            Active
                                        </span>
                                        <div className="flex items-center gap-2 text-[#f58362] font-black uppercase text-xs tracking-widest group-hover:translate-x-2 transition-transform">
                                            Enter <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Border highlight on hover */}
                                <div className="absolute inset-0 rounded-[2rem] border-[3px] border-transparent group-hover:border-[#f58362] transition-colors pointer-events-none"></div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-white/70 text-xl font-bold uppercase tracking-wider mb-4">
                            No active events at this time
                        </p>
                        <p className="text-white/50 text-sm">Check back soon for upcoming events!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
