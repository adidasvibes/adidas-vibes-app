import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, Download, Filter, ArrowLeft, Loader, Users, Ticket, MapPin, Plus, Globe, Calendar, Trash2, Edit2 } from 'lucide-react';
import { db } from '../config/firebase';
import { APP_ID } from '../constants/firebase';
import { CustomTooltip, StatCard, PollCard } from '../components/InsightsCharts';
import { downloadCSV } from '../utils/export';
import { CHART_COLORS, MARKETPLACES } from '../constants/assets';
import { APP_CONFIG } from '../config/app';

export const InsightsDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [selectedCity, setSelectedCity] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState("All");
    const [selectedAgeRange, setSelectedAgeRange] = useState("All");
    const [selectedGender, setSelectedGender] = useState("All");
    const [selectedDateRange, setSelectedDateRange] = useState({ start: "", end: "" });
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventFilter, setEventFilter] = useState("All");
    const [editingEventId, setEditingEventId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        type: 'offline',
        startDate: '',
        endDate: '',
        marketplaces: []
    });

    // Fetch data once
    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(
                    collection(db, 'artifacts', APP_ID, 'public', 'data', 'vibe_codes')
                );
                const rawDocs = [];

                querySnapshot.forEach((doc) => {
                    rawDocs.push({ id: doc.id, ...doc.data() });
                });

                setAllData(rawDocs);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchEvents();
        fetchVouchers();
    }, []);

    // Fetch events from Firestore
    const fetchEvents = async () => {
        try {
            const eventsSnapshot = await getDocs(
                collection(db, 'artifacts', APP_ID, 'public', 'data', 'events')
            );
            const eventsList = [];
            eventsSnapshot.forEach((doc) => {
                eventsList.push({ id: doc.id, ...doc.data() });
            });
            setEvents(eventsList);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    // Fetch vouchers from Firestore
    const fetchVouchers = async () => {
        try {
            const mpDoc = await getDoc(
                doc(db, 'artifacts', APP_ID, 'public', 'data')
            );
            if (mpDoc.exists()) {
                setFormData({
                    name: '',
                    location: '',
                    description: '',
                    type: '',
                    startDate: '',
                    endDate: '',
                    marketplaces: mpDoc.data()?.marketplaces || []
                });
            } else {
                console.log("No vouchers found");
            }
        } catch (error) {
            console.error("Error fetching vouchers:", error);
        }
    };

    // Handle event creation/update
    const handleEditEvent = (event) => {
        setEditingEventId(event.id);
        setFormData({
            name: event.name,
            location: event.location,
            description: event.description || '',
            type: event.type,
            startDate: event.startDate || '',
            endDate: event.endDate || '',
            marketplaces: event.marketplaces || []
        });
        setShowEventForm(true);
    };

    const handleCancelEdit = () => {
        setEditingEventId(null);
        setFormData({ name: '', location: '', description: '', type: 'offline', startDate: '', endDate: '', marketplaces: [] });
        setShowEventForm(false);
    };

    // Handle event creation/update
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.location) {
            alert('Please fill in Event Name and Location');
            return;
        }

        try {
            if (editingEventId) {
                // Update existing event
                const eventRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'events', editingEventId);
                await updateDoc(eventRef, {
                    name: formData.name,
                    location: formData.location,
                    description: formData.description,
                    type: formData.type,
                    startDate: formData.startDate || null,
                    endDate: formData.endDate || null,
                    marketplaces: formData.marketplaces,
                    updatedAt: serverTimestamp()
                });

                // Update in local state
                setEvents(events.map(ev =>
                    ev.id === editingEventId
                        ? { ...ev, ...formData, updatedAt: new Date() }
                        : ev
                ));

                alert('Event updated successfully!');
                setEditingEventId(null);
            } else {
                // Create new event
                const eventRef = await addDoc(
                    collection(db, 'artifacts', APP_ID, 'public', 'data', 'events'),
                    {
                        name: formData.name,
                        location: formData.location,
                        description: formData.description,
                        type: formData.type,
                        startDate: formData.startDate || null,
                        endDate: formData.endDate || null,
                        marketplaces: formData.marketplaces,
                        createdAt: serverTimestamp(),
                        status: 'active'
                    }
                );

                setEvents([...events, {
                    id: eventRef.id,
                    name: formData.name,
                    location: formData.location,
                    description: formData.description,
                    type: formData.type,
                    startDate: formData.startDate || null,
                    endDate: formData.endDate || null,
                    marketplaces: formData.marketplaces,
                    createdAt: new Date(),
                    status: 'active'
                }]);

                alert('Event created successfully!');
            }

            setFormData({ name: '', location: '', description: '', type: 'offline', startDate: '', endDate: '', marketplaces: [] });
            setShowEventForm(false);
        } catch (error) {
            console.error("Error creating/updating event:", error);
            alert('Failed to create/update event. Check console for details.');
        }
    };

    // Handle voucher creation/update
    const handleConfigureVouchers = async (e) => {
        e.preventDefault();
        try {
            // Update vouchers
            const eventRef = doc(db, 'artifacts', APP_ID, 'public', 'data');
            await updateDoc(eventRef, { marketplaces: formData.marketplaces });

            alert('Voucher updated successfully!');
        } catch (error) {
            console.error("Error creating/updating vouchers:", error);
            alert('Failed to create/update vouchers. Check console for details.');
        }
    };

    // Helper function to check if event is active
    const isEventActive = (event) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (event.startDate) {
            const startDate = new Date(event.startDate);
            if (startDate > today) return 'not-started';
        }

        if (event.endDate) {
            const endDate = new Date(event.endDate);
            if (endDate < today) return 'expired';
        }

        return 'active';
    };

    // Filter events by type
    const filteredEvents = eventFilter === "All"
        ? events
        : events.filter(e => e.type === eventFilter);

    // Calculate stats based on selected city and event
    const { stats, cities, ageRanges, genders } = useMemo(() => {
        let filteredData = allData;

        // Filter by city
        if (selectedCity !== "All") {
            filteredData = filteredData.filter(d => (d.userLocation?.city || "Unknown") === selectedCity);
        }

        // Filter by event
        if (selectedEvent !== "All") {
            filteredData = filteredData.filter(d => d.eventId === selectedEvent);
        }

        // Filter by age range
        if (selectedAgeRange !== "All") {
            filteredData = filteredData.filter(d => d.ageRange === selectedAgeRange);
        }

        // Filter by gender
        if (selectedGender !== "All") {
            filteredData = filteredData.filter(d => d.gender === selectedGender);
        }

        // Filter by date range
        if (selectedDateRange.start || selectedDateRange.end) {
            filteredData = filteredData.filter(d => {
                const dataDate = new Date(d.createdAt?.seconds * 1000 || d.createdAt);
                const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : new Date(0);
                const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : new Date();
                endDate.setHours(23, 59, 59, 999);

                return dataDate >= startDate && dataDate <= endDate;
            });
        }

        let total = 0;
        let redeemed = 0;
        let vibeCounts = {};
        let locationCounts = {};
        let ageRangeCounts = {};
        let genderCounts = {};
        let qCounts = {
            q1: { A: 0, B: 0, C: 0, D: 0, E: 0 },
            q2: { A: 0, B: 0, C: 0, D: 0, E: 0 },
            q3: { A: 0, B: 0, C: 0, D: 0, E: 0 },
            q4: { A: 0, B: 0, C: 0, D: 0, E: 0 },
            q5: { A: 0, B: 0, C: 0, D: 0, E: 0 },
            q6: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        };

        const uniqueCities = new Set();
        const uniqueAgeRanges = new Set();
        const uniqueGenders = new Set();

        // Process filtered data for stats
        filteredData.forEach(data => {
            total++;
            if (data.redeemed) redeemed++;

            const v = data.result || "Unknown";
            vibeCounts[v] = (vibeCounts[v] || 0) + 1;

            if (data.ageRange) {
                ageRangeCounts[data.ageRange] = (ageRangeCounts[data.ageRange] || 0) + 1;
            }

            if (data.gender) {
                genderCounts[data.gender] = (genderCounts[data.gender] || 0) + 1;
            }

            if (data.answers) {
                Object.keys(data.answers).forEach(key => {
                    const answerVal = data.answers[key];
                    if (qCounts[key] && qCounts[key][answerVal] !== undefined) {
                        qCounts[key][answerVal]++;
                    }
                });
            }
        });

        // Get all cities, age ranges, and genders for dropdowns
        allData.forEach(data => {
            const c = data.userLocation?.city || "Unknown";
            uniqueCities.add(c);
            locationCounts[c] = (locationCounts[c] || 0) + 1;

            if (data.ageRange) {
                uniqueAgeRanges.add(data.ageRange);
            }

            if (data.gender) {
                uniqueGenders.add(data.gender);
            }
        });

        const vibeData = Object.keys(vibeCounts).map(key => ({
            name: key,
            value: vibeCounts[key]
        }));

        const locationData = Object.keys(locationCounts)
            .map(key => ({ name: key, users: locationCounts[key] }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 10);

        const ageRangeData = Object.keys(ageRangeCounts).map(key => ({
            name: key,
            value: ageRangeCounts[key]
        }));

        const genderData = Object.keys(genderCounts).map(key => ({
            name: key,
            value: genderCounts[key]
        }));

        return {
            stats: { total, redeemed, vibes: vibeData, locations: locationData, questions: qCounts, ageRanges: ageRangeData, genders: genderData },
            cities: Array.from(uniqueCities).sort(),
            ageRanges: Array.from(uniqueAgeRanges).sort(),
            genders: Array.from(uniqueGenders).sort()
        };
    }, [allData, selectedCity, selectedEvent, selectedAgeRange, selectedGender, selectedDateRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1d248a] flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-white font-black uppercase tracking-widest animate-pulse">Loading Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#a3e635] selection:text-[#1d248a]">

            {/* Header */}
            <div className="bg-[#4338ca] pt-12 pb-24 px-6 relative overflow-hidden rounded-b-[4rem] shadow-xl border-b-8 border-[#a3e635]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#db2777] rounded-full blur-[100px] opacity-30 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a3e635] rounded-full blur-[80px] opacity-20 -ml-10 -mb-10"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="group bg-white/10 hover:bg-white text-white hover:text-[#4338ca] px-5 py-2 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => downloadCSV(allData, events)}
                                className="bg-[#a3e635] hover:bg-[#8cc63f] text-[#1d248a] px-5 py-2 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:translate-y-1"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <div className="px-4 py-2 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/30">
                                {allData.length} Records
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[4px_4px_0px_#1d248a]">
                        Vibe Check <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a3e635] to-[#db2777]">Insights</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 space-y-12">

                {/* Filter Control */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#1d248a]">
                        <Filter className="w-5 h-5" />
                        <span className="font-black uppercase tracking-wide text-sm">Filter Dashboard:</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold uppercase tracking-wide outline-none"
                        >
                            <option value="All">All Locations</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        {APP_CONFIG.enableEvents ? <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold uppercase tracking-wide outline-none"
                        >
                            <option value="All">All Events</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select> : null}

                        <select
                            value={selectedAgeRange}
                            onChange={(e) => setSelectedAgeRange(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold uppercase tracking-wide outline-none"
                        >
                            <option value="All">All Ages</option>
                            {ageRanges.map(age => (
                                <option key={age} value={age}>{age}</option>
                            ))}
                        </select>

                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold uppercase tracking-wide outline-none"
                        >
                            <option value="All">All Genders</option>
                            {genders.map(gen => (
                                <option key={gen} value={gen}>{gen}</option>
                            ))}
                        </select>

                        {APP_CONFIG.enableEvents ? <input
                            type="date"
                            value={selectedDateRange.start}
                            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold outline-none"
                            placeholder="From"
                        /> : null}

                        {APP_CONFIG.enableEvents ? <input
                            type="date"
                            value={selectedDateRange.end}
                            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#4338ca] focus:border-[#4338ca] block p-2.5 font-bold outline-none"
                            placeholder="To"
                        /> : null}
                    </div>
                </div>

                {/* Big Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label={selectedCity === "All" ? "Total Vibes Checked" : `Vibes in ${selectedCity}`}
                        value={stats.total}
                        icon={<Users className="w-8 h-8 text-[#4338ca]" />}
                        color="bg-white"
                        accent="border-[#4338ca]"
                    />
                    <StatCard
                        label="Vouchers Redeemed"
                        value={stats.redeemed}
                        sub={`${stats.total > 0 ? ((stats.redeemed / stats.total) * 100).toFixed(1) : 0}% Rate`}
                        icon={<Ticket className="w-8 h-8 text-white" />}
                        color="bg-[#db2777]"
                        textColor="text-white"
                        accent="border-[#be185d]"
                    />
                    <StatCard
                        label="Top City (Overall)"
                        value={stats.locations[0]?.name || "N/A"}
                        icon={<MapPin className="w-8 h-8 text-[#4338ca]" />}
                        color="bg-[#a3e635]"
                        accent="border-[#65a30d]"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Vibe Distribution */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#4338ca] relative group hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#4338ca] transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#4338ca] p-2 rounded-lg text-white"><Activity className="w-5 h-5" /></div>
                            <h3 className="text-xl font-black text-[#4338ca] uppercase italic tracking-tighter">Personality Breakdown</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.vibes}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#4338ca' }}
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(67, 56, 202, 0.05)' }} />
                                    <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                                        {stats.vibes.map((entry, index) => (
                                            <Bar key={`bar-${index}`} dataKey="value" fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Location Map */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#db2777] relative group hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#db2777] transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#db2777] p-2 rounded-lg text-white"><MapPin className="w-5 h-5" /></div>
                            <h3 className="text-xl font-black text-[#4338ca] uppercase italic tracking-tighter">Top Locations</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={stats.locations}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 11, fontWeight: 800, fill: '#6b7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="users" fill="#db2777" radius={[0, 10, 10, 0]} barSize={24}>
                                        {stats.locations.map((entry, index) => (
                                            <Bar key={`bar-loc-${index}`} dataKey="users" fill={index === 0 ? '#4338ca' : '#db2777'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Question Deep Dive */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#4338ca] uppercase italic tracking-tighter bg-gray-50 px-4">
                            The Deep Dive {selectedCity !== "All" && <span className="text-[#db2777]">({selectedCity})</span>}
                        </h2>
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(stats.questions).map((qKey, idx) => (
                            <PollCard
                                key={qKey}
                                qId={qKey}
                                index={idx}
                                data={stats.questions[qKey]}
                            />
                        ))}
                    </div>
                </div>

                {/* Demographics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Age Range Distribution */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-[#f4b337] shadow-[8px_8px_0px_#f4b337] relative group hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#f4b337] transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#f4b337] p-2 rounded-lg text-[#1d248a]"><Users className="w-5 h-5" /></div>
                            <h3 className="text-xl font-black text-[#4338ca] uppercase italic tracking-tighter">Age Distribution</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.ageRanges}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#4338ca' }}
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244, 179, 55, 0.05)' }} />
                                    <Bar dataKey="value" fill="#f4b337" radius={[8, 8, 8, 8]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gender Distribution */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-[#a3e635] shadow-[8px_8px_0px_#a3e635] relative group hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#a3e635] transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#a3e635] p-2 rounded-lg text-[#1d248a]"><Activity className="w-5 h-5" /></div>
                            <h3 className="text-xl font-black text-[#4338ca] uppercase italic tracking-tighter">Gender Distribution</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.genders}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#4338ca' }}
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163, 230, 53, 0.05)' }} />
                                    <Bar dataKey="value" fill="#a3e635" radius={[8, 8, 8, 8]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* EVENT MANAGEMENT SECTION */}
                {APP_CONFIG.enableEvents ? <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#4338ca] uppercase italic tracking-tighter bg-gray-50 px-4">
                            Event Management
                        </h2>
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Create Event Button */}
                    <button
                        onClick={() => {
                            setEditingEventId(null);
                            setFormData({ name: '', location: '', description: '', type: 'offline', marketplaces: [] });
                            setShowEventForm(!showEventForm);
                        }}
                        className="bg-[#a3e635] hover:bg-[#8cc63f] text-[#1d248a] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" /> {editingEventId ? 'Edit Event' : 'Create New Event'}
                    </button>

                    {/* Event Creation/Edit Form */}
                    {showEventForm && (
                        <div className="bg-white p-8 rounded-[2rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#4338ca]">
                            <h3 className="text-2xl font-black text-[#1d248a] uppercase tracking-tighter mb-6 italic">
                                {editingEventId ? '✏️ Edit Event' : '✨ Create New Event'}
                            </h3>
                            <form onSubmit={handleCreateEvent} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">Event Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                            placeholder="e.g., Adidas Launch"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">Location *</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                            placeholder="e.g., Jakarta, ID"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                        placeholder="Event details..."
                                        rows="4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">Event Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                    >
                                        <option value="offline">Offline</option>
                                        <option value="online">Online</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Marketplace Configuration */}
                                <div className="border-t-2 border-gray-200 pt-6">
                                    <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-4">Marketplace Vouchers (Optional)</label>
                                    <p className="text-xs text-gray-600 mb-4">Add marketplace discount codes & vibe-specific product links for your event</p>

                                    <div className="space-y-4">
                                        {MARKETPLACES.map((marketplace) => {
                                            const selectedMp = formData.marketplaces.find(m => m.id === marketplace.id);
                                            return (
                                                <div key={marketplace.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={marketplace.logo}
                                                                alt={marketplace.name}
                                                                className="h-6 object-contain max-w-[60px]"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                            <span className="font-bold text-[#1d248a]">{marketplace.name}</span>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedMp}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        marketplaces: [...formData.marketplaces, {
                                                                            id: marketplace.id,
                                                                            code: '',
                                                                            links: { ED: '', SU: '', FR: '', CZ: '', GC: '' }
                                                                        }]
                                                                    });
                                                                } else {
                                                                    setFormData({
                                                                        ...formData,
                                                                        marketplaces: formData.marketplaces.filter(m => m.id !== marketplace.id)
                                                                    });
                                                                }
                                                            }}
                                                            className="w-5 h-5 cursor-pointer"
                                                        />
                                                    </div>

                                                    {selectedMp && (
                                                        <div className="space-y-3 mt-3 pt-3 border-t border-gray-300">
                                                            {/* Voucher Code */}
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Voucher Code (Same for All Vibes)</label>
                                                                <input
                                                                    type="text"
                                                                    value={selectedMp.code}
                                                                    onChange={(e) => {
                                                                        const updated = formData.marketplaces.map(m =>
                                                                            m.id === marketplace.id ? { ...m, code: e.target.value } : m
                                                                        );
                                                                        setFormData({ ...formData, marketplaces: updated });
                                                                    }}
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4338ca] outline-none text-sm font-mono"
                                                                    placeholder="e.g., ERAOVB"
                                                                />
                                                            </div>

                                                            {/* Voucher T&C */}
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Terms and conditions</label>
                                                                <textarea
                                                                    type="text"
                                                                    value={selectedMp.description}
                                                                    onChange={(e) => {
                                                                        const updated = formData.marketplaces.map(m =>
                                                                            m.id === marketplace.id ? { ...m, description: e.target.value } : m
                                                                        );
                                                                        setFormData({ ...formData, marketplaces: updated });
                                                                    }}
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4338ca] outline-none text-sm font-mono"
                                                                    placeholder="e.g., Voucher validity, usage limits, etc."
                                                                />
                                                            </div>

                                                            {/* Vibe-Specific Links */}
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                <p className="text-xs font-bold text-gray-700 uppercase mb-3">Product Links by Vibe:</p>
                                                                <div className="space-y-2">
                                                                    {[
                                                                        { code: 'ED', name: 'Energy Drive' },
                                                                        { code: 'SU', name: 'Spark Up' },
                                                                        { code: 'FR', name: 'Full Recharge' },
                                                                        { code: 'CZ', name: 'Chill Zone' },
                                                                        { code: 'GC', name: 'Get Comfy' }
                                                                    ].map((vibe) => (
                                                                        <div key={vibe.code}>
                                                                            <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                                                                ⚡ {vibe.name} ({vibe.code})
                                                                            </label>
                                                                            <input
                                                                                type="url"
                                                                                value={selectedMp.links?.[vibe.code] || ''}
                                                                                onChange={(e) => {
                                                                                    const updated = formData.marketplaces.map(m =>
                                                                                        m.id === marketplace.id
                                                                                            ? { ...m, links: { ...m.links, [vibe.code]: e.target.value } }
                                                                                            : m
                                                                                    );
                                                                                    setFormData({ ...formData, marketplaces: updated });
                                                                                }}
                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#4338ca] outline-none"
                                                                                placeholder="https://..."
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#4338ca] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#3730a3] transition-all"
                                    >
                                        {editingEventId ? 'Update Event' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Events Filter Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setEventFilter("All")}
                            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wide text-sm transition-all ${eventFilter === "All"
                                ? "bg-[#4338ca] text-white"
                                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#4338ca]"
                                }`}
                        >
                            All Events
                        </button>
                        <button
                            onClick={() => setEventFilter("online")}
                            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wide text-sm flex items-center gap-2 transition-all ${eventFilter === "online"
                                ? "bg-[#db2777] text-white"
                                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#db2777]"
                                }`}
                        >
                            <Globe className="w-4 h-4" /> Online
                        </button>
                        <button
                            onClick={() => setEventFilter("offline")}
                            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wide text-sm flex items-center gap-2 transition-all ${eventFilter === "offline"
                                ? "bg-[#a3e635] text-[#1d248a]"
                                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#a3e635]"
                                }`}
                        >
                            <MapPin className="w-4 h-4" /> Offline
                        </button>
                    </div>

                    {/* Events List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => {
                            const isActive = isEventActive(event);
                            return (
                                <div
                                    key={event.id}
                                    className="bg-white p-6 rounded-[1.5rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#4338ca] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#4338ca] transition-all cursor-pointer relative"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-[#1d248a] uppercase tracking-tight">{event.name}</h3>
                                            {(event.startDate || event.endDate) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {event.startDate && `From ${new Date(event.startDate).toLocaleDateString()}`}
                                                    {event.startDate && event.endDate && ' — '}
                                                    {event.endDate && `Until ${new Date(event.endDate).toLocaleDateString()}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-2">
                                            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap ${event.type === 'online'
                                                ? 'bg-[#db2777] text-white'
                                                : event.type === 'offline'
                                                    ? 'bg-[#a3e635] text-[#1d248a]'
                                                    : 'bg-[#4338ca] text-white'
                                                }`}>
                                                {event.type}
                                            </span>
                                            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap ${isActive === 'active'
                                                ? 'bg-green-500 text-white'
                                                : isActive === 'not-started'
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-400 text-white'
                                                }`}>
                                                {isActive === 'active' ? 'Active' : isActive === 'not-started' ? 'Not Started Yet' : 'Expired'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4 text-[#db2777] flex-shrink-0" />
                                            <span className="font-bold">{event.location}</span>
                                        </div>
                                        {event.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 truncate">ID: {event.id}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                className="flex-1 bg-[#f58362] text-white py-2 rounded-lg font-bold uppercase tracking-wide text-sm hover:bg-[#e06d4d] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => navigate(`/event/${event.id}`)}
                                                className="flex-1 bg-[#4338ca] text-white py-2 rounded-lg font-bold uppercase tracking-wide text-sm hover:bg-[#3730a3] transition-all"
                                            >
                                                View Event →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-wide">No events found</p>
                        </div>
                    )}
                </div> : null}

                <div className="bg-white p-8 rounded-[2rem] border-4 border-[#4338ca] shadow-[8px_8px_0px_#4338ca]">
                    <h3 className="text-2xl font-black text-[#1d248a] uppercase tracking-tighter mb-6 italic">
                        {`✨ Configure ${APP_CONFIG.enableEvents ? 'Global ' : ''}Vouchers`}
                    </h3>
                    <form onSubmit={handleConfigureVouchers} className="space-y-6">

                        {/* Marketplace Configuration */}
                        <div className="border-t-2 border-gray-200 pt-6">
                            <label className="block text-sm font-black text-[#1d248a] uppercase tracking-wide mb-4">{`Marketplace ${APP_CONFIG.enableEvents ? 'Global ' : ''}Vouchers (Optional)`}</label>
                            <p className="text-xs text-gray-600 mb-4">Add marketplace discount codes & vibe-specific product links</p>

                            <div className="space-y-4">
                                {MARKETPLACES.map((marketplace) => {
                                    const selectedMp = formData.marketplaces.find(m => m.id === marketplace.id);
                                    return (
                                        <div key={marketplace.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={marketplace.logo}
                                                        alt={marketplace.name}
                                                        className="h-6 object-contain max-w-[60px]"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                    <span className="font-bold text-[#1d248a]">{marketplace.name}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedMp}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                marketplaces: [...formData.marketplaces, {
                                                                    id: marketplace.id,
                                                                    code: '',
                                                                    links: { ED: '', SU: '', FR: '', CZ: '', GC: '' }
                                                                }]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                marketplaces: formData.marketplaces.filter(m => m.id !== marketplace.id)
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 cursor-pointer"
                                                />
                                            </div>

                                            {selectedMp && (
                                                <div className="space-y-3 mt-3 pt-3 border-t border-gray-300">
                                                    {/* Voucher Code */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Voucher Code (Same for All Vibes)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedMp.code}
                                                            required={true}
                                                            onChange={(e) => {
                                                                const updated = formData.marketplaces.map(m =>
                                                                    m.id === marketplace.id ? { ...m, code: e.target.value } : m
                                                                );
                                                                setFormData({ ...formData, marketplaces: updated });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4338ca] outline-none text-sm font-mono"
                                                            placeholder="e.g., ERAOVB"
                                                        />
                                                    </div>

                                                    {/* Voucher T&C */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Terms and conditions</label>
                                                        <textarea
                                                            type="text"
                                                            value={selectedMp.description}
                                                            onChange={(e) => {
                                                                const updated = formData.marketplaces.map(m =>
                                                                    m.id === marketplace.id ? { ...m, description: e.target.value } : m
                                                                );
                                                                setFormData({ ...formData, marketplaces: updated });
                                                            }}
                                                            required={true}
                                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4338ca] outline-none text-sm font-mono"
                                                            placeholder="e.g., Voucher validity, usage limits, etc."
                                                        />
                                                    </div>

                                                    {/* Vibe-Specific Links */}
                                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                        <p className="text-xs font-bold text-gray-700 uppercase mb-3">Product Links by Vibe:</p>
                                                        <div className="space-y-2">
                                                            {[
                                                                { code: 'ED', name: 'Energy Drive' },
                                                                { code: 'SU', name: 'Spark Up' },
                                                                { code: 'FR', name: 'Full Recharge' },
                                                                { code: 'CZ', name: 'Chill Zone' },
                                                                { code: 'GC', name: 'Get Comfy' }
                                                            ].map((vibe) => (
                                                                <div key={vibe.code}>
                                                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                                                        ⚡ {vibe.name} ({vibe.code})
                                                                    </label>
                                                                    <input
                                                                        type="url"
                                                                        value={selectedMp.links?.[vibe.code] || ''}
                                                                        required={true}
                                                                        onChange={(e) => {
                                                                            const updated = formData.marketplaces.map(m =>
                                                                                m.id === marketplace.id
                                                                                    ? { ...m, links: { ...m.links, [vibe.code]: e.target.value } }
                                                                                    : m
                                                                            );
                                                                            setFormData({ ...formData, marketplaces: updated });
                                                                        }}
                                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#4338ca] outline-none"
                                                                        placeholder="https://..."
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#4338ca] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#3730a3] transition-all"
                            >
                                {`Update ${APP_CONFIG.enableEvents ? 'Global ' : ''}Vouchers`}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center pt-12 pb-8 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Adidas Vibes • Internal Data</p>
                </div>
            </div>
        </div>
    );
};
