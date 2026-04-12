import { useState } from 'react';

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    return { location, error, loading, getLocation };
};
