'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('providers_category',{
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // providers_places.category_id is created FK-less by the previous
    // migration (this table didn't exist yet at that point) - add the actual
    // constraint here, now that both tables exist.
    await queryInterface.addConstraint('providers_places', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'providers_places_category_id_fkey',
      references: {
        table: 'providers_category',
        field: 'id',
      },
    });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.removeConstraint('providers_places', 'providers_places_category_id_fkey');
   await queryInterface.dropTable('providers_category');
  }
};
