import { pool } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  console.log('🚀 Running database migrations...');

  try {
    // Create extension for UUID
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create ENUM types
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE session_status AS ENUM ('draft', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE game_path AS ENUM ('castle', 'workshop', 'dumpster_fire');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE pile_type AS ENUM ('handled', 'need_help', 'unknown', 'unassigned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        logo_url TEXT,
        primary_color VARCHAR(7) DEFAULT '#FF6B35',
        secondary_color VARCHAR(7) DEFAULT '#1A1A2E',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Game sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        access_token VARCHAR(64) UNIQUE NOT NULL,
        status session_status DEFAULT 'draft',
        path_chosen game_path,
        company_profile JSONB DEFAULT '{}',
        medal_type VARCHAR(100),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Players table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        color VARCHAR(7) DEFAULT '#6366F1',
        is_default BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Responsibility templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responsibility_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id UUID REFERENCES responsibility_templates(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        why_it_matters TEXT,
        typical_owner VARCHAR(255),
        category VARCHAR(50),
        industry_tags TEXT[] DEFAULT '{}',
        min_company_size INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Responsibility assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responsibility_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        template_id UUID REFERENCES responsibility_templates(id) ON DELETE CASCADE,
        player_id UUID REFERENCES players(id) ON DELETE SET NULL,
        pile pile_type DEFAULT 'unassigned',
        is_expanded BOOLEAN DEFAULT FALSE,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, template_id)
      );
    `);

    // Jane conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jane_conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
        messages JSONB DEFAULT '[]',
        context_item_id UUID REFERENCES responsibility_templates(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_access_token ON game_sessions(access_token);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_client ON game_sessions(client_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_assignments_session ON responsibility_assignments(session_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_templates_parent ON responsibility_templates(parent_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_templates_category ON responsibility_templates(category);`);

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

migrate();
