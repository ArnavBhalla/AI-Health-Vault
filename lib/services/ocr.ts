import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { RecordMetadata } from '@/lib/types';

export interface ExtractedData {
  text: string;
  metadata: Partial<RecordMetadata>;
}

/**
 * OCR and document parsing service
 * Extracts text and metadata from PDFs and images
 */
export class OCRService {
  /**
   * Extract text from a PDF file
   */
  static async extractFromPDF(buffer: Buffer): Promise<ExtractedData> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      // Parse metadata from extracted text
      const metadata = this.parseLabMetadata(text);

      return {
        text,
        metadata,
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      return {
        text: '',
        metadata: {},
      };
    }
  }

  /**
   * Extract text from an image file using OCR
   */
  static async extractFromImage(buffer: Buffer): Promise<ExtractedData> {
    try {
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = data.text;

      // Parse metadata from extracted text
      const metadata = this.parseLabMetadata(text);

      return {
        text,
        metadata,
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        text: '',
        metadata: {},
      };
    }
  }

  /**
   * Extract data based on file type
   */
  static async extractFromFile(
    buffer: Buffer,
    filename: string
  ): Promise<ExtractedData> {
    const ext = filename.toLowerCase().split('.').pop();

    if (ext === 'pdf') {
      return this.extractFromPDF(buffer);
    } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return this.extractFromImage(buffer);
    }

    return {
      text: '',
      metadata: {},
    };
  }

  /**
   * Parse lab metadata from extracted text
   * Attempts to find lab names, values, units, and ranges
   */
  private static parseLabMetadata(text: string): Partial<RecordMetadata> {
    const metadata: Partial<RecordMetadata> = {};

    // Common lab test patterns
    const labTests = [
      'ALT', 'AST', 'Glucose', 'Cholesterol', 'HDL', 'LDL', 'Triglycerides',
      'Hemoglobin', 'Hematocrit', 'WBC', 'RBC', 'Platelets', 'TSH', 'T4', 'T3',
      'Vitamin D', 'Vitamin B12', 'Iron', 'Ferritin', 'Creatinine', 'BUN',
      'Sodium', 'Potassium', 'Calcium', 'Magnesium', 'A1C', 'HbA1c'
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
    // Pattern: number followed by unit (e.g., "59 U/L" or "5.8 mg/dL")
    const valuePattern = /(\d+\.?\d*)\s*(mg\/dL|U\/L|mmol\/L|g\/dL|%|ng\/mL|pg\/mL|mL\/min|mcg\/L|IU\/L)/i;
    const valueMatch = text.match(valuePattern);

    if (valueMatch) {
      metadata.value = parseFloat(valueMatch[1]);
      metadata.unit = valueMatch[2];
    }

    // Try to find range patterns
    // Pattern: "Reference Range: 10-40" or "Normal: 10 - 40"
    const rangePattern = /(?:Reference Range|Normal Range|Normal|Range)[\s:]*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/i;
    const rangeMatch = text.match(rangePattern);

    if (rangeMatch) {
      metadata.range = `${rangeMatch[1]}-${rangeMatch[2]}`;
    }

    // Try to find date patterns
    // Pattern: MM/DD/YYYY or DD-MMM-YYYY
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i;
    const dateMatch = text.match(datePattern);

    if (dateMatch) {
      try {
        const dateStr = dateMatch[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          metadata.date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (error) {
        // Ignore date parsing errors
      }
    }

    return metadata;
  }

  /**
   * Use AI to extract structured data from text
   * This is more accurate but requires API calls
   */
  static async extractWithAI(text: string): Promise<Partial<RecordMetadata>> {
    // TODO: Implement AI-powered extraction using Claude
    // This would be more accurate than regex patterns
    // For now, fall back to regex parsing
    return this.parseLabMetadata(text);
  }
}
