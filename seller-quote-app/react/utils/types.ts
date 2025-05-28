// Type definitions for the quote app

export interface QuoteItem {
  id: string
  name: string
  skuName?: string
  refId?: string
  sku?: string
  imageUrl?: string
  listPrice: number
  sellingPrice: number
  price?: number
  quantity: number
  error?: boolean | string
  seller?: string
}

export interface Quote {
  id: string
  referenceName: string
  subtotal: number
  discountPercent?: number
  finalValue?: number
  expirationDate?: string
  status: string
  items: QuoteItem[]
  costCenter?: string
  costCenterName?: string
  updateHistory?: any[]
  creationDate: string
  lastUpdate: string
  hasChildren?: boolean
  parentQuote?: string
  seller?: string
  sellerName?: string
  // Add these properties for metrics
  organization?: string
  organizationName?: string
  creatorEmail?: string
}

export interface QuoteSimple {
  id: string
  referenceName: string
  subtotal: number
  costCenter: string
  costCenterName: string
  status: string
  creationDate: string
  expirationDate: string
  lastUpdate: string
  parentQuote?: string
  assignedTo: string
  assignedToEmail: string
  // These optional fields are used in getEmptySimpleQuote
  creatorEmail?: string
  creatorRole?: string
  organization?: string
  organizationName?: string
  rowLoading?: boolean
  items?: QuoteItem[] // Adding back items as it's used somewhere
}
