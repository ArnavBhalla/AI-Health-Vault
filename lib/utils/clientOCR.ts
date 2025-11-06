/**
 * Client-side OCR utilities
 * Processes files in the browser before encryption
 */

import { RecordMetadata } from '@/lib/types';

export interface ExtractedMetadata {
  labName?: string;
  value?: number;
  unit?: string;
  range?: string;
  date?: string;
}

/**
 * Extract metadata from a file client-side
 * This maintains E2E encryption by processing before upload
 */
export async function extractMetadataFromFile(
  file: File
): Promise<ExtractedMetadata> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.pdf')) {
    return extractFromPDF(file);
  } else if (
    filename.endsWith('.jpg') ||
    filename.endsWith('.jpeg') ||
    filename.endsWith('.png')
  ) {
    return extractFromImage(file);
  }

  return {};
}

/**
 * Extract metadata from PDF
 * Note: Full PDF parsing requires a library like pdf.js
 * For MVP, we'll use a simplified approach
 */
async function extractFromPDF(file: File): Promise<ExtractedMetadata> {
  // For MVP, return empty metadata
  // In production, use pdf.js to extract text client-side
  console.log('PDF OCR not yet implemented client-side');
  return {};
}

/**
 * Extract metadata from image
 * Note: Full OCR requires Tesseract.js which works in the browser
 * For MVP, we'll use a simplified approach
 */
async function extractFromImage(file: File): Promise<ExtractedMetadata> {
  // For MVP, return empty metadata
  // In production, use Tesseract.js for client-side OCR
  console.log('Image OCR not yet implemented client-side');
  return {};
}

/**
 * Parse lab metadata from text using regex patterns
 */
export function parseLabMetadata(text: string): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // Common lab test patterns
  const labTests = [
    'ALT',
    'AST',
    'Glucose',
    'Cholesterol',
    'HDL',
    'LDL',
    'Triglycerides',
    'Hemoglobin',
    'Hematocrit',
    'WBC',
    'RBC',
    'Platelets',
    'TSH',
    'T4',
    'T3',
    'Vitamin D',
    'Vitamin B12',
    'Iron',
    'Ferritin',
    'Creatinine',
    'BUN',
    'Sodium',
    'Potassium',
    'Calcium',
    'Magnesium',
    'A1C',
    'HbA1c',
  ];

  // Try to find lab test name
  for (const test of labTests) {
    const regex = new RegExp(`\\b${test}\\b`, 'i');
    if (regex.test(text)) {
      metadata.labName = test;
      break;
    }
  }

  // Try to find value and unit patterns
  const valuePattern = /(\d+\.?\d*)\s*(mg\/dL|U\/L|mmol\/L|g\/dL|%|ng\/mL|pg\/mL|mL\/min|mcg\/L|IU\/L)/i;
  const valueMatch = text.match(valuePattern);

  if (valueMatch) {
    metadata.value = parseFloat(valueMatch[1]);
    metadata.unit = valueMatch[2];
  }

  // Try to find range patterns
  const rangePattern = /(?:Reference Range|Normal Range|Normal|Range)[\s:]*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/i;
  const rangeMatch = text.match(rangePattern);

  if (rangeMatch) {
    metadata.range = `${rangeMatch[1]}-${rangeMatch[2]}`;
  }

  // Try to find date patterns
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i;
  const dateMatch = text.match(datePattern);

  if (dateMatch) {
    try {
      const dateStr = dateMatch[0];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        metadata.date = date.toISOString().split('T')[0];
      }
    } catch (error) {
      // Ignore date parsing errors
    }
  }

  return metadata;
}
