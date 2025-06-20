const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the existing enum type if it exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_procurements_status') THEN
          ALTER TABLE procurements ALTER COLUMN status DROP DEFAULT;
          ALTER TABLE procurements ALTER COLUMN status TYPE VARCHAR(255);
          DROP TYPE enum_procurements_status;
        END IF;
      END $$;
    `);

    // Create new enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_procurements_status AS ENUM ('received', 'completed');
    `);

    // Update column to use new enum type with default
    await queryInterface.sequelize.query(`
      ALTER TABLE procurements 
      ALTER COLUMN status TYPE enum_procurements_status 
      USING status::enum_procurements_status,
      ALTER COLUMN status SET DEFAULT 'received'::enum_procurements_status;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // If needed to rollback, convert to varchar
    await queryInterface.sequelize.query(`
      ALTER TABLE procurements ALTER COLUMN status TYPE VARCHAR(255);
      DROP TYPE IF EXISTS enum_procurements_status;
    `);
  }
}; 