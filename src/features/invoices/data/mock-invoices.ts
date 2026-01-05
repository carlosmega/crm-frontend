import type { Invoice, InvoiceDetail } from '@/core/contracts'
import { InvoiceStateCode, PaymentTermsCode, PriorityCode } from '@/core/contracts/enums'

/**
 * Mock Invoices Data
 *
 * Invoices vinculadas a Orders fulfilled
 * Estados: Active (pendiente), Paid (pagada), Overdue (vencida)
 */

export const mockInvoices: Invoice[] = [
  // Invoice 1: Paid - Vinculada a order-1 (Fulfilled)
  {
    invoiceid: 'invoice-001',
    invoicenumber: 'INV-20240125-001',
    statecode: InvoiceStateCode.Paid,
    name: 'Invoice for Enterprise Software License - Acme Corp',
    description: 'Annual enterprise license for 100 users',

    // Relaciones
    salesorderid: 'order-1',
    opportunityid: 'opp-1',
    customerid: 'account-1',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 50000,
    totalamountlessfreight: 48000,
    freightamount: 2000,
    discountamount: 0,
    totaltax: 5000,

    // Payment tracking
    totalpaid: 50000, // Pagado completo
    totalbalance: 0,

    // Fechas
    duedate: '2024-02-25', // Net 30
    datedelivered: '2024-01-20',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'Acme Corp',
    billto_line1: '123 Business Ave',
    billto_city: 'New York',
    billto_stateorprovince: 'NY',
    billto_postalcode: '10001',
    billto_country: 'USA',

    // Audit
    createdon: '2024-01-20T15:00:00Z',
    modifiedon: '2024-02-15T10:30:00Z',
  },

  // Invoice 2: Active - Vencimiento próximo
  {
    invoiceid: 'invoice-002',
    invoicenumber: 'INV-20240201-002',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Cloud Infrastructure Setup - TechStart Inc',
    description: 'Initial cloud infrastructure deployment',

    // Relaciones
    salesorderid: 'order-2', // Order Submitted (aún no fulfilled)
    opportunityid: 'opp-2',
    customerid: 'account-2',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 25000,
    totalamountlessfreight: 24000,
    freightamount: 1000,
    discountamount: 1500,
    discountpercentage: 5,
    totaltax: 2500,

    // Payment tracking
    totalpaid: 0, // No pagado
    totalbalance: 25000,

    // Fechas
    duedate: '2024-03-15', // Net 45
    datedelivered: '2024-01-25',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net45,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'TechStart Inc',
    billto_line1: '456 Tech Blvd',
    billto_city: 'San Francisco',
    billto_stateorprovince: 'CA',
    billto_postalcode: '94102',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-01T09:00:00Z',
    modifiedon: '2024-02-01T09:00:00Z',
  },

  // Invoice 3: Overdue - Vencida hace 10 días
  {
    invoiceid: 'invoice-003',
    invoicenumber: 'INV-20231201-003',
    statecode: InvoiceStateCode.Active, // Active pero vencida
    name: 'Invoice for Consulting Services Q4 2023',
    description: 'Q4 consulting services delivered',

    // Relaciones
    salesorderid: 'order-old-1',
    opportunityid: 'opp-old-1',
    customerid: 'account-3',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 18000,
    totalamountlessfreight: 18000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 1800,

    // Payment tracking
    totalpaid: 0, // No pagado
    totalbalance: 18000,

    // Fechas (VENCIDA)
    duedate: '2024-01-15', // Vencida hace días
    datedelivered: '2023-12-15',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.High, // Alta prioridad por vencimiento

    // Billing address
    billto_name: 'Global Systems',
    billto_line1: '789 Enterprise Rd',
    billto_city: 'Chicago',
    billto_stateorprovince: 'IL',
    billto_postalcode: '60601',
    billto_country: 'USA',

    // Audit
    createdon: '2023-12-15T16:00:00Z',
    modifiedon: '2024-01-10T11:00:00Z',
  },

  // Invoice 4: Active - Pago parcial
  {
    invoiceid: 'invoice-004',
    invoicenumber: 'INV-20240210-004',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Hardware Refresh - Manufacturing Co',
    description: 'Server and workstation hardware upgrade',

    // Relaciones
    customerid: 'account-4',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 95000,
    totalamountlessfreight: 93000,
    freightamount: 2000,
    discountamount: 5000,
    totaltax: 9500,

    // Payment tracking (pago parcial)
    totalpaid: 45000, // Pagado 45k de 95k
    totalbalance: 50000, // Balance pendiente

    // Fechas
    duedate: '2024-04-10', // Net 60
    datedelivered: '2024-02-10',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net60,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'Manufacturing Co',
    billto_line1: '321 Factory Lane',
    billto_city: 'Detroit',
    billto_stateorprovince: 'MI',
    billto_postalcode: '48201',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-10T10:00:00Z',
    modifiedon: '2024-02-28T14:30:00Z',
  },

  // Invoice 5: Canceled
  {
    invoiceid: 'invoice-005',
    invoicenumber: 'INV-20240115-005',
    statecode: InvoiceStateCode.Canceled,
    name: 'Invoice for Custom Development - Canceled',
    description: 'Custom software development project\n\nCanceled: Project terminated by client',

    // Relaciones
    customerid: 'account-5',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 35000,
    totalamountlessfreight: 35000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 3500,

    // Payment tracking
    totalpaid: 0,
    totalbalance: 35000,

    // Fechas
    duedate: '2024-02-15',
    datedelivered: '2024-01-15',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.Low,

    // Billing address
    billto_name: 'Retail Chain Inc',
    billto_line1: '555 Shopping Plaza',
    billto_city: 'Los Angeles',
    billto_stateorprovince: 'CA',
    billto_postalcode: '90001',
    billto_country: 'USA',

    // Audit
    createdon: '2024-01-15T11:00:00Z',
    modifiedon: '2024-01-25T09:00:00Z',
  },

  // Invoice 6: Due on Receipt - Prepaid
  {
    invoiceid: 'invoice-006',
    invoicenumber: 'INV-20240220-006',
    statecode: InvoiceStateCode.Paid,
    name: 'Invoice for Training Services - Prepaid',
    description: 'Technical training for 20 attendees (prepaid)',

    // Relaciones
    customerid: 'account-6',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 12000,
    totalamountlessfreight: 12000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 1200,

    // Payment tracking
    totalpaid: 12000,
    totalbalance: 0,

    // Fechas
    duedate: '2024-02-20', // Due on receipt (pagado inmediatamente)
    datedelivered: '2024-02-20',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Prepaid,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'Startup Ventures LLC',
    billto_line1: '888 Innovation Way',
    billto_city: 'Austin',
    billto_stateorprovince: 'TX',
    billto_postalcode: '78701',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-20T08:00:00Z',
    modifiedon: '2024-02-20T12:00:00Z',
  },

  // Invoice 7: Active - Recent invoice
  {
    invoiceid: 'invoice-007',
    invoicenumber: 'INV-20240301-007',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for CRM Platform Implementation - TechVision Inc',
    description: 'Complete CRM platform setup and migration',

    // Relaciones
    salesorderid: 'order-002',
    opportunityid: 'opp-2',
    customerid: 'account-2',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 85000,
    totalamountlessfreight: 85000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 8500,

    // Payment tracking
    totalpaid: 0,
    totalbalance: 85000,

    // Fechas
    duedate: '2024-04-15', // Net 45
    datedelivered: '2024-02-15',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net45,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'TechVision Inc',
    billto_line1: '456 Tech Blvd',
    billto_city: 'San Francisco',
    billto_stateorprovince: 'CA',
    billto_postalcode: '94102',
    billto_country: 'USA',

    // Audit
    createdon: '2024-03-01T10:00:00Z',
    modifiedon: '2024-03-01T10:00:00Z',
  },

  // Invoice 8: Paid - Office 365 Migration
  {
    invoiceid: 'invoice-008',
    invoicenumber: 'INV-20240225-008',
    statecode: InvoiceStateCode.Paid,
    name: 'Invoice for Office 365 Migration - SmallBiz Co',
    description: 'Google Workspace to Office 365 migration',

    // Relaciones
    salesorderid: 'order-014',
    customerid: 'account-14',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 18000,
    totalamountlessfreight: 18000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 1800,

    // Payment tracking
    totalpaid: 18000,
    totalbalance: 0,

    // Fechas
    duedate: '2024-03-27', // Net 30
    datedelivered: '2024-02-18',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'SmallBiz Co',
    billto_line1: '150 Main St',
    billto_city: 'Portland',
    billto_stateorprovince: 'OR',
    billto_postalcode: '97201',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-25T09:00:00Z',
    modifiedon: '2024-03-20T14:30:00Z',
  },

  // Invoice 9: Active - Cybersecurity Training
  {
    invoiceid: 'invoice-009',
    invoicenumber: 'INV-20240228-009',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Cybersecurity Training - Government Agency',
    description: 'Cybersecurity awareness training for 200 employees',

    // Relaciones
    salesorderid: 'order-015',
    customerid: 'account-15',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 32000,
    totalamountlessfreight: 32000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 3200,

    // Payment tracking
    totalpaid: 16000, // Pago parcial 50%
    totalbalance: 16000,

    // Fechas
    duedate: '2024-04-29', // Net 60
    datedelivered: '2024-02-25',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net60,
    prioritycode: PriorityCode.High,

    // Billing address
    billto_name: 'Government Agency',
    billto_line1: '500 Capitol Way',
    billto_city: 'Sacramento',
    billto_stateorprovince: 'CA',
    billto_postalcode: '94203',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-28T11:00:00Z',
    modifiedon: '2024-03-15T10:00:00Z',
  },

  // Invoice 10: Paid - Annual Support Contract
  {
    invoiceid: 'invoice-010',
    invoicenumber: 'INV-20231215-010',
    statecode: InvoiceStateCode.Paid,
    name: 'Invoice for Annual Support Contract - MegaCorp',
    description: '24/7 premium support and maintenance',

    // Relaciones
    salesorderid: 'order-013',
    customerid: 'account-13',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 180000,
    totalamountlessfreight: 180000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 18000,

    // Payment tracking
    totalpaid: 180000,
    totalbalance: 0,

    // Fechas
    duedate: '2024-01-14', // Net 30
    datedelivered: '2023-12-01',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'MegaCorp Headquarters',
    billto_line1: '1000 Enterprise Blvd',
    billto_city: 'Miami',
    billto_stateorprovince: 'FL',
    billto_postalcode: '33101',
    billto_country: 'USA',

    // Audit
    createdon: '2023-12-15T09:00:00Z',
    modifiedon: '2024-01-10T15:00:00Z',
  },

  // Invoice 11: Active - Cloud Services Monthly
  {
    invoiceid: 'invoice-011',
    invoicenumber: 'INV-20240305-011',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Cloud Services - DataStream Inc - March 2024',
    description: 'Monthly cloud hosting and services',

    // Relaciones
    customerid: 'account-16',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 8500,
    totalamountlessfreight: 8500,
    freightamount: 0,
    discountamount: 0,
    totaltax: 850,

    // Payment tracking
    totalpaid: 0,
    totalbalance: 8500,

    // Fechas
    duedate: '2024-04-04', // Net 30
    datedelivered: '2024-03-01',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net30,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'DataStream Inc',
    billto_line1: '200 Cloud Ave',
    billto_city: 'Atlanta',
    billto_stateorprovince: 'GA',
    billto_postalcode: '30301',
    billto_country: 'USA',

    // Audit
    createdon: '2024-03-05T08:00:00Z',
    modifiedon: '2024-03-05T08:00:00Z',
  },

  // Invoice 12: Overdue - Legacy Project
  {
    invoiceid: 'invoice-012',
    invoicenumber: 'INV-20231120-012',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Legacy System Migration - OldTech Corp',
    description: 'Legacy mainframe to cloud migration\n\nOVERDUE: Payment pending for 60+ days',

    // Relaciones
    customerid: 'account-17',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 245000,
    totalamountlessfreight: 240000,
    freightamount: 5000,
    discountamount: 0,
    totaltax: 24500,

    // Payment tracking
    totalpaid: 100000, // Pago parcial
    totalbalance: 145000, // Balance vencido

    // Fechas (VENCIDA)
    duedate: '2024-01-05', // Vencida hace mucho
    datedelivered: '2023-11-15',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net45,
    prioritycode: PriorityCode.High, // Urgente por vencimiento

    // Billing address
    billto_name: 'OldTech Corp',
    billto_line1: '100 Legacy Dr',
    billto_city: 'Pittsburgh',
    billto_stateorprovince: 'PA',
    billto_postalcode: '15201',
    billto_country: 'USA',

    // Audit
    createdon: '2023-11-20T10:00:00Z',
    modifiedon: '2024-02-15T11:00:00Z',
  },

  // Invoice 13: Paid - Quick turnaround
  {
    invoiceid: 'invoice-013',
    invoicenumber: 'INV-20240228-013',
    statecode: InvoiceStateCode.Paid,
    name: 'Invoice for Emergency IT Support - FinanceFirst Bank',
    description: 'Emergency 24-hour IT support and recovery',

    // Relaciones
    customerid: 'account-18',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 45000,
    totalamountlessfreight: 45000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 4500,

    // Payment tracking
    totalpaid: 45000,
    totalbalance: 0,

    // Fechas
    duedate: '2024-02-28', // Due on receipt - pagado mismo día
    datedelivered: '2024-02-28',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Prepaid,
    prioritycode: PriorityCode.Urgent,

    // Billing address
    billto_name: 'FinanceFirst Bank',
    billto_line1: '500 Banking Plaza',
    billto_city: 'Charlotte',
    billto_stateorprovince: 'NC',
    billto_postalcode: '28201',
    billto_country: 'USA',

    // Audit
    createdon: '2024-02-28T15:00:00Z',
    modifiedon: '2024-02-28T18:00:00Z',
  },

  // Invoice 14: Active - Large enterprise deal
  {
    invoiceid: 'invoice-014',
    invoicenumber: 'INV-20240310-014',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Enterprise Software Suite - Fortune500 Inc',
    description: 'Enterprise software licenses and implementation - Phase 1',

    // Relaciones
    customerid: 'account-19',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 550000,
    totalamountlessfreight: 550000,
    freightamount: 0,
    discountamount: 50000,
    discountpercentage: 8.3,
    totaltax: 55000,

    // Payment tracking
    totalpaid: 0,
    totalbalance: 550000,

    // Fechas
    duedate: '2024-05-09', // Net 60
    datedelivered: '2024-03-10',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net60,
    prioritycode: PriorityCode.High,

    // Billing address
    billto_name: 'Fortune500 Inc',
    billto_line1: '1 Corporate Plaza',
    billto_city: 'New York',
    billto_stateorprovince: 'NY',
    billto_postalcode: '10001',
    billto_country: 'USA',

    // Audit
    createdon: '2024-03-10T10:00:00Z',
    modifiedon: '2024-03-10T10:00:00Z',
  },

  // Invoice 15: Active - Consulting services
  {
    invoiceid: 'invoice-015',
    invoicenumber: 'INV-20240312-015',
    statecode: InvoiceStateCode.Active,
    name: 'Invoice for Business Process Consulting - InnovateNow',
    description: 'Business process optimization and automation consulting',

    // Relaciones
    customerid: 'account-20',
    customeridtype: 'account',
    ownerid: 'user-1',

    // Pricing
    totalamount: 68000,
    totalamountlessfreight: 68000,
    freightamount: 0,
    discountamount: 0,
    totaltax: 6800,

    // Payment tracking
    totalpaid: 34000, // 50% down payment
    totalbalance: 34000,

    // Fechas
    duedate: '2024-04-26', // Net 45
    datedelivered: '2024-03-12',

    // Payment terms
    paymenttermscode: PaymentTermsCode.Net45,
    prioritycode: PriorityCode.Normal,

    // Billing address
    billto_name: 'InnovateNow LLC',
    billto_line1: '350 Innovation Blvd',
    billto_city: 'San Jose',
    billto_stateorprovince: 'CA',
    billto_postalcode: '95101',
    billto_country: 'USA',

    // Audit
    createdon: '2024-03-12T09:00:00Z',
    modifiedon: '2024-03-12T09:00:00Z',
  },
]

/**
 * Mock Invoice Details (Invoice Lines)
 *
 * Líneas de productos en las facturas
 */

export const mockInvoiceDetails: InvoiceDetail[] = [
  // Invoice 001 - Lines (Paid)
  {
    invoicedetailid: 'invdetail-001-1',
    invoiceid: 'invoice-001',
    salesorderdetailid: 'orderdetail-001-1',
    productid: 'prod-001', // CRM Enterprise License
    productdescription: 'CRM Enterprise License - 100 users',
    quantity: 1,
    priceperunit: 15000,
    baseamount: 15000,
    manualdiscountamount: 0,
    tax: 1500,
    extendedamount: 16500,
    lineitemnumber: 1,
    quantityshipped: 1,
    createdon: '2024-01-20T15:00:00Z',
    modifiedon: '2024-01-20T15:00:00Z',
  },
  {
    invoicedetailid: 'invdetail-001-2',
    invoiceid: 'invoice-001',
    salesorderdetailid: 'orderdetail-001-2',
    productid: 'prod-004', // CRM Implementation Service
    productdescription: 'CRM Implementation Service',
    quantity: 1,
    priceperunit: 25000,
    baseamount: 25000,
    manualdiscountamount: 0,
    tax: 2500,
    extendedamount: 27500,
    lineitemnumber: 2,
    quantityshipped: 1,
    createdon: '2024-01-20T15:00:00Z',
    modifiedon: '2024-01-20T15:00:00Z',
  },
  {
    invoicedetailid: 'invdetail-001-3',
    invoiceid: 'invoice-001',
    salesorderdetailid: 'orderdetail-001-3',
    productid: 'prod-007', // Premium Support
    productdescription: 'Premium Support Plan - Annual',
    quantity: 1,
    priceperunit: 8000,
    baseamount: 8000,
    manualdiscountamount: 0,
    tax: 1000,
    extendedamount: 9000,
    lineitemnumber: 3,
    quantityshipped: 1,
    createdon: '2024-01-20T15:00:00Z',
    modifiedon: '2024-01-20T15:00:00Z',
  },

  // Invoice 002 - Lines (Active)
  {
    invoicedetailid: 'invdetail-002-1',
    invoiceid: 'invoice-002',
    productid: 'prod-013', // Cloud Hosting - Enterprise
    productdescription: 'Cloud Hosting - Enterprise Tier (12 months)',
    quantity: 12,
    priceperunit: 1500,
    baseamount: 18000,
    manualdiscountamount: 900, // 5% discount
    tax: 1800,
    extendedamount: 18900,
    lineitemnumber: 1,
    createdon: '2024-02-01T09:00:00Z',
    modifiedon: '2024-02-01T09:00:00Z',
  },
  {
    invoicedetailid: 'invdetail-002-2',
    invoiceid: 'invoice-002',
    productid: 'prod-014', // Database as a Service
    productdescription: 'Database as a Service - SQL Premium',
    quantity: 1,
    priceperunit: 6000,
    baseamount: 6000,
    manualdiscountamount: 600, // 10% discount
    tax: 700,
    extendedamount: 6100,
    lineitemnumber: 2,
    createdon: '2024-02-01T09:00:00Z',
    modifiedon: '2024-02-01T09:00:00Z',
  },

  // Invoice 003 - Lines (Overdue)
  {
    invoicedetailid: 'invdetail-003-1',
    invoiceid: 'invoice-003',
    productid: 'prod-005', // Business Process Consulting
    productdescription: 'Business Process Consulting (30 days)',
    quantity: 30,
    priceperunit: 2500,
    baseamount: 75000,
    manualdiscountamount: 5000,
    tax: 7000,
    extendedamount: 77000,
    lineitemnumber: 1,
    createdon: '2023-12-15T16:00:00Z',
    modifiedon: '2023-12-15T16:00:00Z',
  },
]
