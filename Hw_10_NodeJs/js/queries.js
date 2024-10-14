const mssql = require('mssql');
const connection = require('./config');

module.exports = {
    // Регистрация пользователя с транзакцией
    registerUser: async function (name, login, password) {
        const transaction = new mssql.Transaction(await connection);
        try {
            await transaction.begin(); // Начинаем транзакцию
            const request = new mssql.Request(transaction);
            await request.input('Name', mssql.NVarChar(50), name)
                .input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('INSERT INTO Users (Name, Login, Password) VALUES (@Name, @Login, @Password)');
            await transaction.commit(); // Подтверждаем транзакцию
        } catch (error) {
            await transaction.rollback(); // Откатываем изменения в случае ошибки
            throw error;
        }
    },

    // Авторизация пользователя
    loginUser: async function (login, password) {
        try {
            const pool = await connection;
            const result = await pool.request()
                .input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('SELECT * FROM Users WHERE Login = @Login AND Password = @Password');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    // Авторизация администратора
    loginAdmin: async function (login, password) {
        try {
            const pool = await connection;
            const result = await pool.request()
                .input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('SELECT * FROM Admins WHERE Login = @Login AND Password = @Password');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    // Получение всех пользователей
    getAllUsers: async function () {
        try {
            const pool = await connection;
            const result = await pool.request().query('SELECT * FROM Users');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    },

    // Получение пользователя по ID
    getUserById: async function (id) {
        try {
            const pool = await connection;
            const result = await pool.request()
                .input('Id', mssql.Int, id)
                .query('SELECT * FROM Users WHERE Id = @Id');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    // Обновление данных пользователя с транзакцией
    updateUser: async function (id, name, login) {
        const transaction = new mssql.Transaction(await connection);
        try {
            await transaction.begin();
            const request = new mssql.Request(transaction);
            await request.input('Id', mssql.Int, id)
                .input('Name', mssql.NVarChar(50), name)
                .input('Login', mssql.NVarChar(50), login)
                .query('UPDATE Users SET Name = @Name, Login = @Login WHERE Id = @Id');
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    // Удаление пользователя с транзакцией
    deleteUser: async function (id) {
        const transaction = new mssql.Transaction(await connection);
        try {
            await transaction.begin();
            const request = new mssql.Request(transaction);
            await request.input('Id', mssql.Int, id)
                .query('DELETE FROM Users WHERE Id = @Id');
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
