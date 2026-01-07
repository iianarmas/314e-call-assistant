/**
 * Parse CSV file for bulk contact import
 * Expected columns: Name, Company, Title, Product, Trigger Type, Trigger Details, Notes
 */

export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row')
  }

  // Parse header
  const headers = parseCSVLine(lines[0])

  // Validate required columns
  const requiredColumns = ['name', 'company', 'product']
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())

  for (const required of requiredColumns) {
    if (!normalizedHeaders.includes(required)) {
      throw new Error(`Missing required column: ${required}`)
    }
  }

  // Parse data rows
  const contacts = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // Skip empty lines

    const values = parseCSVLine(lines[i])
    const contact = {}

    headers.forEach((header, index) => {
      const key = normalizeColumnName(header)
      const value = values[index]?.trim() || null

      if (key) {
        contact[key] = value
      }
    })

    // Validate product
    if (contact.product && !['Dexit', 'Muspell'].includes(contact.product)) {
      console.warn(`Row ${i + 1}: Invalid product "${contact.product}". Must be "Dexit" or "Muspell"`)
      contact.product = null
    }

    // Only add if has required fields
    if (contact.name && contact.company && contact.product) {
      contacts.push(contact)
    } else {
      console.warn(`Row ${i + 1}: Skipped due to missing required fields (name, company, product)`)
    }
  }

  return contacts
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field delimiter
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  // Add last field
  result.push(current)

  return result
}

/**
 * Normalize column names to match database schema
 */
function normalizeColumnName(header) {
  const normalized = header.toLowerCase().trim()

  const columnMap = {
    'name': 'name',
    'company': 'company',
    'organization': 'company',
    'title': 'title',
    'position': 'title',
    'role': 'title',
    'product': 'product',
    'trigger type': 'trigger_type',
    'trigger': 'trigger_type',
    'trigger details': 'trigger_details',
    'trigger detail': 'trigger_details',
    'notes': 'notes',
    'note': 'notes',
    'comments': 'notes'
  }

  return columnMap[normalized] || null
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate() {
  const headers = ['Name', 'Company', 'Title', 'Product', 'Trigger Type', 'Trigger Details', 'Notes']
  const example = [
    'John Smith',
    'Memorial Hospital',
    'HIM Director',
    'Dexit',
    '',
    '',
    'Found on LinkedIn'
  ]

  return [headers.join(','), example.join(',')].join('\n')
}

/**
 * Validate CSV file before parsing
 */
export function validateCSVFile(file) {
  const errors = []

  // Check file type
  if (!file.name.endsWith('.csv')) {
    errors.push('File must be a CSV file (.csv)')
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB')
  }

  return errors
}
