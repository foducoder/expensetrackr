import { TRANSACTION_CATEGORIES, InsertTransaction, TRANSACTION_SOURCES } from "@shared/schema";
import { categorizeMerchant } from "./categoryMatcher";

// Regex patterns for different Indian banks and payment apps
const SMS_PATTERNS = {
  // HDFC Bank pattern
  HDFC: /HDFC Bank: Rs\.([0-9,.]+) (debited|credited) from a\/c [*#](\d+) on (\d{2}-\d{2}-\d{4}) to ([^.]+)\. Avl bal: Rs\.([0-9,.]+)/i,
  
  // ICICI Bank pattern
  ICICI: /ICICI Bank: Rs\.([0-9,.]+) (credited|debited) to your a\/c XX(\d+) on (\d{2}-\d{2}-\d{4}) by ([^.]+)\. Available balance: Rs\.([0-9,.]+)/i,
  
  // SBI pattern
  SBI: /SBI Alert: Rs\.([0-9,.]+) (debited|credited) from your A\/c no\. XX(\d+) on (\d{2}-\d{2}-\d{4}) using ([^.]+) at ([^.]+)\. Avl Bal:Rs\.([0-9,.]+)/i,
  
  // Axis Bank pattern
  AXIS: /Axis Bank: Rs\.([0-9,.]+) sent to ([^@]+)@(\w+) via UPI on (\d{2}-\d{2}-\d{4}) from a\/c XX(\d+)/i,
  
  // PNB pattern
  PNB: /PNB: Rs\.([0-9,.]+) (withdrawn|deposited) from ([^on]+) on (\d{2}-\d{2}-\d{4}) from a\/c XX(\d+)/i,
  
  // PhonePe pattern
  PHONEPE: /([0-9,.]+) paid via PhonePe to ([^.]+) on (\d{2}-\d{2}-\d{4})/i,
  
  // Paytm pattern
  PAYTM: /Rs\.([0-9,.]+) (paid|received) to ([^.]+) on (\d{2}-\d{2}-\d{4}) from Paytm/i,
  
  // Amazon Pay pattern
  AMAZONPAY: /Amazon Pay: Rs\.([0-9,.]+) (paid|debited) to ([^.]+) on (\d{2}-\d{2}-\d{4})/i,
  
  // Google Pay pattern
  GOOGLEPAY: /Rs\.([0-9,.]+) (sent|received) to ([^.]+) via Google Pay on (\d{2}-\d{2}-\d{4})/i,
};

// Parse date from Indian format (DD-MM-YYYY)
function parseDateFromIndian(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Parse amount by removing commas and converting to number
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/,/g, ''));
}

// Determine transaction source from SMS content
function determineTransactionSource(smsBody: string): typeof TRANSACTION_SOURCES[number] {
  if (/UPI|upi|UPI-P2M|BHIM|PhonePe|Google Pay|GPay|Paytm/i.test(smsBody)) {
    return "UPI";
  } else if (/credit card|creditcard|CC|Credit Card/i.test(smsBody)) {
    return "Credit Card";
  } else if (/debit card|debitcard|DC|Debit Card/i.test(smsBody)) {
    return "Debit Card";
  } else if (/NetBanking|Net Banking|NEFT|RTGS|IMPS/i.test(smsBody)) {
    return "Net Banking";
  } else if (/ATM|CASH WITHDRAWAL|WITHDRAWAL/i.test(smsBody)) {
    return "ATM";
  } else {
    return "Other";
  }
}

export function parseIndianBankSMS(smsBody: string): InsertTransaction | null {
  // Try to match the SMS against known patterns
  for (const [bank, pattern] of Object.entries(SMS_PATTERNS)) {
    const match = smsBody.match(pattern);
    
    if (match) {
      // Extract transaction details based on the matched pattern
      switch (bank) {
        case "HDFC": {
          const [_, amountStr, type, accountLast4, dateStr, merchant, balanceStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: type === "debited" ? "debit" : "credit",
            description: `${type === "debited" ? "Payment to" : "Payment from"} ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: determineTransactionSource(smsBody),
            smsBody,
          };
        }
        
        case "ICICI": {
          const [_, amountStr, type, accountLast4, dateStr, merchant, balanceStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: type === "debited" ? "debit" : "credit",
            description: `${type === "debited" ? "Payment to" : "Payment from"} ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: determineTransactionSource(smsBody),
            smsBody,
          };
        }
        
        case "SBI": {
          const [_, amountStr, type, accountLast4, dateStr, method, merchant, balanceStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: type === "debited" ? "debit" : "credit",
            description: `${type === "debited" ? "Payment to" : "Payment from"} ${merchantName} using ${method}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: determineTransactionSource(smsBody),
            smsBody,
          };
        }
        
        case "AXIS": {
          const [_, amountStr, recipientName, upiId, dateStr, accountLast4] = match;
          const merchantName = recipientName.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: "debit",
            description: `UPI payment to ${merchantName}@${upiId}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: "UPI",
            smsBody,
          };
        }
        
        case "PNB": {
          const [_, amountStr, type, method, dateStr, accountLast4] = match;
          const isDebit = type === "withdrawn";
          const category = isDebit ? "Other Expense" : "Other Income";
          
          return {
            amount: parseAmount(amountStr),
            type: isDebit ? "debit" : "credit",
            description: `${isDebit ? "Withdrawal from" : "Deposit to"} ${method.trim()}`,
            merchantName: method.trim(),
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: determineTransactionSource(smsBody),
            smsBody,
          };
        }
        
        case "PHONEPE": {
          const [_, amountStr, merchant, dateStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: "debit",
            description: `PhonePe payment to ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: "UPI",
            smsBody,
          };
        }
        
        case "PAYTM": {
          const [_, amountStr, type, merchant, dateStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: type === "paid" ? "debit" : "credit",
            description: `Paytm ${type} ${type === "paid" ? "to" : "from"} ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: "UPI",
            smsBody,
          };
        }
        
        case "AMAZONPAY": {
          const [_, amountStr, type, merchant, dateStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: "debit",
            description: `Amazon Pay payment to ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: "UPI",
            smsBody,
          };
        }
        
        case "GOOGLEPAY": {
          const [_, amountStr, type, merchant, dateStr] = match;
          const merchantName = merchant.trim();
          const category = categorizeMerchant(merchantName);
          
          return {
            amount: parseAmount(amountStr),
            type: type === "sent" ? "debit" : "credit",
            description: `Google Pay ${type} ${type === "sent" ? "to" : "from"} ${merchantName}`,
            merchantName,
            category,
            timestamp: parseDateFromIndian(dateStr),
            source: "UPI",
            smsBody,
          };
        }
      }
    }
  }
  
  // If no pattern matched
  return null;
}
