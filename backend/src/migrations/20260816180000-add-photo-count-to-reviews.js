'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Materialized, not live-resolved - same reasoning as helpful_count
    // (20260813140000): a review's full photo list is only ever resolved
    // for one review at a time (Review.photos, on-demand via getReviewById),
    // never embedded in placeReviews/myReviews' list queries, which would be
    // a real N+1. photoCount is the cheap, list-safe signal instead -
    // MediaService.attachMedia/removeMedia recompute and store it, same
    // "recompute from source" pattern as Place.average_rating/review_count.
    await queryInterface.addColumn('providers_reviews', 'photo_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('providers_reviews', 'photo_count');
  }
};
