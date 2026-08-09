'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('providers_places', 'latitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });
    await queryInterface.addColumn('providers_places', 'longitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });

    // Not optional: without this, sort: NEAREST's Haversine ORDER BY isn't
    // sargable and forces a full-table scan on every request - this index is
    // what lets the bounding-box WHERE pre-filter in PlaceRepository use an
    // index instead of a sequential scan. See
    // docs/07-geo-and-location-strategy.md §4-5.
    await queryInterface.addIndex('providers_places', ['latitude', 'longitude'], {
      name: 'providers_places_latitude_longitude_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('providers_places', 'providers_places_latitude_longitude_idx');
    await queryInterface.removeColumn('providers_places', 'longitude');
    await queryInterface.removeColumn('providers_places', 'latitude');
  }
};
