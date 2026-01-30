/**
 * Data Service for CP Dashboard
 * Handles fetching task data from Google Sheets (CSV) and local state management.
 */

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pY9WtCSu6_A3YsZ31MgcbWj3Q2Ea8AO33Ztr8MVedAg/edit?gid=113319197#gid=113319197';

const DEFAULT_TASKS = [
    { id: 'T1', customer: 'Loading...', product: 'Please sync sheet', channel: 'Voice', status: 'Pending', time: 'Just now' }
];

/**
 * Converts a regular Google Sheet URL to a CSV export URL
 * Preserves the GID to fetch the correct sheet/tab
 */
export const convertToCsvUrl = (url) => {
    if (!url) return null;
    // If it's already a CSV export or a published CSV, return it as is
    if (url.includes('/export?format=csv') || url.includes('output=csv')) return url;

    try {
        const gidMatch = url.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';

        // Published "d/e" format
        if (url.includes('/d/e/')) {
            const pubMatch = url.match(/^(https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/[a-zA-Z0-9-_]+)/);
            if (pubMatch) return `${pubMatch[1]}/pub?output=csv&gid=${gid}`;
        }

        // Standard "d" format
        const baseUrlMatch = url.match(/^(https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+)/);
        if (baseUrlMatch) return `${baseUrlMatch[1]}/export?format=csv&gid=${gid}`;
    } catch (e) {
        console.error('URL conversion error:', e);
    }
    return url;
};

/**
 * Robust Mapping for different Sheet headers
 */
const HEADER_MAPPING = {
    id: ['id', 'no', 's.no', 'sr no', 'serial number', 'sno', 'number', 'sl no'],
    customer: ['org name', 'organization', 'customer', 'client', 'customer name', 'name', 'company', 'brand', 'party'],
    product: ['product', 'item', 'service', 'product name', 'project', 'plan'],
    mobile: ['mobile', 'phone', 'contact', 'mobile number', 'number', 'phone number', 'tel', 'whatsapp', 'mobile_no'],
    email: ['email', 'email id', 'email_id', 'mail', 'email address'],
    contact: ['contact person', 'contact_person', 'person', 'representative', 'owner', 'manager'],
    status: ['status', 'state', 'condition', 'progress', 'outcome'],
    time: ['scheduled_date', 'time', 'date', 'last update', 'last_update', 'timestamp', 'updated at', 'slot', 'time_slot', 'tss expiry date', 'expiry'],
    response: ['customer response', 'response', 'analysis', 'conclusion', 'result', 'feedback']
};

export const fetchTasksFromSheet = async (url) => {
    const targetUrl = url || DEFAULT_SHEET_URL;
    const csvUrl = convertToCsvUrl(targetUrl);

    if (!csvUrl) return DEFAULT_TASKS;

    try {
        // Add cache buster to bypass Google's CDN for real-time updates
        const fetchUrl = `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return DEFAULT_TASKS;

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

        return lines.slice(1).map((line, index) => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim());
            const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

            const task = {
                id: `T${index + 1}`,
                status: 'Pending',
                time: 'Just now',
                channel: 'Voice'
            };

            headers.forEach((header, i) => {
                const val = cleanValues[i];
                if (!val) return;
                const h = header.toLowerCase().trim();

                // Store all raw fields for dynamic display
                task[header] = val;

                if (HEADER_MAPPING.id.includes(h)) task.id = val;
                else if (HEADER_MAPPING.customer.includes(h)) task.customer = val;
                else if (HEADER_MAPPING.product.includes(h)) task.product = val;
                else if (HEADER_MAPPING.mobile.includes(h)) {
                    task.mobile = val;
                    task.channel = 'Voice';
                }
                else if (HEADER_MAPPING.email.includes(h)) {
                    task.email = val;
                    if (!task.mobile) task.channel = 'Email';
                }
                else if (HEADER_MAPPING.contact.includes(h)) task.contact = val;
                else if (HEADER_MAPPING.status.includes(h)) {
                    task.status = val.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                }
                else if (HEADER_MAPPING.time.includes(h)) task.time = val;
            });

            task.customer = task.customer || 'Customer';
            task.product = task.product || 'General Inquiry';
            return task;
        }).filter(t => t.customer && t.customer !== 'Customer');
    } catch (error) {
        console.error('Error fetching Google Sheet data:', error);
        return [
            { id: 'TIP', customer: 'Access Denied!', product: 'Go to File > Share > Publish to web', channel: 'Guide', status: 'Failed', time: 'Select CSV & Publish' }
        ];
    }
};

export const getInitialTasks = () => DEFAULT_TASKS;
export const getSheetUrl = () => localStorage.getItem('pucho_sheet_url') || DEFAULT_SHEET_URL;

/**
 * Fetches Daily Ledger data
 * Currently returns mock dynamic data, ready to be connected to API/Sheet
 */
export const fetchLedgerData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: '#TRX-001', date: '2026-01-30', party: 'Global Corp', account: 'Sales', type: 'Credit', amount: '₹45,000', status: 'Settled' },
        { id: '#TRX-002', date: '2026-01-30', party: 'Tech Sol', account: 'Purchase', type: 'Debit', amount: '₹12,400', status: 'Pending' },
        { id: '#TRX-003', date: '2026-01-29', party: 'Office Depot', account: 'Admin Exp', type: 'Debit', amount: '₹2,100', status: 'Settled' },
        { id: '#TRX-004', date: '2026-01-29', party: 'Retail Plus', account: 'Sales', type: 'Credit', amount: '₹8,900', status: 'Settled' },
        { id: '#TRX-005', date: '2026-01-29', party: 'Zenith Hub', account: 'Sales', type: 'Credit', amount: '₹15,000', status: 'Pending' },
    ];
};

/**
 * Fetches Stock Position data
 */
export const fetchStockData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 'STK-01', name: 'Raw Material A', category: 'Raw Materials', quantity: '1,200 kg', value: '₹2.4L', status: 'In Stock' },
        { id: 'STK-02', name: 'Finished Product X', category: 'Finished Goods', quantity: '450 units', value: '₹9.0L', status: 'Low Stock' },
        { id: 'STK-03', name: 'Packaging Box - M', category: 'Packaging', quantity: '3,000 units', value: '₹60K', status: 'In Stock' },
        { id: 'STK-04', name: 'Component B', category: 'Components', quantity: '150 units', value: '₹1.2L', status: 'Critical' },
        { id: 'STK-05', name: 'Raw Material C', category: 'Raw Materials', quantity: '800 kg', value: '₹1.6L', status: 'In Stock' },
    ];
};

/**
 * Fetches Pending Dues data
 */
export const fetchDuesData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 'CUST-88', name: 'Acme Corp', amount: '₹1,50,000', overdue: '15 Days', mobile: '+91 98765 43210', priority: 'High' },
        { id: 'CUST-42', name: 'Blue Sky Ltd', amount: '₹45,000', overdue: '5 Days', mobile: '+91 88888 77777', priority: 'Medium' },
        { id: 'CUST-15', name: 'Global Tech', amount: '₹2,10,000', overdue: '30 Days', mobile: '+91 70000 11111', priority: 'Critical' },
        { id: 'CUST-09', name: 'Smart Retail', amount: '₹12,400', overdue: '1 Day', mobile: '+91 99999 00000', priority: 'Low' },
        { id: 'CUST-77', name: 'Matrix Soft', amount: '₹88,000', overdue: '22 Days', mobile: '+91 81234 56789', priority: 'High' },
    ];
};
