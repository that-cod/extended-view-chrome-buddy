
export interface CSVRow {
  [key: string]: string;
}

export interface ProcessedTrade {
  date: string;
  symbol: string;
  action: 'buy' | 'sell';
  volume: number;
  price: number;
  profit: number;
  emotion?: string;
  confidence?: number;
}

export class CSVProcessor {
  static parseCSV(csvText: string): CSVRow[] {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = this.parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index].trim();
        });
        rows.push(row);
      }
    }

    return rows;
  }

  static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  static mapToTrades(rows: CSVRow[]): ProcessedTrade[] {
    return rows.map(row => this.mapRowToTrade(row)).filter(trade => trade !== null) as ProcessedTrade[];
  }

  static mapRowToTrade(row: CSVRow): ProcessedTrade | null {
    try {
      // Common column mappings for different broker formats
      const dateFields = ['Date', 'Time', 'DateTime', 'Open Time', 'Close Time', 'date', 'time'];
      const symbolFields = ['Symbol', 'Instrument', 'Pair', 'symbol', 'instrument'];
      const actionFields = ['Type', 'Action', 'Side', 'Buy/Sell', 'type', 'action'];
      const volumeFields = ['Volume', 'Size', 'Quantity', 'Lots', 'volume', 'size'];
      const priceFields = ['Price', 'Open Price', 'Close Price', 'Entry Price', 'price'];
      const profitFields = ['Profit', 'P&L', 'PnL', 'Net P&L', 'profit', 'pnl'];

      const date = this.findFieldValue(row, dateFields);
      const symbol = this.findFieldValue(row, symbolFields);
      const action = this.findFieldValue(row, actionFields);
      const volume = this.findFieldValue(row, volumeFields);
      const price = this.findFieldValue(row, priceFields);
      const profit = this.findFieldValue(row, profitFields);

      if (!date || !symbol || !action || !volume || !price) {
        return null;
      }

      return {
        date: this.parseDate(date),
        symbol: symbol,
        action: this.normalizeAction(action),
        volume: parseFloat(volume) || 0,
        price: parseFloat(price) || 0,
        profit: parseFloat(profit) || 0,
        emotion: this.detectEmotion(row),
        confidence: this.calculateConfidence(row)
      };
    } catch (error) {
      console.error('Error mapping row to trade:', error, row);
      return null;
    }
  }

  static findFieldValue(row: CSVRow, possibleFields: string[]): string | null {
    for (const field of possibleFields) {
      if (row[field] !== undefined) {
        return row[field];
      }
    }
    return null;
  }

  static parseDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  static normalizeAction(action: string): 'buy' | 'sell' {
    const normalizedAction = action.toLowerCase();
    if (normalizedAction.includes('buy') || normalizedAction.includes('long')) {
      return 'buy';
    }
    return 'sell';
  }

  static detectEmotion(row: CSVRow): string | undefined {
    const profit = parseFloat(this.findFieldValue(row, ['Profit', 'P&L', 'PnL']) || '0');
    if (profit > 0) return 'confident';
    if (profit < 0) return 'frustrated';
    return 'neutral';
  }

  static calculateConfidence(row: CSVRow): number {
    // Simple confidence calculation based on profit/loss ratio
    const profit = parseFloat(this.findFieldValue(row, ['Profit', 'P&L', 'PnL']) || '0');
    const volume = parseFloat(this.findFieldValue(row, ['Volume', 'Size', 'Lots']) || '1');
    
    if (profit > 0) {
      return Math.min(50 + (profit / volume) * 10, 100);
    } else {
      return Math.max(50 + (profit / volume) * 10, 0);
    }
  }
}
