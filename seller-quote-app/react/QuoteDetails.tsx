import React, { FC, useState, useContext, useEffect, ChangeEventHandler, FocusEventHandler } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import QuoteTable from './components/QuoteDetails/QuoteTable'

import {
  Layout,
  PageBlock,
  PageHeader,
  Button,
  Tag,
  DatePicker,
  Spinner,
  Alert,
  ToastContext,
  InputCurrency,
  Input
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { useQuery, useMutation } from 'react-apollo'
import { formatCurrency, FormattedCurrency } from 'vtex.format-currency'

import { GetQuoteById } from './graphql/GetQuote.graphql'
import './styles.global.css'
import UPDATE_ASSIGNEE from './graphql/updateAssignee.graphql'
import UPDATE_QUOTE from './graphql/updateQuote.graphql'

const initialState = {
  id: '',
  costCenter: '',
  costCenterName: '',
  creationDate: '',
  creatorEmail: '',
  creatorRole: '',
  expirationDate: '',
  items: [],
  lastUpdate: '',
  organization: '',
  organizationName: '',
  referenceName: '',
  status: '',
  subtotal: 0,
  updateHistory: [],
  viewedByCustomer: false,
  viewedBySales: false,
  hasChildren: false,
}

// Define interfaces for component props and data structures
interface QuoteDetailsProps {
  params?: any
  standalone?: boolean
}

interface QuoteItem {
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
  error?: string
  _tempEmptyInput?: boolean
}

const QuoteDetails: FC<QuoteDetailsProps> = (props) => {
  const {
    route: { params: runtimeParams },
    navigate,
    account,
    culture,
    culture: { currency: currencyCode, locale }
  } = useRuntime()

  // Use props.params if provided, otherwise use runtime params
  const params = props.params || runtimeParams
  const standalone = props.standalone !== false

  const intl = useIntl()
  const { formatMessage } = intl
  const { showToast } = useContext(ToastContext)

  // State for managing quote and editing
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [quoteState, setQuoteState] = useState<any>(initialState)
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [updatingSubtotal, setUpdatingSubtotal] = useState(0)
  const [originalSubtotal, setOriginalSubtotal] = useState(0)
  const MAX_DISCOUNT_PERCENTAGE = 99

  const [updateAssignee] = useMutation(UPDATE_ASSIGNEE)
  const [updateQuote] = useMutation(UPDATE_QUOTE)

  const quoteId = params?.id

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  // Format price function
  const formatPrice = (value: number) =>
    formatCurrency({
      intl,
      culture,
      value: value / 100,
    })

  // Fetch quote data
  const { data, loading, error, refetch } = useQuery(GetQuoteById, {
    variables: { quoteId },
    fetchPolicy: 'network-only',
    skip: !quoteId,
  })

// useEffect(() => {
//   if (data?.GetQuoteById) {
//     setQuoteState(data.GetQuoteById);
//     setExpirationDate(
//       data.GetQuoteById.expirationDate
//         ? new Date(data.GetQuoteById.expirationDate)
//         : null
//     );

//     // Calculate and set subtotals
//     const subtotal = data.GetQuoteById.items.reduce(
//       (sum: number, item: QuoteItem) => {
//         // Determine which price to use (sellingPrice or price)
//         const price = item.sellingPrice ?? item.price ?? 0;

//         // Convert price to cents if it's in dollars (has decimal places)
//         const priceInCents = price % 1 !== 0 ? Math.round(price * 100) : price;

//         return sum + priceInCents * item.quantity;
//       },
//       0
//     );

//     // Store subtotal in cents for internal calculations
//     setUpdatingSubtotal(subtotal);
//     setOriginalSubtotal(subtotal);
//   }
// }, [data]);


 useEffect(() => {
    if (!data?.GetQuoteById) return

    // Direct access to GetQuoteById
    const {
      id: _id,
      costCenter,
      costCenterName,
      creationDate,
      creatorEmail,
      creatorRole,
      expirationDate: _expirationDate,
      items: _items,
      lastUpdate,
      organization,
      organizationName,
      referenceName,
      status: _status,
      subtotal,
      updateHistory,
      viewedByCustomer,
      viewedBySales,
      hasChildren,
    } = data.GetQuoteById

    // Set the expiration date
    if (_expirationDate) {
      setExpirationDate(new Date(_expirationDate))
    }

    // Calculate and set subtotals
    const calculatedSubtotal = _items?.reduce(
      (sum: number, item: QuoteItem) => {
        // Determine which price to use (sellingPrice or price)
        const price = item.sellingPrice ?? item.price ?? 0;

        // Convert price to cents if it's in dollars (has decimal places)
        const priceInCents = price % 1 !== 0 ? Math.round(price * 100) : price;

        return sum + priceInCents * item.quantity;
      },
      0
    ) || 0;

    // Store subtotal in cents for internal calculations
    setUpdatingSubtotal(calculatedSubtotal);
    setOriginalSubtotal(calculatedSubtotal);

    // Set the full quote state
    setQuoteState({
      id: _id,
      costCenter,
      costCenterName,
      creationDate,
      creatorEmail,
      creatorRole,
      expirationDate: _expirationDate,
      items: _items || [], // Ensure items is always at least an empty array
      lastUpdate,
      organization,
      organizationName,
      referenceName,
      status: _status,
      subtotal: calculatedSubtotal, // Use the calculated subtotal
      updateHistory,
      viewedByCustomer,
      viewedBySales,
      hasChildren,
    })

    console.log('Quote data loaded:', { items: _items, subtotal: calculatedSubtotal })

  }, [data])

    useEffect(() => {
    if (!quoteState.items.find((item) => item.error)) {
      setUpdatingSubtotal(
        quoteState.items.reduce(
          (sum, item) => sum + item.sellingPrice * item.quantity,
          0
        )
      )
    }

    const price = quoteState.items.reduce(
      (sum: number, item: QuoteItem) => sum + item.price * item.quantity,
      0
    )

    setOriginalSubtotal(price)
  }, [quoteState])

  if (loading) {
    const loadingContent = (
      <div className="flex justify-center pa7">
        <Spinner />
      </div>
    );

    return standalone ? (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="seller-quote-app.quote-details" defaultMessage="Quote Details" />}
            linkLabel={<FormattedMessage id="seller-quote-app.back" defaultMessage="BACK" />}
            onLinkClick={() => navigate({ to: '/admin/app/example' })}
          />
        }
      >
        {loadingContent}
      </Layout>
    ) : loadingContent;
  }

  if (error) {
    const errorContent = (
      <Alert type="error">
        <FormattedMessage id="seller-quote-app.error-loading-quote" defaultMessage="Error loading quote: {message}" values={{ message: error.message }} />
      </Alert>
    );

    return standalone ? (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="seller-quote-app.quote-details" defaultMessage="Quote Details" />}
            linkLabel={<FormattedMessage id="seller-quote-app.back" defaultMessage="BACK" />}
            onLinkClick={() => navigate({ to: '/admin/app/example' })}
          />
        }
      >
        {errorContent}
      </Layout>
    ) : errorContent;
  }

  const quote = data?.GetQuoteById

  if (!quote) {
    const notFoundContent = (
      <Alert type="error">
        <FormattedMessage id="seller-quote-app.quote-not-found" defaultMessage="Quote not found" />
      </Alert>
    );

    return standalone ? (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="seller-quote-app.quote-details" defaultMessage="Quote Details" />}
            linkLabel={<FormattedMessage id="seller-quote-app.back" defaultMessage="BACK" />}
            onLinkClick={() => navigate({ to: '/admin/app/example' })}
          />
        }
      >
        {notFoundContent}
      </Layout>
    ) : notFoundContent;
  }

  // Helper function to render status tag
  const renderStatusTag = (status: string) => {
    let bgColor = "#8bc34a"

    if (status.toLowerCase() === "declined") {
      bgColor = "#ff4c4c"
    } else if (status.toLowerCase() === "pending") {
      bgColor = "#ffb100"
    } else if (status.toLowerCase() === "ready") {
      bgColor = "#8bc34a"
    }

    return (
      <Tag bgColor={bgColor} color="#ffffff">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    )
  }

   const handleUpdateSellingPrice: (
    id: string
  ) => ChangeEventHandler<HTMLInputElement> = (itemId) => (event) => {
    const newItems = quoteState.items.map((item: QuoteItem) => {
      if (item.id === itemId) {
        let newPrice = ((event.target.value as unknown) as number) * 100

        if (newPrice > item.price) {
          newPrice = item.price
        }

        return {
          ...item,
          sellingPrice: newPrice,
          error:
            !newPrice || newPrice / item.price < (100 - 99) / 100
              ? true
              : undefined, // setting error to false will cause create/update mutation to error
        }
      }

      return item
    })

    setQuoteState({
      ...quoteState,
      items: newItems,
    })
  }

  const handleUpdateQuantity: (
    id: string
  ) => ChangeEventHandler<HTMLInputElement> = (itemId) => (event) => {
    // Allow empty input value temporarily for better UX
    const inputValue = event.target.value;

    let newSubtotal = 0
    const newItems = quoteState.items.map((item: QuoteItem) => {
      if (item.id === itemId) {
        // If input is empty, allow it temporarily
        if (inputValue === '') {
          // For calculation purposes, use 1 as minimum quantity but allow empty display
          newSubtotal += item.sellingPrice * 1;

          return {
            ...item,
            quantity: inputValue as any, // Allow empty string in the input
            _tempEmptyInput: true, // Flag to indicate temporary empty state
          };
        }

        // If input contains only digits, parse it
        let quantity = !new RegExp(/[^\d]/g).test(inputValue) && inputValue
          ? parseInt(inputValue, 10)
          : 1;

        // Enforce minimum of 1 for calculation
        if (quantity <= 0) {
          quantity = 1;
        }

        newSubtotal += item.sellingPrice * quantity;

        return {
          ...item,
          quantity,
          _tempEmptyInput: false,
        };
      }

      // For items not being edited, use their current quantity
      const effectiveQuantity = item._tempEmptyInput ? 1 : item.quantity;
      newSubtotal += item.sellingPrice * effectiveQuantity;

      return item;
    });

    setUpdatingSubtotal(newSubtotal);
    setQuoteState({
      ...quoteState,
      items: newItems,
      subtotal: newSubtotal,
    });
  }

  // Add a handler for when the quantity field loses focus
  const handleQuantityBlur: (id: string) => FocusEventHandler<HTMLInputElement> = (itemId) => (event) => {
    // When focus is lost, enforce minimum quantity of 1
    let newSubtotal = 0;
    const newItems = quoteState.items.map((item: QuoteItem) => {
      if (item.id === itemId) {
        // If the input was temporarily empty or less than 1, set it to 1
        const value = item._tempEmptyInput || item.quantity <= 0 ? 1 : item.quantity;

        newSubtotal += item.sellingPrice * value;

        return {
          ...item,
          quantity: value,
          _tempEmptyInput: false,
        };
      }

      newSubtotal += item.sellingPrice * item.quantity;
      return item;
    });

    setUpdatingSubtotal(newSubtotal);
    setQuoteState({
      ...quoteState,
      items: newItems,
      subtotal: newSubtotal,
    });
  }



  // Start editing mode
  const handleStartEditing = () => {
    setIsEditing(true)
  }

  // Cancel editing and reset changes
  const handleCancelEditing = () => {
    // Reset quote state to original data
    if (data?.GetQuoteById) {
      setQuoteState(data.GetQuoteById)

      // Reset subtotals
      const subtotal = data.GetQuoteById.items.reduce(
        (sum: number, item: QuoteItem) => sum + (item.sellingPrice || item.price || 0) * item.quantity,
        0
      )
      setUpdatingSubtotal(subtotal)
    }

    setIsEditing(false)
  }

  // Handle expiration date change
  const handleExpirationDateChange = (date: Date) => {
    setExpirationDate(date)
  }

  // Save price changes
  const handleSavePriceChanges = () => {
    if (!quoteState) return

    // Check if any items have errors
    const hasErrors = quoteState.items.some((item: QuoteItem) => item.error)
    if (hasErrors) {
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.price-error',
          defaultMessage: 'One or more items have invalid prices. Please check the highlighted fields.'
        }),
        duration: 5000
      })
      return
    }

    setIsSaving(true)

    // Update the quote with new prices
    updateQuote({
      variables: {
        id: params?.id,
        items: quoteState.items,
        subtotal: updatingSubtotal / 100, // Convert to dollars
        expirationDate: expirationDate ? expirationDate.toISOString() : undefined
      }
    })
    .then(response => {
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.prices-updated',
          defaultMessage: 'Quote prices have been updated successfully'
        }),
        duration: 5000
      })
      setIsEditing(false)
      setIsSaving(false)
      refetch() // Reload quote data to get the latest state
    })
    .catch(error => {
      console.error("Error updating prices:", error)
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.update-error',
          defaultMessage: 'Error updating prices. Please try again.'
        }),
        duration: 5000
      })
      setIsSaving(false)
    })
  }

  // Reject quote
  const handleRejectQuote = () => {
    updateQuote({
      variables: {
        id: params?.id,
        decline: true
      }
    })
    .then(response => {
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.quote-rejected',
          defaultMessage: 'Quote has been rejected'
        }),
        duration: 5000
      })
      navigate({
        to: '/admin/app/example'
      })
    })
    .catch(error => {
      console.error("Error rejecting quote:", error)
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.update-error',
          defaultMessage: 'Error rejecting quote. Please try again.'
        }),
        duration: 5000
      })
    })
  }

  console.log("quote",quote)

  // Send quote to admin
  const handleSendToAdmin = () => {
    updateAssignee({
      variables: {
        assignedTo: 'admin',
        assigneeId: 'royalcyber',
        documentId: params?.id,
      },
    })
    .then(response => {
      console.log("Update successful:", response)
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.quote-sent',
          defaultMessage: 'Quote has been sent to admin'
        }),
        duration: 5000
      })
      // Redirect to listing page after successful mutation
      navigate({
        to: '/admin/app/example'
      })
    })
    .catch(error => {
      console.error("Error updating assignee:", error)
      showToast({
        message: formatMessage({
          id: 'seller-quote-app.update-error',
          defaultMessage: 'Error sending quote to admin. Please try again.'
        }),
        duration: 5000
      })
    })
  }

  const quoteContent = (
    <div className="ph6 pv5">
      <div className="flex justify-between items-center mb5">
        <h2 className="t-heading-3 ma0">{(quoteState || quote).referenceName || 'Quote Details'}</h2>
        <div className="flex">
          {isEditing ? (
            <>
              <Button
                variation="primary"
                onClick={handleSavePriceChanges}
                isLoading={isSaving}
                disabled={isSaving}
                className="mr3"
              >
                <FormattedMessage id="seller-quote-app.save-changes" defaultMessage="SAVE CHANGES" />
              </Button>
              <Button
                variation="tertiary"
                onClick={handleCancelEditing}
                disabled={isSaving}
                className="mr3"
              >
                <FormattedMessage id="seller-quote-app.cancel" defaultMessage="CANCEL" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variation="primary"
                onClick={handleStartEditing}
                className="mr3"
              >
                <FormattedMessage id="seller-quote-app.edit-prices" defaultMessage="EDIT PRICES" />
              </Button>
              <Button
                variation="secondary"
                onClick={handleSendToAdmin}
                className="mr3"
              >
                <FormattedMessage id="seller-quote-app.send-quote-to-admin" defaultMessage="SEND QUOTE TO ADMIN" />
              </Button>
              <Button
                variation="danger"
                onClick={handleRejectQuote}
                className="mr3"
              >
                <FormattedMessage id="seller-quote-app.reject" defaultMessage="REJECT" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb5">
        <div className="ba br2 b--light-gray mb5">
          <table className="w-100 collapse">
            <tbody>
              <tr className="striped--light-gray">
                <td className="pa3 w-20 fw6">
                  <FormattedMessage id="seller-quote-app.original-subtotal" defaultMessage="Original Subtotal" />
                </td>
                <td className="pa3 w-20 fw6">
                  <FormattedMessage id="seller-quote-app.discount-amount" defaultMessage="Percentage Discount" />
                </td>
                <td className="pa3 w-20 fw6">
                  <FormattedMessage id="seller-quote-app.quoted-subtotal" defaultMessage="Quoted Subtotal" />
                </td>
                <td className="pa3 w-20 fw6">
                  <FormattedMessage id="seller-quote-app.expiration-date" defaultMessage="Expiration Date" />
                </td>
                <td className="pa3 w-20 fw6">
                  <FormattedMessage id="seller-quote-app.status" defaultMessage="Status" />
                </td>
              </tr>
              <tr className="striped--light-gray">
                <td className="pa3">${(updatingSubtotal / 100)?.toFixed(2)}</td>
                <td className="pa3">${ updatingSubtotal && originalSubtotal ? `${Math.round(100 - (updatingSubtotal / originalSubtotal) * 100)}%`: `0%`}</td>
                <td className="pa3">${(originalSubtotal / 100)?.toFixed(2) || '0.00'}</td>
                <td className="pa3">{formatDate(quote.expirationDate)}</td>
                <td className="pa3">{renderStatusTag(quote.status || 'Ready')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb5">
        <h3 className="t-heading-4 mb3">
          <FormattedMessage id="seller-quote-app.items" defaultMessage="Items" />
        </h3>
        <QuoteTable
          items={quoteState?.items}
          isEditable={isEditing}
          onUpdateSellingPrice={handleUpdateSellingPrice}
          currencyCode={currencyCode}
          locale={locale}
          formatPrice={formatPrice}
          onUpdateQuantity={handleUpdateQuantity}
          onBlurQuantity={handleQuantityBlur}
          maxDiscountPercentage={MAX_DISCOUNT_PERCENTAGE}
          originalSubtotal={originalSubtotal}
          updatingSubtotal={updatingSubtotal}
          expirationDate={quote.expirationDate}
          status={quote.status}
        />
      </div>

      <div className="mb5">
        <h3 className="t-heading-4 mb3">
          <FormattedMessage id="seller-quote-app.change-expiration-date" defaultMessage="Change Expiration Date" />
        </h3>
        <div className="pa5 ba br2 b--light-gray">
          <DatePicker
            label={formatMessage({
              id: 'seller-quote-app.expiration-date',
              defaultMessage: 'Expiration Date'
            })}
            locale="en-US"
            value={expirationDate || (quote.expirationDate ? new Date(quote.expirationDate) : new Date())}
            onChange={handleExpirationDateChange}
          />
        </div>
      </div>

      {quote.updateHistory && quote.updateHistory.length > 0 && (
        <div className="mb5">
          <h3 className="t-heading-4 mb3">
            <FormattedMessage id="seller-quote-app.update-history" defaultMessage="Update History" />
          </h3>
          <div className="pa5 ba br2 b--light-gray">
            <table className="w-100 collapse">
              <thead>
                <tr className="striped--light-gray">
                  <th className="pa3 tl">
                    <FormattedMessage id="seller-quote-app.date" defaultMessage="Date" />
                  </th>
                  <th className="pa3 tl">
                    <FormattedMessage id="seller-quote-app.user" defaultMessage="User" />
                  </th>
                  <th className="pa3 tl">
                    <FormattedMessage id="seller-quote-app.role" defaultMessage="Role" />
                  </th>
                  <th className="pa3 tl">
                    <FormattedMessage id="seller-quote-app.status" defaultMessage="Status" />
                  </th>
                  <th className="pa3 tl">
                    <FormattedMessage id="seller-quote-app.note" defaultMessage="Note" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {quote.updateHistory.map((update: any, index: number) => (
                  <tr key={index} className="striped--light-gray">
                    <td className="pa3">{formatDate(update.date)}</td>
                    <td className="pa3">{update.email}</td>
                    <td className="pa3">{update.role}</td>
                    <td className="pa3">{update.status}</td>
                    <td className="pa3">{update.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return standalone ? (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="seller-quote-app.quote-details" defaultMessage="Quote Details" />}
          linkLabel={<FormattedMessage id="seller-quote-app.back" defaultMessage="BACK" />}
          onLinkClick={() => navigate({ to: '/admin/app/example' })}
        />
      }
    >
      <PageBlock variation="full">
        {quoteContent}
      </PageBlock>
    </Layout>
  ) : quoteContent;
}

export default QuoteDetails
