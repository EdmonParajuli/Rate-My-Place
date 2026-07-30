import { buildSubgraphSchema } from '@apollo/subgraph';
import { authResolvers, placeResolver, sessionResolver, categoryResolver, reviewResolver } from '../resolvers';
import { authTypedefs, placeDefs, sessionTypedefs, categoryTypedefs, reviewTypedefs } from '../typeDefs';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers},
    {typeDefs: placeDefs, resolvers: placeResolver},
    {typeDefs: sessionTypedefs, resolvers: sessionResolver},
    {typeDefs: categoryTypedefs, resolvers: categoryResolver},
    {typeDefs: reviewTypedefs, resolvers: reviewResolver}
])
