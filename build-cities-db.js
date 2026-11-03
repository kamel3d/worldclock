#!/usr/bin/env node

/**
 * GeoNames Cities Database Builder
 *
 * Parses GeoNames data files and creates an optimized JSON database
 * for the World Clock application.
 *
 * Input files (from http://download.geonames.org/export/dump/):
 * - cities15000.txt: Cities with population > 15,000
 * - countryInfo.txt: Country codes to names mapping
 * - admin1CodesASCII.txt: State/province names
 *
 * Output:
 * - cities.json: Optimized database with ~34K cities
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_FILE = path.join(__dirname, 'cities.json');

// Minimum population threshold (optional filter)
const MIN_POPULATION = 50000; // Filter to major cities only

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║       GeoNames Cities Database Builder               ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

// Storage for parsed data
const countries = new Map(); // country_code -> country_name
const admin1Codes = new Map(); // "CC.ADMIN1" -> admin1_name
const cities = [];

/**
 * Parse countryInfo.txt to get country names
 */
async function parseCountryInfo() {
    console.log('📋 Parsing countryInfo.txt...');

    const filePath = path.join(ASSETS_DIR, 'countryInfo.txt');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const line of rl) {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') continue;

        const parts = line.split('\t');
        if (parts.length >= 5) {
            const countryCode = parts[0]; // ISO 2-letter code
            const countryName = parts[4]; // Country name
            countries.set(countryCode, countryName);
            count++;
        }
    }

    console.log(`   ✓ Loaded ${count} countries`);
}

/**
 * Parse admin1CodesASCII.txt to get state/province names
 */
async function parseAdmin1Codes() {
    console.log('📋 Parsing admin1CodesASCII.txt...');

    const filePath = path.join(ASSETS_DIR, 'admin1CodesASCII.txt');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const line of rl) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
            const code = parts[0]; // "CC.ADMIN1"
            const name = parts[1]; // Admin division name
            admin1Codes.set(code, name);
            count++;
        }
    }

    console.log(`   ✓ Loaded ${count} admin divisions`);
}

/**
 * Parse cities15000.txt to get city data
 */
async function parseCities() {
    console.log('📋 Parsing cities15000.txt...');
    console.log('   (This may take a minute...)');

    const filePath = path.join(ASSETS_DIR, 'cities15000.txt');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let total = 0;
    let filtered = 0;

    for await (const line of rl) {
        total++;
        const parts = line.split('\t');

        if (parts.length >= 19) {
            const population = parseInt(parts[14]) || 0;

            // Optional: Filter by population threshold
            if (population < MIN_POPULATION) {
                filtered++;
                continue;
            }

            const countryCode = parts[8];
            const admin1Code = parts[10];
            const featureCode = parts[7]; // PPLC=capital, PPLA=admin capital, PPL=city

            const city = {
                id: parts[0],
                name: parts[1],
                asciiName: parts[2],
                latitude: parseFloat(parts[4]),
                longitude: parseFloat(parts[5]),
                country: countryCode,
                countryName: countries.get(countryCode) || countryCode,
                admin1: admin1Codes.get(`${countryCode}.${admin1Code}`) || '',
                population: population,
                timezone: parts[17],
                isCapital: featureCode === 'PPLC' || featureCode === 'PPLA'
            };

            cities.push(city);
        }
    }

    console.log(`   ✓ Parsed ${total} cities`);
    if (filtered > 0) {
        console.log(`   ✓ Filtered out ${filtered} cities (population < ${MIN_POPULATION})`);
    }
    console.log(`   ✓ Included ${cities.length} cities in database`);
}

/**
 * Sort and optimize the cities array
 */
function optimizeCities() {
    console.log('');
    console.log('🔧 Optimizing database...');

    // Sort by population (largest first)
    cities.sort((a, b) => b.population - a.population);

    console.log(`   ✓ Sorted ${cities.length} cities by population`);
}

/**
 * Write the final JSON database
 */
function writeDatabaseFile() {
    console.log('');
    console.log('💾 Writing cities.json...');

    const data = {
        metadata: {
            source: 'GeoNames (http://www.geonames.org/)',
            generatedAt: new Date().toISOString(),
            totalCities: cities.length,
            minPopulation: MIN_POPULATION,
            version: '1.0'
        },
        cities: cities
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

    const stats = fs.statSync(OUTPUT_FILE);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`   ✓ Database written to: ${OUTPUT_FILE}`);
    console.log(`   ✓ File size: ${sizeMB} MB`);
}

/**
 * Display summary statistics
 */
function displaySummary() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                   Summary                             ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Total cities:        ${cities.length.toLocaleString()}`);
    console.log(`Countries:           ${countries.size}`);
    console.log(`Admin divisions:     ${admin1Codes.size.toLocaleString()}`);
    console.log(`Min population:      ${MIN_POPULATION.toLocaleString()}`);
    console.log('');

    // Top 10 cities
    console.log('Top 10 cities by population:');
    cities.slice(0, 10).forEach((city, i) => {
        console.log(`  ${(i + 1).toString().padStart(2)}. ${city.name.padEnd(20)} ${city.countryName.padEnd(25)} ${city.population.toLocaleString().padStart(12)}`);
    });

    console.log('');
    console.log('✅ Database build complete!');
    console.log('');
}

/**
 * Main build process
 */
async function build() {
    try {
        // Check if assets directory exists
        if (!fs.existsSync(ASSETS_DIR)) {
            console.error(`❌ Error: Assets directory not found: ${ASSETS_DIR}`);
            console.error('   Please ensure GeoNames files are in the assets folder.');
            process.exit(1);
        }

        // Parse all input files
        await parseCountryInfo();
        await parseAdmin1Codes();
        await parseCities();

        // Optimize and write output
        optimizeCities();
        writeDatabaseFile();

        // Display summary
        displaySummary();

    } catch (error) {
        console.error('❌ Error building database:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the build
build();
