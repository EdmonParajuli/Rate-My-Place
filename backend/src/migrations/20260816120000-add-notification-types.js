'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ALTER TYPE ... ADD VALUE can't run inside the multi-statement transaction
  // some Postgres versions wrap DDL in - each statement run separately here
  // (IF NOT EXISTS makes this migration safe to re-run).
  async up (queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_providers_notifications_type" ADD VALUE IF NOT EXISTS 'WATCHED_PLACE_REVIEW';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_providers_notifications_type" ADD VALUE IF NOT EXISTS 'HELPFUL_VOTE_RECEIVED';`
    );
  },

  // Postgres has no ALTER TYPE ... DROP VALUE - down is a no-op (matches
  // this project's precedent of accepting one-directional enum-value
  // migrations rather than rebuilding the type to remove a value).
  async down () {}
};
