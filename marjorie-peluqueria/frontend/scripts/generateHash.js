// scripts/generateHash.js
const bcrypt = require('bcryptjs');

const password = 'marjorie2024';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Hash para la contraseña:', password);
        console.log('INSERT INTO usuarios (username, password_hash, nombre, email, rol)');
        console.log(`VALUES ('admin', '${hash}', 'Administrador', 'admin@marjorie.com', 'superadmin');`);
    }
});