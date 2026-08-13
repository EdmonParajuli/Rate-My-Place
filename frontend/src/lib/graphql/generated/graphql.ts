import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  _Any: { input: any; output: any; }
  _FieldSet: { input: any; output: any; }
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
  category?: Maybe<Category>;
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
  trendingScore?: Maybe<Scalars['Float']['output']>;
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

export type SignUpResponse = {
  __typename?: 'SignUpResponse';
  data?: Maybe<UserData>;
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

export type LoginMutationVariables = Exact<{
  input?: InputMaybe<InputAuthLogin>;
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'LoginResponse', message?: string | null, data?: { __typename?: 'UserData', token?: { __typename?: 'LoginToken', access?: string | null, refresh?: string | null } | null, user?: { __typename?: 'User', id?: number | null, email?: string | null, fullName?: string | null, userType?: UserTypeEnum | null, profilePicture?: string | null } | null } | null } | null };

export type SignUpMutationVariables = Exact<{
  input?: InputMaybe<InputAuthSignUp>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp?: { __typename?: 'SignUpResponse', message?: string | null, data?: { __typename?: 'UserData', token?: { __typename?: 'LoginToken', access?: string | null, refresh?: string | null } | null, user?: { __typename?: 'User', id?: number | null, email?: string | null, fullName?: string | null, userType?: UserTypeEnum | null, profilePicture?: string | null } | null } | null } | null };

export type SignUpBusinessMutationVariables = Exact<{
  input?: InputMaybe<InputSignUpBusiness>;
}>;


export type SignUpBusinessMutation = { __typename?: 'Mutation', signUpBusiness?: { __typename?: 'SignUpBusinessResponse', message?: string | null, data?: { __typename?: 'SignUpBusinessData', token?: { __typename?: 'LoginToken', access?: string | null, refresh?: string | null } | null, user?: { __typename?: 'User', id?: number | null, email?: string | null, fullName?: string | null, userType?: UserTypeEnum | null, profilePicture?: string | null } | null } | null } | null };

export type AuthMeUserQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthMeUserQuery = { __typename?: 'Query', authMeUser?: { __typename?: 'authMeUserResponse', data?: { __typename?: 'User', id?: number | null, email?: string | null, fullName?: string | null, userType?: UserTypeEnum | null, profilePicture?: string | null } | null } | null };

export type SignOutMutationVariables = Exact<{
  input?: InputMaybe<InputRefreshToken>;
}>;


export type SignOutMutation = { __typename?: 'Mutation', signOut?: { __typename?: 'Message', message?: string | null } | null };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories?: { __typename?: 'CategoryListResponse', data?: Array<{ __typename?: 'Category', id?: number | null, label?: string | null } | null> | null } | null };

export type ListPlacesQueryVariables = Exact<{
  sort?: InputMaybe<PlaceSortEnum>;
  near?: InputMaybe<GeoInput>;
  filter?: InputMaybe<PlaceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type ListPlacesQuery = { __typename?: 'Query', listPlaces?: { __typename?: 'PlaceListResponse', message?: string | null, data?: Array<{ __typename?: 'Place', id?: number | null, label?: string | null, address?: string | null, priceRange?: PriceRangeEnum | null, averageRating?: number | null, reviewCount?: number | null, isVerified?: boolean | null, trendingScore?: number | null, latitude?: number | null, longitude?: number | null, distance?: number | null, openNow?: boolean | null, category?: { __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null } | null } | null> | null, pageInfo?: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } | null } | null };

export type PlatformStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformStatsQuery = { __typename?: 'Query', platformStats?: { __typename?: 'PlatformStatsResponse', data?: { __typename?: 'PlatformStats', totalPlaces?: number | null, totalReviews?: number | null } | null } | null };

export type RefreshAccessTokenMutationVariables = Exact<{
  input: InputRefreshAccessToken;
}>;


export type RefreshAccessTokenMutation = { __typename?: 'Mutation', refreshAccessToken?: { __typename?: 'RefreshTokenResponse', data?: { __typename?: 'LoginToken', access?: string | null, refresh?: string | null } | null } | null };


export const LoginDocument = gql`
    mutation Login($input: InputAuthLogin) {
  login(input: $input) {
    message
    data {
      token {
        access
        refresh
      }
      user {
        id
        email
        fullName
        userType
        profilePicture
      }
    }
  }
}
    `;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export const SignUpDocument = gql`
    mutation SignUp($input: InputAuthSignUp) {
  signUp(input: $input) {
    message
    data {
      token {
        access
        refresh
      }
      user {
        id
        email
        fullName
        userType
        profilePicture
      }
    }
  }
}
    `;

/**
 * __useSignUpMutation__
 *
 * To run a mutation, you first call `useSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpMutation, { data, loading, error }] = useSignUpMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignUpMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SignUpMutation, SignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument, options);
      }
export type SignUpMutationHookResult = ReturnType<typeof useSignUpMutation>;
export type SignUpMutationResult = ApolloReactCommon.MutationResult<SignUpMutation>;
export const SignUpBusinessDocument = gql`
    mutation SignUpBusiness($input: InputSignUpBusiness) {
  signUpBusiness(input: $input) {
    message
    data {
      token {
        access
        refresh
      }
      user {
        id
        email
        fullName
        userType
        profilePicture
      }
    }
  }
}
    `;

/**
 * __useSignUpBusinessMutation__
 *
 * To run a mutation, you first call `useSignUpBusinessMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpBusinessMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpBusinessMutation, { data, loading, error }] = useSignUpBusinessMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignUpBusinessMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SignUpBusinessMutation, SignUpBusinessMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SignUpBusinessMutation, SignUpBusinessMutationVariables>(SignUpBusinessDocument, options);
      }
export type SignUpBusinessMutationHookResult = ReturnType<typeof useSignUpBusinessMutation>;
export type SignUpBusinessMutationResult = ApolloReactCommon.MutationResult<SignUpBusinessMutation>;
export const AuthMeUserDocument = gql`
    query AuthMeUser {
  authMeUser {
    data {
      id
      email
      fullName
      userType
      profilePicture
    }
  }
}
    `;

/**
 * __useAuthMeUserQuery__
 *
 * To run a query within a React component, call `useAuthMeUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthMeUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthMeUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuthMeUserQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options);
      }
export function useAuthMeUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options);
        }
// @ts-ignore
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AuthMeUserQuery, AuthMeUserQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-suspense-overloads.mjs
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AuthMeUserQuery | undefined, AuthMeUserQueryVariables>;
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options);
        }
export type AuthMeUserQueryHookResult = ReturnType<typeof useAuthMeUserQuery>;
export type AuthMeUserLazyQueryHookResult = ReturnType<typeof useAuthMeUserLazyQuery>;
export type AuthMeUserSuspenseQueryHookResult = ReturnType<typeof useAuthMeUserSuspenseQuery>;
export type AuthMeUserQueryResult = ApolloReactCommon.QueryResult<AuthMeUserQuery, AuthMeUserQueryVariables>;
export const SignOutDocument = gql`
    mutation SignOut($input: InputRefreshToken) {
  signOut(input: $input) {
    message
  }
}
    `;

/**
 * __useSignOutMutation__
 *
 * To run a mutation, you first call `useSignOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signOutMutation, { data, loading, error }] = useSignOutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignOutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SignOutMutation, SignOutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SignOutMutation, SignOutMutationVariables>(SignOutDocument, options);
      }
export type SignOutMutationHookResult = ReturnType<typeof useSignOutMutation>;
export type SignOutMutationResult = ApolloReactCommon.MutationResult<SignOutMutation>;
export const CategoriesDocument = gql`
    query Categories {
  categories {
    data {
      id
      label
    }
  }
}
    `;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCategoriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
      }
export function useCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
// @ts-ignore
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoriesQuery, CategoriesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-suspense-overloads.mjs
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoriesQuery | undefined, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
export type CategoriesQueryResult = ApolloReactCommon.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const ListPlacesDocument = gql`
    query ListPlaces($sort: PlaceSortEnum, $near: GeoInput, $filter: PlaceFilterInput, $first: Int, $after: String) {
  listPlaces(
    sort: $sort
    near: $near
    filter: $filter
    first: $first
    after: $after
  ) {
    message
    data {
      id
      label
      address
      priceRange
      averageRating
      reviewCount
      isVerified
      trendingScore
      latitude
      longitude
      distance
      openNow
      category {
        id
        label
        icon
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useListPlacesQuery__
 *
 * To run a query within a React component, call `useListPlacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPlacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPlacesQuery({
 *   variables: {
 *      sort: // value for 'sort'
 *      near: // value for 'near'
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useListPlacesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options);
      }
export function useListPlacesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options);
        }
// @ts-ignore
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ListPlacesQuery, ListPlacesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-suspense-overloads.mjs
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ListPlacesQuery | undefined, ListPlacesQueryVariables>;
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options);
        }
export type ListPlacesQueryHookResult = ReturnType<typeof useListPlacesQuery>;
export type ListPlacesLazyQueryHookResult = ReturnType<typeof useListPlacesLazyQuery>;
export type ListPlacesSuspenseQueryHookResult = ReturnType<typeof useListPlacesSuspenseQuery>;
export type ListPlacesQueryResult = ApolloReactCommon.QueryResult<ListPlacesQuery, ListPlacesQueryVariables>;
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
export const RefreshAccessTokenDocument = gql`
    mutation RefreshAccessToken($input: InputRefreshAccessToken!) {
  refreshAccessToken(input: $input) {
    data {
      access
      refresh
    }
  }
}
    `;

/**
 * __useRefreshAccessTokenMutation__
 *
 * To run a mutation, you first call `useRefreshAccessTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshAccessTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshAccessTokenMutation, { data, loading, error }] = useRefreshAccessTokenMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRefreshAccessTokenMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>(RefreshAccessTokenDocument, options);
      }
export type RefreshAccessTokenMutationHookResult = ReturnType<typeof useRefreshAccessTokenMutation>;
export type RefreshAccessTokenMutationResult = ApolloReactCommon.MutationResult<RefreshAccessTokenMutation>;