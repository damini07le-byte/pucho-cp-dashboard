# License Renewal - Google Sheet Structure

## Current Sheet URL
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv
```

---

## 📋 REQUIRED COLUMNS IN GOOGLE SHEET

### **Basic Information** (Already Present ✅)
| Column Name | Data Source | Example | Where It Shows |
|-------------|-------------|---------|----------------|
| `Serial Number` | Manual Entry | `796065660` | Card + Modal Header |
| `Product` | Manual Entry | `TE9 Silver` | Card + Modal Header |
| `Release` | Manual Entry | `Release 6.4` | Modal - License Info |
| `Expiry Date to Type` | Manual Entry | `2026-03-15` | Card + Modal (as "Expiry Date") |
| `Org Name` | Manual Entry | `Gajanana Electricals` | Card + Modal Header |
| `Business Segment` | Manual Entry | `Retail Trading` | Modal - License Info |
| `Contact Person` | Manual Entry | `sunil` | Card + Modal Header |
| `Mobile` | Manual Entry | `9724086968` | Card + Modal Contact |
| `Email ID` | Manual Entry | `chintan@pucho.ai` | Card + Modal Contact |
| `Prospect for TS9/TPS` | Manual Entry | `Yes` / `No` | Modal - License Info |
| `Resource Tagged` | Manual Entry | `Sunil` | Modal - License Info |

### **Calculated Fields** (Auto-calculated by Code 🤖)
| Field Name | Calculation | Example | Where It Shows |
|------------|-------------|---------|----------------|
| `Days Left` | `Expiry Date - Today's Date` | `26` | Card + Modal Timeline (color-coded) |

### **Optional Fields** (Can be added later)
| Column Name | Data Source | Example | Where It Shows |
|-------------|-------------|---------|----------------|
| `Priority` | Manual/Formula | `High` / `Medium` / `Low` | Not currently displayed |
| `Task Status` | Manual/Formula | `Open` / `In Progress` / `Closed` | Modal - Renewal Timeline |
| `Stage` | Manual/Formula | `Initial` / `Follow-up` / `Escalated` | Card display |
| `Payment Status` | Manual/Formula | `Paid` / `Pending` / `Overdue` | Modal - Renewal Timeline (4th box) |

---

## 📅 RENEWAL WORKFLOW COLUMNS (To Be Added)

These columns will store the activity logs from the 30-day renewal campaign:

### **Week 1 (Day 1-7)**

#### `Day 1 - Initial`
**Format:** Combo message (Email + WhatsApp)
```
[WHATSAPP MESSAGE]
Status: Delivered
Message: Dear Sunil, your Tally license expires on 15th March. Renew now to avoid disruption!

[EMAIL]
Status: Sent
Subject: License Renewal Reminder - Gajanana Electricals
Body: Dear Sunil,

This is to remind you that your Tally TE9 Silver license (Serial: 796065660) will expire on 15th March 2026.

Please renew at your earliest convenience.

Best regards,
Tally Team
```

#### `Day 2-3 - Follow-up`
**Format:** Simple message
```
17/02/2026, 10:30 am | Follow-up WhatsApp sent. Awaiting response.
```

#### `Day 4 - Voice Call`
**Format:** Simple message
```
18/02/2026, 02:15 pm | Voice call made. Customer requested quote. Status: SUCCESS
```

### **Week 2 (Day 10-17)**

#### `Day 10 - Second Outreach`
**Format:** Combo message (Email + WhatsApp)
```
[WHATSAPP MESSAGE]
Status: Delivered
Message: Hi Sunil, just 16 days left for your license renewal. Need assistance?

[EMAIL]
Status: Sent
Subject: Second Reminder - License Expiring Soon
Body: Dear Sunil,

Your Tally license will expire in 16 days. Please take action to ensure business continuity.

Contact us for renewal.
```

#### `Day 11-12 - Follow-up`
**Format:** Simple message
```
20/02/2026, 11:00 am | Follow-up message sent
```

#### `Day 14 - Voice Call`
**Format:** Simple message
```
22/02/2026, 03:30 pm | Voice call - Customer confirmed renewal next week
```

### **Week 3 (Day 20-27)**

#### `Day 20 - Final Outreach`
**Format:** Combo message (Email + WhatsApp + Voice)
```
[WHATSAPP MESSAGE]
Status: Delivered
Message: URGENT: Only 6 days left! Your license expires on 15th March.

[EMAIL]
Status: Sent
Subject: FINAL NOTICE - License Expiring in 6 Days
Body: This is your final reminder. Please renew immediately.

[VOICE CALL]
Status: Completed
Notes: Spoke with customer. Payment pending.
```

#### `Day 21-23 - Follow-up`
**Format:** Simple message
```
01/03/2026, 04:00 pm | Final follow-up sent. Customer promised payment by tomorrow.
```

#### `Day 25 - Escalation`
**Format:** Simple message with status
```
03/03/2026, 10:00 am | Escalated to manager. Customer not responding. Status: FAILED
```

---

## 🎨 HOW DATA IS DISPLAYED IN UI

### **Card View (List)**
Shows:
- Organization Name
- Serial Number (badge)
- Product Name (blue badge)
- Contact Person (purple badge)
- Mobile (with icon)
- Email (with icon)
- Expiry Date (large text)
- Days Left (color-coded badge)
- Stage (if available)

### **Modal View (Details)**
Shows 4 sections:

#### 1. **Contact Details**
- Mobile (with phone icon)
- Email (with mail icon)

#### 2. **License Information**
- Release Version
- Business Segment
- Resource Tagged
- Prospect for TS9/TPS (Yes/No badge)

#### 3. **Renewal Timeline** (4 boxes)
- Expiry Date (blue box)
- Days Remaining (orange box, color changes based on urgency: red ≤7 days, orange ≤15 days, green >15 days)
- Task Status (purple box)
- Payment Status (green box - Paid=green, Pending=orange, Overdue=red)

#### 4. **30-Day Renewal Campaign** (Week-wise)

**Week 1 (Blue):**
- Day 1 - Initial Outreach (2 columns: WhatsApp + Email)
- Day 2-3 - Follow-up (single column)
- Day 4 - Voice Call (full width)

**Week 2 (Orange):**
- Day 10 - Second Outreach (2 columns: WhatsApp + Email)
- Day 11-12 - Follow-up (single column)
- Day 14 - Voice Call (full width)

**Week 3 (Red):**
- Day 20 - Final Outreach (full width: WhatsApp + Email + Voice)
- Day 21-23 - Final Follow-up (half width)
- Day 25 - Escalation (half width)

---

## 🔄 DATA FLOW

```
Google Sheet (CSV)
    ↓
Dashboard fetches every 10 minutes (silent background sync - customer won't notice)
    ↓
parseLog() function processes activity columns
    ↓
Detects if combo message (has [WHATSAPP MESSAGE] and [EMAIL] tags)
    ↓
CompactStage component displays:
    - If combo: Shows WhatsApp and Email side-by-side
    - If simple: Shows single message
    ↓
Status indicators:
    - Green dot = SUCCESS/Sent/Delivered
    - Red dot = FAILED
```

---

## 📝 NOTES

1. **Days Left** is calculated automatically - no need to add this column in sheet
2. **Combo messages** must have `[WHATSAPP MESSAGE]` and `[EMAIL]` tags to display separately
3. **Simple messages** can be plain text with timestamp
4. **Status detection**: Code looks for "Status: SUCCESS" or "Status: FAILED" in messages
5. **Empty columns**: If a day's activity column is empty, it shows as grayed out box with "No activity"

---

## 🎯 MINIMUM REQUIRED TO START

**Already have:**
- Serial Number ✅
- Product ✅
- Release ✅
- Expiry Date to Type ✅
- Org Name ✅
- Business Segment ✅
- Contact Person ✅
- Mobile ✅
- Email ID ✅
- Prospect for TS9/TPS ✅
- Resource Tagged ✅

**Need to add (for activity tracking):**
- Day 1 - Initial
- Day 2-3 - Follow-up
- Day 4 - Voice Call
- Day 10 - Second Outreach
- Day 11-12 - Follow-up
- Day 14 - Voice Call
- Day 20 - Final Outreach
- Day 21-23 - Follow-up
- Day 25 - Escalation

**Dashboard will work perfectly even without activity columns** - it will just show "No renewal activities logged yet"
