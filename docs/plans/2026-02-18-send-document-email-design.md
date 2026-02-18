# Send Document Email - Design Document

**Date**: 2026-02-18
**Status**: Approved
**Entities**: Quote, Order, Invoice

---

## Overview

Enable users to send quotes, orders, and invoices by email directly from the detail page, with the PDF automatically attached. The system pre-fills recipient, subject, and body from the document context. In mock mode, the email is simulated and registered as an Activity; in backend mode, it sends via SendGrid through Django REST.

---

## User Flow

```
User on Quote/Order/Invoice detail page
  → Clicks "Send Email" button in toolbar
  → SendDocumentEmailDialog opens
      - To: pre-filled with customer email (Account/Contact)
      - Subject: pre-filled with "Quote: QUO-001 - Document Name"
      - Body: template with greeting, document summary, total
      - Checkbox: "Attach PDF" (checked by default)
      - Cc/Bcc: optional (toggle)
  → Clicks "Send"
  → PDF generated client-side (existing hooks)
  → Email registered as Activity linked to document
  → Toast: "Email sent successfully" (simulated in mock)
```

---

## Architecture

### File Structure

```
shared/components/send-document-email/
  ├── send-document-email-dialog.tsx    # Dialog with form
  ├── use-send-document-email.ts        # Hook: generate PDF + register activity
  └── index.ts                          # Public exports

# Integration points (existing files, add button):
app/(sales)/quotes/[id]/page.tsx
app/(sales)/orders/[id]/page.tsx
app/(sales)/invoices/[id]/page.tsx
```

**Why shared/**: The dialog is used by 3 features (quotes, orders, invoices), satisfying the 2+ feature rule for shared placement.

### Layer Dependencies

```
Page (app layer)
  → SendDocumentEmailDialog (shared)
    → use-send-document-email hook (shared)
      → use-quote-pdf-export / use-order-pdf-export / use-invoice-pdf-export (feature)
      → activity-service (feature/activities)
```

---

## Component API

### SendDocumentEmailDialog Props

```typescript
interface SendDocumentEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: 'quote' | 'order' | 'invoice'
  documentId: string
  documentNumber: string            // QUO-001, ORD-001, INV-001
  documentName: string              // "Website Redesign Proposal"
  customerEmail?: string            // Pre-fill from Account/Contact
  customerName?: string             // For greeting
  totalAmount?: number              // Document total for body template
  currencyCode?: string             // For formatting
  onGeneratePdf: () => Promise<Blob>  // Existing PDF hook
}
```

### Dialog Layout

```
┌──────────────────────────────────────────────┐
│  Send Quote by Email                    [X]  │
├──────────────────────────────────────────────┤
│                                              │
│  To:     [john@acme.com              ]       │
│  [+ Cc]  [+ Bcc]                             │
│                                              │
│  Subject: [Quote: QUO-001 - Website...]      │
│                                              │
│  Message:                                    │
│  ┌────────────────────────────────────────┐  │
│  │ Dear John,                             │  │
│  │                                        │  │
│  │ Please find attached the quote         │  │
│  │ QUO-001 for your review.              │  │
│  │                                        │  │
│  │ Total: $15,250.00                      │  │
│  │                                        │  │
│  │ Best regards,                          │  │
│  │ Carlos                                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ☑ Attach PDF (Quote-QUO-001.pdf)           │
│                                              │
├──────────────────────────────────────────────┤
│              [Cancel]  [Send Email]          │
└──────────────────────────────────────────────┘
```

---

## Button Placement

### Desktop (visible in toolbar)

```
[Back] [Edit] [Export PDF] [Send Email] [Primary Action]
```

### Mobile (in dropdown menu)

```
[Back] [MoreVertical ▼]
        ├─ Export PDF
        ├─ Send Email
        ├─ Edit
        └─ ...
```

### State Conditions

The "Send Email" button follows the same visibility rules as "Export PDF":
- **Quotes**: Visible in all states (Draft, Active, Won, Lost, Canceled)
- **Orders**: Visible in all states
- **Invoices**: Visible in all states

---

## Dual-Mode Strategy

### Mock Mode (current)

```typescript
async function sendEmail(data: SendEmailData) {
  // 1. Generate PDF blob (if attach checkbox is checked)
  let pdfBlob: Blob | null = null
  if (data.attachPdf) {
    pdfBlob = await onGeneratePdf()
  }

  // 2. Register as Activity (Email type)
  await createActivity({
    activitytypecode: ActivityTypeCode.Email,
    subject: data.subject,
    description: data.body,
    regardingobjectid: data.documentId,
    regardingobjectidtype: data.documentType,
    directioncode: true, // Outgoing
    ownerid: session?.user?.id || 'anonymous',
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
  })

  // 3. Show simulated toast
  toast({
    title: "Email sent (simulated)",
    description: `To: ${data.to}`,
  })
}
```

### Backend Mode (future with SendGrid)

```typescript
async function sendEmail(data: SendEmailData) {
  // 1. Generate PDF blob
  let pdfBase64: string | null = null
  if (data.attachPdf) {
    const pdfBlob = await onGeneratePdf()
    pdfBase64 = await blobToBase64(pdfBlob)
  }

  // 2. POST to Django backend
  await api.post('/api/emails/send', {
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
    subject: data.subject,
    body: data.body,
    pdf_base64: pdfBase64,
    filename: `${documentType}-${documentNumber}.pdf`,
    regarding_id: data.documentId,
    regarding_type: data.documentType,
  })

  // 3. Backend registers Activity + sends via SendGrid
  toast({
    title: "Email sent successfully",
    description: `To: ${data.to}`,
  })
}
```

---

## Backend Strategy (Future: Django + SendGrid)

### Why SendGrid

- **Free tier**: 100 emails/day (sufficient for development and SMBs)
- **Simple API**: `pip install sendgrid`, minimal Django code
- **Native attachments**: Base64 PDF attachment support
- **Templates**: HTML email templates via dashboard
- **Tracking**: Open/click tracking maps to Email entity fields (`opencount`, `lastopenedon`)
- **Reliability**: 99.95% uptime, automatic retry queue

### Django Endpoint (Future)

```python
# views.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment

@api_view(['POST'])
def send_document_email(request):
    message = Mail(
        from_email='sales@yourdomain.com',
        to_emails=request.data['to'],
        subject=request.data['subject'],
        html_content=request.data['body']
    )

    if request.data.get('pdf_base64'):
        attachment = Attachment(
            file_content=request.data['pdf_base64'],
            file_name=request.data['filename'],
            file_type='application/pdf'
        )
        message.attachment = attachment

    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    response = sg.send(message)

    # Register as Activity
    Email.objects.create(
        subject=request.data['subject'],
        description=request.data['body'],
        to=request.data['to'],
        regardingobjectid=request.data['regarding_id'],
        directioncode=True,
        ownerid=request.user.id,
    )

    return Response({'status': 'sent'}, status=200)
```

### Alternatives Considered

| Service | Free Tier | Complexity | Best For |
|---------|-----------|------------|----------|
| **SendGrid** | 100/day | Low | SMBs, startups |
| **AWS SES** | 62K/month (EC2) | Medium | AWS-hosted apps |
| **Resend** | 100/day | Low | Modern stacks |
| **SMTP (Gmail)** | 500/day | Very low | Development only |

---

## i18n Keys

New keys needed in translation files:

```json
// common.json
{
  "email": {
    "sendEmail": "Send Email",
    "sendByEmail": "Send by Email",
    "to": "To",
    "cc": "Cc",
    "bcc": "Bcc",
    "subject": "Subject",
    "message": "Message",
    "attachPdf": "Attach PDF",
    "sending": "Sending...",
    "sent": "Email sent",
    "sentSimulated": "Email sent (simulated)",
    "sentDescription": "To: {{to}}",
    "showCc": "+ Cc",
    "showBcc": "+ Bcc",
    "emailRequired": "Recipient email is required",
    "emailInvalid": "Please enter a valid email address"
  }
}

// quotes.json
{
  "email": {
    "dialogTitle": "Send Quote by Email",
    "defaultSubject": "Quote: {{number}} - {{name}}",
    "defaultBody": "Dear {{customerName}},\n\nPlease find attached the quote {{number}} for your review.\n\nTotal: {{total}}\n\nBest regards"
  }
}

// orders.json
{
  "email": {
    "dialogTitle": "Send Order by Email",
    "defaultSubject": "Order: {{number}} - {{name}}",
    "defaultBody": "Dear {{customerName}},\n\nPlease find attached the order confirmation {{number}}.\n\nTotal: {{total}}\n\nBest regards"
  }
}

// invoices.json
{
  "email": {
    "dialogTitle": "Send Invoice by Email",
    "defaultSubject": "Invoice: {{number}} - {{name}}",
    "defaultBody": "Dear {{customerName}},\n\nPlease find attached the invoice {{number}} for your records.\n\nTotal: {{total}}\n\nBest regards"
  }
}
```

---

## Implementation Tasks

1. **Create `shared/components/send-document-email/`** - Dialog component + hook
2. **Add "Send Email" button to Quote detail page** - Desktop + mobile
3. **Add "Send Email" button to Order detail page** - Desktop + mobile
4. **Add "Send Email" button to Invoice detail page** - Desktop + mobile
5. **Add i18n keys** - EN + ES for common, quotes, orders, invoices
6. **Adapt existing PDF hooks** - Expose `generatePdfBlob()` method that returns Blob instead of triggering download

---

## Existing Infrastructure Leveraged

- `core/contracts/entities/email.ts` - Email entity types
- `features/activities/components/email-composer-dialog.tsx` - Reference for form patterns
- `features/quotes/hooks/use-quote-pdf-export.tsx` - PDF generation (adapt to return Blob)
- `features/orders/hooks/use-order-pdf-export.ts` - PDF generation
- `features/invoices/hooks/use-invoice-pdf-export.ts` - PDF generation
- `features/activities/services/activity-service.ts` - Register email as Activity
- Customer email from Account (`emailaddress1`) / Contact (`emailaddress1`)
