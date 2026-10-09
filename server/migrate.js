const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Migration runner for MySQL schema changes.
 * Reads .sql files from a migrations directory, checks the migrations table
 * to see which have already been applied, and runs the ones that haven't.
 */
class Migrator {
  /**
   * @param {Object} dbConfig - mysql2/promise connection config
   * @param {string} migrationDir - directory containing numbered SQL files
   */
  constructor(dbConfig, migrationDir) {
    this.dbConfig = dbConfig;
    this.migrationDir = migrationDir;
  }

  /**
   * Get connection (creates one per run, caller can also pass a pool/connection).
   */
  async _getConnection() {
    return mysql.createConnection(this.dbConfig);
  }

  /**
   * List migration files sorted by name (assumes filename-based ordering,
   * e.g. 001_create_xxx.sql, 002_add_yyy.sql).
   */
  _listMigrationFiles() {
    if (!fs.existsSync(this.migrationDir)) {
      throw new Error(`Migration directory not found: ${this.migrationDir}`);
    }
    const files = fs.readdirSync(this.migrationDir).filter((f) => f.endsWith('.sql'));
    if (files.length === 0) return [];
    files.sort(); // lexicographic sort works for zero-padded numbers
    return files.map((f) => path.join(this.migrationDir, f));
  }

  /**
   * Fetch already-applied migration filenames from the migrations table.
   */
  async _getAppliedMigrationNames(conn) {
    const [rows] = await conn.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    return new Set(rows.map((r) => r.filename));
  }

  /**
   * Record that a migration was applied.
   */
  async _recordMigration(conn, filename) {
    await conn.query('INSERT INTO migrations (filename) VALUES (?)', [filename]);
  }

  /**
   * Run all pending migrations. Returns an object summarising the run.
   * @param {Object} [options] - { connection?: mysql2 connection (optional) }
   */
  async run({ connection } = {}) {
    const conn = connection || (await this._getConnection());
    let released = false;
    try {
      // Ensure migrations table exists before querying it
      await this._ensureMigrationsTable(conn);

      const applied = await this._getAppliedMigrationNames(conn);
      const files = this._listMigrationFiles();
      const pending = files.filter((f) => !applied.has(path.basename(f)));

      if (pending.length === 0) {
        return { applied: [], skipped: files.map((f) => path.basename(f)) };
      }

      const appliedFiles = [];
      const log = [];

      for (const filePath of pending) {
        const filename = path.basename(filePath);
        const sql = fs.readFileSync(filePath, 'utf8');
        log.push(`Running migration: ${filename}`);

        try {
          await conn.query(sql);
          await this._recordMigration(conn, filename);
          appliedFiles.push(filename);
          log.push(`  -> applied`);
        } catch (err) {
          log.push(`  -> failed: ${err.message || err}`);
          throw new Error(`Migration failed: ${filename} — ${err.message || err}`);
        }
      }

      return {
        applied: appliedFiles,
        skipped: files.filter((f) => applied.has(path.basename(f))).map((f) => path.basename(f)),
        log,
      };
    } finally {
      if (!released && !connection) {
        await conn.end();
      }
    }
  }

  /**
   * Run the initial migrations_table.sql on the connection if it doesn't exist.
   * Used to bootstrap the tracking table itself.
   */
  async _ensureMigrationsTable(conn) {
    const migrationsTableSql = path.join(this.migrationDir, 'migrations_table.sql');
    if (fs.existsSync(migrationsTableSql)) {
      const sql = fs.readFileSync(migrationsTableSql, 'utf8');
      await conn.query(sql);
    }
  }
}

/**
 * Bootstraps and runs migrations, then optionally keeps a persistent
 * connection for the app to reuse. Call this at server startup.
 *
 * @param {Object} dbConfig
 * @param {string} migrationDir
 * @returns {Object} { migrator, connection } — connection is left open when
 *   `keepConnection` is true (default false).
 */
async function runMigrations(dbConfig, migrationDir, { keepConnection = false } = {}) {
  const migrator = new Migrator(dbConfig, migrationDir);
  const conn = await mysql.createConnection(dbConfig);
  try {
    await migrator._ensureMigrationsTable(conn);
    const result = await migrator.run({ connection: conn });
    if (!keepConnection) {
      await conn.end();
      return result;
    }
    return { result, connection: conn, migrator };
  } catch (err) {
    await conn.end();
    throw err;
  }
}

module.exports = { Migrator, runMigrations };

// When run directly: `node migrate.js` or `npm run migrate`
if (require.main === module) {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'osas_database',
  };

  const migrationDir = path.resolve(__dirname, 'database');

  runMigrations(dbConfig, migrationDir)
    .then((result) => {
      if (result.applied.length) {
        console.log(`Migrations applied: ${result.applied.join(', ')}`);
      } else {
        console.log('No new migrations to apply');
      }
      if (result.skipped.length) {
        console.log(`Already applied (skipped): ${result.skipped.join(', ')}`);
      }
    })
    .catch((err) => {
      console.error('Migration failed:', err.message || err);
      process.exit(1);
    });
}
