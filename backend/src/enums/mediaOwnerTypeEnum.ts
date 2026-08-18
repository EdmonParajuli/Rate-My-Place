// Matches doc 3's MEDIA table design. All three owner types are implemented
// by MediaService - USER (AVATAR/COVER), PLACE (AVATAR/COVER/PHOTO), REVIEW
// (PHOTO only) - see mediaValidators.ts's attachMediaSchema for the exact
// kind restrictions per owner type.
export enum MediaOwnerTypeEnum {
    PLACE = "PLACE",
    REVIEW = "REVIEW",
    USER = "USER",
}
