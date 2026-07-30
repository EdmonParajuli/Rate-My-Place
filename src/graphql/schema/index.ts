import { buildSubgraphSchema } from '@apollo/subgraph';
import { authResolvers, placeResolver, sessionResolver, categoryResolver, reviewResolver, reviewReplyResolver, reviewVoteResolver } from '../resolvers';
import { authTypedefs, placeDefs, sessionTypedefs, categoryTypedefs, reviewTypedefs, reviewReplyTypedefs, reviewVoteTypedefs, commonTypedefs } from '../typeDefs';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers},
    {typeDefs: placeDefs, resolvers: placeResolver},
    {typeDefs: sessionTypedefs, resolvers: sessionResolver},
    {typeDefs: categoryTypedefs, resolvers: categoryResolver},
    {typeDefs: reviewTypedefs, resolvers: reviewResolver},
    {typeDefs: reviewReplyTypedefs, resolvers: reviewReplyResolver},
    {typeDefs: reviewVoteTypedefs, resolvers: reviewVoteResolver},
    {typeDefs: commonTypedefs, resolvers: {}}
])
