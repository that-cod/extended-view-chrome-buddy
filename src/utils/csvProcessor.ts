
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

type FieldMatchInfo = {
  matched: boolean;
  matchedTo?: string;
  header?: string;
};

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

  /**
   * New fuzzy field matcher to match any variation of expected fields.
   */
  static fuzzyFindFieldValue(row: CSVRow, possibleFields: string[]): string | null {
    const lowerKeys = Object.keys(row).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
    for (const wantedRaw of possibleFields) {
      const wanted = wantedRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (let i = 0; i < lowerKeys.length; i++) {
        if (
          lowerKeys[i] === wanted ||
          lowerKeys[i].includes(wanted) ||
          wanted.includes(lowerKeys[i])
        ) {
          // Return the value by matching real key, preserving original keycase
          const realKey = Object.keys(row)[i];
          return row[realKey];
        }
      }
    }
    return null;
  }

  static mapToTrades(rows: CSVRow[]): ProcessedTrade[] {
    // Attempt to process every row, collect stats for debugging
    const trades: ProcessedTrade[] = [];
    for (const row of rows) {
      const trade = this.mapRowToTrade(row);
      if (trade !== null) trades.push(trade);
    }
    return trades;
  }

  static mapRowToTrade(row: CSVRow): ProcessedTrade | null {
    try {
      // Broader search field names for robustness:
      const dateFields = ['Date', 'Time', 'DateTime', 'Open Time', 'Close Time', 'date', 'time', 'trd_date', 'tradedate'];
      const symbolFields = ['Symbol', 'Instrument', 'Pair', 'symbol', 'instrument', 'ticker'];
      const actionFields = ['Type', 'Action', 'Side', 'Buy/Sell', 'type', 'action', 'bs'];
      const volumeFields = ['Volume', 'Size', 'Quantity', 'Lots', 'volume', 'size', 'qty', 'quantity', 'units'];
      const priceFields = ['Price', 'Open Price', 'Close Price', 'Entry Price', 'price', 'executionprice'];
      const profitFields = ['Profit', 'P&L', 'PnL', 'Net P&L', 'profit', 'pnl', 'pnl_usd', 'result', 'gain'];

      // Use fuzzy matching on all:
      const date = this.fuzzyFindFieldValue(row, dateFields);
      const symbol = this.fuzzyFindFieldValue(row, symbolFields);
      const action = this.fuzzyFindFieldValue(row, actionFields);
      const volume = this.fuzzyFindFieldValue(row, volumeFields);
      const price = this.fuzzyFindFieldValue(row, priceFields);
      const profit = this.fuzzyFindFieldValue(row, profitFields);

      if (!date || !symbol || !action || !volume || !price) {
        // Optionally attach debug info:
        // console.log('Row skipped due to missing fields:', row);
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
      // Optionally log bad row
      // console.error('Error mapping row to trade:', error, row);
      return null;
    }
  }

  static parseDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date.toISOString();
      // Try other formats here if needed
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  static normalizeAction(action: string): 'buy' | 'sell' {
    const normalizedAction = action.toLowerCase();
    if (normalizedAction.includes('buy') || normalizedAction.includes('long') || normalizedAction === 'b') {
      return 'buy';
    }
    return 'sell';
  }

  static detectEmotion(row: CSVRow): string | undefined {
    const profit = parseFloat(this.fuzzyFindFieldValue(row, ['Profit', 'P&L', 'PnL', 'pnl_usd', 'result', 'gain']) || '0');
    if (profit > 0) return 'confident';
    if (profit < 0) return 'frustrated';
    return 'neutral';
  }

  static calculateConfidence(row: CSVRow): number {
    const profit = parseFloat(this.fuzzyFindFieldValue(row, ['Profit', 'P&L', 'PnL', 'pnl_usd', 'result', 'gain']) || '0');
    const volume = parseFloat(this.fuzzyFindFieldValue(row, ['Volume', 'Size', 'Lots', 'qty', 'quantity', 'units']) || '1');
    if (profit > 0) {
      return Math.min(50 + (profit / volume) * 10, 100);
    } else {
      return Math.max(50 + (profit / volume) * 10, 0);
    }
  }

  /**
   * Add a function to get all unique headers in a sample CSV
   */
  static extractHeaders(rows: CSVRow[]): string[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]);
  }
}
