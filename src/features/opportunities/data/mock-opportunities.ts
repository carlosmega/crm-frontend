import type { Opportunity } from '@/core/contracts'
import { OpportunityStateCode, SalesStageCode, CustomerType } from '@/core/contracts'

/**
 * Mock Opportunities Data
 *
 * Includes opportunities in different sales stages with both Account (B2B) and Contact (B2C) customers
 */

export const mockOpportunities: Opportunity[] = [
  // Qualify Stage (25%)
  {
    opportunityid: 'opp-001',
    name: 'Acme Corp - CRM Implementation',
    description: 'Full CRM system implementation and training for 250 employees',
    statecode: OpportunityStateCode.Open,
    statuscode: 1, // In_Progress
    customerid: 'acc-001', // Acme Corporation
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Qualify,
    closeprobability: 25,
    estimatedvalue: 150000,
    estimatedclosedate: new Date('2024-06-30').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-03-01').toISOString(),
    modifiedon: new Date('2024-03-15').toISOString(),
  },
  {
    opportunityid: 'opp-002',
    name: 'TechVision - Cloud Migration',
    description: 'Migration of on-premise infrastructure to Azure cloud platform',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-002', // TechVision Systems
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Qualify,
    closeprobability: 25,
    estimatedvalue: 280000,
    estimatedclosedate: new Date('2024-07-15').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-03-05').toISOString(),
    modifiedon: new Date('2024-03-18').toISOString(),
  },
  // Develop Stage (50%)
  {
    opportunityid: 'opp-003',
    name: 'Global Finance - Security Audit',
    description: 'Comprehensive cybersecurity audit and compliance assessment',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-003', // Global Finance Partners
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 95000,
    estimatedclosedate: new Date('2024-05-30').toISOString(),
    ownerid: 'user-002',
    createdon: new Date('2024-02-10').toISOString(),
    modifiedon: new Date('2024-03-20').toISOString(),
  },
  {
    opportunityid: 'opp-004',
    name: 'HealthCare Plus - EHR Integration',
    description: 'Integration of Electronic Health Records system with existing infrastructure',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-004', // HealthCare Plus
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 180000,
    estimatedclosedate: new Date('2024-06-15').toISOString(),
    ownerid: 'user-002',
    createdon: new Date('2024-02-15').toISOString(),
    modifiedon: new Date('2024-03-22').toISOString(),
  },
  {
    opportunityid: 'opp-005',
    name: 'Manufacturing Pro - ERP Upgrade',
    description: 'Upgrade existing ERP system to latest version with custom modules',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-005', // Manufacturing Pro Inc
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 320000,
    estimatedclosedate: new Date('2024-08-01').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-02-20').toISOString(),
    modifiedon: new Date('2024-03-25').toISOString(),
  },
  // Propose Stage (75%)
  {
    opportunityid: 'opp-006',
    name: 'Retail Solutions - POS System',
    description: 'New point-of-sale system with inventory management for 50 locations',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-006', // Retail Solutions Group
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Propose,
    closeprobability: 75,
    estimatedvalue: 220000,
    estimatedclosedate: new Date('2024-05-15').toISOString(),
    ownerid: 'user-003',
    createdon: new Date('2024-01-15').toISOString(),
    modifiedon: new Date('2024-03-28').toISOString(),
  },
  {
    opportunityid: 'opp-007',
    name: 'Energy Dynamics - IoT Platform',
    description: 'IoT platform for real-time monitoring of energy infrastructure',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-007', // Energy Dynamics Corp
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Propose,
    closeprobability: 75,
    estimatedvalue: 450000,
    estimatedclosedate: new Date('2024-05-31').toISOString(),
    ownerid: 'user-002',
    createdon: new Date('2024-01-20').toISOString(),
    modifiedon: new Date('2024-03-29').toISOString(),
  },
  // Close Stage - Won
  {
    opportunityid: 'opp-008',
    name: 'Digital Marketing - Website Redesign',
    description: 'Complete website redesign with SEO optimization and analytics',
    statecode: OpportunityStateCode.Won,
    statuscode: 3, // Won
    customerid: 'acc-008', // Digital Marketing Hub
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Close,
    closeprobability: 100,
    estimatedvalue: 65000,
    estimatedclosedate: new Date('2024-04-15').toISOString(),
    actualvalue: 68000,
    actualclosedate: new Date('2024-03-30').toISOString(),
    closestatus: 'Contract signed - Project starting next month',
    ownerid: 'user-003',
    createdon: new Date('2024-01-10').toISOString(),
    modifiedon: new Date('2024-03-30').toISOString(),
  },
  {
    opportunityid: 'opp-009',
    name: 'Acme Corp - Training Program',
    description: 'Employee training program for new software implementation',
    statecode: OpportunityStateCode.Won,
    statuscode: 3,
    customerid: 'acc-001', // Acme Corporation
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Close,
    closeprobability: 100,
    estimatedvalue: 35000,
    estimatedclosedate: new Date('2024-03-31').toISOString(),
    actualvalue: 35000,
    actualclosedate: new Date('2024-03-28').toISOString(),
    closestatus: 'Completed successfully - Excellent feedback from client',
    ownerid: 'user-001',
    createdon: new Date('2024-02-01').toISOString(),
    modifiedon: new Date('2024-03-28').toISOString(),
  },
  // Close Stage - Lost
  {
    opportunityid: 'opp-010',
    name: 'HealthCare Plus - Mobile App',
    description: 'Patient portal mobile application for iOS and Android',
    statecode: OpportunityStateCode.Lost,
    statuscode: 4, // Lost
    customerid: 'acc-004', // HealthCare Plus
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Close,
    closeprobability: 0,
    estimatedvalue: 120000,
    estimatedclosedate: new Date('2024-04-30').toISOString(),
    actualclosedate: new Date('2024-03-25').toISOString(),
    closestatus: 'Lost to competitor - Budget constraints cited by client',
    ownerid: 'user-002',
    createdon: new Date('2024-01-05').toISOString(),
    modifiedon: new Date('2024-03-25').toISOString(),
  },
  // B2C Opportunities (Contact customers)
  {
    opportunityid: 'opp-011',
    name: 'Mark Wilson - Consulting Services',
    description: 'Personal consulting package for business strategy',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'con-011', // Mark Wilson (B2C)
    customeridtype: CustomerType.Contact,
    salesstage: SalesStageCode.Qualify,
    closeprobability: 25,
    estimatedvalue: 15000,
    estimatedclosedate: new Date('2024-05-15').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-03-10').toISOString(),
    modifiedon: new Date('2024-03-20').toISOString(),
  },
  {
    opportunityid: 'opp-012',
    name: 'Rachel Green - E-commerce Setup',
    description: 'E-commerce website setup and digital marketing for small business',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'con-012', // Rachel Green (B2C)
    customeridtype: CustomerType.Contact,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 12000,
    estimatedclosedate: new Date('2024-06-01').toISOString(),
    ownerid: 'user-002',
    createdon: new Date('2024-03-12').toISOString(),
    modifiedon: new Date('2024-03-26').toISOString(),
  },
  // On Hold
  {
    opportunityid: 'opp-013',
    name: 'TechVision - Data Analytics Platform',
    description: 'Custom data analytics platform with AI/ML capabilities',
    statecode: OpportunityStateCode.Open,
    statuscode: 2, // On_Hold
    customerid: 'acc-002', // TechVision Systems
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 380000,
    estimatedclosedate: new Date('2024-09-30').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-02-05').toISOString(),
    modifiedon: new Date('2024-03-15').toISOString(),
  },
  // More opportunities in different stages
  {
    opportunityid: 'opp-014',
    name: 'Global Finance - Mobile Banking App',
    description: 'Next-generation mobile banking application with biometric authentication',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-003', // Global Finance Partners
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Propose,
    closeprobability: 75,
    estimatedvalue: 550000,
    estimatedclosedate: new Date('2024-06-30').toISOString(),
    ownerid: 'user-002',
    createdon: new Date('2024-01-25').toISOString(),
    modifiedon: new Date('2024-04-01').toISOString(),
  },
  {
    opportunityid: 'opp-015',
    name: 'Manufacturing Pro - Warehouse Automation',
    description: 'Automated warehouse management system with robotics integration',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-005', // Manufacturing Pro Inc
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Qualify,
    closeprobability: 25,
    estimatedvalue: 420000,
    estimatedclosedate: new Date('2024-08-15').toISOString(),
    ownerid: 'user-001',
    createdon: new Date('2024-03-20').toISOString(),
    modifiedon: new Date('2024-03-30').toISOString(),
  },
  // Opportunity created from qualified lead (John Smith)
  {
    opportunityid: 'opp-016',
    name: 'John Smith - Enterprise Software Solution',
    description: 'Software implementation for Tech Innovators Inc - Qualified from lead',
    statecode: OpportunityStateCode.Open,
    statuscode: 1,
    customerid: 'acc-101', // Tech Innovators Inc (created when lead was qualified)
    customeridtype: CustomerType.Account,
    salesstage: SalesStageCode.Develop,
    closeprobability: 50,
    estimatedvalue: 75000,
    estimatedclosedate: new Date('2024-07-15').toISOString(),
    originatingleadid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // John Smith lead
    ownerid: 'user-001',
    createdon: new Date('2024-03-15').toISOString(),
    modifiedon: new Date('2024-03-31').toISOString(),
  },
]
