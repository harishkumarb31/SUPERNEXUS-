import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const bcrypt = (bcryptjs as any).default || bcryptjs;
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting RegulaFlow AI Database Seeding ---');

  // Clear existing records in proper dependency order
  await prisma.documentAccessLog.deleteMany({});
  await prisma.documentRequestAssignment.deleteMany({});
  await prisma.documentRequest.deleteMany({});
  await prisma.documentVersion.deleteMany({});
  await prisma.documentVerification.deleteMany({});
  await prisma.userTask.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.escalationEvent.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.applicationStageHistory.deleteMany({});
  await prisma.eVCActivity.deleteMany({});
  await prisma.complianceObligation.deleteMany({});
  await prisma.validationFinding.deleteMany({});
  await prisma.documentExtraction.deleteMany({});
  await prisma.applicationDocument.deleteMany({});
  await prisma.documentCategory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.regulatoryReference.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.institution.deleteMany({});

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create Institutions
  const apexInst = await prisma.institution.create({
    data: {
      code: '1-109283921',
      name: 'Apex Institute of Technology & Engineering',
      type: 'ENGINEERING_TECH',
      region: 'NORTHERN',
      state: 'Delhi',
      city: 'New Delhi',
      address: 'Plot 4A, Institutional Area, Sector 62',
      pincode: '110001',
      contactEmail: 'registrar@apextech.edu.in',
      contactPhone: '+91 11 2890 4501',
      establishedYear: 2004,
    },
  });

  const bharatInst = await prisma.institution.create({
    data: {
      code: '1-208394812',
      name: 'Bharat Institute of Management & Research',
      type: 'MANAGEMENT',
      region: 'WESTERN',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'Bandra-Kurla Complex, Tech Park Avenue',
      pincode: '400051',
      contactEmail: 'director@bharatmgmt.ac.in',
      contactPhone: '+91 22 4782 9100',
      establishedYear: 2011,
    },
  });

  const deccanInst = await prisma.institution.create({
    data: {
      code: '1-309482711',
      name: 'Deccan College of Pharmacy & Health Sciences',
      type: 'PHARMACY',
      region: 'SOUTHERN',
      state: 'Telangana',
      city: 'Hyderabad',
      address: 'Cyberabad Knowledge City, Block C',
      pincode: '500081',
      contactEmail: 'principal@deccanpharmacy.edu.in',
      contactPhone: '+91 40 6821 3400',
      establishedYear: 2015,
    },
  });

  const heritageInst = await prisma.institution.create({
    data: {
      code: '1-409182736',
      name: 'Heritage Polytechnic Institute',
      type: 'POLYTECHNIC',
      region: 'EASTERN',
      state: 'West Bengal',
      city: 'Kolkata',
      address: 'Salt Lake Sector V, Electronics Complex',
      pincode: '700091',
      contactEmail: 'admin@heritagepoly.ac.in',
      contactPhone: '+91 33 2357 8800',
      establishedYear: 2008,
    },
  });

  console.log('✓ Created 4 Institutions');

  // 1b. Create Enterprise Departments
  const deptScrutiny = await prisma.department.create({
    data: {
      name: 'Approval & Regulatory Scrutiny',
      code: 'DEPT_SCRUTINY',
      description: 'Document evidence analysis, intake calculation, land deeds verification',
    },
  });

  const deptLegal = await prisma.department.create({
    data: {
      name: 'Legal, Land & Compliance Oversight',
      code: 'DEPT_LEGAL',
      description: 'Lease covenants, land title deeds, court disputes, and statutory NOC tracking',
    },
  });

  const deptEvc = await prisma.department.create({
    data: {
      name: 'Expert Visiting & Inspection Committees',
      code: 'DEPT_EVC',
      description: 'Physical & virtual campus verification, infrastructure scoring, lab audits',
    },
  });

  const deptQuality = await prisma.department.create({
    data: {
      name: 'Accreditation & Standards Evaluation',
      code: 'DEPT_QUALITY',
      description: 'Faculty-student ratios, NBA accreditation, trainee learning & quality assurance',
    },
  });

  console.log('✓ Created 4 Enterprise Departments');

  // 1c. Create Standard Document Categories
  const catAicte = await prisma.documentCategory.create({
    data: {
      name: 'AICTE Approval Documents',
      code: 'CAT_AICTE_APPROVAL',
      description: 'Formal letters of approval, extension orders, and AICTE council gazette notifications',
      isDefault: true,
    },
  });

  const catInst = await prisma.documentCategory.create({
    data: {
      name: 'Institution Records',
      code: 'CAT_INSTITUTION_RECORDS',
      description: 'Society / Trust registration deeds, MoA, bylaws, and governing body resolutions',
      isDefault: true,
    },
  });

  const catAccreditation = await prisma.documentCategory.create({
    data: {
      name: 'Accreditation Documents',
      code: 'CAT_ACCREDITATION',
      description: 'NBA, NAAC, NIRF certificates, self-assessment reports, and compliance scoresheets',
      isDefault: true,
    },
  });

  const catFaculty = await prisma.documentCategory.create({
    data: {
      name: 'Faculty Details',
      code: 'CAT_FACULTY_DETAILS',
      description: 'Faculty rosters, cadre ratios, appointment letters, payscales, and biometric rolls',
      isDefault: true,
    },
  });

  const catInfra = await prisma.documentCategory.create({
    data: {
      name: 'Infrastructure Documents',
      code: 'CAT_INFRASTRUCTURE',
      description: 'Architect certificates, municipal building sanctions, occupancy certificates, and floor plans',
      isDefault: true,
    },
  });

  const catFinancial = await prisma.documentCategory.create({
    data: {
      name: 'Financial Documents',
      code: 'CAT_FINANCIAL',
      description: 'Audited balance sheets, profit & loss statements, FDR receipts, and endowment fund records',
      isDefault: true,
    },
  });

  const catLease = await prisma.documentCategory.create({
    data: {
      name: 'Lease Documents',
      code: 'CAT_LEASE_DOCUMENTS',
      description: 'Registered land title deeds, long-term lease covenants, and sub-registrar certified copies',
      isDefault: true,
    },
  });

  const catCompliance = await prisma.documentCategory.create({
    data: {
      name: 'Compliance Evidence',
      code: 'CAT_COMPLIANCE_EVIDENCE',
      description: 'Fire Safety NOC, pollution clearance certificates, barrier-free access affidavits',
      isDefault: true,
    },
  });

  const catEvc = await prisma.documentCategory.create({
    data: {
      name: 'EVC Reports',
      code: 'CAT_EVC_REPORTS',
      description: 'Expert Visiting Committee on-site inspection reports, geo-tagged photos, and scoring sheets',
      isDefault: true,
    },
  });

  const catGeneral = await prisma.documentCategory.create({
    data: {
      name: 'General Supporting Documents',
      code: 'CAT_GENERAL_SUPPORTING',
      description: 'Statutory undertakings, legal affidavits, and miscellaneous regulatory submissions',
      isDefault: true,
    },
  });

  console.log('✓ Created 10 Enterprise Document Categories');

  // 2. Create Users across all roles
  // --- Enterprise Roles ---
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@supernexus.ai',
      passwordHash,
      fullName: 'Aarav Singhania (Super Admin)',
      role: 'SUPER_ADMIN',
      designation: 'Chief Regulatory Systems Architect',
      phone: '+91 98000 11111',
      region: 'NORTHERN',
      departmentId: deptScrutiny.id,
    },
  });

  const enterpriseAdmin = await prisma.user.create({
    data: {
      email: 'admin@supernexus.ai',
      passwordHash,
      fullName: 'Meera Nambiar (Admin)',
      role: 'ADMIN',
      designation: 'Director of Operational Compliance',
      phone: '+91 98000 22222',
      region: 'NORTHERN',
      departmentId: deptScrutiny.id,
    },
  });

  const deptOfficer = await prisma.user.create({
    data: {
      email: 'officer.dept@supernexus.ai',
      passwordHash,
      fullName: 'Rajeshwer Sen (HR / Dept Officer)',
      role: 'DEPARTMENT_OFFICER',
      designation: 'Lead Scrutiny Officer (Engineering)',
      phone: '+91 98000 33333',
      region: 'NORTHERN',
      departmentId: deptScrutiny.id,
    },
  });

  const evaluatorUser = await prisma.user.create({
    data: {
      email: 'evaluator@supernexus.ai',
      passwordHash,
      fullName: 'Dr. Priya Sundaram (Evaluator)',
      role: 'EVALUATOR',
      designation: 'Senior Technical Evaluator',
      phone: '+91 98000 44444',
      region: 'NORTHERN',
      departmentId: deptEvc.id,
    },
  });

  const fresherUser = await prisma.user.create({
    data: {
      email: 'fresher@supernexus.ai',
      passwordHash,
      fullName: 'Aditya Varma (Fresher)',
      role: 'FRESHER',
      designation: 'Junior Verification Associate',
      phone: '+91 98000 55555',
      region: 'NORTHERN',
      departmentId: deptQuality.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@supernexus.ai',
      passwordHash,
      fullName: 'Kavita Joshi (Viewer)',
      role: 'VIEWER',
      designation: 'Statutory Observer & Auditor',
      phone: '+91 98000 66666',
      region: 'NORTHERN',
    },
  });

  // --- AICTE Domain Legacy Roles (for backward compatibility & existing tests) ---
  const instUser = await prisma.user.create({
    data: {
      email: 'institution@regulaflow.aicte.gov.in',
      passwordHash,
      fullName: 'Dr. Ramesh Sharma (Principal)',
      role: 'INSTITUTION_USER',
      designation: 'Institution Head / Principal',
      phone: '+91 98101 23456',
      region: 'NORTHERN',
      institutionId: apexInst.id,
    },
  });

  const regionalOfficer = await prisma.user.create({
    data: {
      email: 'officer.north@regulaflow.aicte.gov.in',
      passwordHash,
      fullName: 'Shri Vikram Malhotra (Regional Officer)',
      role: 'REGIONAL_OFFICER',
      designation: 'Regional Director (North)',
      phone: '+91 98202 34567',
      region: 'NORTHERN',
      departmentId: deptScrutiny.id,
    },
  });

  const bureauOfficer = await prisma.user.create({
    data: {
      email: 'bureau.chief@regulaflow.aicte.gov.in',
      passwordHash,
      fullName: 'Dr. Ananya Sen (Bureau Chief - Approval)',
      role: 'BUREAU_OFFICER',
      designation: 'Bureau Chief (Approval Bureau)',
      phone: '+91 98303 45678',
      region: 'NORTHERN',
      departmentId: deptScrutiny.id,
    },
  });

  const committeeMember = await prisma.user.create({
    data: {
      email: 'committee.expert@regulaflow.aicte.gov.in',
      passwordHash,
      fullName: 'Prof. K. Venkatesh (EVC Chairman)',
      role: 'COMMITTEE_MEMBER',
      designation: 'EVC Committee Chairman',
      phone: '+91 98404 56789',
      region: 'NORTHERN',
      departmentId: deptEvc.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@regulaflow.aicte.gov.in',
      passwordHash,
      fullName: 'System Administrator (AICTE HQ)',
      role: 'SYSTEM_ADMIN',
      designation: 'Lead Infrastructure Administrator',
      phone: '+91 98505 67890',
      departmentId: deptScrutiny.id,
    },
  });

  console.log('✓ Created 11 Enterprise & Domain Demo Users across all roles');

  // 3. Create Applications across different stages
  // App 1: Extension of Approval - UNDER_SCRUTINY
  const app1 = await prisma.application.create({
    data: {
      applicationNumber: 'AICTE/2026-27/APP-00101',
      academicYear: '2026-2027',
      category: 'EXTENSION_OF_APPROVAL',
      currentStage: 'UNDER_SCRUTINY',
      priority: 'NORMAL',
      institutionId: apexInst.id,
      assignedOfficerId: regionalOfficer.id,
      submissionDate: new Date('2026-10-10T10:00:00Z'),
      deadlineDate: new Date('2026-11-15T18:00:00Z'),
      programmesData: JSON.stringify([
        { name: 'Computer Science & Engineering', intake: 120, approvedIntake: 120, shift: 'First' },
        { name: 'Electronics & Communication', intake: 60, approvedIntake: 60, shift: 'First' },
        { name: 'Mechanical Engineering', intake: 60, approvedIntake: 60, shift: 'First' }
      ]),
      infrastructureData: JSON.stringify({
        landAreaAcres: 5.5,
        totalBuiltUpAreaSqM: 14250,
        instructionalAreaSqM: 8200,
        administrativeAreaSqM: 2100,
        amenitiesAreaSqM: 1850,
        circulationAreaSqM: 2100
      }),
      facultyData: JSON.stringify({
        principalAppointed: true,
        professors: 4,
        associateProfessors: 8,
        assistantProfessors: 24,
        studentFacultyRatio: '1:18.5'
      }),
      financialData: JSON.stringify({
        endowmentFundStatus: 'Active FDR with AICTE',
        auditedAccountsSubmitted: true,
        lastFinancialYear: '2025-2026'
      }),
      scrutinyRemarks: 'Initial document scrutiny in progress. Land records verified.',
    },
  });

  // App 2: Increase in Intake - DEFICIENCY_RAISED
  const app2 = await prisma.application.create({
    data: {
      applicationNumber: 'AICTE/2026-27/APP-00102',
      academicYear: '2026-2027',
      category: 'INCREASE_IN_INTAKE',
      currentStage: 'DEFICIENCY_RAISED',
      priority: 'HIGH',
      institutionId: apexInst.id,
      assignedOfficerId: regionalOfficer.id,
      submissionDate: new Date('2026-10-05T14:30:00Z'),
      deadlineDate: new Date('2026-11-05T18:00:00Z'),
      programmesData: JSON.stringify([
        { name: 'Computer Science (AI & ML)', currentIntake: 60, proposedIntake: 120, shift: 'First' }
      ]),
      infrastructureData: JSON.stringify({
        landAreaAcres: 5.5,
        additionalComputerLabsRequired: 2,
        additionalLabsConstructed: 1
      }),
      scrutinyRemarks: 'Deficiency noted: Fire Safety NOC expired on 15-Sep-2026. Renewal certificate required under APH Chapter 1 Clause 1.4.',
    },
  });

  // App 3: New Programme - AWAITING_EVC
  const app3 = await prisma.application.create({
    data: {
      applicationNumber: 'AICTE/2026-27/APP-00103',
      academicYear: '2026-2027',
      category: 'NEW_PROGRAMME_DIVISION',
      currentStage: 'AWAITING_EVC',
      priority: 'HIGH',
      institutionId: bharatInst.id,
      submissionDate: new Date('2026-09-20T11:00:00Z'),
      deadlineDate: new Date('2026-11-10T18:00:00Z'),
      programmesData: JSON.stringify([
        { name: 'Master of Business Administration (Data Analytics)', intake: 60, shift: 'First' }
      ]),
      scrutinyRemarks: 'Desk scrutiny cleared. Expert Visiting Committee (EVC) physical verification scheduled.',
    },
  });

  // App 4: Extension of Approval - APPROVED
  const app4 = await prisma.application.create({
    data: {
      applicationNumber: 'AICTE/2026-27/APP-00104',
      academicYear: '2026-2027',
      category: 'EXTENSION_OF_APPROVAL',
      currentStage: 'APPROVED',
      priority: 'NORMAL',
      institutionId: deccanInst.id,
      submissionDate: new Date('2026-08-15T09:00:00Z'),
      deadlineDate: new Date('2026-09-30T18:00:00Z'),
      scrutinyRemarks: 'All statutory norms fulfilled. Approved by Executive Committee for academic year 2026-27.',
    },
  });

  // App 5: New Institution - DRAFT
  const app5 = await prisma.application.create({
    data: {
      applicationNumber: 'AICTE/2026-27/APP-00105',
      academicYear: '2026-2027',
      category: 'NEW_INSTITUTION',
      currentStage: 'DRAFT',
      priority: 'NORMAL',
      institutionId: heritageInst.id,
      programmesData: JSON.stringify([
        { name: 'Diploma in Civil Engineering', intake: 60 },
        { name: 'Diploma in Electrical Engineering', intake: 60 }
      ]),
    },
  });

  console.log('✓ Created 5 Applications across DRAFT, UNDER_SCRUTINY, DEFICIENCY_RAISED, AWAITING_EVC, APPROVED');

  // 4. Create Documents for App 1 & App 2 with Enterprise Metadata
  const doc1 = await prisma.applicationDocument.create({
    data: {
      applicationId: app1.id,
      institutionId: apexInst.id,
      departmentId: deptLegal.id,
      categoryId: catLease.id,
      uploaderId: instUser.id,
      documentType: 'LAND_TITLE_LEASE_DEED',
      title: 'Apex Institute 30-Year Registered Land Lease Deed',
      description: 'Certified perpetual indenture of lease executed with Delhi Development Authority for Plot 4A Sector 62.',
      fileName: 'apex_30yr_registered_lease_deed.pdf',
      originalName: 'Registered_Lease_Deed_SubRegistrar_Delhi.pdf',
      mimeType: 'application/pdf',
      fileSize: 4289100,
      filePath: 'uploads/docs/apex_lease_deed.pdf',
      checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      version: 1,
      expiryDate: new Date('2044-06-30T00:00:00Z'),
      status: 'VERIFIED',
      verifiedBy: regionalOfficer.fullName,
      verifiedAt: new Date('2026-10-12T11:20:00Z'),
    },
  });

  await prisma.documentVerification.create({
    data: {
      documentId: doc1.id,
      verifierId: deptOfficer.id,
      status: 'VERIFIED',
      comments: 'DDA registration confirmed with sub-registrar ledger seal. 5.50 acres verified.',
      createdAt: new Date('2026-10-12T11:20:00Z'),
    },
  });

  const doc2 = await prisma.applicationDocument.create({
    data: {
      applicationId: app1.id,
      institutionId: apexInst.id,
      departmentId: deptScrutiny.id,
      categoryId: catInfra.id,
      uploaderId: instUser.id,
      documentType: 'BUILDING_PLAN_SANCTION',
      title: 'DDA Approved Master Sanctioned Building Plan',
      description: 'Architectural blueprint and carpet area breakdown for Academic & Admin Blocks.',
      fileName: 'apex_sanctioned_building_plan.pdf',
      originalName: 'DDA_Approved_Building_Plan_Sanction.pdf',
      mimeType: 'application/pdf',
      fileSize: 8492000,
      filePath: 'uploads/docs/apex_building_plan.pdf',
      checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      version: 1,
      status: 'UNDER_REVIEW',
    },
  });

  const doc3 = await prisma.applicationDocument.create({
    data: {
      applicationId: app2.id,
      institutionId: bharatInst.id,
      departmentId: deptLegal.id,
      categoryId: catCompliance.id,
      uploaderId: instUser.id,
      documentType: 'FIRE_SAFETY_NOC',
      title: 'Delhi Fire Safety Clearance Certificate',
      description: 'Annual statutory fire safety clearance certificate (requires immediate renewal).',
      fileName: 'apex_fire_safety_noc_2025.pdf',
      originalName: 'Delhi_Fire_Service_Certificate_NOC.pdf',
      mimeType: 'application/pdf',
      fileSize: 1845000,
      filePath: 'uploads/docs/apex_fire_noc.pdf',
      checksumSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      version: 1,
      expiryDate: new Date('2026-09-15T00:00:00Z'), // Expired!
      status: 'REJECTED',
      rejectionReason: 'Certificate expired on 15-Sept-2026. Please obtain renewal inspection certificate.',
    },
  });

  await prisma.documentVerification.create({
    data: {
      documentId: doc3.id,
      verifierId: enterpriseAdmin.id,
      status: 'REJECTED',
      rejectionReason: 'Expired Fire NOC. Mandatory statutory compliance violation.',
      comments: 'Flagged during automated compliance review and confirmed by admin.',
      createdAt: new Date('2026-10-14T09:30:00Z'),
    },
  });

  const doc4 = await prisma.applicationDocument.create({
    data: {
      applicationId: app1.id,
      institutionId: apexInst.id,
      departmentId: deptScrutiny.id,
      categoryId: catGeneral.id,
      uploaderId: instUser.id,
      documentType: 'AICTE_UNDERTAKING_AFFIDAVIT',
      title: 'AICTE Statutory Undertaking & Appendix 3 Affidavit',
      description: 'Duly notarized affidavit confirming non-capitation fee policy and anti-ragging measures.',
      fileName: 'apex_aicte_affidavit_undertaking.pdf',
      originalName: 'Affidavit_Undertaking_APH_Appendix_3.pdf',
      mimeType: 'application/pdf',
      fileSize: 1205000,
      filePath: 'uploads/docs/apex_affidavit.pdf',
      checksumSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      version: 1,
      status: 'VERIFIED',
      verifiedBy: deptOfficer.fullName,
      verifiedAt: new Date('2026-10-15T14:10:00Z'),
    },
  });

  // Additional Seeded Documents across Categories
  const doc5 = await prisma.applicationDocument.create({
    data: {
      applicationId: app1.id,
      institutionId: apexInst.id,
      departmentId: deptQuality.id,
      categoryId: catAccreditation.id,
      uploaderId: enterpriseAdmin.id,
      documentType: 'BAR_COUNCIL_PCI_COA_APPROVAL',
      title: 'NBA Tier-1 Accreditation Compliance Report',
      description: 'National Board of Accreditation 3-Year Outcome Assessment for Computer Engineering.',
      fileName: 'apex_nba_accreditation_2025.pdf',
      originalName: 'NBA_Tier1_Accreditation_Certificate_Apex.pdf',
      mimeType: 'application/pdf',
      fileSize: 3120000,
      filePath: 'uploads/docs/apex_nba_certificate.pdf',
      checksumSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      version: 1,
      status: 'VERIFIED',
      verifiedBy: superAdmin.fullName,
      verifiedAt: new Date('2026-10-16T16:00:00Z'),
    },
  });

  const doc6 = await prisma.applicationDocument.create({
    data: {
      applicationId: app1.id,
      institutionId: apexInst.id,
      departmentId: deptScrutiny.id,
      categoryId: catFinancial.id,
      uploaderId: deptOfficer.id,
      documentType: 'AUDITED_BALANCE_SHEET',
      title: 'Audited Financial Statements & Balance Sheet FY 2024-25',
      description: 'Statutory auditor chartered accountant report, income expenditure sheet, and FDR proofs.',
      fileName: 'apex_audited_balance_sheet_2025.pdf',
      originalName: 'Chartered_Accountant_Audited_Balance_Sheet.pdf',
      mimeType: 'application/pdf',
      fileSize: 5210000,
      filePath: 'uploads/docs/apex_audited_financials.pdf',
      checksumSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      version: 1,
      status: 'VERIFIED',
      verifiedBy: enterpriseAdmin.fullName,
      verifiedAt: new Date('2026-10-17T11:45:00Z'),
    },
  });

  console.log('✓ Created 6 Enterprise Application Documents with Verification Trails');

  // 5. Create OCR Extractions
  await prisma.documentExtraction.create({
    data: {
      documentId: doc1.id,
      rawText: 'REGISTERED INDENTURE OF LEASE DEED. This lease agreement executed on 1st July 2014 by Delhi Development Authority (Lessor) in favor of Apex Educational Trust (Lessee) for Plot 4A, Institutional Area, Sector 62, New Delhi, measuring 5.50 Acres (22,257 sq meters) for 30 years ending 30th June 2044.',
      extractedFieldsJson: JSON.stringify({
        lessor: 'Delhi Development Authority',
        lessee: 'Apex Educational Trust',
        plotNumber: 'Plot 4A, Sector 62',
        landAreaAcres: 5.50,
        leaseTenureYears: 30,
        commencementDate: '2014-07-01',
        expiryDate: '2044-06-30',
        registeredNumber: 'REG/ND/2014/90821'
      }),
      confidenceScore: 0.96,
      ocrEngine: 'TESSERACT_OCR',
    },
  });

  await prisma.documentExtraction.create({
    data: {
      documentId: doc3.id,
      rawText: 'GOVERNMENT OF NCT OF DELHI - HEADQUARTERS: DELHI FIRE SERVICE, NEW DELHI. Fire Safety Certificate issued under Rule 35 of the Delhi Fire Service Rules 2010. This certificate is valid for a period of three years from 16-09-2023 to 15-09-2026 unless cancelled earlier.',
      extractedFieldsJson: JSON.stringify({
        issuingAuthority: 'Delhi Fire Service Headquarters',
        certificateNumber: 'DFS/MS/2023/SZ/1942',
        issueDate: '2023-09-16',
        expiryDate: '2026-09-15',
        validityStatus: 'EXPIRED'
      }),
      confidenceScore: 0.94,
      ocrEngine: 'TESSERACT_OCR',
    },
  });

  console.log('✓ Created OCR extractions with structured field bindings');

  // 6. Create Validation Findings (Evidence-linked deficiencies)
  await prisma.validationFinding.create({
    data: {
      applicationId: app2.id,
      documentId: doc3.id,
      ruleCode: 'VAL_FIRE_NOC_EXPIRED',
      title: 'Fire Safety NOC Validity Expired',
      description: 'The uploaded Fire Safety Certificate expired on 15-Sep-2026. AICTE APH Chapter 1 Clause 1.4 mandates an active, unexpired Fire Safety NOC at the time of scrutiny.',
      severity: 'CRITICAL',
      status: 'CONFIRMED',
      evidenceExcerpt: '"This certificate is valid for a period of three years from 16-09-2023 to 15-09-2026" (Extracted from Delhi Fire Service NOC, Page 1).',
      detectedAt: new Date('2026-10-06T15:00:00Z'),
    },
  });

  await prisma.validationFinding.create({
    data: {
      applicationId: app1.id,
      documentId: doc2.id,
      ruleCode: 'VAL_CARPET_AREA_DEFICIT',
      title: 'Computer Lab Carpet Area Deficit for Additional Batch',
      description: 'Total instructional computer laboratory carpet area is 320 sq.m against the mandated 400 sq.m for requested additional intake under AICTE Norms Appendix 4.',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      evidenceExcerpt: 'Total lab area recorded in Building Plan Sanction: 320 sq. meters across Rooms 201 & 202.',
      detectedAt: new Date('2026-10-11T12:00:00Z'),
    },
  });

  console.log('✓ Created 2 Evidence-Linked Validation Findings');

  // 7. Create Compliance Obligations (Deadlines, Leases, Undertakings)
  await prisma.complianceObligation.create({
    data: {
      institutionId: apexInst.id,
      applicationId: app1.id,
      obligationType: 'LEASE_VALIDITY',
      title: 'Institutional Land Lease Validity Monitoring',
      description: 'Mandatory 30-year registered lease deed with minimum unexpired period of 15 years under APH Chapter 1.',
      dueDate: new Date('2044-06-30T00:00:00Z'),
      warningDays: 365,
      status: 'ACTIVE',
      evidenceDocumentId: doc1.id,
    },
  });

  await prisma.complianceObligation.create({
    data: {
      institutionId: apexInst.id,
      applicationId: app2.id,
      obligationType: 'FIRE_SAFETY_RENEWAL',
      title: 'Annual Fire Safety NOC Renewal Submission',
      description: 'Submission of renewed Fire Safety NOC from State Fire Department.',
      dueDate: new Date('2026-10-25T00:00:00Z'), // Expired / overdue!
      warningDays: 30,
      status: 'OVERDUE',
      evidenceDocumentId: doc3.id,
    },
  });

  await prisma.complianceObligation.create({
    data: {
      institutionId: apexInst.id,
      applicationId: app1.id,
      obligationType: 'AFFIDAVIT_UNDERTAKING',
      title: 'Annual AICTE Non-Ragging & Faculty Service Undertaking',
      description: 'Submission of notarized affidavit on Rs. 100 stamp paper as per Appendix 3.',
      dueDate: new Date('2026-11-20T00:00:00Z'), // Due in ~22 days -> DUE_SOON
      warningDays: 30,
      status: 'DUE_SOON',
      evidenceDocumentId: doc4.id,
    },
  });

  await prisma.complianceObligation.create({
    data: {
      institutionId: bharatInst.id,
      applicationId: app3.id,
      obligationType: 'ENDOWMENT_FUND_DEPOSIT',
      title: 'Joint FDR Endowment Fund Compliance',
      description: 'Establishment of Rs. 35 Lakh FDR in joint name of Institution and Regional Officer AICTE.',
      dueDate: new Date('2026-12-15T00:00:00Z'),
      warningDays: 45,
      status: 'ACTIVE',
    },
  });

  console.log('✓ Created 4 Compliance Obligations (Active, Due Soon, Overdue)');

  // 8. Create EVC Activities
  await prisma.eVCActivity.create({
    data: {
      applicationId: app3.id,
      committeeType: 'EXPERT_VISITING_COMMITTEE',
      scheduledDate: new Date('2026-11-08T10:00:00Z'),
      venueOrMode: 'PHYSICAL_INSPECTION',
      status: 'SCHEDULED',
      chairmanName: 'Prof. K. Venkatesh (IIT Delhi, Dept. of Management Studies)',
      membersJson: JSON.stringify([
        { name: 'Prof. K. Venkatesh', role: 'Chairman', affiliation: 'IIT Delhi' },
        { name: 'Dr. Sunita Rao', role: 'Expert Member (Architecture)', affiliation: 'SPA New Delhi' },
        { name: 'Shri S. K. Gupta', role: 'AICTE Regional Representative', affiliation: 'AICTE Northern Office' }
      ]),
      checklistJson: JSON.stringify([
        { item: 'Verification of instructional laboratories with GIS geo-tagging', status: 'PENDING' },
        { item: 'Barrier-free environment for differently-abled (ramps, lifts, braille signage)', status: 'PENDING' },
        { item: 'Safety equipment, fire hydrants and emergency exits verification', status: 'PENDING' },
        { item: 'Library digital catalogue, national/international journals subscription', status: 'PENDING' },
        { item: 'Student-to-Faculty Ratio physical verification with Aadhaar OTP authentication', status: 'PENDING' }
      ]),
      observations: 'Committee formed. Pre-inspection document brief shared with chairman.',
    },
  });

  // App 1 Stage History
  await prisma.applicationStageHistory.createMany({
    data: [
      {
        applicationId: app1.id,
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        action: 'APPLICATION_SUBMIT',
        actorId: instUser.id,
        actorName: instUser.fullName,
        actorRole: instUser.role,
        reason: 'Application submitted with all mandatory proofs',
        timestamp: new Date('2026-10-10T10:00:00Z'),
      },
      {
        applicationId: app1.id,
        fromStage: 'SUBMITTED',
        toStage: 'UNDER_SCRUTINY',
        action: 'SCRUTINY_START',
        actorId: regionalOfficer.id,
        actorName: regionalOfficer.fullName,
        actorRole: regionalOfficer.role,
        reason: 'Assigned to Northern Regional Scrutiny Officer',
        timestamp: new Date('2026-10-11T09:30:00Z'),
      },
    ],
  });

  // App 2 Stage History
  await prisma.applicationStageHistory.createMany({
    data: [
      {
        applicationId: app2.id,
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        action: 'APPLICATION_SUBMIT',
        actorId: instUser.id,
        actorName: instUser.fullName,
        actorRole: instUser.role,
        timestamp: new Date('2026-10-05T14:30:00Z'),
      },
      {
        applicationId: app2.id,
        fromStage: 'SUBMITTED',
        toStage: 'UNDER_SCRUTINY',
        action: 'SCRUTINY_START',
        actorId: regionalOfficer.id,
        actorName: regionalOfficer.fullName,
        actorRole: regionalOfficer.role,
        timestamp: new Date('2026-10-06T11:00:00Z'),
      },
      {
        applicationId: app2.id,
        fromStage: 'UNDER_SCRUTINY',
        toStage: 'DEFICIENCY_RAISED',
        action: 'DEFICIENCY_FLAGGED',
        actorId: regionalOfficer.id,
        actorName: regionalOfficer.fullName,
        actorRole: regionalOfficer.role,
        reason: 'Fire Safety NOC expired. Correction notice issued.',
        timestamp: new Date('2026-10-06T15:15:00Z'),
      },
    ],
  });

  // 9. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: instUser.id,
        institutionId: apexInst.id,
        applicationId: app2.id,
        category: 'DEFICIENCY_ALERT',
        severity: 'CRITICAL',
        title: 'Deficiency Notice: Fire Safety NOC Expired',
        message: 'Your application AICTE/2026-27/APP-00102 has been flagged for an expired Fire Safety Certificate. Please upload a valid renewal within 15 calendar days.',
        link: '/applications/' + app2.id,
        read: false,
        createdAt: new Date('2026-10-06T15:20:00Z'),
      },
      {
        userId: regionalOfficer.id,
        institutionId: apexInst.id,
        applicationId: app1.id,
        category: 'APPLICATION_STATUS',
        severity: 'INFO',
        title: 'Application Assigned for Scrutiny',
        message: 'Application AICTE/2026-27/APP-00101 (Apex Institute of Technology) assigned to your regional queue.',
        link: '/applications/' + app1.id,
        read: true,
        createdAt: new Date('2026-10-11T09:30:00Z'),
      },
      {
        userId: instUser.id,
        institutionId: apexInst.id,
        category: 'COMPLIANCE_REMINDER',
        severity: 'WARNING',
        title: 'Upcoming Compliance Deadline: Affidavit Undertaking',
        message: 'Annual AICTE Non-Ragging & Faculty Service Undertaking is due on 20-Nov-2026.',
        link: '/compliance',
        read: false,
        createdAt: new Date('2026-10-25T08:00:00Z'),
      },
      {
        userId: bureauOfficer.id,
        category: 'ESCALATION',
        severity: 'CRITICAL',
        title: 'Overdue Compliance Escalation: Fire Safety NOC',
        message: 'Apex Institute of Technology has failed to resolve Fire Safety NOC within statutory window. Escalated to Bureau Officer.',
        link: '/compliance',
        read: false,
        createdAt: new Date('2026-10-26T09:00:00Z'),
      },
    ],
  });

  // 10. Escalation Event
  await prisma.escalationEvent.create({
    data: {
      applicationId: app2.id,
      triggerRule: 'ESC_OVERDUE_CRITICAL_DEFICIENCY',
      severity: 'CRITICAL',
      escalatedToRole: 'BUREAU_OFFICER',
      message: 'Critical deficiency regarding Fire Safety Certificate unresolved after 15 calendar days.',
      resolved: false,
    },
  });

  // 11. Regulatory Reference Documents (for AI RAG)
  await prisma.regulatoryReference.create({
    data: {
      code: 'APH_2026_LAND_NORMS',
      title: 'AICTE Approval Process Handbook — Chapter 1: Land and Built-Up Space Norms',
      chapter: 'Chapter 1',
      category: 'NORMS',
      summary: 'Specifies minimum land requirements (Mega/Metro: 1.5 - 2.5 Acres, Urban: 2.5 - 4.0 Acres, Rural: 7.5 Acres) and mandatory 30-year registered lease or clear ownership deed free from any encumbrances.',
      effectiveYear: '2026-2027',
      contentChunksJson: JSON.stringify([
        {
          section: 'Clause 1.3 - Land Requirements',
          text: 'The land required for Technical Institutions offering Degree / Diploma programmes shall be contiguous. In Mega / Metro cities, minimum land requirement is 1.5 Acres. In Urban category, it is 2.5 Acres. In Rural category, it is 7.5 Acres. The title must be in the name of the Trust / Society with a minimum registered lease of 30 years.',
          pageRef: 'Page 14, Section 1.3.1'
        },
        {
          section: 'Clause 1.4 - Essential Safety Documents',
          text: 'Every institution must possess an unexpired Fire Safety Certificate issued by the competent Fire Service Authority of the respective State / UT. Additionally, a structural stability certificate and municipal building plan approval are strictly required before granting Extension of Approval (EoA).',
          pageRef: 'Page 18, Section 1.4.2'
        },
        {
          section: 'Clause 1.7 - Carpet Area Norms',
          text: 'Instructional laboratories for Computer Engineering must provide at least 66 sq. meters carpet area per batch of 30 students, with an overall student-to-computer ratio of 1:1 in labs and 1:3 for general campus availability.',
          pageRef: 'Page 22, Section 1.7.4'
        }
      ]),
    },
  });

  await prisma.regulatoryReference.create({
    data: {
      code: 'APH_2026_FACULTY_NORMS',
      title: 'AICTE Approval Process Handbook — Chapter 2: Cadre Ratio and Student-Faculty Ratios',
      chapter: 'Chapter 2',
      category: 'NORMS',
      summary: 'Specifies mandatory student-to-faculty ratios (1:20 for Undergraduate Engineering, 1:15 for Postgraduate / MBA, 1:25 for Diploma) and Cadre Ratio (1 Professor : 2 Associate Professors : 6 Assistant Professors).',
      effectiveYear: '2026-2027',
      contentChunksJson: JSON.stringify([
        {
          section: 'Clause 2.1 - Student Faculty Ratio (SFR)',
          text: 'For Undergraduate Engineering and Technology programmes, the Student-Faculty Ratio shall be 1:20. For Master of Business Administration (MBA) and MCA programmes, the SFR shall be 1:15. For Diploma programmes, the SFR shall be 1:25.',
          pageRef: 'Page 35, Section 2.1.2'
        },
        {
          section: 'Clause 2.4 - Cadre Ratio',
          text: 'The faculty cadre structure shall be in the ratio of 1:2:6 for Professor : Associate Professor : Assistant Professor. In institutions running PG programmes, at least one regular Professor with Ph.D. is mandatory per department.',
          pageRef: 'Page 38, Section 2.4.1'
        }
      ]),
    },
  });

  await prisma.regulatoryReference.create({
    data: {
      code: 'APH_2026_EVC_PROCEDURES',
      title: 'AICTE Approval Process Handbook — Chapter 4: Expert Visiting Committee (EVC) Protocols',
      chapter: 'Chapter 4',
      category: 'PROCEDURES',
      summary: 'Outlines standard operating procedures for Expert Visiting Committee (EVC) inspections, video recording mandates, GIS verification, and biometric verification of faculty.',
      effectiveYear: '2026-2027',
      contentChunksJson: JSON.stringify([
        {
          section: 'Clause 4.2 - EVC Composition and Mode',
          text: 'The Expert Visiting Committee shall comprise three experts: one Senior Professor from IIT / NIT as Chairman, one subject domain expert, and one AICTE Regional representative. Inspection may be conducted via Physical Verification with continuous geotagged video streaming or Hybrid mode.',
          pageRef: 'Page 52, Section 4.2.1'
        },
        {
          section: 'Clause 4.5 - Verification Checklist and Report Submission',
          text: 'The EVC must submit their consolidated inspection report within 24 hours of completing the visit. Observations must be strictly factual and reference physical or documentary evidence. No EVC member may make verbal commitments regarding approval or rejection.',
          pageRef: 'Page 56, Section 4.5.3'
        }
      ]),
    },
  });

  console.log('✓ Created 3 Regulatory Reference Documents with RAG chunks');

  // 11b. Create Enterprise Tasks & Learning Assignments
  await prisma.userTask.createMany({
    data: [
      // Evaluator Tasks
      {
        title: 'Inspect Land Deed & Survey Boundaries',
        description: 'Cross-check OCR extracted survey numbers and carpet area against Chapter 4 norms.',
        type: 'VERIFICATION',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 60,
        dueDate: new Date(Date.now() + 86400000 * 3),
        assignedToId: evaluatorUser.id,
        assignedById: deptOfficer.id,
        applicationId: app1.id,
      },
      {
        title: 'Evaluate Cadre Ratio & Faculty Pay Slips',
        description: 'Verify 1:15 or 1:20 SFR ratios and professor-to-assistant-professor cadre distribution.',
        type: 'EVALUATION',
        status: 'PENDING',
        priority: 'NORMAL',
        progress: 0,
        dueDate: new Date(Date.now() + 86400000 * 5),
        assignedToId: evaluatorUser.id,
        assignedById: enterpriseAdmin.id,
        applicationId: app1.id,
      },
      {
        title: 'Audit Fire Safety NOC & Emergency Evacuation Plan',
        description: 'Verify validity period from State Fire Advisory Authority and emergency egress maps.',
        type: 'COMPLIANCE',
        status: 'COMPLETED',
        priority: 'URGENT',
        progress: 100,
        dueDate: new Date(Date.now() - 86400000 * 1),
        assignedToId: evaluatorUser.id,
        assignedById: deptOfficer.id,
        applicationId: app2.id,
      },
      // Fresher Tasks (Learning & Supervised Verification)
      {
        title: 'Orientation: Approval Process Handbook Norms (Ch. 1-3)',
        description: 'Study essential land requirements, administrative and instructional area mandates.',
        type: 'LEARNING',
        status: 'COMPLETED',
        priority: 'NORMAL',
        progress: 100,
        dueDate: new Date(Date.now() - 86400000 * 2),
        assignedToId: fresherUser.id,
        assignedById: enterpriseAdmin.id,
      },
      {
        title: 'Supervised Verification: Building Plan Sanction Checklist',
        description: 'Conduct guided check of architect-certified floor plan layouts under senior evaluator review.',
        type: 'VERIFICATION',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 45,
        dueDate: new Date(Date.now() + 86400000 * 2),
        assignedToId: fresherUser.id,
        assignedById: deptOfficer.id,
        applicationId: app1.id,
      },
      {
        title: 'Module: OCR Entity Extraction & Evidence Tagging',
        description: 'Practice identifying lease tenure clauses, notarized dates, and lessor metadata in Tesseract stream.',
        type: 'LEARNING',
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        progress: 70,
        dueDate: new Date(Date.now() + 86400000 * 4),
        assignedToId: fresherUser.id,
        assignedById: enterpriseAdmin.id,
      },
      {
        title: 'Self-Study: Anti-Ragging Undertaking Legal Standards',
        description: 'Review statutory Supreme Court directives on student anti-ragging affidavits.',
        type: 'LEARNING',
        status: 'PENDING',
        priority: 'LOW',
        progress: 0,
        dueDate: new Date(Date.now() + 86400000 * 7),
        assignedToId: fresherUser.id,
        assignedById: deptOfficer.id,
      },
      // Department Officer Tasks
      {
        title: 'Scrutinize EoA Application Batch North-2026',
        description: 'Comprehensive review of pending applications awaiting scrutiny sign-off.',
        type: 'SCRUTINY',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 75,
        dueDate: new Date(Date.now() + 86400000 * 2),
        assignedToId: deptOfficer.id,
        assignedById: enterpriseAdmin.id,
        applicationId: app1.id,
      },
      {
        title: 'Review Deficiency Rectifications - Bharat Institute',
        description: 'Check re-uploaded Fire Safety NOC after 30-day cure period warning.',
        type: 'SCRUTINY',
        status: 'PENDING',
        priority: 'URGENT',
        progress: 10,
        dueDate: new Date(Date.now() + 86400000 * 1),
        assignedToId: deptOfficer.id,
        assignedById: superAdmin.id,
        applicationId: app2.id,
      },
    ],
  });

  console.log('✓ Created 9 Enterprise Tasks across Evaluator, Fresher & Department Officer');

  // 11c. Create Enterprise Document Requests & Notifications (Employee Missing Document Workflow)
  const req1 = await prisma.documentRequest.create({
    data: {
      requestNumber: 'DOC-REQ-2026-0001',
      title: 'Audited Balance Sheet & Financial Statements FY 2025-26',
      categoryId: catFinancial.id,
      categoryName: 'Financial Documents',
      description: 'Chartered accountant verified balance sheet and revenue statement for Apex Institute.',
      reason: 'Required to verify endowment fund status and financial viability under Chapter 3 EoA scrutiny checklist.',
      priority: 'HIGH',
      requiredByDate: new Date(Date.now() + 86400000 * 3),
      status: 'SUBMITTED',
      requesterId: evaluatorUser.id,
      departmentId: deptScrutiny.id,
      applicationId: app1.id,
    },
  });

  const req2 = await prisma.documentRequest.create({
    data: {
      requestNumber: 'DOC-REQ-2026-0002',
      title: 'Municipal Master Sanctioned Building Plan Blueprint',
      categoryId: catInfra.id,
      categoryName: 'Infrastructure Documents',
      description: 'High-resolution blueprint with DDA architectural approval stamp and carpet area dimensions.',
      reason: 'Needed to compute carpet area against instructional requirements for junior evaluator training module.',
      priority: 'NORMAL',
      requiredByDate: new Date(Date.now() + 86400000 * 5),
      status: 'ASSIGNED',
      requesterId: fresherUser.id,
      assignedToId: deptOfficer.id,
      departmentId: deptScrutiny.id,
      applicationId: app1.id,
    },
  });

  await prisma.documentRequestAssignment.create({
    data: {
      requestId: req2.id,
      assignedById: enterpriseAdmin.id,
      assignedToId: deptOfficer.id,
      notes: 'Please verify if DDA approved master copy is filed in physical registry.',
    },
  });

  const req3 = await prisma.documentRequest.create({
    data: {
      requestNumber: 'DOC-REQ-2026-0003',
      title: 'Fire Safety Certificate Renewal Inspection Report',
      categoryId: catCompliance.id,
      categoryName: 'Compliance Evidence',
      description: 'State Fire Advisory Board official inspection challan or provisional renewal NOC.',
      reason: 'Existing Fire NOC expired on 15-Sept-2026. Cannot clear safety compliance without valid renewal certificate.',
      priority: 'URGENT',
      requiredByDate: new Date(Date.now() + 86400000 * 1),
      status: 'IN_PROGRESS',
      requesterId: evaluatorUser.id,
      assignedToId: enterpriseAdmin.id,
      departmentId: deptLegal.id,
      applicationId: app2.id,
    },
  });

  console.log('✓ Created 3 Enterprise Document Requests with Multi-Tier Assignments');

  // 11d. Create Document Request Notifications for Super Admin, Admin, HR & Requesters
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        category: 'DOCUMENT_REQUEST',
        severity: 'WARNING',
        title: 'New Document Request: DOC-REQ-2026-0001 (HIGH Priority)',
        message: 'Evaluator Rajesh Kulkarni requested "Audited Balance Sheet & Financial Statements FY 2025-26" for Apex Institute.',
        link: '/documents?tab=requests&id=' + req1.id,
        read: false,
        metadataJson: JSON.stringify({
          requestId: req1.id,
          requestNumber: req1.requestNumber,
          title: req1.title,
          requesterName: evaluatorUser.fullName,
          priority: req1.priority,
          department: deptScrutiny.name,
          requiredByDate: req1.requiredByDate,
        }),
      },
      {
        userId: enterpriseAdmin.id,
        category: 'DOCUMENT_REQUEST',
        severity: 'WARNING',
        title: 'Document Request Needs Assignment: DOC-REQ-2026-0001',
        message: 'Evaluator Rajesh Kulkarni requested "Audited Balance Sheet & Financial Statements FY 2025-26" for scrutiny.',
        link: '/documents?tab=requests&id=' + req1.id,
        read: false,
        metadataJson: JSON.stringify({
          requestId: req1.id,
          requestNumber: req1.requestNumber,
          title: req1.title,
          requesterName: evaluatorUser.fullName,
          priority: req1.priority,
        }),
      },
      {
        userId: deptOfficer.id,
        category: 'DOCUMENT_REQUEST',
        severity: 'WARNING',
        title: 'Department Document Request: DOC-REQ-2026-0001',
        message: 'Rajesh Kulkarni in Scrutiny department submitted a high-priority request for missing financial records.',
        link: '/documents?tab=requests&id=' + req1.id,
        read: false,
      },
      {
        userId: deptOfficer.id,
        category: 'DOCUMENT_REQUEST',
        severity: 'INFO',
        title: 'Assigned Document Request: DOC-REQ-2026-0002',
        message: 'Admin Meera Nambiar assigned you to fulfill "Municipal Master Sanctioned Building Plan Blueprint" for Amit Verma (Fresher).',
        link: '/documents?tab=requests&id=' + req2.id,
        read: false,
      },
      {
        userId: evaluatorUser.id,
        category: 'DOCUMENT_REQUEST',
        severity: 'INFO',
        title: 'Document Request Submitted: DOC-REQ-2026-0001',
        message: 'Your request for "Audited Balance Sheet & Financial Statements FY 2025-26" has been dispatched to HR and Administration.',
        link: '/documents?tab=my-requests',
        read: false,
      },
    ],
  });

  console.log('✓ Created Multi-Role Notifications for Document Requests');

  // 12. Create Baseline Audit Trail
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: instUser.id,
        actorEmail: instUser.email,
        actorRole: instUser.role,
        action: 'APPLICATION_SUBMIT',
        entityType: 'Application',
        entityId: app1.id,
        afterStateJson: JSON.stringify({ currentStage: 'SUBMITTED', appNumber: app1.applicationNumber }),
        reason: 'Institution submitted annual EoA application',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        timestamp: new Date('2026-10-10T10:00:00Z'),
      },
      {
        actorId: regionalOfficer.id,
        actorEmail: regionalOfficer.email,
        actorRole: regionalOfficer.role,
        action: 'STAGE_TRANSITION',
        entityType: 'Application',
        entityId: app1.id,
        beforeStateJson: JSON.stringify({ currentStage: 'SUBMITTED' }),
        afterStateJson: JSON.stringify({ currentStage: 'UNDER_SCRUTINY' }),
        reason: 'Regional officer initiated desk scrutiny',
        ipAddress: '10.0.12.44',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0',
        timestamp: new Date('2026-10-11T09:30:00Z'),
      },
      {
        actorId: regionalOfficer.id,
        actorEmail: regionalOfficer.email,
        actorRole: regionalOfficer.role,
        action: 'DEFICIENCY_FLAGGED',
        entityType: 'ValidationFinding',
        entityId: app2.id,
        afterStateJson: JSON.stringify({ ruleCode: 'VAL_FIRE_NOC_EXPIRED', severity: 'CRITICAL' }),
        reason: 'Officer confirmed expired fire NOC after automated OCR flag',
        ipAddress: '10.0.12.44',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0',
        timestamp: new Date('2026-10-06T15:15:00Z'),
      },
    ],
  });

  console.log('✓ Created Initial Audit Log Events');
  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
