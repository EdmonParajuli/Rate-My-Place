'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Polymorphic (doc 3): one table for place photos, review photos, and
    // user avatar/cover rather than three near-identical tables. Standard
    // paranoid: true - deleting an uploaded photo is a normal, reversible
    // content delete.
    await queryInterface.createTable('providers_media', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      owner_type: {
        type: Sequelize.ENUM('PLACE', 'REVIEW', 'USER'),
        allowNull: false
      },
      // Not a real FK - owner_type decides which table owner_id points into,
      // so a single references clause can't express it (same tradeoff as
      // any polymorphic-association table).
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      kind: {
        type: Sequelize.ENUM('PHOTO', 'AVATAR', 'COVER'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Backs "find the current AVATAR/COVER for this user" and, later, "find
    // all PHOTOs for this place/review".
    await queryInterface.addIndex('providers_media', ['owner_type', 'owner_id', 'kind'], {
      name: 'providers_media_owner_kind_idx'
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('providers_media');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_media_owner_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_media_kind";');
  }
};
