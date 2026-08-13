'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('providers_places', 'trending_score', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Sorting listPlaces by TRENDING is a plain indexed-column ORDER BY, same
    // as HIGHEST_RATED/NEW - not the computed-expression case NEAREST is.
    await queryInterface.addIndex('providers_places', ['trending_score'], {
      name: 'providers_places_trending_score_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('providers_places', 'providers_places_trending_score_idx');
    await queryInterface.removeColumn('providers_places', 'trending_score');
  }
};
