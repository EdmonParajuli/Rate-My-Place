// Matches doc 3's MEDIA table design. Only USER is implemented by
// MediaService today (avatar/cover) - PLACE/REVIEW exist here because
// they're part of the agreed polymorphic shape, but attachMedia rejects
// them until the place/review photo tickets land.
export enum MediaOwnerTypeEnum {
    PLACE = "PLACE",
    REVIEW = "REVIEW",
    USER = "USER",
}
