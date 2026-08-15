'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Standard paranoid: true (base project convention) - unlike the toggle
    // join tables (ReviewVote/SavedPlace/UserBadge), deleting a notification
    // is a normal, reversible content delete, not "undo an action".
    await queryInterface.createTable('providers_notifications', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_users',
          key: 'id'
        }
      },
      type: {
        type: Sequelize.ENUM('REVIEW_REPLY', 'NEW_REVIEW', 'BADGE_EARNED'),
        allowNull: false
      },
      // Precomputed human-readable text at creation time (e.g. "The Daily
      // Grind replied to your review") - simpler than a generic payload blob
      // the frontend would have to interpret, and avoids N+1 lookups to
      // resolve a place label per notification at render time.
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      // Nullable - only used as a navigation target. BADGE_EARNED has none
      // (there's no single place a badge is "about").
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'providers_places',
          key: 'id'
        }
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Backs both the unread-count query and the UNREAD filter.
    await queryInterface.addIndex('providers_notifications', ['user_id', 'read'], {
      name: 'providers_notifications_user_id_read_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_notifications_type";');
  }
};
