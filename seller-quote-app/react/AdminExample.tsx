import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Table,
  Tag,
} from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { useQuery } from 'react-apollo'

import { GetQuotes } from './graphql/GetQuotes.graphql'
import './styles.global.css'

const AdminExample: FC = () => {
  const runtime = useRuntime()

  console.log(runtime.account)
  const variables = {
    account: runtime.account
  }

  const { data, loading, error, refetch } = useQuery(GetQuotes, {
    variables,
    fetchPolicy: 'network-only'
  })

  // Check if we're returning from detail page and refetch data
  React.useEffect(() => {
    // This will run when the component mounts or is revisited
    refetch();
  }, [refetch]);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  // console.log(data)

  // const filteredQuotes = data?.GetQuotes ? data.GetQuotes.filter((quote: any) => 
  //   quote.assignedTo === 'seller' && quote.assigneeId === runtime.account
  // ) : [];

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const schema = {
    properties: {
      referenceName: {
        title: 'Ref. Name',
        width: 200,
      },
      subtotal: {
        title: 'Subtotal',
        width: 150,
        cellRenderer: ({ cellData }: any) => {
          return `$${cellData.toFixed(2)}`
        },
      },
      creatorEmail: {
        title: 'Created by',
        // width: 150,
      },
      creationDate: {
        title: 'Created on',
        // width: 100,
        cellRenderer: ({ cellData }: any) => {
          return formatDate(cellData)
        },
      },
      expirationDate: {
        title: 'Expiration Date',
        // width: 120,
        cellRenderer: ({ cellData }: any) => {
          return formatDate(cellData)
        },
      },
      status: {
        title: 'Status',
        // width: 100,
        cellRenderer: ({ cellData }: any) => {
          let bgColor = "#8bc34a";

          if (cellData.toLowerCase() === "declined") {
            bgColor = "#ff4c4c";
          } else if (cellData.toLowerCase() === "pending") {
            bgColor = "#ffb100";
          } else if (cellData.toLowerCase() === "ready") {
            bgColor = "#8bc34a";
          }
          return (
            <Tag bgColor={bgColor} color="#ffffff">
              {cellData.charAt(0).toUpperCase() + cellData.slice(1)}
            </Tag>
          )
        },
      },
      lastUpdate: {
        title: 'Last Update',
        // width: 100,
        cellRenderer: ({ cellData }: any) => {
          return formatDate(cellData)
        },
      },
      accountName: {
        title: 'Organization',
        // width: 120,
        cellRenderer: ({ rowData }: any) => {
          return rowData.accountName || 'My Org'
        },
      },
      costCenter: {
        title: 'Cost Center',
        // width: 100,
        cellRenderer: () => {
          return '1'
        },
      },
    },
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin-example.hello-world" />}
        />
      }
      fullWidth
    >
      <PageBlock variation="full">
        <div className="mb-5">
          {data && data.GetQuotes && (
            <Table
              schema={schema}
              items={data?.GetQuotes}
              density="low"
              fullWidth
              onRowClick={({ rowData }) => {
                console.log('Row clicked:', rowData);
                if (rowData && rowData.id) {
                  console.log('Navigating to quote:', rowData.id);
                  runtime.navigate({
                    to: `/admin/app/example/${rowData.id}`,
                  });
                } else {
                  console.error('Missing rowData.id for navigation');
                }
              }}
            />
          )}
        </div>
      </PageBlock>
    </Layout>
  )
}

export default AdminExample
