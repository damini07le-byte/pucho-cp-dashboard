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
    id: ['task_id', 'serial number', 'id', 'no', 's.no', 'sr no', 'licence index'],
    customer: ['org name', 'organization', 'customer', 'client', 'customer name', 'name', 'company', 'brand', 'party'],
    product: ['product', 'item', 'service', 'product name', 'project', 'plan', 'licence type'],
    mobile: ['mobile', 'phone', 'contact', 'mobile number', 'number', 'phone number', 'tel', 'whatsapp', 'mobile_no'],
    email: ['email id', 'email_id', 'email', 'mail', 'email address'],
    contact: ['contact person', 'contact_person', 'person', 'representative', 'owner', 'manager'],
    status: ['status', 'state', 'condition', 'progress'],
    time: ['tss expiry date', 'scheduled_date', 'time', 'date', 'last update', 'last_update', 'timestamp', 'updated at', 'expiry'],
    outcome: ['call outcome', 'outcome', 'last call', 'result', 'call_outcome'],
    summary: ['summary', 'call summary', 'analysis', 'conclusion', 'remarks', 'notes', 'call_summary'],
    followUp: ['next_followup_date', 'next action', 'follow up', 'next_followup', 'schedule', 'ai suggestion', 'next_step'],
    taskStage: ['task_type', 'task_stage', 'task stage', 'current_task', 'step', 'stage', 'task no']
};

export const fetchTasksFromSheet = async (url) => {
    const targetUrl = url || DEFAULT_SHEET_URL;
    const csvUrl = convertToCsvUrl(targetUrl);

    if (!csvUrl) return [];

    try {
        const fetchUrl = `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

        return lines.slice(1).map((line, index) => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim());
            const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

            const task = {
                id: `T${index + 1}`,
                status: 'Pending',
                time: 'Just now',
                product: 'General',
                priority: 'Medium'
            };

            headers.forEach((header, i) => {
                const val = cleanValues[i];
                if (!val) return;
                const h = header.toLowerCase().trim();

                task[header] = val;

                if (HEADER_MAPPING.id.includes(h)) task.id = val;
                else if (HEADER_MAPPING.customer.includes(h)) task.name = val;
                else if (HEADER_MAPPING.product.includes(h)) task.product = val;
                else if (HEADER_MAPPING.mobile.includes(h)) task.mobile = val;
                else if (HEADER_MAPPING.email.includes(h)) task.email = val;
                else if (HEADER_MAPPING.outcome.includes(h)) task.callOutcome = val;
                else if (HEADER_MAPPING.summary.includes(h)) task.emailOutcome = val; // Mapping summary to Digital log for visibility
                else if (HEADER_MAPPING.followUp.includes(h)) task.followUp = val;
                else if (HEADER_MAPPING.taskStage.includes(h)) task.taskStage = val;
                else if (h.includes('priority')) task.priority = val;
                else if (h.includes('amount') || h.includes('due')) task.amount = val;
                else if (h.includes('overdue')) task.overdue = val;
            });

            task.name = task.name || 'Unknown Customer';
            task.amount = task.amount || '₹0';
            task.overdue = task.overdue || '0 Days';
            task.callOutcome = task.callOutcome || 'No Activity';
            task.followUp = task.followUp || 'Schedule: AI Monitoring';
            task.taskStage = task.taskStage || 'Task 1: Initial';
            task.emailOutcome = task.emailOutcome || 'Waiting for call...';

            return task;
        });
    } catch (error) {
        console.error('Error fetching Google Sheet data:', error);
        return [];
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
    // Simulating "Master Recovery Sheet" with exhaustive columns and detailed history
    const disclaimer = "\n\nDisclaimer: Please ignore if you have already paid your EMI/License Renewal fees.";

    return [
        {
            row_id: 1,
            customer_id: '796065660',
            name: 'Gajanana Elec',
            mobile: '9724086968',
            email: 'billing@gajanana.in',
            product: 'TE9 Silver',
            amount: '₹45,000',
            due_date: '2026-02-25',
            payment_status: 'Unpaid',
            current_stage: 'T-5 Stage',
            sap_sync: 'Synced',
            remarks: 'Active drip flow',
            priority: 'Critical',
            detailed_history: {
                whatsapp: [
                    { id: 1, stage: 'T-15', date: 'Feb 10', time: '10:00 AM', msg: 'Hi, your license for TE9 Silver is due in 15 days.' + disclaimer, status: 'Read' },
                    { id: 2, stage: 'T-5', date: 'Feb 20', time: '09:30 AM', msg: 'Urgent: Only 5 days left for your payment.' + disclaimer, status: 'Delivered' }
                ],
                emails: [
                    { id: 1, stage: 'T-10', date: 'Feb 15', time: '11:00 AM', subject: 'Invoice Renewal - 10 Days Left', body: 'Dear Team, please process your ₹45,000 payment.' + disclaimer, status: 'Opened' }
                ],
                ai_calls: []
            }
        },
        {
            row_id: 2,
            customer_id: '746558766',
            name: 'R. C. Agencies',
            mobile: '9888877777',
            email: 'accounts@rcagencies.com',
            product: 'TE9 Gold',
            amount: '₹1,20,000',
            due_date: '2026-02-05',
            payment_status: 'Unpaid',
            current_stage: 'Recovery Stage',
            sap_sync: 'Pending Sync',
            remarks: 'AI Agent following up daily',
            priority: 'High',
            detailed_history: {
                whatsapp: [
                    { id: 1, stage: 'T-15', date: 'Jan 21', time: '10:00 AM', msg: 'Reminder: 15 days left.' + disclaimer, status: 'Read' },
                    { id: 2, stage: 'T-5', date: 'Jan 31', time: '09:00 AM', msg: 'Reminder: 5 days left.' + disclaimer, status: 'Read' },
                    { id: 3, stage: 'T-0', date: 'Feb 05', time: '08:00 AM', msg: 'Due today: Please pay ₹1,20,000.' + disclaimer, status: 'Read' }
                ],
                emails: [
                    { id: 1, stage: 'T-10', date: 'Jan 26', time: '09:00 AM', subject: 'Payment Due in 10 Days', body: 'Your Gold license expires on Feb 5.' + disclaimer, status: 'Opened' },
                    { id: 2, stage: 'T-5', date: 'Jan 31', time: '09:30 AM', subject: 'Urgent Pay: 5 Days Left', body: 'Final reminders started.' + disclaimer, status: 'Seen' },
                    { id: 3, stage: 'T-0', date: 'Feb 05', time: '08:30 AM', subject: 'DUE TODAY: Action Required', body: 'Please pay immediately.' + disclaimer, status: 'Sent' }
                ],
                ai_calls: [
                    { id: 1, date: 'Feb 06', time: '11:30 AM', transcript: 'AI: Namaste, main Pucho AI se bol rahi hoon... Aapka payment overdue hai. Customer: Haan, kal tak kar dunga.', outcome: 'Agreed' },
                    { id: 2, date: 'Feb 07', time: '04:00 PM', transcript: 'AI: Hello, kal aapne payment ka promise kiya tha. Status? Customer: Server down hai, sham tak check karein.', outcome: 'Follow-up' },
                    { id: 3, date: 'Feb 08', time: '10:00 AM', transcript: 'AI: Regular follow-up call. Customer: Doing it now.', outcome: 'Processing' }
                ]
            }
        },
        {
            row_id: 3,
            customer_id: '786534651',
            name: 'Kalash Textile',
            mobile: '7000011111',
            email: 'info@kalashtex.co',
            product: 'TE9 Gold',
            amount: '₹88,500',
            due_date: '2026-02-12',
            payment_status: 'Paid',
            current_stage: 'Completed',
            sap_sync: 'Synced',
            remarks: 'Flow terminated on payment',
            priority: 'Low',
            detailed_history: {
                whatsapp: [
                    { id: 1, stage: 'T-15', date: 'Jan 28', time: '10:00 AM', msg: '15 days to go.' + disclaimer, status: 'Read' }
                ],
                emails: [
                    { id: 1, stage: 'T-10', date: 'Feb 02', time: '09:00 AM', subject: 'Renewal Notice', body: '10 days reminder.' + disclaimer, status: 'Opened' }
                ],
                ai_calls: []
            }
        }
    ];





};
