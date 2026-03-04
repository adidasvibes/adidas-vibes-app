/**
 * Fetch user's IP location data
 */
export const getIpLocation = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://ipapi.co/json/', { 
        signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      lat: data.latitude,
      lng: data.longitude,
      provider: data.org
    };

  } catch (error) {
    console.warn("Could not fetch IP location:", error);
    return { city: "Unknown", region: "Unknown", country: "Unknown" }; 
  }
};
