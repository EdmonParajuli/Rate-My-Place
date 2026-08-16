'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Mirrors the existing profile_picture column. Denormalized read cache,
    // not the source of truth - MediaService writes both this column and a
    // providers_media row (kind: COVER) in the same transaction on upload,
    // same "recompute/store, read the column" pattern as Place.averageRating.
    // See docs/specs/phase-8-media-plumbing.md.
    await queryInterface.addColumn('providers_users', 'cover_picture', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('providers_users', 'cover_picture');
  }
};
