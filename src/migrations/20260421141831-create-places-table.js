'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('providers_places',{
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_users',
          key: 'id'
        },
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'providers_category',
          key: 'id'
        }
      },
      average_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5
        }
      },
      review_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
    });
    await queryInterface.addIndex('provider_places',['label'],{
      concurrently: true,
      name: 'providers_places_label',
      where: {
        deleted_at: null,
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_places')
  }
};
