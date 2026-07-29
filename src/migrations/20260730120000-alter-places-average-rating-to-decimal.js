'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('providers_places', 'average_rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('providers_places', 'average_rating', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  }
};
