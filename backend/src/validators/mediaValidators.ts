import Joi from "joi";
import { stringSchema, numberSchema } from "./schemas";
import { cloudinary as cloudinaryConfig } from "../config";
import { MediaKindEnum } from "../enums/mediaKindEnum";
import { MediaOwnerTypeEnum } from "../enums/mediaOwnerTypeEnum";

// Restricted to our own configured Cloudinary cloud, not just "any
// well-formed URI" - attachMedia has no way to verify the caller actually
// went through the signed-upload flow (the whole point of that flow is this
// server never sees the file bytes), so this is the one guardrail against a
// client passing an arbitrary external URL as their avatar/cover/photo.
const cloudinaryUrlSchema = stringSchema
    .uri()
    .pattern(new RegExp(`^https://res\\.cloudinary\\.com/${cloudinaryConfig.cloudName}/`))
    .messages({
        "string.pattern.base": "URL must be a Cloudinary asset from this app's configured cloud.",
    });

// ownerId is required for PLACE/REVIEW (which one) and forbidden for USER
// (always the caller's own account - MediaService never trusts a
// client-supplied id there, so accepting one here would just be misleading).
// kind is further restricted per ownerType - USER has no PHOTO concept
// (avatar/cover only, single-slot), PLACE has AVATAR/COVER (both
// single-slot) plus PHOTO (gallery), REVIEW only has PHOTO (no avatar/cover
// concept at all for a review).
export const attachMediaSchema = Joi.object({
    ownerType: stringSchema.label("Owner type").valid(MediaOwnerTypeEnum.PLACE, MediaOwnerTypeEnum.USER, MediaOwnerTypeEnum.REVIEW).required(),
    ownerId: numberSchema.label("Owner ID").integer().min(1).when("ownerType", {
        is: MediaOwnerTypeEnum.USER,
        then: Joi.forbidden(),
        otherwise: Joi.required(),
    }),
    kind: stringSchema.label("Kind").required().when("ownerType", {
        switch: [
            { is: MediaOwnerTypeEnum.PLACE, then: stringSchema.valid(MediaKindEnum.AVATAR, MediaKindEnum.COVER, MediaKindEnum.PHOTO) },
            { is: MediaOwnerTypeEnum.REVIEW, then: stringSchema.valid(MediaKindEnum.PHOTO) },
        ],
        otherwise: stringSchema.valid(MediaKindEnum.AVATAR, MediaKindEnum.COVER),
    }),
    url: cloudinaryUrlSchema.label("URL").required(),
});
