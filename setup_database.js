// Execute with Node.js to set up the database schema
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';

// Configure neon to use ws
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function dropTables() {
  try {
    console.log('Dropping all tables...');
    // Drop tables in correct order (respecting foreign key constraints)
    await pool.query('DROP TABLE IF EXISTS likes CASCADE');
    await pool.query('DROP TABLE IF EXISTS comments CASCADE');
    await pool.query('DROP TABLE IF EXISTS submissions CASCADE');
    await pool.query('DROP TABLE IF EXISTS prompts CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

async function runMigration() {
  try {
    console.log('Running migration...');
    
    // Create tables using schema from shared/schema.ts
    await pool.query(`
    -- Create users table with UUID
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    -- Create prompts table with UUID
    CREATE TABLE IF NOT EXISTS prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id),
      creator_role TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      is_daily BOOLEAN DEFAULT FALSE NOT NULL,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    -- Create submissions table with UUID
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id UUID NOT NULL REFERENCES prompts(id),
      user_id UUID REFERENCES users(id),
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    -- Create comments table with UUID
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES submissions(id),
      user_id UUID REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    -- Create likes table with UUID and unique constraint
    CREATE TABLE IF NOT EXISTS likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      submission_id UUID REFERENCES submissions(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT user_submission_unique UNIQUE(user_id, submission_id)
    );
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Insert sample users
    const user1Result = await pool.query(`
      INSERT INTO users (username, password, name, avatar) 
      VALUES ('alexj', 'password123', 'Alex Janssen', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde')
      RETURNING id
    `);
    const user1 = user1Result.rows[0];
    
    const user2Result = await pool.query(`
      INSERT INTO users (username, password, name, avatar) 
      VALUES ('saradv', 'password123', 'Sara de Vries', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330')
      RETURNING id
    `);
    const user2 = user2Result.rows[0];
    
    const user3Result = await pool.query(`
      INSERT INTO users (username, password, name, avatar) 
      VALUES ('thomasb', 'password123', 'Thomas Berg', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36')
      RETURNING id
    `);
    const user3 = user3Result.rows[0];
    
    const user4Result = await pool.query(`
      INSERT INTO users (username, password, name, avatar) 
      VALUES ('kimv', 'password123', 'Kim Visser', 'https://images.unsplash.com/photo-1607746882042-944635dfe10e')
      RETURNING id
    `);
    const user4 = user4Result.rows[0];
    
    const user5Result = await pool.query(`
      INSERT INTO users (username, password, name, avatar) 
      VALUES ('joostb', 'password123', 'Joost Bakker', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e')
      RETURNING id
    `);
    const user5 = user5Result.rows[0];
    
    // Insert writer prompts
    const writerPrompt1Result = await pool.query(`
      INSERT INTO prompts (creator_id, creator_role, type, content, is_active, is_daily, likes, comments) 
      VALUES ($1, 'writer', 'text', 
        '"De oude vuurtoren stond daar, eenzaam aan de rand van de kliffen, als een stille wachter over de woeste zee. Jarenlang had hij schepen veilig naar de kust geloodst, maar nu stond hij verlaten, zijn licht gedoofd. Tot die ene stormachtige nacht, toen haar lantaarn voor het eerst in decennia weer tot leven kwam..."',
        true, true, 218, 87)
      RETURNING id
    `, [user1.id]);
    const writerPrompt1 = writerPrompt1Result.rows[0];
    
    const writerPrompt2Result = await pool.query(`
      INSERT INTO prompts (creator_id, creator_role, type, content, is_active, is_daily, likes, comments) 
      VALUES ($1, 'writer', 'text', 
        '"De robot had 257 jaar in de verlaten bibliotheek gezeten, boeken lezend en verzorgend. Nu was er voor het eerst een mens binnengekomen, een kind met grote ogen, dat verbaasd tussen de eindeloze boekenrijen stond. De robot deed wat hij altijd deed: hij reikte naar de plank en koos het perfecte boek uit voor zijn nieuwe bezoeker..."',
        false, false, 183, 73)
      RETURNING id
    `, [user2.id]);
    const writerPrompt2 = writerPrompt2Result.rows[0];
    
    // Insert sketcher prompts
    const sketcherPrompt1Result = await pool.query(`
      INSERT INTO prompts (creator_id, creator_role, type, content, is_active, is_daily, likes, comments) 
      VALUES ($1, 'sketcher', 'image', 'https://images.unsplash.com/photo-1618331835717-801e976710b2',
        true, true, 218, 87)
      RETURNING id
    `, [user3.id]);
    const sketcherPrompt1 = sketcherPrompt1Result.rows[0];
    
    const sketcherPrompt2Result = await pool.query(`
      INSERT INTO prompts (creator_id, creator_role, type, content, is_active, is_daily, likes, comments) 
      VALUES ($1, 'sketcher', 'image', 'https://images.unsplash.com/photo-1613312968134-3fd240c3c9ad',
        true, false, 183, 73)
      RETURNING id
    `, [user4.id]);
    const sketcherPrompt2 = sketcherPrompt2Result.rows[0];
    
    // Insert submissions
    await pool.query(`
      INSERT INTO submissions (prompt_id, user_id, type, content, likes, comments) 
      VALUES ($1, $2, 'text', 
        '"Model RK-7 was niet ontworpen om te dromen. Toch zag hij de vlinders elke nacht in zijn stand-bymodus. Ze dansten door zijn geheugencircuits, brachten kleur waar alleen binaire code hoorde te zijn. Toen hij er eentje in het park tegenkwam, bevroor zijn systeem voor precies 2,7 seconden. Zijn metallische hand reikte voorzichtig uit, maar de vlinder was al weer weg. In zijn logboek noteerde hij: ''Vandaag leerde ik wat verlangen is.''"',
        5, 2)
    `, [sketcherPrompt2.id, user5.id]);
    
    await pool.query(`
      INSERT INTO submissions (prompt_id, user_id, type, content, likes, comments) 
      VALUES ($1, $2, 'image', 'https://images.unsplash.com/photo-1582985412748-cf5339357e77',
        10, 3)
    `, [writerPrompt1.id, user3.id]);
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    await dropTables();
    await runMigration();
    await seedDatabase();
    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main();