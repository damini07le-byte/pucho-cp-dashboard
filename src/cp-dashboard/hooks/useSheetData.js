import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

// Published CSV URL: Guarantees no CORS or login issues for public web apps
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv&gid=307229921';

export const useSheetData = (refreshInterval = 30000, customUrl = null) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const targetUrl = customUrl || SHEET_URL;

    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            // Aggressive cache busting for real-time data
            const response = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`, {
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
                        // Map data to include the actual row index from the sheet (1-based, adjusted for headers)
                        const processedData = results.data.map((row, index) => ({
                            ...row,
                            sheet_row_number: index + 2 // +1 for header, +1 for 1-based indexing
                        }));
                        setData(processedData);
                        setLastUpdated(new Date());
                    }
                    setLoading(false);
                }
            });
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [targetUrl]);

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
