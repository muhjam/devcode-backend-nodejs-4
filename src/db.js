const mysql = require('mysql2/promise');

// koneksi ke database mysql
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    database: process.env.MYSQL_DBNAME || 'contact-manager',
    password: process.env.MYSQL_PASSWORD || '123123',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// migrasi database mysql
const migration = async () => {
    try {
        // query mysql untuk membuat table contacts
        await db.query(
            `
            CREATE TABLE IF NOT EXISTS contacts (
            id int not null auto_increment,
            full_name varchar(255) not null,
            phone_number varchar(255) not null,
            email varchar(255) not null,
            primary key (id)
            )
        `
        );
        console.log('Running Migration Successfully!');
    } catch (err) {
        throw err;
    }
};

// TODO: Lengkapi fungsi dibawah ini untuk mengambil data didalam database
const find = async () => {
    const query = 'SELECT * FROM contacts';
    const connection = await db.getConnection();
    const [results] = await connection.query(query);
    connection.release();
    const formattedResults = results.map((result) => ({
        id: result.id,
        full_name: result.full_name,
        phone_number: result.phone_number,
        email: result.email,
    }));

    return formattedResults;
};

// TODO: Lengkapi fungsi dibawah ini untuk menyimpan data kedalam database
const create = async (data) => {
    const query =
        'INSERT INTO contacts (full_name, phone_number, email) VALUES (?, ?, ?)';
    const connection = await db.getConnection();

    const { full_name, phone_number, email } = {
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
    };
    const results = await connection.query(query, [
        full_name,
        phone_number,
        email,
    ]);

    return {
        id: results[0].insertId,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
    };
};

// TODO: Lengkapi fungsi dibawah ini untuk mengedit data didalam database
const update = async (id, data) => {
    const contacts =
        'SELECT full_name, phone_number, email FROM contacts WHERE id = ?';
    const query =
        'UPDATE contacts SET full_name = ?, phone_number = ?, email = ? WHERE id = ? ';
    const connection = await db.getConnection();
    const contact = await connection.query(contacts, id);
    const { full_name, phone_number, email, id_contact } = {
        full_name:
            data.full_name != null ? data.full_name : contact[0][0].full_name,
        phone_number:
            data.phone_number != null
                ? data.phone_number
                : contact[0][0].phone_number,
        email: data.email != null ? data.email : contact[0][0].email,
        id_contact: id,
    };
    await connection.query(query, [full_name, phone_number, email, id_contact]);
    connection.release();

    return {
        id: parseInt(id),
        full_name: full_name,
        phone_number: phone_number,
        email: email,
    };
};

// TODO: Lengkapi fungsi dibawah ini untuk menghapus data didalam database
const destroy = async (id) => {
    const query = 'DELETE FROM contacts WHERE contacts.id = ?';
    const connection = await db.getConnection();

    await connection.query(query, id);
    connection.release();

    return parseInt(id);
};

module.exports = { migration, find, create, update, destroy };
