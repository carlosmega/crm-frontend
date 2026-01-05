# CRM Sales - User Guide

> Complete guide to managing your sales process from Lead to Invoice

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [1. Lead Management](#1-lead-management)
- [2. Lead Qualification](#2-lead-qualification)
- [3. Opportunity Management](#3-opportunity-management)
- [4. Quote Creation](#4-quote-creation)
- [5. Order Processing](#5-order-processing)
- [6. Invoice Management](#6-invoice-management)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

---

## Overview

This CRM system follows the **Microsoft Dynamics 365 Sales** model and implements the complete **Quote-to-Cash** sales process:

```
┌──────┐    ┌─────────────┐    ┌───────┐    ┌───────┐    ┌─────────┐
│ Lead │ -> │ Opportunity │ -> │ Quote │ -> │ Order │ -> │ Invoice │
└──────┘    └─────────────┘    └───────┘    └───────┘    └─────────┘
   ↓              ↓                ↓            ↓             ↓
 Open         Qualify           Propose      Fulfill        Paid
```

### Key Concepts

**Lead**: Potential customer who has shown interest
**Opportunity**: Qualified sales opportunity in your pipeline
**Quote**: Formal proposal with products and pricing
**Order**: Confirmed purchase order
**Invoice**: Bill for payment

**B2B vs B2C**:
- **B2B** (Business-to-Business): Sales to companies - creates Account + Contact + Opportunity
- **B2C** (Business-to-Consumer): Sales to individuals - creates Contact + Opportunity (no Account)

---

## Quick Start

### For B2B Sales (Company Customer)

1. Create Lead with company name
2. Complete BANT qualification (Budget, Authority, Need, Timing)
3. Qualify Lead → Creates Account + Contact + Opportunity
4. Move Opportunity through sales stages (25% → 50% → 75% → 100%)
5. Create Quote with products
6. Win Opportunity → Generates Order
7. Fulfill Order → Generate Invoice
8. Mark Invoice as Paid

### For B2C Sales (Individual Customer)

1. Create Lead without company name
2. Complete BANT qualification
3. Qualify Lead → Creates Contact + Opportunity (no Account)
4. Follow steps 4-8 same as B2B

---

## 1. Lead Management

### What is a Lead?

A Lead represents a **potential customer** who has expressed interest in your products or services. Leads are the starting point of your sales process.

### Creating a New Lead

**Path**: `/leads/new`

**Required Information**:
- First Name
- Last Name
- Lead Source (how did they find you?)
- Company Name (only for B2B)

**Optional but Recommended**:
- Email
- Phone
- Job Title
- Budget Amount
- Estimated Close Date

**Example - B2B Lead**:
```
First Name: Juan
Last Name: Pérez
Company: Acme Inc
Job Title: IT Director
Email: juan.perez@acme.com
Phone: +34 123 456 789
Lead Source: Website
Budget Amount: €50,000
```

**Example - B2C Lead**:
```
First Name: María
Last Name: García
Company: [leave empty]
Email: maria.garcia@email.com
Phone: +34 987 654 321
Lead Source: Referral
Budget Amount: €5,000
```

### Lead Statuses

| Status | Code | Description |
|--------|------|-------------|
| **Open** | 0 | New lead, needs qualification |
| **Qualified** | 1 | Passed qualification, converted to Opportunity |
| **Disqualified** | 2 | Not a good fit, rejected |

### Lead Quality Ratings

- **Hot**: Ready to buy now
- **Warm**: Interested, needs nurturing
- **Cold**: Long-term prospect

---

## 2. Lead Qualification

### The BANT Framework

Before converting a Lead to an Opportunity, you must complete the **BANT qualification**:

**B**udget - Do they have money?
**A**uthority - Can they make the decision?
**N**eed - Do they have a problem we can solve?
**T**iming - When will they buy?

### Qualification Wizard (5 Steps)

**Path**: Lead detail page → Click "Qualify Lead" button

#### Step 1: BANT Qualification

Complete these required fields:

**Budget**:
- Budget Amount: €50,000
- Budget Status:
  - No Budget (0) - No approved budget
  - May Buy (1) - Might allocate budget
  - Can Buy (2) - Budget available
  - Will Buy (3) - Budget confirmed

**Authority**:
- Decision Maker: Contact ID or name of person with authority

**Need**:
- Need Analysis: Description of customer's pain points and requirements

**Timing**:
- Purchase Timeframe: "Q2 2025" or "Within 3 months" or "This fiscal year"

**Scoring**: The system calculates a lead score (0-100) based on:
- Budget amount and status (40 points)
- Completeness of information (30 points)
- Decision maker identified (15 points)
- Clear timeframe (15 points)

#### Step 2: Account Selection (B2B only)

Choose how to handle the company account:

**Option 1: Create New Account**
- Creates a new company record
- Use when: First time selling to this company
- Auto-fills company name from lead

**Option 2: Link to Existing Account**
- Links to a company that already exists in your system
- Use when: This company is already a customer
- Search and select from existing accounts

**Option 3: No Account (B2C)**
- Automatically selected for individual customers
- No company record created

#### Step 3: Contact Selection

Choose how to handle the contact person:

**Option 1: Create New Contact**
- Creates a new contact record
- Use when: First time dealing with this person
- Auto-fills name, email, phone from lead

**Option 2: Link to Existing Contact**
- Links to someone already in your system
- Use when: You've worked with this person before
- Search and select from existing contacts

#### Step 4: Opportunity Configuration

Configure the sales opportunity details:

**Opportunity Name**: "Acme Inc - CRM Implementation"
- Default format: "{Company/Name} - {Product/Service}"
- Make it descriptive

**Estimated Value**: €50,000
- How much is this deal worth?
- Can be updated later as you learn more

**Estimated Close Date**: 2025-06-30
- When do you expect to close the deal?
- Helps with forecasting

**Description**:
```
Acme Inc needs a CRM system to manage their 50-person sales team.
Looking to replace spreadsheets with a modern solution.
Key requirements: lead management, email integration, mobile access.
```

**Sales Stage**: Starts at "Qualify" (25% probability)

#### Step 5: Review & Confirm

Review all information before confirming:
- Account details (B2B) or "Individual customer" (B2C)
- Contact information
- Opportunity details
- Estimated value and close date

Click **"Confirm Qualification"** to complete the process.

### What Happens After Qualification?

The system automatically:
1. ✅ Changes Lead status to "Qualified"
2. ✅ Creates Account (B2B only)
3. ✅ Creates Contact
4. ✅ Creates Opportunity linked to Account/Contact
5. ✅ Links original Lead to new Opportunity
6. ✅ Shows success message with links to created records

You'll see a success dialog with:
- Link to view the new Opportunity
- Link to view Account (B2B)
- Link to view Contact

**Next Step**: Navigate to the Opportunity to continue the sales process.

---

## 3. Opportunity Management

### What is an Opportunity?

An Opportunity represents a **qualified sales deal** that you're actively pursuing. It tracks your progress through the sales cycle.

### Opportunity Sales Stages

Every Opportunity moves through 4 stages with increasing close probability:

| Stage | Code | Probability | What to Do |
|-------|------|-------------|------------|
| **Qualify** | 0 | 25% | Validate budget, authority, need, timing |
| **Develop** | 1 | 50% | Identify stakeholders, understand requirements, analyze competition |
| **Propose** | 2 | 75% | Present solution, create Quote, negotiate terms |
| **Close** | 3 | 100%/0% | Finalize deal as Won or Lost |

### Working with Opportunities

**Path**: `/opportunities` or `/opportunities/[id]`

#### Qualify Stage (25%)

**Goal**: Confirm the opportunity is worth pursuing

**Required Actions**:
- Verify budget amount and status
- Confirm decision maker contact
- Document customer needs
- Set realistic timeframe

**Fields to Complete**:
- Budget Amount: €50,000
- Budget Status: Will Buy
- Purchase Timeframe: Q2 2025
- Decision Maker: Contact ID
- Need Analysis: Detailed requirements

**When to Advance**: When you've confirmed BANT criteria and customer is serious

#### Develop Stage (50%)

**Goal**: Understand requirements and position your solution

**Required Actions**:
- Identify all stakeholders (decision makers, influencers, champions)
- Research competitors
- Document current situation
- Develop proposed solution
- Create implementation timeline

**Fields to Complete**:
- Proposed Solution: Description of what you'll deliver
- Customer Needs: Detailed pain points
- Current Situation: What they're using now
- Identify Competitors: Who else are they considering?
- Stakeholders: List all involved parties

**When to Advance**: When you have a clear solution that addresses their needs

#### Propose Stage (75%)

**Goal**: Present formal proposal and negotiate

**Required Actions**:
- **Create Quote** with products and pricing
- Schedule proposal presentation
- Identify contacts for presentation
- Assign pursuit team
- Send thank you note after presentation

**Fields to Complete**:
- Presentation Date: When you'll present
- Final Decision Date: When they'll decide
- Customer Contacts: Who will attend
- Pursuit Team: Your team members

**Critical**: You MUST create a Quote before closing as Won

**When to Advance**: When customer is ready to make a decision

#### Close Stage (100% or 0%)

**Goal**: Finalize the deal

**Two Paths**:

**Path 1: Win the Deal** ✅
1. Ensure Quote is "Active" status
2. Click "Win Opportunity"
3. Fill in:
   - Actual Value: Final agreed amount
   - Actual Close Date: Today's date
   - Active Quote: Select the winning quote
4. System automatically creates **Order** from Quote

**Path 2: Lose the Deal** ❌
1. Click "Lose Opportunity"
2. Fill in:
   - Status Reason: Why did you lose?
     - Competitor (who won instead)
     - Price (too expensive)
     - No Budget
     - No Decision
   - Competitor: If applicable
   - Close Date: Today's date

### Opportunity Statuses

| Status | Code | Description |
|--------|------|-------------|
| **Open** | 0 | Active opportunity in pipeline |
| **Won** | 1 | Deal closed successfully → Order created |
| **Lost** | 2 | Deal lost to competitor or cancelled |

---

## 4. Quote Creation

### What is a Quote?

A Quote is a **formal proposal** with products, pricing, and terms. It's required before winning an Opportunity.

### Creating a Quote

**Path**: Opportunity detail page → "Create Quote" button

OR directly: `/quotes/new`

**Required Information**:
- Quote Name: "Acme Inc - CRM Proposal v1"
- Customer: Link to Account (B2B) or Contact (B2C)
- Opportunity: Link to related opportunity
- Valid From: Start date
- Valid To: Expiration date

**Example**:
```
Quote Name: Acme Inc - CRM Implementation Q2 2025
Customer: Acme Inc (Account)
Opportunity: Acme Inc - CRM Implementation
Valid From: 2025-03-01
Valid To: 2025-03-31 (30 days validity)
```

### Adding Products to Quote

**Path**: Quote detail page → "Products" tab → "Add Product"

**For Each Product**:
- Product: Select from product catalog
- Quantity: How many units
- Price Per Unit: Unit price (can override catalog price)
- Discount %: Optional discount
- Tax: Tax amount or %

**System Calculates**:
- Line Total = (Quantity × Price) - Discount + Tax
- Quote Total = Sum of all line totals

**Example Quote Lines**:
```
Product: CRM Professional License
Quantity: 50
Price Per Unit: €50/month
Discount: 10%
Tax: 21%
Line Total: €2,722.50/month

Product: Implementation Service
Quantity: 200 hours
Price Per Unit: €100/hour
Discount: 0%
Tax: 21%
Line Total: €24,200

Total Quote Value: €51,470 (first year)
```

### Quote Statuses

| Status | Code | Next Action |
|--------|------|-------------|
| **Draft** | 0 | Edit products and pricing |
| **Active** | 1 | Present to customer |
| **Won** | 2 | Quote accepted → Create Order |
| **Closed** | 3 | Quote rejected or expired |

### Quote Workflow

1. **Create Quote** (Draft)
   - Add products
   - Set pricing
   - Review totals

2. **Activate Quote**
   - Click "Activate"
   - Locks editing
   - Ready for customer

3. **Win Opportunity**
   - Go to linked Opportunity
   - Click "Win Opportunity"
   - Select this Active Quote
   - System creates Order automatically

**Important**: You can have multiple Quotes per Opportunity (e.g., v1, v2, v3) but only one can be Active at a time.

---

## 5. Order Processing

### What is an Order?

An Order is a **confirmed purchase order** created automatically when you win an Opportunity with an Active Quote.

### How Orders are Created

**You CANNOT create Orders manually**. Orders are automatically generated when:
1. Opportunity has an Active Quote
2. You click "Win Opportunity"
3. System copies Quote Lines → Order Lines

### Order Workflow

**Path**: `/orders` or `/orders/[id]`

#### Step 1: Review Order (Auto-created)

The Order is created with:
- Order Name: From Opportunity name
- Customer: From Quote customer
- Order Lines: Copied from Quote Lines
- Total Amount: Same as Quote total
- Status: Active

#### Step 2: Submit Order (Optional)

Click "Submit Order":
- Changes status to "Submitted"
- Indicates order sent to fulfillment
- Can be used for approval workflows

#### Step 3: Fulfill Order

**Path**: Order detail page → "Fulfill Order" button

**Actions**:
1. Verify all products delivered
2. Click "Fulfill Order"
3. Confirm fulfillment
4. Status changes to "Fulfilled"

**Next Step**: Generate Invoice

### Order Statuses

| Status | Code | Description |
|--------|------|-------------|
| **Active** | 0 | New order, being processed |
| **Submitted** | 1 | Sent to fulfillment |
| **Fulfilled** | 3 | Products/services delivered |
| **Canceled** | 2 | Order cancelled |

---

## 6. Invoice Management

### What is an Invoice?

An Invoice is a **bill for payment** generated from a fulfilled Order.

### Creating an Invoice

**Path**: Order detail page (Fulfilled) → "Create Invoice" button

The Invoice is created with:
- Invoice Number: Auto-generated (e.g., INV-2025-0001)
- Customer: From Order
- Invoice Lines: Copied from Order Lines
- Total Amount: Same as Order total
- Due Date: Payment term (default: Net 30)

### Invoice Workflow

#### Step 1: Review Invoice

**Path**: `/invoices/[id]`

Verify:
- Customer details
- Invoice lines and amounts
- Due date
- Billing address

#### Step 2: Send to Customer

Options:
- Download PDF
- Email to customer
- Print and mail

#### Step 3: Track Payment

Monitor payment status in Invoices list:
- View aging reports (`/invoices/aging`)
- Filter overdue invoices
- Send payment reminders

#### Step 4: Mark as Paid

**Path**: Invoice detail page → "Mark as Paid" button

**Actions**:
1. Click "Mark as Paid"
2. Enter payment details:
   - Payment Date: When received
   - Payment Method: Bank transfer, Credit card, etc.
   - Payment Reference: Transaction ID
3. Confirm
4. Status changes to "Paid"

### Invoice Statuses

| Status | Code | Description |
|--------|------|-------------|
| **Active** | 0 | Awaiting payment |
| **Paid** | 2 | Payment received |
| **Canceled** | 3 | Invoice cancelled |

### Aging Reports

**Path**: `/invoices/aging`

View invoices grouped by age:
- Current (0-30 days)
- 31-60 days
- 61-90 days
- 90+ days overdue

---

## Common Workflows

### Complete B2B Sale Flow

```
Day 1: Create Lead
  - Lead: "Juan Pérez - Acme Inc"
  - Source: Website form
  - Budget: €50,000

Day 3: Qualify Lead using BANT Wizard
  - Budget: €50,000, Will Buy
  - Authority: Juan Pérez (IT Director)
  - Need: Replace spreadsheets with CRM
  - Timing: Q2 2025
  → Creates: Account "Acme Inc" + Contact "Juan Pérez" + Opportunity

Day 5-15: Opportunity - Qualify Stage (25%)
  - Confirm BANT criteria
  - Validate budget authority
  - Document detailed requirements
  → Advance to Develop

Day 16-30: Opportunity - Develop Stage (50%)
  - Identify stakeholders
  - Research competitors
  - Design solution
  → Advance to Propose

Day 31: Opportunity - Propose Stage (75%)
  - Create Quote with products
  - Total: €51,470
  - Valid for 30 days
  - Activate Quote

Day 35: Present Proposal
  - Present to stakeholders
  - Answer questions
  - Negotiate pricing

Day 40: Win Opportunity
  - Click "Win Opportunity"
  - Select Active Quote
  → System creates Order automatically

Day 41: Submit Order
  - Review order details
  - Submit for fulfillment

Day 45-60: Fulfill Order
  - Deliver CRM system
  - Complete implementation
  - Click "Fulfill Order"

Day 61: Create Invoice
  - Generate from fulfilled Order
  - Invoice #INV-2025-0042
  - Due: Net 30 (Day 91)
  - Send to customer

Day 85: Receive Payment
  - Payment received
  - Mark Invoice as Paid
  ✅ Sale Complete!
```

### Complete B2C Sale Flow

```
Day 1: Create Lead
  - Lead: "María García" (no company)
  - Source: Referral
  - Budget: €5,000

Day 2: Qualify Lead
  - Budget: €5,000, Can Buy
  - Timing: This month
  - Need: Personal productivity software
  → Creates: Contact "María García" + Opportunity (no Account)

Day 3-5: Opportunity - Quick cycle
  - Qualify → Develop → Propose (B2C moves faster)

Day 6: Create Quote
  - Quote for individual license
  - Total: €5,400 (incl. tax)

Day 7: Win Opportunity
  → Order created

Day 8: Fulfill & Invoice
  - Deliver digital license
  - Create invoice

Day 15: Payment Received
  ✅ Complete!
```

### Handling Multiple Quotes

**Scenario**: Customer requests pricing options

```
Day 1: Create Quote v1 - Standard Package
  - 50 users
  - Basic features
  - Total: €30,000

Day 3: Create Quote v2 - Professional Package
  - 50 users
  - Advanced features
  - Total: €50,000

Day 5: Create Quote v3 - Enterprise Package
  - 50 users
  - All features + support
  - Total: €75,000

Day 7: Customer chooses Quote v2
  - Deactivate v1 and v3 (status: Closed)
  - Activate v2
  - Win Opportunity with v2
  → Order created from v2
```

---

## Troubleshooting

### "Cannot qualify lead - missing fields"

**Problem**: Required BANT fields not completed

**Solution**:
1. Go to Lead detail page
2. Click "Qualify" stage in BPF
3. Complete ALL fields:
   - Budget Amount (must be > 0)
   - Budget Status (select any option including "No Budget")
   - Purchase Timeframe
   - Need Analysis
   - Decision Maker
4. Save
5. Try qualifying again

### "Cannot win opportunity - no active quote"

**Problem**: Trying to win without a Quote

**Solution**:
1. Go to Opportunity detail
2. Click "Create Quote"
3. Add products
4. Click "Activate Quote"
5. Return to Opportunity
6. Click "Win Opportunity"
7. Select the Active Quote

### "Cannot create order - quote not active"

**Problem**: Quote is in Draft or Closed status

**Solution**:
1. Go to Quote detail
2. If Draft: Click "Activate"
3. If Closed: Create new Quote or reactivate if needed
4. Return to Opportunity and win with Active Quote

### "Cannot create invoice - order not fulfilled"

**Problem**: Trying to invoice before fulfillment

**Solution**:
1. Go to Order detail
2. Click "Fulfill Order"
3. Confirm fulfillment
4. Click "Create Invoice"

### B2B vs B2C Confusion

**Problem**: Created B2C lead but need Account

**Solution**:
1. Edit Lead
2. Add Company Name
3. Save
4. Qualify again - will now be B2B

### Duplicate Accounts/Contacts

**Problem**: Creating duplicates instead of linking existing

**Solution**:
- Always use qualification wizard "Link to Existing" option
- Search before creating new records
- Use consistent naming (e.g., "Acme Inc" not "ACME" or "Acme Corporation")

### Lost Sales Stages Progress

**Problem**: BPF showing wrong stage or not updating

**Solution**:
1. Refresh page
2. Check Opportunity sales stage field
3. Click on BPF stage manually
4. Save stage data
5. Advance using "Next Stage" button

### Quote Total Doesn't Match

**Problem**: Quote total seems wrong

**Solution**:
1. Check individual line totals
2. Verify discount % is applied correctly
3. Check tax calculation (21% VAT)
4. Formula: (Qty × Price) - Discount + Tax
5. Remove and re-add line if needed

---

## Best Practices

### Lead Management

- ✅ **Qualify quickly**: Aim to qualify or disqualify within 3 days
- ✅ **Score leads**: Focus on high-scoring leads (80+) first
- ✅ **Track source**: Always record lead source to analyze ROI
- ✅ **Update budget**: Refine budget amount as you learn more

### Opportunity Management

- ✅ **Keep moving**: Don't let opportunities stagnate in one stage
- ✅ **Update probability**: Adjust close probability based on signals
- ✅ **Document everything**: Use notes and activities to track interactions
- ✅ **Set reminders**: Use scheduled activities for follow-ups

### Quote Management

- ✅ **Version control**: Use "v1", "v2" naming for revisions
- ✅ **Valid dates**: Set realistic expiration dates (15-30 days)
- ✅ **Detailed descriptions**: Clear product descriptions prevent confusion
- ✅ **Approval workflow**: Get internal approval before activating

### Order & Invoice Management

- ✅ **Fulfill promptly**: Update order status as work progresses
- ✅ **Invoice immediately**: Create invoice as soon as order fulfilled
- ✅ **Track payments**: Monitor aging report weekly
- ✅ **Payment terms**: Set clear due dates (Net 15, Net 30, etc.)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Create new record (context dependent) |
| `Ctrl + S` | Save current form |
| `Ctrl + K` | Global search |
| `Esc` | Close dialog/modal |
| `/` | Focus search |

---

## Getting Help

- **Documentation**: See CLAUDE.md for technical architecture
- **Support**: Contact your system administrator
- **Feature Requests**: Submit via GitHub issues

---

**Version**: 1.0
**Last Updated**: 2025-12-31
**CRM Version**: Based on Microsoft Dynamics 365 Sales & Common Data Service
