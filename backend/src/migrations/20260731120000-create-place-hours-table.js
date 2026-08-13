'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // No deleted_at / paranoid on this table - hours get replaced wholesale
    // (delete the place's rows, insert the new set) rather than edited in
    // place, so there's no history worth keeping, same reasoning as
    // providers_review_votes from Phase 2.
    await queryInterface.createTable('providers_place_hours', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_places',
          key: 'id'
        }
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      opens_at: {
        type: Sequelize.TIME,
        allowNull: false
      },
      closes_at: {
        type: Sequelize.TIME,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('providers_place_hours', ['place_id', 'day_of_week'], {
      unique: true,
      name: 'providers_place_hours_place_id_day_of_week_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_place_hours');
  }
};
