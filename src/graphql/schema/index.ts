import { buildSubgraphSchema } from '@apollo/subgraph';
import { authResolvers, placeResolver, sessionResolver, categoryResolver, reviewResolver } from '../resolvers';
import { authTypedefs, placeDefs, sessionTypedefs, categoryTypedefs, reviewTypedefs, commonTypedefs } from '../typeDefs';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers},
    {typeDefs: placeDefs, resolvers: placeResolver},
    {typeDefs: sessionTypedefs, resolvers: sessionResolver},
    {typeDefs: categoryTypedefs, resolvers: categoryResolver},
    {typeDefs: reviewTypedefs, resolvers: reviewResolver},
    {typeDefs: commonTypedefs, resolvers: {}}
])
