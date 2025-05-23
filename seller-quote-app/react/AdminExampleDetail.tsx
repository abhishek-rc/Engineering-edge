import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import QuoteDetails from './QuoteDetails'
import './styles.global.css'

const AdminExampleDetail: FC<Props> = ({ params }) => {
  const runtime = useRuntime()
  
  return (
    <Layout
      pageHeader={
        <PageHeader 
          title={<FormattedMessage id="admin-example.details" defaultMessage="Quote Details" />}
          linkLabel={<FormattedMessage id="admin-example.back" defaultMessage="BACK" />}
          onLinkClick={() => runtime.navigate({ to: '/admin/app/example' })}
        />
      }
    >
      <PageBlock variation="full">
        <QuoteDetails params={params} standalone={false} />
      </PageBlock>
    </Layout>
  )
}

interface Props {
  params: any
}

export default AdminExampleDetail
