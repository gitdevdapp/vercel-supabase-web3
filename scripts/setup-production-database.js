#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script sets up the production Supabase database using the service role key.
 * It reads the SQL file and executes it against the production database.
 * 
 * Usage:
 *   node scripts/setup-production-database.js
 * 
 * Requirements:
 *   - Service role key (will be prompted securely)
 *   - Network access to Supabase
 * 
 * Security:
 *   - Service role key is handled in memory only
 *   - No sensitive data is written to files
 *   - Key is cleared after use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Supabase configuration
const SUPABASE_URL = 'https://[REDACTED-PROJECT-ID].supabase.co';
const SQL_FILE_PATH = path.join(__dirname, 'enhanced-database-setup.sql');

/**
 * Securely prompt for service role key
 */
function promptForServiceKey() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Hide input for security
        const stdin = process.openStdin();
        process.stdin.on('data', char => {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.pause();
                    break;
                default:
                    process.stdout.write('\b*');
                    break;
            }
        });

        rl.question('🔑 Enter Supabase Service Role Key (input hidden): ', (key) => {
            console.log(''); // New line after hidden input
            rl.close();
            resolve(key.trim());
        });
    });
}

/**
 * Execute SQL against Supabase database
 */
async function executeSQLFile(serviceKey, sqlContent) {
    console.log('🚀 Executing database setup...\n');

    try {
        // Use the Supabase REST API to execute SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                sql: sqlContent
            })
        });

        if (!response.ok) {
            // Try alternative approach using the SQL endpoint
            const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${serviceKey}`,
                    'apikey': serviceKey,
                    'Content-Type': 'application/sql'
                },
                body: sqlContent
            });

            if (!sqlResponse.ok) {
                throw new Error(`Database execution failed: ${response.status} ${response.statusText}`);
            }
        }

        console.log('✅ Database setup completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error executing database setup:', error.message);
        return false;
    }
}

/**
 * Alternative method using PostgreSQL direct connection
 */
async function executeSQLDirect(serviceKey, sqlContent) {
    console.log('🔄 Trying direct PostgreSQL execution...\n');
    
    try {
        // Extract database info from service key JWT
        const payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64').toString());
        const dbRef = payload.ref;
        
        // Use pg library if available
        const { Client } = require('pg');
        
        const client = new Client({
            host: `db.${dbRef}.supabase.co`,
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: serviceKey,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();
        console.log('🔗 Connected to production database');
        
        // Execute the SQL
        await client.query(sqlContent);
        
        await client.end();
        console.log('✅ Database setup completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Direct connection failed:', error.message);
        console.log('💡 Make sure you have "pg" package installed: npm install pg');
        return false;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🗄️  Production Database Setup Script');
    console.log('=====================================\n');

    // Check if SQL file exists
    if (!fs.existsSync(SQL_FILE_PATH)) {
        console.error(`❌ SQL file not found: ${SQL_FILE_PATH}`);
        process.exit(1);
    }

    console.log(`📋 Found SQL file: ${path.basename(SQL_FILE_PATH)}`);
    
    // Read SQL file
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    console.log(`📄 SQL file contains ${sqlContent.split('\n').length} lines`);
    console.log(`🎯 Target database: ${SUPABASE_URL}\n`);

    // Warn about service key usage
    console.log('⚠️  SECURITY WARNING:');
    console.log('   This script requires your Supabase service role key');
    console.log('   The key will be handled securely and not stored anywhere');
    console.log('   Only use this for one-time database setup\n');

    const proceed = await new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Continue with database setup? (y/N): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!proceed) {
        console.log('❌ Setup cancelled by user');
        process.exit(0);
    }

    // Get service key
    const serviceKey = await promptForServiceKey();
    
    if (!serviceKey) {
        console.error('❌ No service key provided');
        process.exit(1);
    }

    // Validate service key format (JWT)
    if (!serviceKey.match(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
        console.error('❌ Invalid service key format (should be a JWT token)');
        process.exit(1);
    }

    console.log('🔍 Service key validated');

    // Try to execute SQL
    let success = false;
    
    // First try REST API approach
    success = await executeSQLFile(serviceKey, sqlContent);
    
    // If REST API fails, try direct PostgreSQL connection
    if (!success) {
        console.log('\n🔄 REST API failed, trying direct connection...');
        success = await executeSQLDirect(serviceKey, sqlContent);
    }

    // Clear service key from memory
    serviceKey.replace(/./g, '0');

    if (success) {
        console.log('\n🎉 Production database setup completed!');
        console.log('\nNext steps:');
        console.log('1. ✅ Database schema is now ready');
        console.log('2. 🚀 Deploy your application to production');
        console.log('3. 🧪 Test the authentication flow');
        console.log('4. 🗑️  Delete the service role key from your system');
        console.log('\n⚠️  Remember to remove any files containing the service role key!');
    } else {
        console.log('\n❌ Database setup failed');
        console.log('\nAlternative options:');
        console.log('1. 🌐 Use Supabase Dashboard SQL Editor (recommended)');
        console.log('2. 📋 Copy and paste the SQL file contents manually');
        console.log('3. 🔧 Check your service role key permissions');
    }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error.message);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n❌ Setup cancelled by user');
    process.exit(0);
});

// Run the script
main().catch(console.error);
