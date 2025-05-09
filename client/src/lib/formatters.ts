// Format currency in Indian Rupee format
export function formatIndianCurrency(amount: number): string {
  // Format the number with Indian locale (en-IN) and INR currency
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number with Indian thousand separators (e.g., 1,00,000)
export function formatIndianNumber(number: number): string {
  return new Intl.NumberFormat("en-IN").format(number);
}

// Format percentage with 1 decimal place
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format phone number in Indian format (+91 XXXXX XXXXX)
export function formatIndianPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Check if the number starts with country code
  if (digits.startsWith("91") && digits.length >= 12) {
    return `+91 ${digits.substring(2, 7)} ${digits.substring(7)}`;
  } else if (digits.length === 10) {
    return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
  }
  
  // Return as is if it doesn't fit expected format
  return phoneNumber;
}
