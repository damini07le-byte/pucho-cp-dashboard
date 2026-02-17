# License Renewal - Column Mapping Quick Reference

## 🔄 AUTO-REFRESH SETTINGS
- **Refresh Interval:** Every 10 minutes (600,000 ms)
- **User Experience:** Silent background sync - customer won't notice any refresh
- **First Load:** Immediate on page load
- **Continuous:** Runs automatically in background

---

## 📊 GOOGLE SHEET COLUMNS → CODE MAPPING

### ✅ BASIC INFORMATION (Required)
```javascript
// FROM SHEET COLUMN → CODE FIELD
'Serial Number'        → customer['Serial Number']
'Product'              → customer['Product']
'Org Name'             → customer['Org Name']
'Contact Person'       → customer['Contact Person']
'Mobile'               → customer['Mobile']
'Email ID'             → customer['Email ID']
```

### 📜 LICENSE DETAILS (Required)
```javascript
// FROM SHEET COLUMN → CODE FIELD
'Release'              → customer['Release']
'Expiry Date to Type'  → customer['Expiry Date']  // Also used to calculate Days Left
'Business Segment'     → customer['Business Segment']
'Resource Tagged'      → customer['Resource Tagged']
'Prospect for TS9/TPS' → customer['Prospect for TS9/TPS']
```

### 🤖 AUTO-CALCULATED FIELDS
```javascript
// CALCULATED IN CODE (not from sheet)
Days Left = calculateDaysLeft(customer['Expiry Date to Type'])
// Formula: (Expiry Date - Today's Date) in days
```

### 📌 OPTIONAL STATUS FIELDS
```javascript
// FROM SHEET COLUMN → CODE FIELD (Optional - has defaults)
'Priority'        → customer['Priority']        // Default: 'Medium'
'Task Status'     → customer['Task Status']     // Default: 'Open'
'Stage'           → customer['Stage']           // Default: 'N/A'
'Payment Status'  → customer['Payment Status']  // Default: 'Pending'
```

### 📅 RENEWAL WORKFLOW ACTIVITY COLUMNS

#### Week 1 (Days 1-7)
```javascript
// FROM SHEET COLUMN → CODE FIELD
'Day 1 - Initial'        → customer.logs.day1Initial
'Day 2-3 - Follow-up'    → customer.logs.day2FollowUp
'Day 4 - Voice Call'     → customer.logs.day4Call
```

#### Week 2 (Days 10-17)
```javascript
// FROM SHEET COLUMN → CODE FIELD
'Day 10 - Second Outreach' → customer.logs.day10Second
'Day 11-12 - Follow-up'    → customer.logs.day11FollowUp
'Day 14 - Voice Call'      → customer.logs.day14Call
```

#### Week 3 (Days 20-27)
```javascript
// FROM SHEET COLUMN → CODE FIELD
'Day 20 - Final Outreach'  → customer.logs.day20Final
'Day 21-23 - Follow-up'    → customer.logs.day21FollowUp
'Day 25 - Escalation'      → customer.logs.day25Escalation
```

---

## 🎨 UI DISPLAY LOCATIONS

### 📇 CARD VIEW (List)
```
┌─────────────────────────────────────┐
│ Org Name                            │
│ ┌─────┐ ┌────────┐ ┌──────────┐   │
│ │Serial│ │Product │ │Contact   │   │
│ └─────┘ └────────┘ └──────────┘   │
│ 📞 Mobile                           │
│ ✉️  Email                           │
│ 📅 Expiry Date                      │
│ ⏰ Days Left (color-coded)          │
│ 🏷️  Stage                           │
└─────────────────────────────────────┘
```

### 📋 MODAL VIEW (Details)

#### Section 1: Contact Details (2 columns)
```
┌─────────────┬─────────────┐
│ 📞 Mobile   │ ✉️  Email   │
└─────────────┴─────────────┘
```

#### Section 2: License Information (4 fields in 2x2 grid)
```
┌──────────────────┬──────────────────┐
│ Release Version  │ Business Segment │
│ Resource Tagged  │ Prospect TS9/TPS │
└──────────────────┴──────────────────┘
```

#### Section 3: Renewal Timeline (4 boxes)
```
┌─────────┬─────────┬─────────┬─────────┐
│ Expiry  │  Days   │  Task   │ Payment │
│  Date   │  Left   │ Status  │ Status  │
│ (blue)  │(orange) │(purple) │ (green) │
└─────────┴─────────┴─────────┴─────────┘
```

#### Section 4: 30-Day Renewal Campaign (Week-wise)
```
Week 1 (Blue)
├── Day 1: Initial (2 cols: WhatsApp + Email)
├── Day 2-3: Follow-up (1 col)
└── Day 4: Voice Call (full width)

Week 2 (Orange)
├── Day 10: Second (2 cols: WhatsApp + Email)
├── Day 11-12: Follow-up (1 col)
└── Day 14: Voice Call (full width)

Week 3 (Red)
├── Day 20: Final (full width: WA + Email + Voice)
├── Day 21-23: Follow-up (half width)
└── Day 25: Escalation (half width)
```

---

## 🎯 COLOR CODING LOGIC

### Days Left Badge
```javascript
if (daysLeft <= 7)  → RED badge    (Urgent!)
if (daysLeft <= 15) → ORANGE badge (Warning)
if (daysLeft > 15)  → GREEN badge  (Safe)
```

### Payment Status Badge
```javascript
if (status === 'Paid')    → GREEN badge
if (status === 'Overdue') → RED badge
if (status === 'Pending') → ORANGE badge (default)
```

### Activity Status Indicators
```javascript
if (log contains "Status: FAILED")    → RED dot
if (log contains "Status: SUCCESS")   → GREEN dot
if (log contains "Status: Delivered") → GREEN dot
Default                                → GREEN dot
```

---

## 📝 ACTIVITY LOG FORMAT EXAMPLES

### Combo Message (Email + WhatsApp)
```
[WHATSAPP MESSAGE]
Status: Delivered
Message: Your license expires soon!

[EMAIL]
Status: Sent
Subject: Renewal Reminder
Body: Please renew your license...
```

### Simple Message
```
17/02/2026, 10:30 am | Follow-up sent. Customer responded.
```

---

## ⚡ QUICK CHECKLIST

### Minimum Required Columns (Already Present ✅)
- [ ] Serial Number
- [ ] Product
- [ ] Release
- [ ] Expiry Date to Type
- [ ] Org Name
- [ ] Business Segment
- [ ] Contact Person
- [ ] Mobile
- [ ] Email ID
- [ ] Prospect for TS9/TPS
- [ ] Resource Tagged

### Optional Columns (Add as needed)
- [ ] Priority
- [ ] Task Status
- [ ] Stage
- [ ] Payment Status

### Activity Columns (Add for workflow tracking)
- [ ] Day 1 - Initial
- [ ] Day 2-3 - Follow-up
- [ ] Day 4 - Voice Call
- [ ] Day 10 - Second Outreach
- [ ] Day 11-12 - Follow-up
- [ ] Day 14 - Voice Call
- [ ] Day 20 - Final Outreach
- [ ] Day 21-23 - Follow-up
- [ ] Day 25 - Escalation

---

## 🚀 READY TO USE!

**Dashboard works immediately with just the basic columns!**

Activity columns can be added later as the renewal workflow progresses.
