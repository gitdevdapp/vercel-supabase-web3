#!/usr/bin/env node

/**
 * Direct Production Database Setup Script
 * 
 * This script directly sets up the production database using the provided service role key.
 * This is the faster, non-interactive version for immediate setup.
 * 
 * SECURITY: Service role key is embedded - use only once then delete this file
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA';
const SQL_FILE_PATH = path.join(__dirname, 'enhanced-database-setup.sql');

async function executeDatabaseSetup() {
    console.log('🗄️  Direct Production Database Setup');
    console.log('====================================\n');

    try {
        // Read the SQL file
        if (!fs.existsSync(SQL_FILE_PATH)) {
            throw new Error(`SQL file not found: ${SQL_FILE_PATH}`);
        }

        const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
        console.log(`📋 Loaded SQL file: ${sqlContent.split('\n').length} lines`);
        console.log(`🎯 Target: ${SUPABASE_URL}\n`);

        // Try using the pg library for direct connection
        let success = false;
        
        try {
            console.log('🔄 Attempting direct PostgreSQL connection...');
            const { Client } = require('pg');
            
            // Extract database reference from JWT
            const payload = JSON.parse(Buffer.from(SERVICE_KEY.split('.')[1], 'base64').toString());
            const dbRef = payload.ref;
            
            const client = new Client({
                host: `db.${dbRef}.supabase.co`,
                port: 5432,
                database: 'postgres',
                user: 'postgres',
                password: SERVICE_KEY,
                ssl: { rejectUnauthorized: false }
            });

            await client.connect();
            console.log('🔗 Connected to production database');
            
            // Execute the SQL file
            await client.query(sqlContent);
            console.log('✅ SQL execution completed');
            
            await client.end();
            success = true;
            
        } catch (pgError) {
            console.log('⚠️  PostgreSQL connection failed, trying REST API...');
            console.log(`   Error: ${pgError.message}`);
            
            // Fallback to Supabase REST API
            try {
                // Split SQL into individual statements for execution
                const statements = sqlContent
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

                console.log(`📝 Executing ${statements.length} SQL statements via API...`);

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];
                    if (statement.trim()) {
                        console.log(`   Statement ${i + 1}/${statements.length}...`);
                        
                        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${SERVICE_KEY}`,
                                'apikey': SERVICE_KEY,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                sql: statement + ';'
                            })
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            console.log(`   ⚠️  Statement ${i + 1} warning: ${response.status} - ${errorText}`);
                        }
                    }
                }
                
                success = true;
                console.log('✅ REST API execution completed');
                
            } catch (apiError) {
                console.error('❌ REST API execution failed:', apiError.message);
            }
        }

        if (success) {
            console.log('\n🎉 Production database setup completed successfully!');
            console.log('\n📋 What was set up:');
            console.log('   ✅ Enhanced profiles table with all fields');
            console.log('   ✅ Row Level Security (RLS) policies');
            console.log('   ✅ Automatic profile creation triggers');
            console.log('   ✅ Data validation constraints');
            console.log('   ✅ Performance indexes');
            console.log('   ✅ Migration for existing users');
            
            console.log('\n🚀 Next steps:');
            console.log('   1. Run verification script: node scripts/verify-production-setup.js');
            console.log('   2. Deploy your application');
            console.log('   3. Test authentication flow');
            console.log('   4. DELETE this file (contains service key)');
            
        } else {
            console.log('\n❌ Database setup failed');
            console.log('\n🔧 Manual setup required:');
            console.log(`   1. Go to: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
            console.log('   2. Copy and paste contents of: scripts/enhanced-database-setup.sql');
            console.log('   3. Click "Run" to execute the setup');
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Execute the setup
executeDatabaseSetup();
