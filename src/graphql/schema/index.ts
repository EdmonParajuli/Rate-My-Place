import { buildSubgraphSchema } from '@apollo/subgraph';
import { authResolvers, placeResolver } from '../resolvers';
import { authTypedefs, placeDefs } from '../typeDefs';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers},
    {typeDefs: placeDefs, resolvers: placeResolver}
])
