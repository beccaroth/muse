/**
 * Notion Data Import Script
 *
 * This script imports your existing Notion projects and seeds into Supabase.
 *
 * Run with: npx tsx scripts/import-notion-data.ts
 *
 * Make sure to:
 * 1. Set up your Supabase project first
 * 2. Run the migration SQL in supabase/migrations/001_initial_schema.sql
 * 3. Add your Supabase credentials to .env
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Your Notion Projects data
const projects = [
  {
    project_name: 'Skippers',
    status: 'In progress' as const,
    priority: 'Next' as const,
    project_types: ['Screenplay', 'Animation'] as const[],
    description: 'National Treasure in Disneyland',
    start_value: 0,
    end_value: 100,
    current_value: 40,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Sandman Inc.',
    status: 'On hold' as const,
    priority: 'Next' as const,
    project_types: ['Animation'] as const[],
    description: 'The last sandman spends all his time crushing amorphous dreams into dream dust in a factory on the moon. His life is gray and boring until a rogue dream escapes, literally bringing color into his life.',
    start_value: 0,
    end_value: 100,
    current_value: 10,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Heartbreak Video',
    status: 'Done' as const,
    priority: 'Now' as const,
    project_types: ['Screenplay'] as const[],
    description: "Romeo & Juliet at Blockbuster & Hollywood Video in the 90's",
    start_value: 0,
    end_value: 100,
    current_value: 100,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'She/Wolf',
    status: 'In progress' as const,
    priority: 'Now' as const,
    project_types: ['Short Film'] as const[],
    description: 'Ruby, a twenty-something transgender med student, is fighting the dysphoria from her lycanthropy. She\'s experimenting with wolfsbane to create a cure. She finds out about a wellness retreat in Big Bear that promises a more permanent solution. But things get bloody under the next full moon.',
    start_value: 0,
    end_value: 100,
    current_value: 30,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Curtain Call',
    status: 'On hold' as const,
    priority: 'Next' as const,
    project_types: ['Screenplay'] as const[],
    description: 'Friday the 13th at theater camp',
    start_value: 0,
    end_value: 100,
    current_value: 20,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Wizard & Goblin',
    status: 'Not started' as const,
    priority: 'Someday' as const,
    project_types: ['Comic'] as const[],
    description: null,
    start_value: 0,
    end_value: 100,
    current_value: 0,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Prom Swap',
    status: 'On hold' as const,
    priority: 'Next' as const,
    project_types: ['Screenplay'] as const[],
    description: 'A genie trapped in a Tamagotchi grants two closeted transgender high schoolers wish to swap bodies. They spend the weeks before prom exploring the performance of gender, and learning there\'s no easy way to be yourself.',
    start_value: 0,
    end_value: 100,
    current_value: 15,
    start_date: null,
    end_date: null,
  },
  {
    project_name: 'Rabbi Claus',
    status: 'Not started' as const,
    priority: 'Someday' as const,
    project_types: ['Screenplay'] as const[],
    description: 'A Jewish guy decides to be a Santa to make easy money. He ends up saving Christmas.',
    start_value: 0,
    end_value: 100,
    current_value: 0,
    start_date: null,
    end_date: null,
  },
];

// Your Notion Seeds data
const seeds = [
  {
    title: 'CritCompanion',
    description: 'A better character sheet for D&D',
    project_type: 'App' as const,
    date_added: '2025-12-19',
  },
  {
    title: 'Screenwriting App',
    description: 'Plain text screenwriting app like Highland with constant autosaving',
    project_type: 'App' as const,
    date_added: '2025-12-13',
  },
  {
    title: 'Serial + In the Mouth of Madness',
    description: 'Investigative podcaster ends up delving into a Lovecraftian nightmare',
    project_type: 'Screenplay' as const,
    date_added: '2025-11-14',
  },
  {
    title: 'Pop Quiz',
    description: 'Pop culture quiz/panel show',
    project_type: 'Other' as const,
    date_added: '2025-10-23',
  },
  {
    title: 'Warehouse of the Dead',
    description: "Dawn of the Dead but at an Amazon Warehouse / Walmart. Metamorphic shelter in place, what kills you is the cabin fever and paranoia.",
    project_type: 'Screenplay' as const,
    date_added: '2025-10-20',
  },
  {
    title: 'Haunted Muppet',
    description: null,
    project_type: 'Screenplay' as const,
    date_added: '2025-11-02',
  },
];

async function importData() {
  console.log('Starting Notion data import...\n');

  // Import projects
  console.log('Importing projects...');
  for (const project of projects) {
    const { error } = await supabase.from('projects').insert(project);
    if (error) {
      console.error(`  ✗ Failed to import "${project.project_name}":`, error.message);
    } else {
      console.log(`  ✓ Imported "${project.project_name}"`);
    }
  }

  console.log('\nImporting seeds...');
  for (const seed of seeds) {
    const { error } = await supabase.from('seeds').insert(seed);
    if (error) {
      console.error(`  ✗ Failed to import "${seed.title}":`, error.message);
    } else {
      console.log(`  ✓ Imported "${seed.title}"`);
    }
  }

  console.log('\nImport complete!');
}

importData().catch(console.error);
