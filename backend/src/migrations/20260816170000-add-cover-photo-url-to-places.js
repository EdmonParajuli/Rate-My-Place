'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Denormalized read cache, same "recompute and store a column" precedent
    // as User.profilePicture/coverPicture (docs/specs/phase-8-media-plumbing.md)
    // - PlaceCard/PlaceDetailPage both render many places at once (a
    // Discover grid), so resolving this live from providers_media per row
    // would be a real N+1. No write path yet (no attachMedia support for
    // PLACE) - seeded directly for now; a real place-photo upload ticket
    // will write both this column and a providers_media row together.
    await queryInterface.addColumn('providers_places', 'cover_photo_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('providers_places', 'cover_photo_url');
  }
};
