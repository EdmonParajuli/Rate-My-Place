import { buildSubgraphSchema } from '@apollo/subgraph';
import { authResolvers, placeResolver, sessionResolver, categoryResolver, reviewResolver, reviewReplyResolver, reviewVoteResolver, savedPlaceResolver, badgeResolver, notificationResolver, mediaResolver, platformStatsResolver, businessDashboardResolver, reviewQrCodeResolver } from '../resolvers';
import { authTypedefs, placeDefs, sessionTypedefs, categoryTypedefs, reviewTypedefs, reviewReplyTypedefs, reviewVoteTypedefs, savedPlaceTypedefs, badgeTypedefs, notificationTypedefs, mediaTypedefs, commonTypedefs, platformStatsTypedefs, businessDashboardTypedefs, reviewQrCodeTypedefs } from '../typeDefs';
export const schema = buildSubgraphSchema([
    {typeDefs: authTypedefs, resolvers: authResolvers},
    {typeDefs: placeDefs, resolvers: placeResolver},
    {typeDefs: sessionTypedefs, resolvers: sessionResolver},
    {typeDefs: categoryTypedefs, resolvers: categoryResolver},
    {typeDefs: reviewTypedefs, resolvers: reviewResolver},
    {typeDefs: reviewReplyTypedefs, resolvers: reviewReplyResolver},
    {typeDefs: reviewVoteTypedefs, resolvers: reviewVoteResolver},
    {typeDefs: savedPlaceTypedefs, resolvers: savedPlaceResolver},
    {typeDefs: badgeTypedefs, resolvers: badgeResolver},
    {typeDefs: notificationTypedefs, resolvers: notificationResolver},
    {typeDefs: mediaTypedefs, resolvers: mediaResolver},
    {typeDefs: commonTypedefs, resolvers: {}},
    {typeDefs: platformStatsTypedefs, resolvers: platformStatsResolver},
    {typeDefs: businessDashboardTypedefs, resolvers: businessDashboardResolver},
    {typeDefs: reviewQrCodeTypedefs, resolvers: reviewQrCodeResolver}
])
