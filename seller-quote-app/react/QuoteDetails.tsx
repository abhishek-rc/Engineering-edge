import React, { FC } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Button,
  Tag,
  DatePicker,
  Spinner,
  Alert,
  ToastContext
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { useQuery, useMutation } from 'react-apollo'

import { GetQuoteById } from './graphql/GetQuote.graphql'
import './styles.global.css'
import UPDATE_ASSIGNEE from './graphql/updateAssignee.graphql'

// Define interface for component props
interface QuoteDetailsProps {
  params?: any
  standalone?: boolean
}

const QuoteDetails: FC<QuoteDetailsProps> = (props) => {
  const {
    route: { params: runtimeParams },
    navigate,
    account
  } = useRuntime()

  // Use props.params if provided, otherwise use runtime params
  const params = props.params || runtimeParams
  const standalone = props.standalone !== false
  
  const intl = useIntl()
  const { formatMessage } = intl
//   const { showToast } = React.useContext(ToastContext)

  const [updateAssignee] = useMutation(UPDATE_ASSIGNEE)

  const quoteId = params?.id

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  // Fetch quote data
  const { data, loading, error } = useQuery(GetQuoteById, {
    variables: { quoteId },
    fetchPolicy: 'network-only',
    skip: !quoteId,
  })

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

//   const handleUseQuote = () => {
//     showToast({
//       message: formatMessage({ 
//         id: 'seller-quote-app.quote-used',
//         defaultMessage: 'Quote has been used successfully'
//       }),
//       duration: 5000
//     })
//   }

  const handleRejectQuote = () => {
    // showToast({
    //   message: formatMessage({ 
    //     id: 'seller-quote-app.quote-rejected',
    //     defaultMessage: 'Quote has been rejected'
    //   }),
    //   duration: 5000
    // })
    console.log("Quote rejected")
  }

  const handleSaveQuote = () => {
    console.log("STARTED >>>>>>>>>>>>>")
    updateAssignee({
        variables: {
          assignedTo: 'admin',
          assigneeId: 'royalcyber',
          documentId: params?.id,
        },
      })
      .then(response => {
        console.log("Update successful:", response);
        // Redirect to listing page after successful mutation
        navigate({
          to: '/admin/app/example'
        });
      })
      .catch(error => {
        console.error("Error updating assignee:", error);
      });

    console.log("ENDED >>>>>>>>>>>>>>>")
  }

  const quoteContent = (
    <div className="ph6 pv5">
      <div className="flex justify-between items-center mb5">
        <h2 className="t-heading-3 ma0">{quote.referenceName || 'Quote Details'}</h2>
        <div className="flex">
          <Button
            variation="secondary"
            onClick={handleSaveQuote}
            className="mr3 ml3"
          >
            <FormattedMessage id="seller-quote-app.send-quote-to-admin" defaultMessage="SEND QUOTE TO ADMIN" />
          </Button>
          <Button 
            variation="danger"
            onClick={handleRejectQuote}
            className="mr3 ml3"
          >
            <FormattedMessage id="seller-quote-app.reject" defaultMessage="REJECT" />
          </Button>
          {/* <Button
            variation="primary"
            onClick={handleUseQuote}
            className="mr3 ml3"
          >
            <FormattedMessage id="seller-quote-app.use-quote" defaultMessage="USE QUOTE" />
          </Button> */}
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
                  <FormattedMessage id="seller-quote-app.discount-amount" defaultMessage="Discount Amount" />
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
                <td className="pa3">${quote.subtotal?.toFixed(2) || '0.00'}</td>
                <td className="pa3">{quote.discountPercent ? `${quote.discountPercent}%` : '0%'}</td>
                <td className="pa3">${quote.finalValue?.toFixed(2) || quote.subtotal?.toFixed(2) || '0.00'}</td>
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
        <table className="w-100 collapse ba br2 b--light-gray">
          <thead>
            <tr className="striped--light-gray">
              <th className="pa3 tc">
                <FormattedMessage id="seller-quote-app.image" defaultMessage="Image" />
              </th>
              <th className="pa3 tl">
                <FormattedMessage id="seller-quote-app.sku" defaultMessage="SKU" />
              </th>
              <th className="pa3 tl">
                <FormattedMessage id="seller-quote-app.name" defaultMessage="Name" />
              </th>
              <th className="pa3 tr">
                <FormattedMessage id="seller-quote-app.list-price" defaultMessage="List Price" />
              </th>
              <th className="pa3 tr">
                <FormattedMessage id="seller-quote-app.unit-price" defaultMessage="Unit Price" />
              </th>
              <th className="pa3 tc">
                <FormattedMessage id="seller-quote-app.quantity" defaultMessage="Quantity" />
              </th>
              <th className="pa3 tr">
                <FormattedMessage id="seller-quote-app.total" defaultMessage="Total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.items && quote.items.map((item: any) => (
              <tr key={item.id} className="striped--light-gray">
                <td className="pa3">
                  <div className="h3 w3 flex-none">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-100" />
                    ) : (
                      <div className="h-100 bg-light-gray flex items-center justify-center">
                        <span className="c-muted-1">N/A</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="pa3">{item.refId || item.sku}</td>
                <td className="pa3">{item.name}</td>
                <td className="pa3 tr">${item.listPrice?.toFixed(2) || '0.00'}</td>
                <td className="pa3 tr">${item.sellingPrice?.toFixed(2) || item.price?.toFixed(2) || '0.00'}</td>
                <td className="pa3 tc">{item.quantity}</td>
                <td className="pa3 tr">${((item.sellingPrice || item.price || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
            value={quote.expirationDate ? new Date(quote.expirationDate) : new Date()}
            onChange={(date: Date) => {
              // Handle date change
              console.log('New expiration date:', date)
            }}
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
