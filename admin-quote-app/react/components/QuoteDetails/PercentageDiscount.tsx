import React, { Fragment } from 'react'
import { InputCurrency } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

const PercentageDiscount = ({
  updatingSubtotal,
  originalSubtotal,
  maxDiscountState,
  discountState,
  handlePercentageDiscount,
}: any) => {
  if (
    discountState === 0 ||
    (updatingSubtotal !== undefined &&
      originalSubtotal !== undefined &&
      Math.round(100 - (updatingSubtotal / originalSubtotal) * 100) <=
        maxDiscountState)
  ) {
    return (
      <Fragment>
        <div className="mt5">
          <InputCurrency
          currencyCode="USD"
          locale="en-US"
          // defaultValue={0}
            value={discountState}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              let val = Number(e.target.value)
              if (isNaN(val)) val = 0
              if (val < 0) val = 0
              // if (val > maxDiscountState) val = maxDiscountState
              handlePercentageDiscount(val)
            }}
          />
        </div>

        <div className="mt1">
          <FormattedMessage id="admin/b2b-quotes.quote-details.apply-discount.help-text" />
        </div>
      </Fragment>
    )
  }

  return (
    <div className="mt1">
      <FormattedMessage id="admin/b2b-quotes.quote-details.apply-discount.disabled-message" />
    </div>
  )
}

export default PercentageDiscount
