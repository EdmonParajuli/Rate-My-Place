'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('providers_users',{
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,

      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_type: {
        type: Sequelize.ENUM([
          'REGULAR',
          'BUSINESS'
        ]),
        allowNull: false,
        defaultValue: 'REGULAR'
      },
      profile_picture: {
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
    await queryInterface.addIndex('providers_users',['email'],{unique: true})
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('providers_users')
  }
};
