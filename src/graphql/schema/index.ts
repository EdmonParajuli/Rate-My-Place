import { buildSubgraphSchema } from '@apollo/subgraph';
import { authTypedefs } from '../typeDefs/authTypedefs';
import { authResolvers } from '../resolvers/authResolver';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers}
])
