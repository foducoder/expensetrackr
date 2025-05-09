import { TRANSACTION_CATEGORIES } from "@shared/schema";

// Keyword mappings for automatic categorization
const CATEGORY_KEYWORDS: Record<typeof TRANSACTION_CATEGORIES[number], string[]> = {
  "Food & Dining": [
    "swiggy", "zomato", "food", "restaurant", "cafe", "pizza", "uber eats", 
    "mcdonalds", "burger", "starbucks", "hotel", "dhaba", "diner", "bakery",
    "dominos", "subway", "kfc", "chai", "tea", "coffeehouse", "coffee"
  ],
  
  "Shopping": [
    "amazon", "flipkart", "myntra", "ajio", "nykaa", "tata cliq", "snapdeal", 
    "walmart", "big bazaar", "dmart", "ikea", "mall", "retail", "store", 
    "shop", "market", "purchase", "center", "boutique", "ecommerce", "online shop"
  ],
  
  "Entertainment": [
    "netflix", "amazon prime", "hotstar", "sony liv", "zee5", "disney+", 
    "movie", "cinema", "pvr", "inox", "theatre", "concert", "event", "festival", 
    "show", "game", "gaming", "playstation", "xbox", "music", "spotify", "gaana", 
    "jiosaavn", "wynk", "ticket", "ticketmaster", "bookmyshow"
  ],
  
  "Transportation": [
    "uber", "ola", "cab", "taxi", "auto", "rickshaw", "metro", "bus", "train", 
    "irctc", "railway", "flight", "airplane", "airline", "petrol", "gas", "diesel", 
    "fuel", "parking", "toll", "fare", "redbus", "makemytrip", "goibibo", "yatra"
  ],
  
  "Utilities": [
    "electricity", "power", "water", "gas", "bill", "utility", "broadband", 
    "internet", "wifi", "fiber", "jio", "airtel", "vodafone", "bsnl", "phone", 
    "mobile", "postpaid", "prepaid", "recharge", "dth", "tatasky", "dish tv", 
    "payment", "service", "maintenance"
  ],
  
  "Health": [
    "doctor", "hospital", "clinic", "medical", "pharmacy", "medicine", "apollo", 
    "medplus", "netmeds", "pharmeasy", "1mg", "health", "wellness", "fitness", 
    "gym", "cure.fit", "cult.fit", "yoga", "checkup", "test", "diagnostic", 
    "insurance", "dental", "eye", "optical", "lenses", "care"
  ],
  
  "Education": [
    "school", "college", "university", "institute", "academy", "class", "course", 
    "tutorial", "workshop", "training", "lesson", "learning", "byju's", "unacademy", 
    "vedantu", "khan", "udemy", "coursera", "education", "book", "stationery", 
    "supplies", "tuition", "fee", "student", "scholarship", "study"
  ],
  
  "Travel": [
    "hotel", "resort", "booking", "trip", "vacation", "holiday", "tour", "travel", 
    "airbnb", "makemytrip", "oyo", "goibibo", "cleartrip", "yatra", "trivago", 
    "flight", "airline", "indigo", "spicejet", "airindia", "vistara", "jetairways", 
    "tourism", "visa", "passport", "luggage", "stay"
  ],
  
  "Groceries": [
    "grocery", "bigbasket", "grofers", "blinkit", "jiomart", "milk", "vegetable", 
    "fruit", "meat", "poultry", "seafood", "dairy", "bread", "rice", "wheat", 
    "flour", "dal", "pulse", "spice", "oil", "ghee", "butter", "supermarket", 
    "kirana", "general", "minimart", "mart", "fresh", "organic"
  ],
  
  "Investment": [
    "mutual fund", "stock", "share", "equity", "bond", "debenture", "dividend", 
    "interest", "zerodha", "groww", "upstox", "paytm money", "coin", "nse", 
    "bse", "sensex", "nifty", "investment", "invest", "portfolio", "crypto", 
    "bitcoin", "ethereum", "gold", "silver", "metal", "deposit", "fd", "sip"
  ],
  
  "Salary": [
    "salary", "income", "wage", "payroll", "stipend", "bonus", "incentive", 
    "commission", "payment", "earnings", "pay", "compensation", "remuneration", 
    "monthly", "credit"
  ],
  
  "Rent": [
    "rent", "lease", "housing", "accommodation", "tenant", "landlord", "property", 
    "apartment", "flat", "house", "residence", "dwelling", "lodge", "rented", 
    "rental", "monthly"
  ],
  
  "Other Income": [
    "refund", "return", "reimbursement", "cashback", "reward", "prize", "gift", 
    "donation", "grant", "scholarship", "allowance", "pension", "settlement", 
    "alimony", "inheritance", "lottery", "winning", "interest", "dividend", "income"
  ],
  
  "Other Expense": [
    "withdrawal", "atm", "cash", "fee", "charge", "penalty", "fine", "tax", 
    "duty", "loan", "emi", "installment", "premium", "subscription", "membership", 
    "donation", "charity", "contribution", "miscellaneous", "other", "expense"
  ]
};

export function categorizeMerchant(merchantName: string): typeof TRANSACTION_CATEGORIES[number] {
  const normalizedMerchant = merchantName.toLowerCase();
  
  // Check each category's keywords for a match
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => normalizedMerchant.includes(keyword.toLowerCase()))) {
      return category as typeof TRANSACTION_CATEGORIES[number];
    }
  }
  
  // Special pattern matching for salaries
  if (/salary|payroll|inc[o]?me/i.test(normalizedMerchant)) {
    return "Salary";
  }
  
  // Default for unrecognized merchants
  return "Other Expense";
}
