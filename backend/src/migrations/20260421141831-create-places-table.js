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
      // No inline FK reference here - providers_category doesn't exist yet at
      // this point in migration history (created by the next migration). The
      // FK constraint itself is added there instead, once both tables exist.
      // Found replaying migrations against a fresh DB for integration tests
      // (docs/specs/phase-9-integration-tests.md) - the real dev DB was never
      // actually migrated from empty, so this ordering bug was latent.
      category_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('providers_places',['label'],{
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
