import {
  Service,
  ServiceContext,
  ParamsContext,
  RecorderState,
  
} from "@vtex/api";
import { Clients } from "./clients";
import { GetQuotes, GetQuoteById, UpdateAssignee } from "./resolvers/quotes";

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.

declare global {
  type Context = ServiceContext<Clients, State>;

  interface State extends RecorderState {
    code: number;
  }
}

const THREE_SECONDS_MS = 3 * 1000;
const CONCURRENCY = 10;

export default new Service<Clients, State, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
        timeout: 10000,
      },
      events: {
        exponentialTimeoutCoefficient: 2,
        exponentialBackoffCoefficient: 2,
        initialBackoffDelay: 50,
        retries: 1,
        timeout: THREE_SECONDS_MS,
        concurrency: CONCURRENCY,
      },
    },
  },
    
  graphql: {
    resolvers: {
      Query: {
        GetQuotes,
        GetQuoteById,
      },
      Mutation: {
        UpdateAssignee,
      },
    },
  },
});
