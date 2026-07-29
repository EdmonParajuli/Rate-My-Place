'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('providers_category', [
      {
        label: 'Restaurant',
        description: 'A place where people pay to sit and eat meals that are cooked and served on the premises.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        label: 'Cafe',
        description: 'A small restaurant selling light meals and drinks.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        label: 'Bar',
        description: 'A place where alcoholic drinks are served.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        label: 'Hotel',
        description: 'A place that provides accommodation, meals, and other services for travelers and tourists.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        label: 'Gym',
        description: 'A place equipped for physical exercise.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers_category', null, {});
  }
};
