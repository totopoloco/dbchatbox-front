import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { getAccessToken } from './auth-context';

const httpLink = new HttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
