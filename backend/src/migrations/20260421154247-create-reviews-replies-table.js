'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('providers_reviews_replies',{
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
    owner_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'providers_users',
        key: 'id'
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
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
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_reviews_replies');
  }
};
