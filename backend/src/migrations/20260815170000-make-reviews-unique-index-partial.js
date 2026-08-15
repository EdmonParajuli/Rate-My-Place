'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // The original unique(place_id, reviewer_id) index was a plain index, not
    // partial - once a reviewer soft-deleted their review for a place, the
    // now-orphaned deleted row still held that (place_id, reviewer_id) slot
    // forever, so createReview for that same pair failed with a generic
    // Sequelize "Validation error" on every future attempt. Same bug class
    // providers_reviews_replies already fixed with a partial index (see
    // 20260730140000-add-unique-review-id-to-reviews-replies.js) - this table
    // never got the same treatment. Found 2026-08-15 while verifying Phase 5's
    // Saved -> Reviewed tab.
    await queryInterface.removeIndex('providers_reviews', 'providers_reviews_place_id_reviewer_id_unique');

    await queryInterface.addIndex('providers_reviews', ['place_id', 'reviewer_id'], {
      unique: true,
      name: 'providers_reviews_place_id_reviewer_id_unique',
      where: {
        deleted_at: null
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('providers_reviews', 'providers_reviews_place_id_reviewer_id_unique');

    await queryInterface.addIndex('providers_reviews', ['place_id', 'reviewer_id'], {
      unique: true,
      name: 'providers_reviews_place_id_reviewer_id_unique'
    });
  }
};
