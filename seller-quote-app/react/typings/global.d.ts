// Global type definitions
declare interface QuoteItem {
  id: string
  name: string
  skuName?: string
  refId?: string
  sku?: string
  imageUrl?: string
  listPrice: number
  sellingPrice: number
  price: number
  quantity: number
  error?: boolean | string
  seller?: string
}

declare interface Quote {
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
  creationDate?: string
  lastUpdate?: string
  hasChildren?: boolean
  parentQuote?: string
}

declare interface QuoteSimple {
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
}
