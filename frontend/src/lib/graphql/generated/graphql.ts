/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  _Any: { input: unknown; output: unknown; }
  _FieldSet: { input: unknown; output: unknown; }
};

export type ActiveSessionsResponse = {
  __typename?: 'ActiveSessionsResponse';
  data?: Maybe<Array<Maybe<Session>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type AuthMeResponse = {
  __typename?: 'AuthMeResponse';
  data?: Maybe<User>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Category = {
  __typename?: 'Category';
  avgRating?: Maybe<Scalars['Float']['output']>;
  businessCount?: Maybe<Scalars['Int']['output']>;
  coverImageUrl?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  label?: Maybe<Scalars['String']['output']>;
};

export type CategoryListResponse = {
  __typename?: 'CategoryListResponse';
  data?: Maybe<Array<Maybe<Category>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  data?: Maybe<Category>;
  message?: Maybe<Scalars['String']['output']>;
};

export type GeoInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type InputAuthLogin = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type InputAuthSignUp = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  userType?: InputMaybe<UserTypeEnum>;
};

export type InputChangePassword = {
  confirmNewPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  previousPassword: Scalars['String']['input'];
  refreshToken?: InputMaybe<Scalars['String']['input']>;
};

export type InputConfirmForgotPassword = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
};

export type InputForgotPassword = {
  email: Scalars['String']['input'];
};

export type InputPlace = {
  address?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  priceRange?: InputMaybe<PriceRangeEnum>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type InputPlaceHour = {
  closesAt: Scalars['String']['input'];
  dayOfWeek: Scalars['Int']['input'];
  opensAt: Scalars['String']['input'];
};

export type InputRefreshAccessToken = {
  refreshToken: Scalars['String']['input'];
};

export type InputRefreshToken = {
  refreshToken: Scalars['String']['input'];
};

export type InputReview = {
  rating: Scalars['Int']['input'];
  review: Scalars['String']['input'];
};

export type InputReviewReply = {
  description: Scalars['String']['input'];
};

export type InputSignUpBusiness = {
  address?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  priceRange?: InputMaybe<PriceRangeEnum>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateReview = {
  rating?: InputMaybe<Scalars['Int']['input']>;
  review?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateReviewReply = {
  description: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  data?: Maybe<UserData>;
  message?: Maybe<Scalars['String']['output']>;
};

export type LoginToken = {
  __typename?: 'LoginToken';
  access?: Maybe<Scalars['String']['output']>;
  refresh?: Maybe<Scalars['String']['output']>;
};

export type Message = {
  __typename?: 'Message';
  message?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword?: Maybe<Message>;
  confirmForgotPassword?: Maybe<Message>;
  createPlace?: Maybe<PlaceResponse>;
  createReview?: Maybe<ReviewResponse>;
  createReviewReply?: Maybe<ReviewReplyResponse>;
  deletePlace?: Maybe<Message>;
  deleteReview?: Maybe<Message>;
  deleteReviewReply?: Maybe<Message>;
  forgotPassword?: Maybe<Message>;
  login?: Maybe<LoginResponse>;
  refreshAccessToken?: Maybe<RefreshTokenResponse>;
  revokeSession?: Maybe<Message>;
  setPlaceHours?: Maybe<PlaceHoursResponse>;
  signOut?: Maybe<Message>;
  signUp?: Maybe<SignUpResponse>;
  signUpBusiness?: Maybe<SignUpBusinessResponse>;
  toggleHelpfulVote?: Maybe<ToggleHelpfulVoteResponse>;
  updatePlace?: Maybe<PlaceResponse>;
  updateReview?: Maybe<ReviewResponse>;
  updateReviewReply?: Maybe<ReviewReplyResponse>;
};


export type MutationChangePasswordArgs = {
  input: InputChangePassword;
};


export type MutationConfirmForgotPasswordArgs = {
  input: InputConfirmForgotPassword;
};


export type MutationCreatePlaceArgs = {
  input?: InputMaybe<InputPlace>;
};


export type MutationCreateReviewArgs = {
  input: InputReview;
  placeId: Scalars['Int']['input'];
};


export type MutationCreateReviewReplyArgs = {
  input: InputReviewReply;
  reviewId: Scalars['Int']['input'];
};


export type MutationDeletePlaceArgs = {
  placeId: Scalars['Int']['input'];
};


export type MutationDeleteReviewArgs = {
  reviewId: Scalars['Int']['input'];
};


export type MutationDeleteReviewReplyArgs = {
  replyId: Scalars['Int']['input'];
};


export type MutationForgotPasswordArgs = {
  input: InputForgotPassword;
};


export type MutationLoginArgs = {
  input?: InputMaybe<InputAuthLogin>;
};


export type MutationRefreshAccessTokenArgs = {
  input: InputRefreshAccessToken;
};


export type MutationRevokeSessionArgs = {
  sessionId: Scalars['Int']['input'];
};


export type MutationSetPlaceHoursArgs = {
  hours: Array<InputPlaceHour>;
  placeId: Scalars['Int']['input'];
};


export type MutationSignOutArgs = {
  input?: InputMaybe<InputRefreshToken>;
};


export type MutationSignUpArgs = {
  input?: InputMaybe<InputAuthSignUp>;
};


export type MutationSignUpBusinessArgs = {
  input?: InputMaybe<InputSignUpBusiness>;
};


export type MutationToggleHelpfulVoteArgs = {
  reviewId: Scalars['Int']['input'];
};


export type MutationUpdatePlaceArgs = {
  input?: InputMaybe<InputPlace>;
  placeId: Scalars['Int']['input'];
};


export type MutationUpdateReviewArgs = {
  input: InputUpdateReview;
  reviewId: Scalars['Int']['input'];
};


export type MutationUpdateReviewReplyArgs = {
  input: InputUpdateReviewReply;
  replyId: Scalars['Int']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Place = {
  __typename?: 'Place';
  address?: Maybe<Scalars['String']['output']>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  distance?: Maybe<Scalars['Float']['output']>;
  hours?: Maybe<Array<Maybe<PlaceHour>>>;
  id?: Maybe<Scalars['Int']['output']>;
  isVerified?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  openNow?: Maybe<Scalars['Boolean']['output']>;
  owner?: Maybe<User>;
  phone?: Maybe<Scalars['String']['output']>;
  priceRange?: Maybe<PriceRangeEnum>;
  ratingBreakdown?: Maybe<Array<Maybe<RatingBreakdownEntry>>>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type PlaceFilterInput = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  minRating?: InputMaybe<Scalars['Float']['input']>;
  openNow?: InputMaybe<Scalars['Boolean']['input']>;
  priceRange?: InputMaybe<PriceRangeEnum>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type PlaceHour = {
  __typename?: 'PlaceHour';
  closesAt?: Maybe<Scalars['String']['output']>;
  dayOfWeek?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  opensAt?: Maybe<Scalars['String']['output']>;
};

export type PlaceHoursResponse = {
  __typename?: 'PlaceHoursResponse';
  data?: Maybe<Array<Maybe<PlaceHour>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type PlaceListResponse = {
  __typename?: 'PlaceListResponse';
  data?: Maybe<Array<Maybe<Place>>>;
  message?: Maybe<Scalars['String']['output']>;
  pageInfo?: Maybe<PageInfo>;
};

export type PlaceResponse = {
  __typename?: 'PlaceResponse';
  data?: Maybe<Place>;
  message?: Maybe<Scalars['String']['output']>;
};

export type PlaceSortEnum =
  | 'HIGHEST_RATED'
  | 'NEAREST'
  | 'NEW'
  | 'TRENDING';

export type PlatformStats = {
  __typename?: 'PlatformStats';
  totalPlaces?: Maybe<Scalars['Int']['output']>;
  totalReviews?: Maybe<Scalars['Int']['output']>;
};

export type PlatformStatsResponse = {
  __typename?: 'PlatformStatsResponse';
  data?: Maybe<PlatformStats>;
  message?: Maybe<Scalars['String']['output']>;
};

export type PriceRangeEnum =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type Query = {
  __typename?: 'Query';
  _service: _Service;
  activeSessions?: Maybe<ActiveSessionsResponse>;
  authMeUser?: Maybe<AuthMeUserResponse>;
  categories?: Maybe<CategoryListResponse>;
  category?: Maybe<CategoryResponse>;
  getPlaceById?: Maybe<PlaceResponse>;
  listPlaces?: Maybe<PlaceListResponse>;
  myReviews?: Maybe<ReviewListResponse>;
  placeReviews?: Maybe<ReviewListResponse>;
  platformStats?: Maybe<PlatformStatsResponse>;
};


export type QueryCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetPlaceByIdArgs = {
  id: Scalars['Int']['input'];
};


export type QueryListPlacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PlaceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  near?: InputMaybe<GeoInput>;
  sort?: InputMaybe<PlaceSortEnum>;
};


export type QueryMyReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlaceReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  placeId: Scalars['Int']['input'];
  sort?: InputMaybe<ReviewSortEnum>;
};

export type RatingBreakdownEntry = {
  __typename?: 'RatingBreakdownEntry';
  count?: Maybe<Scalars['Int']['output']>;
  stars?: Maybe<Scalars['Int']['output']>;
};

export type RefreshTokenResponse = {
  __typename?: 'RefreshTokenResponse';
  data?: Maybe<LoginToken>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Review = {
  __typename?: 'Review';
  helpfulByMe?: Maybe<Scalars['Boolean']['output']>;
  helpfulCount?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  place?: Maybe<Place>;
  placeId?: Maybe<Scalars['Int']['output']>;
  rating?: Maybe<Scalars['Int']['output']>;
  reply?: Maybe<ReviewReply>;
  review?: Maybe<Scalars['String']['output']>;
  reviewer?: Maybe<User>;
  reviewerId?: Maybe<Scalars['Int']['output']>;
};

export type ReviewListResponse = {
  __typename?: 'ReviewListResponse';
  data?: Maybe<Array<Maybe<Review>>>;
  message?: Maybe<Scalars['String']['output']>;
  pageInfo?: Maybe<PageInfo>;
};

export type ReviewReply = {
  __typename?: 'ReviewReply';
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  ownerId?: Maybe<Scalars['Int']['output']>;
  reviewId?: Maybe<Scalars['Int']['output']>;
};

export type ReviewReplyResponse = {
  __typename?: 'ReviewReplyResponse';
  data?: Maybe<ReviewReply>;
  message?: Maybe<Scalars['String']['output']>;
};

export type ReviewResponse = {
  __typename?: 'ReviewResponse';
  data?: Maybe<Review>;
  message?: Maybe<Scalars['String']['output']>;
};

export type ReviewSortEnum =
  | 'HELPFUL'
  | 'RECENT';

export type Session = {
  __typename?: 'Session';
  createdAt?: Maybe<Scalars['String']['output']>;
  deviceLabel?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  ipAddress?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['String']['output']>;
};

export type SignUpBusinessData = {
  __typename?: 'SignUpBusinessData';
  place?: Maybe<Place>;
  token?: Maybe<LoginToken>;
  user?: Maybe<User>;
};

export type SignUpBusinessResponse = {
  __typename?: 'SignUpBusinessResponse';
  data?: Maybe<SignUpBusinessData>;
  message?: Maybe<Scalars['String']['output']>;
};

export type SignUpData = {
  __typename?: 'SignUpData';
  email?: Maybe<Scalars['String']['output']>;
  userType?: Maybe<UserTypeEnum>;
};

export type SignUpResponse = {
  __typename?: 'SignUpResponse';
  data?: Maybe<SignUpData>;
  message?: Maybe<Scalars['String']['output']>;
};

export type ToggleHelpfulVoteResponse = {
  __typename?: 'ToggleHelpfulVoteResponse';
  helpfulByMe?: Maybe<Scalars['Boolean']['output']>;
  helpfulCount?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profilePicture?: Maybe<Scalars['String']['output']>;
  userType?: Maybe<UserTypeEnum>;
};

export type UserData = {
  __typename?: 'UserData';
  token?: Maybe<LoginToken>;
  user?: Maybe<User>;
};

export type UserTypeEnum =
  | 'BUSINESS'
  | 'REGULAR';

export type _Service = {
  __typename?: '_Service';
  sdl?: Maybe<Scalars['String']['output']>;
};

export type AuthMeUserResponse = {
  __typename?: 'authMeUserResponse';
  data?: Maybe<User>;
  message?: Maybe<Scalars['String']['output']>;
};

export type PlatformStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformStatsQuery = { platformStats: { data: { totalPlaces: number | null, totalReviews: number | null } | null } | null };


export const PlatformStatsDocument = gql`
    query PlatformStats {
  platformStats {
    data {
      totalPlaces
      totalReviews
    }
  }
}
    `;

/**
 * __usePlatformStatsQuery__
 *
 * To run a query within a React component, call `usePlatformStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlatformStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlatformStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlatformStatsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options);
      }
export function usePlatformStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options);
        }
// @ts-ignore
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlatformStatsQuery, PlatformStatsQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-suspense-overloads.mjs
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlatformStatsQuery | undefined, PlatformStatsQueryVariables>;
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options);
        }
export type PlatformStatsQueryHookResult = ReturnType<typeof usePlatformStatsQuery>;
export type PlatformStatsLazyQueryHookResult = ReturnType<typeof usePlatformStatsLazyQuery>;
export type PlatformStatsSuspenseQueryHookResult = ReturnType<typeof usePlatformStatsSuspenseQuery>;
export type PlatformStatsQueryResult = ApolloReactCommon.QueryResult<PlatformStatsQuery, PlatformStatsQueryVariables>;