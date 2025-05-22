import readFile from '../utils/readFile'

const MESSAGE_BODY = readFile('../assets/quoteCreated.html')

export const quoteCreatedMessage = {
  FriendlyName: 'Quote Created',
  IsDefaultTemplate: false,
  IsPersisted: true,
  IsRemoved: false,
  Name: 'quote-created',
  // Description: null,
  // AccountId: null,
  // AccountName: null,
  // ApplicationId: null,
  Templates: {
    email: {
      // CC: null,
      // BCC: null,
      IsActive: true,
      Message: MESSAGE_BODY,
      ProviderId: '00000000-0000-0000-0000-000000000000',
      Subject: '[{{quote.organization}}] Request for Quotation',
      To: '{{message.to}}',
      Type: 'E',
      // ProviderName: null,
      withError: false,
    },
    sms: {
      IsActive: false,
      Parameters: [],
      Type: 'S',
      // ProviderId: null,
      // ProviderName: null,
      withError: false,
    },
  },
  Type: '',
}
