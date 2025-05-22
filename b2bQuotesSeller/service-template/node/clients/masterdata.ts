import { ExternalClient, InstanceOptions, IOContext } from "@vtex/api";

export default class MasterDataClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://royalcyber.vtexcommercestable.com.br/api/dataentities/`,
      context,
      {
        ...options,
        headers: {
          "X-VTEX-API-AppKey": "vtexappkey-royalcyber-SWNKYK",
          "X-VTEX-API-AppToken":
            "ECLJKTHLDICPOGJHEHJHHKJKURCYSYHLSFLZSVDMDLRITTEUBXWIATSIAVQAHGNLGDGZRHUCZHIKWCEAMNWUILOBQHWNTRDASMSCVHFQIHUMGFLUTBLJPXONHSAQPDEE",
        },
      }
    );
  }

  public async getQuotes(): Promise<any> {
    let queryParams = "_fields=_all&_size=10";
    return this.http.get(`quotes/search?${queryParams}`);
  }

  public async getQuotesBySeller(sellerId?: string): Promise<any> {
    return this.http.get("quotes/scroll?_size=10&_fields=_all");
  }

  public async getAssigneeQuotes(assignedId: string): Promise<any> {
    return this.http.get(`quotes/search?_fields=_all&_where=assigneeId=${assignedId}&_schema=v1.4`);
  }

  public async getQuotesById(quoteId: string): Promise<any> {
    return this.http.get(`quotes/search?_fields=_all&id=${quoteId}&_schema=v1.4`);
  }

  public async updatePartialDocument({
    dataEntity,
    id,
    fields,
    schema = ''
  }: {
    dataEntity: string;
    id: string;
    fields: Record<string, any>;
    schema?: string;
  }): Promise<any> {
    const schemaParam = schema ? `?_schema=${schema}` : '';
    
    return this.http.patch(
      `${dataEntity}/documents/${id}${schemaParam}`,
      fields,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  }
}
