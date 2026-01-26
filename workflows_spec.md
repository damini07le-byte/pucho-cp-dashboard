# Pucho AI Studio Workflow Specifications

This document defines the logic and triggers for the 10 workflows in the Automated Customer Communication System.

## Architecture Overview

### 1. Data Sync (WF 1)
- **Trigger**: 1st of every month at 00:00 IST.
- **Logic**: 
    - Fetch master data from source Excel.
    - Append to "Sheet 1: Customers" in Google Sheets.
    - Deduplicate based on `Customer ID`.

### 2. Task Generator (WF 2)
- **Trigger**: Daily at 08:00 AM IST.
- **Logic**:
    - Scan "Sheet 1: Customers".
    - Find records where `Expiry Date` is within 30 days and `DND Flag` is FALSE.
    - Check if a task already exists for this `Customer ID` for the current month.
    - Create new rows in "Sheet 2: Tasks" with status `Pending`.

### 3. Task Scheduler (WF 3)
- **Trigger**: Daily at 08:30 AM IST.
- **Logic**:
    - Assign `Pending` tasks to `Time Slot` (Morning: 9-12 AM or Evening: 5-7 PM) based on capacity and priority.
    - Set `Status` to `Scheduled`.

### 4. Email Sender (WF 4)
- **Trigger**: Cron (9 AM & 5 PM IST).
- **Tool**: Gmail.
- **Payload**: `{Name}`, `{Product}`, `{ExpiryDate}`.

### 5. WhatsApp Sender (WF 5)
- **Trigger**: Cron (9 AM & 5 PM IST).
- **Tool**: Pucho WhatsApp API.
- **Template**: `Software_Renewal_Reminder_1`.

### 6. Voice Caller (WF 6)
- **Trigger**: Cron (9 AM & 5 PM IST).
- **Tool**: Pucho Voice Agent.
- **Script**: "Hello {Name}, am I speaking with you regarding your {Product} renewal?"

### 7. Outcome Processor (WF 7)
- **Trigger**: Webhook from Pucho Tools / Scheduled Check.
- **Logic**:
    - Receive outcome (e.g., "Agreed to migrate").
    - Update "Sheet 2: Tasks" status to `Completed`.
    - Log entry in "Sheet 3: Communication Log".

### 8. Follow-up Scheduler (WF 8)
- **Trigger**: Daily at 6:00 PM IST.
- **Logic**:
    - Find tasks with status `Failed` or `Not Reachable`.
    - Increment `Attempt Number`.
    - Reschedule for next available slot (30 min → 1 day → 2 days jump).

### 9. DND Manager (WF 9)
- **Trigger**: Real-time Webhook.
- **Logic**:
    - If customer says "DND" or "Opt-out", set `DND Flag` to TRUE in Sheet 1.
    - Cancel any pending tasks for this user.

### 10. Data Quality Reporter (WF 10)
- **Trigger**: Every Monday at 09:00 AM IST.
- **Logic**:
    - Summarize Sheet 1 rows with `Data Quality Flag` = "Wrong Contact" or "Junk".
    - Send email summary to Admin.
