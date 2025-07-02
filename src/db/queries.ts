import { pool } from "./client";
export async function grantPermission(apiKey: string, module: string, action: string) {
    await pool.query(
        `INSERT INTO permissions (api_key, module, action) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
        [apiKey, module, action]
    );
}
export async function revokePermission(apiKey: string, module: string, action: string) {
    await pool.query(`DELETE FROM permissions WHERE api_key = $1 AND module = $2 AND action = $3`, [
        apiKey,
        module,
        action,
    ]);
}
export async function listPermissions(apiKey: string) {
    const res = await pool.query(`SELECT module, action FROM permissions WHERE api_key = $1`, [apiKey]);
    return res.rows;
}
