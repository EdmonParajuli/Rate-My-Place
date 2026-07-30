'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // No deleted_at / paranoid on this table, unlike the rest of the schema -
    // a vote is a pure toggle (row exists = helpful, row absent = not), so
    // un-voting hard-deletes the row rather than soft-deleting it. That keeps
    // the UNIQUE(review_id, user_id) below a plain index instead of needing
    // the partial-index workaround providers_reviews_replies needed for its
    // own soft-deleted, reusable unique key.
    await queryInterface.createTable('providers_review_votes', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_reviews',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers_users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('providers_review_votes', ['review_id', 'user_id'], {
      unique: true,
      name: 'providers_review_votes_review_id_user_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_review_votes');
  }
};
