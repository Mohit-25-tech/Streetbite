import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError(null);
                setLocationLoading(false);
            },
            (err) => {
                setLocationError(err.message || 'Could not detect location.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    // Try to restore saved location
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('userLocation');
            if (saved) setLocation(JSON.parse(saved));
        } catch { }
    }, []);

    useEffect(() => {
        if (location) sessionStorage.setItem('userLocation', JSON.stringify(location));
    }, [location]);

    return (
        <LocationContext.Provider value={{ location, locationError, locationLoading, detectLocation, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error('useLocation must be within LocationProvider');
    return ctx;
};

export default LocationContext;
