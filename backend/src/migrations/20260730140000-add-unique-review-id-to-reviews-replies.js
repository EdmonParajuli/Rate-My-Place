'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Partial index (WHERE deleted_at IS NULL) rather than a plain unique
    // index - review_id is reused whenever a reply is soft-deleted and the
    // owner replies again to the same review, and a plain unique index would
    // permanently block that on the now-orphaned soft-deleted row.
    await queryInterface.addIndex('providers_reviews_replies', ['review_id'], {
      unique: true,
      name: 'providers_reviews_replies_review_id_unique',
      where: {
        deleted_at: null
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('providers_reviews_replies', 'providers_reviews_replies_review_id_unique');
  }
};
