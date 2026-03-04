/**
 * Download data as CSV file
 */
export const downloadCSV = (data, events = [], appName = 'adidas_vibes') => {
  if (data.length === 0) return;

  // Create event lookup map with dates
  const eventMap = {};
  events.forEach(event => {
    eventMap[event.id] = {
      name: event.name,
      startDate: event.startDate || '',
      endDate: event.endDate || ''
    };
  });

  // Headers - added event start and end dates
  const headers = ["Code,Result,City,Region,Event,EventStartDate,EventEndDate,AgeRange,Gender,Redeemed,RedeemedAt,Q1,Q2,Q3,Q4,Q5,Q6"];
  
  // Rows
  const rows = data.map(row => {
    const q = row.answers || {};
    const clean = (str) => `"${(str || "").replace(/"/g, '""')}"`; // Escape quotes
    const eventInfo = eventMap[row.eventId] || {};
    
    return [
      clean(row.code),
      clean(row.result),
      clean(row.userLocation?.city || "Unknown"),
      clean(row.userLocation?.region || "Unknown"),
      clean(eventInfo.name || "No Event"),
      clean(eventInfo.startDate),
      clean(eventInfo.endDate),
      clean(row.ageRange || "Not provided"),
      clean(row.gender || "Not provided"),
      row.redeemed ? "YES" : "NO",
      row.redeemedAt ? row.redeemedAt.seconds : "",
      clean(q.q1), clean(q.q2), clean(q.q3), clean(q.q4), clean(q.q5), clean(q.q6)
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${appName}_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
