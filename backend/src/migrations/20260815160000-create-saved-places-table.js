'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // No deleted_at / paranoid on this table, same reasoning as
    // providers_review_votes - saving is a pure toggle (row exists = saved,
    // row absent = not), so un-saving hard-deletes rather than soft-deletes,
    // keeping UNIQUE(user_id, place_id) a plain index.
    await queryInterface.createTable('providers_saved_places', {
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
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_places',
          key: 'id'
        }
      },
      // A saved place belongs to exactly one list at a time - SAVED (the
      // default, i.e. plain "All Saved" with no sub-category), WANT_TO_VISIT,
      // or FAVORITE. "Reviewed" is deliberately not a value here - it's
      // derived live from providers_reviews, never stored (see
      // docs/specs/phase-5-saved-places.md).
      list_type: {
        type: Sequelize.ENUM('SAVED', 'WANT_TO_VISIT', 'FAVORITE'),
        allowNull: false,
        defaultValue: 'SAVED'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('providers_saved_places', ['user_id', 'place_id'], {
      unique: true,
      name: 'providers_saved_places_user_id_place_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_saved_places');
    // Postgres ENUM types aren't dropped automatically when the column that
    // used them is removed - clean it up explicitly so undo is actually
    // reversible, same as add-price-range-to-places.js.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_providers_saved_places_list_type";');
  }
};
