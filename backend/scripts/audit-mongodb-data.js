#!/usr/bin/env node

/**
 * MongoDB Data Audit Script
 * 
 * This script performs comprehensive auditing of MongoDB collections
 * to ensure they comply with expected schema validation rules.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const colors = require('colors/safe');
require('dotenv').config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nionfar';
const OUTPUT_DIR = path.join(__dirname, '../audit-reports');

// Ensure audit directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(colors.green('✓ Connected to MongoDB'));
    return client;
  } catch (error) {
    console.error(colors.red('✗ Failed to connect to MongoDB:'), error);
    process.exit(1);
  }
}

async function getCollectionSchemas(client) {
  const db = client.db();
  const collections = await db.listCollections().toArray();
  
  // Get validator schemas for each collection
  const schemas = {};
  for (const collection of collections) {
    try {
      const options = await db.command({ 
        collMod: collection.name,
        validator: { $get: true } 
      });
      
      schemas[collection.name] = options.validator || {};
    } catch (error) {
      console.log(colors.yellow(`No schema validation for collection: ${collection.name}`));
      schemas[collection.name] = {};
    }
  }
  
  return { collections, schemas };
}

async function auditCollection(client, collectionName, schema) {
  const db = client.db();
  const collection = db.collection(collectionName);
  const results = {
    collectionName,
    documentCount: await collection.countDocuments(),
    validDocuments: 0,
    invalidDocuments: [],
    missingFields: {},
    typeErrors: {},
  };
  
  // Skip audit if no schema
  if (!schema.$jsonSchema) {
    results.status = 'SKIPPED - No schema validation';
    return results;
  }
  
  const requiredFields = schema.$jsonSchema.required || [];
  const properties = schema.$jsonSchema.properties || {};
  
  // Audit each document
  const cursor = collection.find({});
  let count = 0;
  
  while (await cursor.hasNext()) {
    const document = await cursor.next();
    count++;
    
    if (count % 1000 === 0) {
      process.stdout.write(`Auditing ${collectionName}: ${count} documents\r`);
    }
    
    let isValid = true;
    const errors = [];
    
    // Check required fields
    for (const field of requiredFields) {
      if (document[field] === undefined) {
        isValid = false;
        errors.push(`Missing required field: ${field}`);
        results.missingFields[field] = (results.missingFields[field] || 0) + 1;
      }
    }
    
    // Check types
    for (const [field, spec] of Object.entries(properties)) {
      if (document[field] !== undefined) {
        const expectedType = spec.bsonType || spec.type;
        if (expectedType) {
          let actualType = typeof document[field];
          if (document[field] === null) actualType = 'null';
          if (Array.isArray(document[field])) actualType = 'array';
          if (document[field] instanceof Date) actualType = 'date';
          if (document[field] instanceof mongoose.Types.ObjectId) actualType = 'objectId';
          
          const typeMap = {
            'string': ['string'],
            'number': ['number', 'int', 'double', 'decimal'],
            'boolean': ['bool', 'boolean'],
            'object': ['object'],
            'array': ['array'],
            'null': ['null'],
            'date': ['date'],
            'objectId': ['objectId']
          };
          
          const validTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
          
          const isTypeValid = validTypes.some(type => {
            return typeMap[actualType] && typeMap[actualType].includes(type);
          });
          
          if (!isTypeValid) {
            isValid = false;
            errors.push(`Type error for ${field}: expected ${expectedType}, got ${actualType}`);
            const key = `${field}:${expectedType}`;
            results.typeErrors[key] = (results.typeErrors[key] || 0) + 1;
          }
        }
      }
    }
    
    if (isValid) {
      results.validDocuments++;
    } else {
      results.invalidDocuments.push({
        _id: document._id,
        errors
      });
    }
  }
  
  return results;
}

function generateReport(auditResults) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(OUTPUT_DIR, `mongodb-audit-${timestamp}.json`);
  
  // Summary stats
  const summary = {
    timestamp,
    collectionsAudited: auditResults.length,
    totalDocuments: auditResults.reduce((acc, res) => acc + res.documentCount, 0),
    totalValidDocuments: auditResults.reduce((acc, res) => acc + res.validDocuments, 0),
    totalInvalidDocuments: auditResults.reduce((acc, res) => acc + (res.invalidDocuments?.length || 0), 0),
    collectionResults: auditResults
  };
  
  // Write detailed report
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  
  return { summary, reportPath };
}

async function main() {
  console.log(colors.blue('Starting MongoDB data audit...'));
  const client = await connectToMongoDB();
  
  try {
    const { collections, schemas } = await getCollectionSchemas(client);
    console.log(colors.blue(`Found ${collections.length} collections to audit`));
    
    const auditResults = [];
    for (const collection of collections) {
      const schema = schemas[collection.name];
      process.stdout.write(`Auditing collection "${collection.name}"...\r`);
      const result = await auditCollection(client, collection.name, schema);
      auditResults.push(result);
      
      const invalidCount = result.invalidDocuments?.length || 0;
      const validPercent = result.documentCount ? 
        ((result.validDocuments / result.documentCount) * 100).toFixed(2) : 100;
      
      const status = invalidCount === 0 ? 
        colors.green('✓ PASSED') : 
        colors.red(`✗ FAILED (${invalidCount} invalid documents)`);
      
      console.log(`${collection.name}: ${status} - ${validPercent}% valid (${result.validDocuments}/${result.documentCount})`);
    }
    
    const { summary, reportPath } = generateReport(auditResults);
    
    console.log('\n' + colors.blue('==== AUDIT SUMMARY ===='));
    console.log(`Collections audited: ${summary.collectionsAudited}`);
    console.log(`Total documents: ${summary.totalDocuments}`);
    console.log(`Valid documents: ${summary.totalValidDocuments}`);
    console.log(`Invalid documents: ${summary.totalInvalidDocuments}`);
    
    if (summary.totalInvalidDocuments > 0) {
      console.log(colors.yellow('\nRecommendation: Run the schema fix script to resolve data issues'));
      console.log(colors.yellow('  npm run mongodb:fix'));
    }
    
    console.log(colors.green(`\nDetailed audit report saved to: ${reportPath}`));
    
  } catch (error) {
    console.error(colors.red('Error during audit:'), error);
    process.exit(1);
  } finally {
    await client.close();
    console.log(colors.blue('MongoDB connection closed'));
  }
}

main().catch(console.error); 