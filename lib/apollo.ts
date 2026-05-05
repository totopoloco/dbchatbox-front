import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8080/graphql',
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Member: { keyFields: ['id'] },
      Session: { keyFields: ['id'] },
      Trainer: { keyFields: ['id'] },
      TrainerLog: { keyFields: ['id'] },
      MemberSubscription: { keyFields: ['id'] },
      MembershipType: { keyFields: ['id'] },
      SessionOccurrence: { keyFields: ['id'] },
      Payment: { keyFields: ['id'] },
      PaymentDocument: { keyFields: ['id'] },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only' },
    mutate: { fetchPolicy: 'network-only' },
  },
});
