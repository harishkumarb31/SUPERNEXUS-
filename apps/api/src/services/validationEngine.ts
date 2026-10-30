import { FindingSeverity, FindingStatus } from '@regulaflow/shared';
import { prisma } from './db';

export interface ValidationRuleResult {
  ruleCode: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  documentId?: string;
  evidenceExcerpt?: string;
  isDeficient: boolean;
}

export class ValidationEngine {
  /**
   * Run all deterministic compliance & document validation rules on an application
   */
  static async validateApplication(applicationId: string): Promise<any[]> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        documents: {
          include: {
            extractions: true,
          },
        },
        institution: true,
      },
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const findingsToCreate: ValidationRuleResult[] = [];
    const now = new Date();

    // Rule 1: Mandatory Document Checklist Verification
    const mandatoryDocTypes = [
      'LAND_TITLE_LEASE_DEED',
      'FIRE_SAFETY_NOC',
      'AICTE_UNDERTAKING_AFFIDAVIT',
    ];

    const uploadedDocTypes = application.documents.map((d) => d.documentType);
    for (const mandatoryType of mandatoryDocTypes) {
      if (!uploadedDocTypes.includes(mandatoryType)) {
        findingsToCreate.push({
          ruleCode: 'VAL_MANDATORY_DOCS_MISSING',
          title: `Mandatory Document Missing: ${mandatoryType.replace(/_/g, ' ')}`,
          description: `AICTE APH mandates submission of valid ${mandatoryType.replace(/_/g, ' ')} for processing ${application.category}.`,
          severity: FindingSeverity.CRITICAL,
          isDeficient: true,
        });
      }
    }

    // Rule 2 & 3 & 4: Inspect Uploaded Documents & OCR Extractions
    const checksums = new Map<string, string>();

    for (const doc of application.documents) {
      // Duplicate detection
      if (checksums.has(doc.checksumSha256)) {
        findingsToCreate.push({
          ruleCode: 'VAL_DUPLICATE_CHECKSUM',
          title: `Duplicate Document Detected: ${doc.originalName}`,
          description: `The file '${doc.originalName}' matches the SHA256 checksum of another document in this application. Re-uploading identical documents is not permitted.`,
          severity: FindingSeverity.HIGH,
          documentId: doc.id,
          evidenceExcerpt: `SHA256: ${doc.checksumSha256}`,
          isDeficient: true,
        });
      } else {
        checksums.set(doc.checksumSha256, doc.id);
      }

      // Fire Safety NOC Expiry Rule
      if (doc.documentType === 'FIRE_SAFETY_NOC') {
        const latestExtraction = doc.extractions[0];
        let expiryDate = doc.expiryDate;

        if (latestExtraction?.extractedFieldsJson) {
          try {
            const fields = JSON.parse(latestExtraction.extractedFieldsJson);
            if (fields.expiryDate) {
              expiryDate = new Date(fields.expiryDate);
            }
          } catch (e) {
            // ignore JSON parse
          }
        }

        if (expiryDate && expiryDate.getTime() < now.getTime()) {
          findingsToCreate.push({
            ruleCode: 'VAL_FIRE_NOC_EXPIRED',
            title: 'Fire Safety Certificate Expired',
            description: `The Fire Safety Certificate expired on ${expiryDate.toLocaleDateString('en-IN')}. AICTE APH Chapter 1 Clause 1.4 requires an active Fire NOC.`,
            severity: FindingSeverity.CRITICAL,
            documentId: doc.id,
            evidenceExcerpt: latestExtraction?.rawText?.substring(0, 200) || `Expired on ${expiryDate.toISOString()}`,
            isDeficient: true,
          });
        }
      }

      // Land Title Lease Tenure Rule
      if (doc.documentType === 'LAND_TITLE_LEASE_DEED') {
        const latestExtraction = doc.extractions[0];
        if (latestExtraction?.extractedFieldsJson) {
          try {
            const fields = JSON.parse(latestExtraction.extractedFieldsJson);
            if (fields.tenureYears && fields.tenureYears < 15) {
              findingsToCreate.push({
                ruleCode: 'VAL_LEASE_EXPIRY',
                title: 'Insufficient Lease Deed Tenure',
                description: `Extracted lease tenure is ${fields.tenureYears} years. AICTE norms mandate at least 30-year registered lease (or minimum 15 years unexpired) for technical institutions.`,
                severity: FindingSeverity.CRITICAL,
                documentId: doc.id,
                evidenceExcerpt: `Tenure: ${fields.tenureYears} years detected in registered indenture.`,
                isDeficient: true,
              });
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // Affidavit Notarization Rule
      if (doc.documentType === 'AICTE_UNDERTAKING_AFFIDAVIT') {
        const latestExtraction = doc.extractions[0];
        if (latestExtraction?.extractedFieldsJson) {
          try {
            const fields = JSON.parse(latestExtraction.extractedFieldsJson);
            if (fields.hasNotarization === false) {
              findingsToCreate.push({
                ruleCode: 'VAL_AFFIDAVIT_NOTARIZATION',
                title: 'Affidavit Missing Notary Seal / Stamp',
                description: 'The uploaded undertaking does not show a recognized advocate notary seal or stamp paper reference as required under Appendix 3.',
                severity: FindingSeverity.MEDIUM,
                documentId: doc.id,
                evidenceExcerpt: 'Missing verified notary acknowledgment.',
                isDeficient: true,
              });
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // Persist new findings into database without creating duplicates
    const createdFindings = [];
    for (const item of findingsToCreate) {
      const existing = await prisma.validationFinding.findFirst({
        where: {
          applicationId,
          ruleCode: item.ruleCode,
          status: { in: [FindingStatus.OPEN, FindingStatus.CONFIRMED] },
        },
      });

      if (!existing) {
        const finding = await prisma.validationFinding.create({
          data: {
            applicationId,
            documentId: item.documentId || null,
            ruleCode: item.ruleCode,
            title: item.title,
            description: item.description,
            severity: item.severity,
            status: FindingStatus.OPEN,
            evidenceExcerpt: item.evidenceExcerpt || null,
          },
        });
        createdFindings.push(finding);
      }
    }

    return createdFindings;
  }
}

