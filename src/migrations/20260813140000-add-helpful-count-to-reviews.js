'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Materialized, not incrementally adjusted - ReviewVoteService.toggle
    // fully recomputes this from providers_review_votes on every write, same
    // "recompute from source" pattern as Place.average_rating/review_count.
    // Needed as a real column (not left purely live) so placeReviews's
    // HELPFUL sort can order/paginate on it via plain WHERE/ORDER BY, the
    // same reason average_rating/review_count are stored rather than computed
    // per-request.
    await queryInterface.addColumn('providers_reviews', 'helpful_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('providers_reviews', 'helpful_count');
  }
};
