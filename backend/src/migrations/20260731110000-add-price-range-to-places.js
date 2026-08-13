'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('providers_places', 'price_range', {
      type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('providers_places', 'price_range');
    // Postgres ENUM types aren't dropped automatically when the column that
    // used them is removed - clean it up explicitly so undo is actually
    // reversible, not just "column gone, orphaned type left behind."
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_places_price_range";');
  }
};
