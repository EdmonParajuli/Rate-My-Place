'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('providers_reviews', ['place_id', 'reviewer_id'], {
      unique: true,
      name: 'providers_reviews_place_id_reviewer_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('providers_reviews', 'providers_reviews_place_id_reviewer_id_unique');
  }
};
