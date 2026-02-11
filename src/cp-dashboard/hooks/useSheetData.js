import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

// Fixed URL with specific GID to fetch the correct data sheet
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv&gid=307229921';

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
                        console.log(`🕒 Auto-Synced at ${new Date().toLocaleTimeString()} | Rows: ${results.data.length}`);
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
