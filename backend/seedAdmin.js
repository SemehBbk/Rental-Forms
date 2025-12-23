const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/adminModel');

dotenv.config();

const createAdmin = async () => {
    try {
        const db = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
        await mongoose.connect(db);
        console.log('DB Connected for Seeding');

        // Check if admin exists
        const existing = await Admin.findOne({ email: 'admin@admin.com' });
        if (existing) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@admin.com',
            password: 'password123',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log('Email: admin@admin.com');
        console.log('Password: password123');
        process.exit(0);

    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

createAdmin();
