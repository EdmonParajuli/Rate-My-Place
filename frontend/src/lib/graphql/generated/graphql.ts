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

export type Badge = {
  __typename?: 'Badge';
  description?: Maybe<Scalars['String']['output']>;
  earned?: Maybe<Scalars['Boolean']['output']>;
  earnedAt?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  key?: Maybe<BadgeKeyEnum>;
  label?: Maybe<Scalars['String']['output']>;
};

export type BadgeKeyEnum =
  | 'ELITE_REVIEWER'
  | 'EXPLORER'
  | 'FIRST_REVIEW'
  | 'HELPFUL_REVIEWER'
  | 'PROLIFIC_REVIEWER';

export type BadgeListResponse = {
  __typename?: 'BadgeListResponse';
  data?: Maybe<Array<Maybe<Badge>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type BusinessDashboardResponse = {
  __typename?: 'BusinessDashboardResponse';
  data?: Maybe<BusinessDashboardStats>;
  message?: Maybe<Scalars['String']['output']>;
};

export type BusinessDashboardStats = {
  __typename?: 'BusinessDashboardStats';
  averageRating?: Maybe<Scalars['Float']['output']>;
  averageRatingTrend?: Maybe<Scalars['Float']['output']>;
  insights?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  placeId?: Maybe<Scalars['Int']['output']>;
  placeName?: Maybe<Scalars['String']['output']>;
  ratingTrend?: Maybe<Array<Maybe<MonthlyRatingPoint>>>;
  reputationScore?: Maybe<Scalars['Int']['output']>;
  reputationScoreTrend?: Maybe<Scalars['Int']['output']>;
  responseRate?: Maybe<Scalars['Float']['output']>;
  responseRateTrend?: Maybe<Scalars['Float']['output']>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  reviewCountTrend?: Maybe<Scalars['Int']['output']>;
  reviewVolume?: Maybe<Array<Maybe<MonthlyVolumePoint>>>;
  sentiment?: Maybe<SentimentBreakdown>;
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

export type MonthlyRatingPoint = {
  __typename?: 'MonthlyRatingPoint';
  averageRating?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['String']['output']>;
};

export type MonthlyVolumePoint = {
  __typename?: 'MonthlyVolumePoint';
  month?: Maybe<Scalars['String']['output']>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
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
  setSavedPlaceListType?: Maybe<SavedPlaceResponse>;
  signOut?: Maybe<Message>;
  signUp?: Maybe<SignUpResponse>;
  signUpBusiness?: Maybe<SignUpBusinessResponse>;
  toggleHelpfulVote?: Maybe<ToggleHelpfulVoteResponse>;
  toggleSavePlace?: Maybe<ToggleSavePlaceResponse>;
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


export type MutationSetSavedPlaceListTypeArgs = {
  listType: SavedListTypeEnum;
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


export type MutationToggleSavePlaceArgs = {
  placeId: Scalars['Int']['input'];
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
  savedByMe?: Maybe<Scalars['Boolean']['output']>;
  savedListType?: Maybe<SavedListTypeEnum>;
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
  businessDashboard?: Maybe<BusinessDashboardResponse>;
  categories?: Maybe<CategoryListResponse>;
  category?: Maybe<CategoryResponse>;
  getPlaceById?: Maybe<PlaceResponse>;
  listPlaces?: Maybe<PlaceListResponse>;
  myBadges?: Maybe<BadgeListResponse>;
  myReviews?: Maybe<ReviewListResponse>;
  placeReviews?: Maybe<ReviewListResponse>;
  platformStats?: Maybe<PlatformStatsResponse>;
  savedPlaces?: Maybe<SavedPlaceListResponse>;
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


export type QuerySavedPlacesArgs = {
  filter?: InputMaybe<SavedPlaceFilterEnum>;
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
  createdAt?: Maybe<Scalars['String']['output']>;
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

export type SavedListTypeEnum =
  | 'FAVORITE'
  | 'SAVED'
  | 'WANT_TO_VISIT';

export type SavedPlace = {
  __typename?: 'SavedPlace';
  createdAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  listType?: Maybe<SavedListTypeEnum>;
  place?: Maybe<Place>;
  placeId?: Maybe<Scalars['Int']['output']>;
};

export type SavedPlaceFilterEnum =
  | 'ALL'
  | 'FAVORITE'
  | 'WANT_TO_VISIT';

export type SavedPlaceListResponse = {
  __typename?: 'SavedPlaceListResponse';
  data?: Maybe<Array<Maybe<SavedPlace>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type SavedPlaceResponse = {
  __typename?: 'SavedPlaceResponse';
  data?: Maybe<SavedPlace>;
  message?: Maybe<Scalars['String']['output']>;
};

export type SentimentBreakdown = {
  __typename?: 'SentimentBreakdown';
  negativePercent?: Maybe<Scalars['Float']['output']>;
  neutralPercent?: Maybe<Scalars['Float']['output']>;
  positivePercent?: Maybe<Scalars['Float']['output']>;
};

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

export type ToggleSavePlaceResponse = {
  __typename?: 'ToggleSavePlaceResponse';
  listType?: Maybe<SavedListTypeEnum>;
  message?: Maybe<Scalars['String']['output']>;
  savedByMe?: Maybe<Scalars['Boolean']['output']>;
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

export type MyBadgesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyBadgesQuery = { __typename?: 'Query', myBadges?: { __typename?: 'BadgeListResponse', data?: Array<{ __typename?: 'Badge', id?: number | null, key?: BadgeKeyEnum | null, label?: string | null, description?: string | null, icon?: string | null, earned?: boolean | null, earnedAt?: string | null } | null> | null } | null };

export type UpdatePlaceMutationVariables = Exact<{
  placeId: Scalars['Int']['input'];
  input?: InputMaybe<InputPlace>;
}>;


export type UpdatePlaceMutation = { __typename?: 'Mutation', updatePlace?: { __typename?: 'PlaceResponse', message?: string | null } | null };

export type SetPlaceHoursMutationVariables = Exact<{
  placeId: Scalars['Int']['input'];
  hours: Array<InputPlaceHour> | InputPlaceHour;
}>;


export type SetPlaceHoursMutation = { __typename?: 'Mutation', setPlaceHours?: { __typename?: 'PlaceHoursResponse', message?: string | null } | null };

export type ChangePasswordMutationVariables = Exact<{
  input: InputChangePassword;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword?: { __typename?: 'Message', message?: string | null } | null };

export type BusinessDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type BusinessDashboardQuery = { __typename?: 'Query', businessDashboard?: { __typename?: 'BusinessDashboardResponse', data?: { __typename?: 'BusinessDashboardStats', placeId?: number | null, placeName?: string | null, reputationScore?: number | null, reputationScoreTrend?: number | null, averageRating?: number | null, averageRatingTrend?: number | null, reviewCount?: number | null, reviewCountTrend?: number | null, responseRate?: number | null, responseRateTrend?: number | null, insights?: Array<string | null> | null, ratingTrend?: Array<{ __typename?: 'MonthlyRatingPoint', month?: string | null, averageRating?: number | null } | null> | null, reviewVolume?: Array<{ __typename?: 'MonthlyVolumePoint', month?: string | null, reviewCount?: number | null } | null> | null, sentiment?: { __typename?: 'SentimentBreakdown', positivePercent?: number | null, neutralPercent?: number | null, negativePercent?: number | null } | null } | null } | null };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories?: { __typename?: 'CategoryListResponse', data?: Array<{ __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null, coverImageUrl?: string | null, businessCount?: number | null, avgRating?: number | null } | null> | null } | null };

export type CategoryQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type CategoryQuery = { __typename?: 'Query', category?: { __typename?: 'CategoryResponse', data?: { __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null, coverImageUrl?: string | null, businessCount?: number | null, avgRating?: number | null } | null } | null };

export type MyReviewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyReviewsQuery = { __typename?: 'Query', myReviews?: { __typename?: 'ReviewListResponse', data?: Array<{ __typename?: 'Review', id?: number | null, review?: string | null, rating?: number | null, createdAt?: string | null, helpfulCount?: number | null, place?: { __typename?: 'Place', id?: number | null, label?: string | null, address?: string | null, priceRange?: PriceRangeEnum | null, averageRating?: number | null, reviewCount?: number | null, isVerified?: boolean | null, openNow?: boolean | null, trendingScore?: number | null, category?: { __typename?: 'Category', label?: string | null, icon?: string | null } | null } | null } | null> | null, pageInfo?: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } | null } | null };

export type GetPlaceByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetPlaceByIdQuery = { __typename?: 'Query', getPlaceById?: { __typename?: 'PlaceResponse', data?: { __typename?: 'Place', id?: number | null, label?: string | null, description?: string | null, address?: string | null, phone?: string | null, website?: string | null, priceRange?: PriceRangeEnum | null, averageRating?: number | null, reviewCount?: number | null, isVerified?: boolean | null, openNow?: boolean | null, savedByMe?: boolean | null, savedListType?: SavedListTypeEnum | null, category?: { __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null } | null, owner?: { __typename?: 'User', id?: number | null, fullName?: string | null, profilePicture?: string | null } | null, hours?: Array<{ __typename?: 'PlaceHour', dayOfWeek?: number | null, opensAt?: string | null, closesAt?: string | null } | null> | null, ratingBreakdown?: Array<{ __typename?: 'RatingBreakdownEntry', stars?: number | null, count?: number | null } | null> | null } | null } | null };

export type PlaceReviewsQueryVariables = Exact<{
  placeId: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ReviewSortEnum>;
}>;


export type PlaceReviewsQuery = { __typename?: 'Query', placeReviews?: { __typename?: 'ReviewListResponse', data?: Array<{ __typename?: 'Review', id?: number | null, review?: string | null, rating?: number | null, reviewerId?: number | null, createdAt?: string | null, helpfulCount?: number | null, helpfulByMe?: boolean | null, reviewer?: { __typename?: 'User', id?: number | null, fullName?: string | null, profilePicture?: string | null } | null, reply?: { __typename?: 'ReviewReply', id?: number | null, description?: string | null, createdAt?: string | null } | null } | null> | null, pageInfo?: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } | null } | null };

export type CreateReviewMutationVariables = Exact<{
  placeId: Scalars['Int']['input'];
  input: InputReview;
}>;


export type CreateReviewMutation = { __typename?: 'Mutation', createReview?: { __typename?: 'ReviewResponse', message?: string | null } | null };

export type UpdateReviewMutationVariables = Exact<{
  reviewId: Scalars['Int']['input'];
  input: InputUpdateReview;
}>;


export type UpdateReviewMutation = { __typename?: 'Mutation', updateReview?: { __typename?: 'ReviewResponse', message?: string | null } | null };

export type DeleteReviewMutationVariables = Exact<{
  reviewId: Scalars['Int']['input'];
}>;


export type DeleteReviewMutation = { __typename?: 'Mutation', deleteReview?: { __typename?: 'Message', message?: string | null } | null };

export type ToggleHelpfulVoteMutationVariables = Exact<{
  reviewId: Scalars['Int']['input'];
}>;


export type ToggleHelpfulVoteMutation = { __typename?: 'Mutation', toggleHelpfulVote?: { __typename?: 'ToggleHelpfulVoteResponse', message?: string | null, helpfulCount?: number | null, helpfulByMe?: boolean | null } | null };

export type CreateReviewReplyMutationVariables = Exact<{
  reviewId: Scalars['Int']['input'];
  input: InputReviewReply;
}>;


export type CreateReviewReplyMutation = { __typename?: 'Mutation', createReviewReply?: { __typename?: 'ReviewReplyResponse', message?: string | null } | null };

export type ListPlacesQueryVariables = Exact<{
  sort?: InputMaybe<PlaceSortEnum>;
  near?: InputMaybe<GeoInput>;
  filter?: InputMaybe<PlaceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type ListPlacesQuery = { __typename?: 'Query', listPlaces?: { __typename?: 'PlaceListResponse', message?: string | null, data?: Array<{ __typename?: 'Place', id?: number | null, label?: string | null, address?: string | null, priceRange?: PriceRangeEnum | null, averageRating?: number | null, reviewCount?: number | null, isVerified?: boolean | null, trendingScore?: number | null, latitude?: number | null, longitude?: number | null, distance?: number | null, openNow?: boolean | null, savedByMe?: boolean | null, savedListType?: SavedListTypeEnum | null, category?: { __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null } | null } | null> | null, pageInfo?: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } | null } | null };

export type PlatformStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformStatsQuery = { __typename?: 'Query', platformStats?: { __typename?: 'PlatformStatsResponse', data?: { __typename?: 'PlatformStats', totalPlaces?: number | null, totalReviews?: number | null } | null } | null };

export type SavedPlacesQueryVariables = Exact<{
  filter?: InputMaybe<SavedPlaceFilterEnum>;
}>;


export type SavedPlacesQuery = { __typename?: 'Query', savedPlaces?: { __typename?: 'SavedPlaceListResponse', data?: Array<{ __typename?: 'SavedPlace', id?: number | null, placeId?: number | null, listType?: SavedListTypeEnum | null, createdAt?: string | null, place?: { __typename?: 'Place', id?: number | null, label?: string | null, address?: string | null, priceRange?: PriceRangeEnum | null, averageRating?: number | null, reviewCount?: number | null, isVerified?: boolean | null, openNow?: boolean | null, trendingScore?: number | null, category?: { __typename?: 'Category', id?: number | null, label?: string | null, icon?: string | null } | null } | null } | null> | null } | null };

export type ToggleSavePlaceMutationVariables = Exact<{
  placeId: Scalars['Int']['input'];
}>;


export type ToggleSavePlaceMutation = { __typename?: 'Mutation', toggleSavePlace?: { __typename?: 'ToggleSavePlaceResponse', message?: string | null, savedByMe?: boolean | null, listType?: SavedListTypeEnum | null } | null };

export type SetSavedPlaceListTypeMutationVariables = Exact<{
  placeId: Scalars['Int']['input'];
  listType: SavedListTypeEnum;
}>;


export type SetSavedPlaceListTypeMutation = { __typename?: 'Mutation', setSavedPlaceListType?: { __typename?: 'SavedPlaceResponse', message?: string | null, data?: { __typename?: 'SavedPlace', id?: number | null, placeId?: number | null, listType?: SavedListTypeEnum | null, createdAt?: string | null } | null } | null };

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
        return ApolloReactHooks.useQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options as any);
      }
export function useAuthMeUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options as any);
        }
// @ts-ignore
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AuthMeUserQuery, AuthMeUserQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<AuthMeUserQuery | undefined, AuthMeUserQueryVariables>;
export function useAuthMeUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<AuthMeUserQuery, AuthMeUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<AuthMeUserQuery, AuthMeUserQueryVariables>(AuthMeUserDocument, options as any);
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
export const MyBadgesDocument = gql`
    query MyBadges {
  myBadges {
    data {
      id
      key
      label
      description
      icon
      earned
      earnedAt
    }
  }
}
    `;

/**
 * __useMyBadgesQuery__
 *
 * To run a query within a React component, call `useMyBadgesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyBadgesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyBadgesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyBadgesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyBadgesQuery, MyBadgesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyBadgesQuery, MyBadgesQueryVariables>(MyBadgesDocument, options as any);
      }
export function useMyBadgesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyBadgesQuery, MyBadgesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyBadgesQuery, MyBadgesQueryVariables>(MyBadgesDocument, options as any);
        }
// @ts-ignore
export function useMyBadgesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyBadgesQuery, MyBadgesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyBadgesQuery, MyBadgesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useMyBadgesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyBadgesQuery, MyBadgesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyBadgesQuery | undefined, MyBadgesQueryVariables>;
export function useMyBadgesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyBadgesQuery, MyBadgesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyBadgesQuery, MyBadgesQueryVariables>(MyBadgesDocument, options as any);
        }
export type MyBadgesQueryHookResult = ReturnType<typeof useMyBadgesQuery>;
export type MyBadgesLazyQueryHookResult = ReturnType<typeof useMyBadgesLazyQuery>;
export type MyBadgesSuspenseQueryHookResult = ReturnType<typeof useMyBadgesSuspenseQuery>;
export type MyBadgesQueryResult = ApolloReactCommon.QueryResult<MyBadgesQuery, MyBadgesQueryVariables>;
export const UpdatePlaceDocument = gql`
    mutation UpdatePlace($placeId: Int!, $input: InputPlace) {
  updatePlace(placeId: $placeId, input: $input) {
    message
  }
}
    `;

/**
 * __useUpdatePlaceMutation__
 *
 * To run a mutation, you first call `useUpdatePlaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlaceMutation, { data, loading, error }] = useUpdatePlaceMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePlaceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePlaceMutation, UpdatePlaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePlaceMutation, UpdatePlaceMutationVariables>(UpdatePlaceDocument, options);
      }
export type UpdatePlaceMutationHookResult = ReturnType<typeof useUpdatePlaceMutation>;
export type UpdatePlaceMutationResult = ApolloReactCommon.MutationResult<UpdatePlaceMutation>;
export const SetPlaceHoursDocument = gql`
    mutation SetPlaceHours($placeId: Int!, $hours: [InputPlaceHour!]!) {
  setPlaceHours(placeId: $placeId, hours: $hours) {
    message
  }
}
    `;

/**
 * __useSetPlaceHoursMutation__
 *
 * To run a mutation, you first call `useSetPlaceHoursMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPlaceHoursMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPlaceHoursMutation, { data, loading, error }] = useSetPlaceHoursMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      hours: // value for 'hours'
 *   },
 * });
 */
export function useSetPlaceHoursMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetPlaceHoursMutation, SetPlaceHoursMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetPlaceHoursMutation, SetPlaceHoursMutationVariables>(SetPlaceHoursDocument, options);
      }
export type SetPlaceHoursMutationHookResult = ReturnType<typeof useSetPlaceHoursMutation>;
export type SetPlaceHoursMutationResult = ApolloReactCommon.MutationResult<SetPlaceHoursMutation>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($input: InputChangePassword!) {
  changePassword(input: $input) {
    message
  }
}
    `;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, options);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = ApolloReactCommon.MutationResult<ChangePasswordMutation>;
export const BusinessDashboardDocument = gql`
    query BusinessDashboard {
  businessDashboard {
    data {
      placeId
      placeName
      reputationScore
      reputationScoreTrend
      averageRating
      averageRatingTrend
      reviewCount
      reviewCountTrend
      responseRate
      responseRateTrend
      ratingTrend {
        month
        averageRating
      }
      reviewVolume {
        month
        reviewCount
      }
      sentiment {
        positivePercent
        neutralPercent
        negativePercent
      }
      insights
    }
  }
}
    `;

/**
 * __useBusinessDashboardQuery__
 *
 * To run a query within a React component, call `useBusinessDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useBusinessDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBusinessDashboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useBusinessDashboardQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<BusinessDashboardQuery, BusinessDashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<BusinessDashboardQuery, BusinessDashboardQueryVariables>(BusinessDashboardDocument, options as any);
      }
export function useBusinessDashboardLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<BusinessDashboardQuery, BusinessDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<BusinessDashboardQuery, BusinessDashboardQueryVariables>(BusinessDashboardDocument, options as any);
        }
// @ts-ignore
export function useBusinessDashboardSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<BusinessDashboardQuery, BusinessDashboardQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BusinessDashboardQuery, BusinessDashboardQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useBusinessDashboardSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BusinessDashboardQuery, BusinessDashboardQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BusinessDashboardQuery | undefined, BusinessDashboardQueryVariables>;
export function useBusinessDashboardSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BusinessDashboardQuery, BusinessDashboardQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<BusinessDashboardQuery, BusinessDashboardQueryVariables>(BusinessDashboardDocument, options as any);
        }
export type BusinessDashboardQueryHookResult = ReturnType<typeof useBusinessDashboardQuery>;
export type BusinessDashboardLazyQueryHookResult = ReturnType<typeof useBusinessDashboardLazyQuery>;
export type BusinessDashboardSuspenseQueryHookResult = ReturnType<typeof useBusinessDashboardSuspenseQuery>;
export type BusinessDashboardQueryResult = ApolloReactCommon.QueryResult<BusinessDashboardQuery, BusinessDashboardQueryVariables>;
export const CategoriesDocument = gql`
    query Categories {
  categories {
    data {
      id
      label
      icon
      coverImageUrl
      businessCount
      avgRating
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
        return ApolloReactHooks.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options as any);
      }
export function useCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options as any);
        }
// @ts-ignore
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoriesQuery, CategoriesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoriesQuery | undefined, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options as any);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
export type CategoriesQueryResult = ApolloReactCommon.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const CategoryDocument = gql`
    query Category($id: Int!) {
  category(id: $id) {
    data {
      id
      label
      icon
      coverImageUrl
      businessCount
      avgRating
    }
  }
}
    `;

/**
 * __useCategoryQuery__
 *
 * To run a query within a React component, call `useCategoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCategoryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CategoryQuery, CategoryQueryVariables> & ({ variables: CategoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CategoryQuery, CategoryQueryVariables>(CategoryDocument, options as any);
      }
export function useCategoryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CategoryQuery, CategoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CategoryQuery, CategoryQueryVariables>(CategoryDocument, options as any);
        }
// @ts-ignore
export function useCategorySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CategoryQuery, CategoryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoryQuery, CategoryQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useCategorySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoryQuery, CategoryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CategoryQuery | undefined, CategoryQueryVariables>;
export function useCategorySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CategoryQuery, CategoryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CategoryQuery, CategoryQueryVariables>(CategoryDocument, options as any);
        }
export type CategoryQueryHookResult = ReturnType<typeof useCategoryQuery>;
export type CategoryLazyQueryHookResult = ReturnType<typeof useCategoryLazyQuery>;
export type CategorySuspenseQueryHookResult = ReturnType<typeof useCategorySuspenseQuery>;
export type CategoryQueryResult = ApolloReactCommon.QueryResult<CategoryQuery, CategoryQueryVariables>;
export const MyReviewsDocument = gql`
    query MyReviews($first: Int, $after: String) {
  myReviews(first: $first, after: $after) {
    data {
      id
      review
      rating
      createdAt
      helpfulCount
      place {
        id
        label
        address
        priceRange
        averageRating
        reviewCount
        isVerified
        openNow
        trendingScore
        category {
          label
          icon
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useMyReviewsQuery__
 *
 * To run a query within a React component, call `useMyReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyReviewsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMyReviewsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyReviewsQuery, MyReviewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyReviewsQuery, MyReviewsQueryVariables>(MyReviewsDocument, options as any);
      }
export function useMyReviewsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyReviewsQuery, MyReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyReviewsQuery, MyReviewsQueryVariables>(MyReviewsDocument, options as any);
        }
// @ts-ignore
export function useMyReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MyReviewsQuery, MyReviewsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyReviewsQuery, MyReviewsQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useMyReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyReviewsQuery, MyReviewsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MyReviewsQuery | undefined, MyReviewsQueryVariables>;
export function useMyReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MyReviewsQuery, MyReviewsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MyReviewsQuery, MyReviewsQueryVariables>(MyReviewsDocument, options as any);
        }
export type MyReviewsQueryHookResult = ReturnType<typeof useMyReviewsQuery>;
export type MyReviewsLazyQueryHookResult = ReturnType<typeof useMyReviewsLazyQuery>;
export type MyReviewsSuspenseQueryHookResult = ReturnType<typeof useMyReviewsSuspenseQuery>;
export type MyReviewsQueryResult = ApolloReactCommon.QueryResult<MyReviewsQuery, MyReviewsQueryVariables>;
export const GetPlaceByIdDocument = gql`
    query GetPlaceById($id: Int!) {
  getPlaceById(id: $id) {
    data {
      id
      label
      description
      address
      phone
      website
      priceRange
      averageRating
      reviewCount
      isVerified
      openNow
      savedByMe
      savedListType
      category {
        id
        label
        icon
      }
      owner {
        id
        fullName
        profilePicture
      }
      hours {
        dayOfWeek
        opensAt
        closesAt
      }
      ratingBreakdown {
        stars
        count
      }
    }
  }
}
    `;

/**
 * __useGetPlaceByIdQuery__
 *
 * To run a query within a React component, call `useGetPlaceByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlaceByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlaceByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPlaceByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetPlaceByIdQuery, GetPlaceByIdQueryVariables> & ({ variables: GetPlaceByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>(GetPlaceByIdDocument, options as any);
      }
export function useGetPlaceByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>(GetPlaceByIdDocument, options as any);
        }
// @ts-ignore
export function useGetPlaceByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useGetPlaceByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetPlaceByIdQuery | undefined, GetPlaceByIdQueryVariables>;
export function useGetPlaceByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>(GetPlaceByIdDocument, options as any);
        }
export type GetPlaceByIdQueryHookResult = ReturnType<typeof useGetPlaceByIdQuery>;
export type GetPlaceByIdLazyQueryHookResult = ReturnType<typeof useGetPlaceByIdLazyQuery>;
export type GetPlaceByIdSuspenseQueryHookResult = ReturnType<typeof useGetPlaceByIdSuspenseQuery>;
export type GetPlaceByIdQueryResult = ApolloReactCommon.QueryResult<GetPlaceByIdQuery, GetPlaceByIdQueryVariables>;
export const PlaceReviewsDocument = gql`
    query PlaceReviews($placeId: Int!, $first: Int, $after: String, $sort: ReviewSortEnum) {
  placeReviews(placeId: $placeId, first: $first, after: $after, sort: $sort) {
    data {
      id
      review
      rating
      reviewerId
      createdAt
      helpfulCount
      helpfulByMe
      reviewer {
        id
        fullName
        profilePicture
      }
      reply {
        id
        description
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __usePlaceReviewsQuery__
 *
 * To run a query within a React component, call `usePlaceReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlaceReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlaceReviewsQuery({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function usePlaceReviewsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<PlaceReviewsQuery, PlaceReviewsQueryVariables> & ({ variables: PlaceReviewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PlaceReviewsQuery, PlaceReviewsQueryVariables>(PlaceReviewsDocument, options as any);
      }
export function usePlaceReviewsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlaceReviewsQuery, PlaceReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlaceReviewsQuery, PlaceReviewsQueryVariables>(PlaceReviewsDocument, options as any);
        }
// @ts-ignore
export function usePlaceReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<PlaceReviewsQuery, PlaceReviewsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlaceReviewsQuery, PlaceReviewsQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function usePlaceReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlaceReviewsQuery, PlaceReviewsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlaceReviewsQuery | undefined, PlaceReviewsQueryVariables>;
export function usePlaceReviewsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlaceReviewsQuery, PlaceReviewsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<PlaceReviewsQuery, PlaceReviewsQueryVariables>(PlaceReviewsDocument, options as any);
        }
export type PlaceReviewsQueryHookResult = ReturnType<typeof usePlaceReviewsQuery>;
export type PlaceReviewsLazyQueryHookResult = ReturnType<typeof usePlaceReviewsLazyQuery>;
export type PlaceReviewsSuspenseQueryHookResult = ReturnType<typeof usePlaceReviewsSuspenseQuery>;
export type PlaceReviewsQueryResult = ApolloReactCommon.QueryResult<PlaceReviewsQuery, PlaceReviewsQueryVariables>;
export const CreateReviewDocument = gql`
    mutation CreateReview($placeId: Int!, $input: InputReview!) {
  createReview(placeId: $placeId, input: $input) {
    message
  }
}
    `;

/**
 * __useCreateReviewMutation__
 *
 * To run a mutation, you first call `useCreateReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewMutation, { data, loading, error }] = useCreateReviewMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateReviewMutation, CreateReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateReviewMutation, CreateReviewMutationVariables>(CreateReviewDocument, options);
      }
export type CreateReviewMutationHookResult = ReturnType<typeof useCreateReviewMutation>;
export type CreateReviewMutationResult = ApolloReactCommon.MutationResult<CreateReviewMutation>;
export const UpdateReviewDocument = gql`
    mutation UpdateReview($reviewId: Int!, $input: InputUpdateReview!) {
  updateReview(reviewId: $reviewId, input: $input) {
    message
  }
}
    `;

/**
 * __useUpdateReviewMutation__
 *
 * To run a mutation, you first call `useUpdateReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateReviewMutation, { data, loading, error }] = useUpdateReviewMutation({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateReviewMutation, UpdateReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateReviewMutation, UpdateReviewMutationVariables>(UpdateReviewDocument, options);
      }
export type UpdateReviewMutationHookResult = ReturnType<typeof useUpdateReviewMutation>;
export type UpdateReviewMutationResult = ApolloReactCommon.MutationResult<UpdateReviewMutation>;
export const DeleteReviewDocument = gql`
    mutation DeleteReview($reviewId: Int!) {
  deleteReview(reviewId: $reviewId) {
    message
  }
}
    `;

/**
 * __useDeleteReviewMutation__
 *
 * To run a mutation, you first call `useDeleteReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteReviewMutation, { data, loading, error }] = useDeleteReviewMutation({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useDeleteReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteReviewMutation, DeleteReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteReviewMutation, DeleteReviewMutationVariables>(DeleteReviewDocument, options);
      }
export type DeleteReviewMutationHookResult = ReturnType<typeof useDeleteReviewMutation>;
export type DeleteReviewMutationResult = ApolloReactCommon.MutationResult<DeleteReviewMutation>;
export const ToggleHelpfulVoteDocument = gql`
    mutation ToggleHelpfulVote($reviewId: Int!) {
  toggleHelpfulVote(reviewId: $reviewId) {
    message
    helpfulCount
    helpfulByMe
  }
}
    `;

/**
 * __useToggleHelpfulVoteMutation__
 *
 * To run a mutation, you first call `useToggleHelpfulVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleHelpfulVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleHelpfulVoteMutation, { data, loading, error }] = useToggleHelpfulVoteMutation({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useToggleHelpfulVoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ToggleHelpfulVoteMutation, ToggleHelpfulVoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ToggleHelpfulVoteMutation, ToggleHelpfulVoteMutationVariables>(ToggleHelpfulVoteDocument, options);
      }
export type ToggleHelpfulVoteMutationHookResult = ReturnType<typeof useToggleHelpfulVoteMutation>;
export type ToggleHelpfulVoteMutationResult = ApolloReactCommon.MutationResult<ToggleHelpfulVoteMutation>;
export const CreateReviewReplyDocument = gql`
    mutation CreateReviewReply($reviewId: Int!, $input: InputReviewReply!) {
  createReviewReply(reviewId: $reviewId, input: $input) {
    message
  }
}
    `;

/**
 * __useCreateReviewReplyMutation__
 *
 * To run a mutation, you first call `useCreateReviewReplyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewReplyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewReplyMutation, { data, loading, error }] = useCreateReviewReplyMutation({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReviewReplyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateReviewReplyMutation, CreateReviewReplyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateReviewReplyMutation, CreateReviewReplyMutationVariables>(CreateReviewReplyDocument, options);
      }
export type CreateReviewReplyMutationHookResult = ReturnType<typeof useCreateReviewReplyMutation>;
export type CreateReviewReplyMutationResult = ApolloReactCommon.MutationResult<CreateReviewReplyMutation>;
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
      savedByMe
      savedListType
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
        return ApolloReactHooks.useQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options as any);
      }
export function useListPlacesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options as any);
        }
// @ts-ignore
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ListPlacesQuery, ListPlacesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ListPlacesQuery | undefined, ListPlacesQueryVariables>;
export function useListPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ListPlacesQuery, ListPlacesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ListPlacesQuery, ListPlacesQueryVariables>(ListPlacesDocument, options as any);
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
        return ApolloReactHooks.useQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options as any);
      }
export function usePlatformStatsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options as any);
        }
// @ts-ignore
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlatformStatsQuery, PlatformStatsQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<PlatformStatsQuery | undefined, PlatformStatsQueryVariables>;
export function usePlatformStatsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PlatformStatsQuery, PlatformStatsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<PlatformStatsQuery, PlatformStatsQueryVariables>(PlatformStatsDocument, options as any);
        }
export type PlatformStatsQueryHookResult = ReturnType<typeof usePlatformStatsQuery>;
export type PlatformStatsLazyQueryHookResult = ReturnType<typeof usePlatformStatsLazyQuery>;
export type PlatformStatsSuspenseQueryHookResult = ReturnType<typeof usePlatformStatsSuspenseQuery>;
export type PlatformStatsQueryResult = ApolloReactCommon.QueryResult<PlatformStatsQuery, PlatformStatsQueryVariables>;
export const SavedPlacesDocument = gql`
    query SavedPlaces($filter: SavedPlaceFilterEnum) {
  savedPlaces(filter: $filter) {
    data {
      id
      placeId
      listType
      createdAt
      place {
        id
        label
        address
        priceRange
        averageRating
        reviewCount
        isVerified
        openNow
        trendingScore
        category {
          id
          label
          icon
        }
      }
    }
  }
}
    `;

/**
 * __useSavedPlacesQuery__
 *
 * To run a query within a React component, call `useSavedPlacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSavedPlacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSavedPlacesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useSavedPlacesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SavedPlacesQuery, SavedPlacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SavedPlacesQuery, SavedPlacesQueryVariables>(SavedPlacesDocument, options as any);
      }
export function useSavedPlacesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SavedPlacesQuery, SavedPlacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SavedPlacesQuery, SavedPlacesQueryVariables>(SavedPlacesDocument, options as any);
        }
// @ts-ignore
export function useSavedPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<SavedPlacesQuery, SavedPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SavedPlacesQuery, SavedPlacesQueryVariables>;
// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs
export function useSavedPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SavedPlacesQuery, SavedPlacesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<SavedPlacesQuery | undefined, SavedPlacesQueryVariables>;
export function useSavedPlacesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SavedPlacesQuery, SavedPlacesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<SavedPlacesQuery, SavedPlacesQueryVariables>(SavedPlacesDocument, options as any);
        }
export type SavedPlacesQueryHookResult = ReturnType<typeof useSavedPlacesQuery>;
export type SavedPlacesLazyQueryHookResult = ReturnType<typeof useSavedPlacesLazyQuery>;
export type SavedPlacesSuspenseQueryHookResult = ReturnType<typeof useSavedPlacesSuspenseQuery>;
export type SavedPlacesQueryResult = ApolloReactCommon.QueryResult<SavedPlacesQuery, SavedPlacesQueryVariables>;
export const ToggleSavePlaceDocument = gql`
    mutation ToggleSavePlace($placeId: Int!) {
  toggleSavePlace(placeId: $placeId) {
    message
    savedByMe
    listType
  }
}
    `;

/**
 * __useToggleSavePlaceMutation__
 *
 * To run a mutation, you first call `useToggleSavePlaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleSavePlaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleSavePlaceMutation, { data, loading, error }] = useToggleSavePlaceMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *   },
 * });
 */
export function useToggleSavePlaceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ToggleSavePlaceMutation, ToggleSavePlaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ToggleSavePlaceMutation, ToggleSavePlaceMutationVariables>(ToggleSavePlaceDocument, options);
      }
export type ToggleSavePlaceMutationHookResult = ReturnType<typeof useToggleSavePlaceMutation>;
export type ToggleSavePlaceMutationResult = ApolloReactCommon.MutationResult<ToggleSavePlaceMutation>;
export const SetSavedPlaceListTypeDocument = gql`
    mutation SetSavedPlaceListType($placeId: Int!, $listType: SavedListTypeEnum!) {
  setSavedPlaceListType(placeId: $placeId, listType: $listType) {
    message
    data {
      id
      placeId
      listType
      createdAt
    }
  }
}
    `;

/**
 * __useSetSavedPlaceListTypeMutation__
 *
 * To run a mutation, you first call `useSetSavedPlaceListTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetSavedPlaceListTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setSavedPlaceListTypeMutation, { data, loading, error }] = useSetSavedPlaceListTypeMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      listType: // value for 'listType'
 *   },
 * });
 */
export function useSetSavedPlaceListTypeMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetSavedPlaceListTypeMutation, SetSavedPlaceListTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetSavedPlaceListTypeMutation, SetSavedPlaceListTypeMutationVariables>(SetSavedPlaceListTypeDocument, options);
      }
export type SetSavedPlaceListTypeMutationHookResult = ReturnType<typeof useSetSavedPlaceListTypeMutation>;
export type SetSavedPlaceListTypeMutationResult = ApolloReactCommon.MutationResult<SetSavedPlaceListTypeMutation>;
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