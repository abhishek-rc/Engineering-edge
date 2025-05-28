import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { FormattedCurrency } from 'vtex.format-currency'
import {
  Input,
  InputCurrency,
  Table,
} from 'vtex.styleguide'

interface QuoteTableProps {
  items: any[]
  isEditable: boolean
  onUpdateSellingPrice: (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onUpdateQuantity?: (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlurQuantity?: (id: string) => (event: React.FocusEvent<HTMLInputElement>) => void
  currencyCode: string
  locale: string
  formatPrice?: (value: number) => string
  maxDiscountPercentage?: number
  // Additional properties
  originalSubtotal?: number
  updatingSubtotal?: number
  expirationDate?: string
  status?: string
}

const QuoteTable: React.FC<QuoteTableProps> = ({
  items,
  isEditable,
  onUpdateSellingPrice,
  onUpdateQuantity,
  onBlurQuantity,
  currencyCode,
  locale,
  formatPrice,
  maxDiscountPercentage = 99,
  originalSubtotal,
  updatingSubtotal,
  expirationDate,
  status
}) => {

  console.log('QuoteTable rendered with items:', items)
  return (
    <Table
      fullWidth
      schema={{
        properties: {
          imageUrl: {
            title: <FormattedMessage id="seller-quote-app.image" defaultMessage="Image" />,
            cellRenderer: ({ rowData }: any) => (
              <div className="dib v-mid relative">
                {rowData.imageUrl ? (
                  <img
                    className="br2 v-mid"
                    height="38"
                    width="38"
                    src={rowData.imageUrl}
                    alt={rowData.name || rowData.skuName}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h2 w2 bg-muted-5 br2 flex items-center justify-center">
                    <span className="c-muted-1 f7">N/A</span>
                  </div>
                )}
              </div>
            ),
            width: 70,
          },
          refId: {
            title: <FormattedMessage id="seller-quote-app.sku" defaultMessage="SKU" />,
            cellRenderer: ({ rowData }: any) => rowData.refId || rowData.sku,
            width: 200,
          },
          name: {
            title: <FormattedMessage id="seller-quote-app.name" defaultMessage="Name" />,
            cellRenderer: ({ rowData }: any) => (
              <div>
                <span>{rowData.name}</span>
                {rowData.skuName && rowData.skuName !== rowData.name && (
                  <Fragment>
                    <br />
                    <span className="t-mini">{rowData.skuName}</span>
                  </Fragment>
                )}
              </div>
            ),
            minWidth: 300,
          },
          listPrice: {
            title: <FormattedMessage id="seller-quote-app.list-price" defaultMessage="Original Price" />,
            headerRight: true,
            width: 120,
            cellRenderer: ({ rowData }: any) => {
              const hasDiscount = rowData.listPrice !== rowData.sellingPrice
              return (
                <div className={`w-100 tr${hasDiscount && isEditable ? ' strike' : ''}`}>
                  <FormattedCurrency value={(rowData.listPrice || 0) / 100} />
                </div>
              )
            },
          },
          sellingPrice: {
            title: <FormattedMessage id="seller-quote-app.unit-price" defaultMessage="Quoted Price" />,
            headerRight: true,
            width: 120,
            cellRenderer: ({ rowData }: any) => {
              if (isEditable) {
                const minPrice = (rowData.listPrice || rowData.price || 0) * ((100 - maxDiscountPercentage) / 100)
                const hasError = rowData.error || (rowData.sellingPrice < minPrice)

                return (
                  <div className="relative">
                    <InputCurrency
                      name={`price-${rowData.id}`}
                      value={(rowData.sellingPrice || rowData.price || 0) / 100}
                      onChange={onUpdateSellingPrice(rowData.id)}
                      currencyCode={currencyCode}
                      locale={locale}
                      error={hasError}
                    />
                    {hasError && (
                      <div className="t-small c-danger absolute" style={{ fontSize: '10px' }}>
                        Min: <FormattedCurrency value={minPrice / 100} />
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div className="w-100 tr">
                  <FormattedCurrency value={(rowData.sellingPrice || rowData.price || 0) / 100} />
                </div>
              )
            },
          },
          quantity: {
            title: <FormattedMessage id="seller-quote-app.quantity" defaultMessage="Quantity" />,
            width: 100,
            cellRenderer: ({ rowData }: any) => {
              if (isEditable && onUpdateQuantity) {
                return (
                  <Input
                    id={rowData.id}
                    name="quantity"
                    value={rowData.quantity}
                    onChange={onUpdateQuantity(rowData.id)}
                    onBlur={onBlurQuantity ? onBlurQuantity(rowData.id) : undefined}
                  />
                )
              }

              return rowData.quantity
            },
          },
          total: {
            title: <FormattedMessage id="seller-quote-app.total" defaultMessage="Total" />,
            headerRight: true,
            cellRenderer: ({ rowData }: any) => {
              return (
                <span className="tr w-100">
                  <FormattedCurrency
                    value={
                      ((rowData.sellingPrice || rowData.price || 0) * rowData.quantity) / 100
                    }
                  />
                </span>
              )
            },
            width: 100,
          },
        },
      }}
      items={items || []}
      emptyStateLabel={<FormattedMessage id="seller-quote-app.empty-state" defaultMessage="No items found" />}
    />
  )
}

export default QuoteTable
