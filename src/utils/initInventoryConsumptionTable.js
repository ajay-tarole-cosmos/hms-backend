const { sequelize } = require('../config/postgres.js');

const initInventoryConsumptionTable = async () => {
  try {
    // Create the enum type if it doesn't exist
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE consumption_source_type AS ENUM ('procurement', 'manual', 'consumption');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE consumption_change_type AS ENUM ('increase', 'decrease');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create the inventory_consumption_history table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS inventory_consumption_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID NOT NULL REFERENCES inventory_items(id),
        previous_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        change_amount INTEGER NOT NULL,
        change_type consumption_change_type NOT NULL,
        source_type consumption_source_type NOT NULL DEFAULT 'manual',
        source_id UUID,
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        changed_by UUID,
        reference_number VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Inventory consumption history table initialized successfully');
  } catch (error) {
    console.error('Error initializing inventory consumption history table:', error);
    throw error;
  }
};

module.exports = initInventoryConsumptionTable; 