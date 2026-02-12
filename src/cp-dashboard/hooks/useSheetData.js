import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

// Export URL for near real-time data (bypasses 5-min publish cache)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pY9WtCSu6_A3YsZ31MgcbWj3Q2Ea8AO33Ztr8MVedAg/export?format=csv&gid=307229921';

export const useSheetData = (refreshInterval = 30000) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            // Aggressive cache busting for real-time data
            const response = await fetch(`${SHEET_URL}&cb=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'pragma': 'no-cache',
                    'cache-control': 'no-cache'
                }
            });
            const csvText = await response.text();

            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data) {
                        setData(results.data);
                        setLastUpdated(new Date());
                    }
                    setLoading(false);
                }
            });
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // Setup 30s Automatic Interval
    useEffect(() => {
        const timer = setInterval(() => {
            fetchData(false); // Background fetch without showing spinner
        }, refreshInterval);

        return () => clearInterval(timer);
    }, [refreshInterval, fetchData]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refetch: () => fetchData(true)
    };
};
