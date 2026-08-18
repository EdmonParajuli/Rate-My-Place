'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Third distinct place image slot alongside cover_photo_url (a single
    // wide banner) and the PHOTO gallery (providers_media, many rows) - a
    // single square logo-style picture shown next to the place name, same
    // "denormalized read cache" precedent as cover_photo_url (PlaceCard/
    // PlaceDetailPage render many places at once, so resolving this live
    // from providers_media per row would be a real N+1). Named to mirror
    // User.profilePicture/profile_picture exactly. Kept in sync by
    // MediaService whenever the owner sets/removes a PLACE-owned AVATAR
    // media row, same pattern updateCoverPhoto already established for
    // COVER.
    await queryInterface.addColumn('providers_places', 'profile_picture', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('providers_places', 'profile_picture');
  }
};
