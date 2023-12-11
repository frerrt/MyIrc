import { Connection } from 'mysql2/typings/mysql/lib/Connection';
const { db } = require("./db");

export async function main(username: string, password: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            if (username && password) {
             
                const query = 'SELECT * FROM users WHERE username = ?';

                const [dbRows, fields] = await db.promise().query(query, [username]);

                if (dbRows.length > 0) {
                    const storedPassword: string = dbRows[0].password;

                    if (storedPassword === password) {
                        resolve(true); // Passwords match, authentication succeeds.
                    } else {
                        resolve(false); // Passwords do not match.
                    }
                } else {
                    resolve(false); // User not found.
                }
                // db.end();
            } else {
                resolve(false); // Missing username or password.
            }
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}