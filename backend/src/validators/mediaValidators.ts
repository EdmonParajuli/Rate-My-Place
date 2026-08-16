import Joi from "joi";
import { stringSchema } from "./schemas";
import { cloudinary as cloudinaryConfig } from "../config";
import { MediaKindEnum } from "../enums/mediaKindEnum";

// Restricted to our own configured Cloudinary cloud, not just "any
// well-formed URI" - attachMedia has no way to verify the caller actually
// went through the signed-upload flow (the whole point of that flow is this
// server never sees the file bytes), so this is the one guardrail against a
// client passing an arbitrary external URL as their avatar/cover.
const cloudinaryUrlSchema = stringSchema
    .uri()
    .pattern(new RegExp(`^https://res\\.cloudinary\\.com/${cloudinaryConfig.cloudName}/`))
    .messages({
        "string.pattern.base": "URL must be a Cloudinary asset from this app's configured cloud.",
    });

// PHOTO deliberately excluded - place/review photo uploads aren't built yet
// (see docs/specs/phase-8-media-plumbing.md), only self-serve avatar/cover.
export const attachMediaSchema = Joi.object({
    kind: stringSchema.label("Kind").valid(MediaKindEnum.AVATAR, MediaKindEnum.COVER).required(),
    url: cloudinaryUrlSchema.label("URL").required(),
});
