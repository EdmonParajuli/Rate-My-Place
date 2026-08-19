'use strict';

/** @type {import('sequelize-cli').Seed} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('providers_category', [
      {
        label: 'Housing & Apartments',
        description: 'Apartment complexes, rental buildings, and other residential housing.',
        icon: 'building-2',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers_category', { label: 'Housing & Apartments' }, {});
  }
};
