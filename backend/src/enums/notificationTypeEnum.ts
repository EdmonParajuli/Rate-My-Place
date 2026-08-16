export enum NotificationTypeEnum {
    REVIEW_REPLY = 'REVIEW_REPLY',
    NEW_REVIEW = 'NEW_REVIEW',
    BADGE_EARNED = 'BADGE_EARNED',
    // A place you saved or previously reviewed got a new review from someone
    // else - distinct from NEW_REVIEW, which notifies the place's owner.
    // Backs the "Reviews" tab on the REGULAR Settings/Notifications design.
    WATCHED_PLACE_REVIEW = 'WATCHED_PLACE_REVIEW',
    // Someone marked your review helpful - backs the "Likes" tab. No
    // dedup/throttling: toggling a vote off and back on re-fires this, same
    // known limitation the original Phase 5 notifications spec flagged when
    // deferring this event.
    HELPFUL_VOTE_RECEIVED = 'HELPFUL_VOTE_RECEIVED',
}
