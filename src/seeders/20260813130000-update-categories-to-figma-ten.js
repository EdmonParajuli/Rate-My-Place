'use strict';

/** @type {import('sequelize-cli').Seed} */
module.exports = {
  // Aligns the category set with the 10 categories the Phase 4 frontend design
  // was actually built against (docs/specs/phase-4-frontend-mvp.md,
  // research/design-tokens.md's accent-color/icon extraction) — the original
  // seeder only had 5, and none had a description worth calling "curated."
  //
  // Four existing categories have an obvious 1:1 rename onto the Figma set
  // (Restaurant->Restaurants, Cafe->Cafés, Hotel->Hotels, Gym->Fitness) and are
  // updated in place, preserving their ids so any existing Place.categoryId
  // foreign keys stay valid. "Bar" has no Figma counterpart at all — kept as an
  // 11th category rather than deleted (a deliberate decision, not an oversight).
  //
  // `icon` switches meaning here: the original seed used flaticon.com image
  // URLs, but every Phase 4 frontend prototype (and the design-tokens research
  // it was extracted from) uses lucide-react icon *names* instead. No real
  // frontend consumes the old URL convention yet, so this seeder moves the
  // whole table onto the convention that's actually going to be built against,
  // rather than leaving two inconsistent meanings in the same column.
  async up (queryInterface, Sequelize) {
    const renames = [
      { from: 'Restaurant', label: 'Restaurants', description: 'Places where people pay to sit and eat meals that are cooked and served on the premises.', icon: 'utensils-crossed' },
      { from: 'Cafe', label: 'Cafés', description: 'Small restaurants selling light meals, coffee, and other drinks.', icon: 'coffee' },
      { from: 'Hotel', label: 'Hotels', description: 'Places that provide accommodation, meals, and other services for travelers and tourists.', icon: 'hotel' },
      { from: 'Gym', label: 'Fitness', description: 'Gyms, studios, and other places equipped for physical exercise.', icon: 'dumbbell' },
    ];

    for (const r of renames) {
      await queryInterface.bulkUpdate(
        'providers_category',
        { label: r.label, description: r.description, icon: r.icon, updated_at: new Date() },
        { label: r.from }
      );
    }

    // Bar isn't part of the Figma 10 — kept, just moved onto the lucide-name
    // icon convention for consistency with every other row.
    await queryInterface.bulkUpdate(
      'providers_category',
      { icon: 'beer', updated_at: new Date() },
      { label: 'Bar' }
    );

    await queryInterface.bulkInsert('providers_category', [
      { label: 'Shopping', description: 'Retail stores and boutiques for clothing, goods, and everyday essentials.', icon: 'shopping-bag', created_at: new Date(), updated_at: new Date() },
      { label: 'Healthcare', description: 'Clinics, dental offices, and other providers of medical care.', icon: 'stethoscope', created_at: new Date(), updated_at: new Date() },
      { label: 'Education', description: 'Schools, tutoring centers, and other places for learning and instruction.', icon: 'graduation-cap', created_at: new Date(), updated_at: new Date() },
      { label: 'Beauty & Wellness', description: 'Spas, salons, and wellness centers offering beauty and relaxation services.', icon: 'scissors', created_at: new Date(), updated_at: new Date() },
      { label: 'Entertainment', description: 'Venues for movies, live music, and other recreational entertainment.', icon: 'music', created_at: new Date(), updated_at: new Date() },
      { label: 'Professional Services', description: 'Legal, financial, and other professional or business services.', icon: 'briefcase', created_at: new Date(), updated_at: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers_category', {
      label: ['Shopping', 'Healthcare', 'Education', 'Beauty & Wellness', 'Entertainment', 'Professional Services'],
    }, {});

    const reverts = [
      { from: 'Restaurants', label: 'Restaurant', description: 'A place where people pay to sit and eat meals that are cooked and served on the premises.', icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
      { from: 'Cafés', label: 'Cafe', description: 'A small restaurant selling light meals and drinks.', icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
      { from: 'Hotels', label: 'Hotel', description: 'A place that provides accommodation, meals, and other services for travelers and tourists.', icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
      { from: 'Fitness', label: 'Gym', description: 'A place equipped for physical exercise.', icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
    ];

    for (const r of reverts) {
      await queryInterface.bulkUpdate(
        'providers_category',
        { label: r.label, description: r.description, icon: r.icon, updated_at: new Date() },
        { label: r.from }
      );
    }

    await queryInterface.bulkUpdate(
      'providers_category',
      { icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', updated_at: new Date() },
      { label: 'Bar' }
    );
  }
};
