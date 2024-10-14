const queries = require('./queries');
var path = require('path');

module.exports = {
    // Регистрация нового пользователя
    registerUser: async function (req, res) {
        const { name, login, password } = req.body;
        try {
            await queries.registerUser(name, login, password);
            res.send('<p>User registered successfully! Redirecting to index page...</p><script>setTimeout(() => { window.location.href = "/" }, 3000);</script>');
        } catch (error) {
            if (error.message.includes('Violation of UNIQUE KEY constraint')) {
                // Обработка ошибки уникальности логина (пользователь уже существует)
                res.send('<p>User already exists! Redirecting to register page...</p><script>setTimeout(() => { window.location.href = "/register" }, 3000);</script>');
            } else {
                res.status(500).send('Error registering user');
            }
        }
    },

    // Вход в систему для пользователя или администратора
    loginUser: async function (req, res) {
        const { login, password } = req.body;
        try {
            const admin = await queries.loginAdmin(login, password);
            if (admin) {
                // Если администратор - с возможностью редактирования
                const users = await queries.getAllUsers();
                res.render('users', { users: users, isAdmin: true });
            } else {
                const user = await queries.loginUser(login, password);
                if (user) {
                   // Если обычный пользователь - без возможности редактирования
                    const users = await queries.getAllUsers();
                    res.render('users', { users: users, isAdmin: false });
                } else {
                    // Если пользователь не найден - обратно на страницу входа
                    res.send('<p>Invalid login or password! Redirecting to login page...</p><script>setTimeout(() => { window.location.href = "/login" }, 3000);</script>');
                }
            }
        } catch (error) {
            res.status(500).send('Error logging in user');
        }
    },

    // Отображение всех пользователей
    displayUsers: async function (req, res) {
        try {
            const users = await queries.getAllUsers();
            res.render('users', { users, isAdmin: true });
        } catch (error) {
            res.status(500).send('Error displaying users');
        }
    },

    // Загрузка страницы редактирования для конкретного пользователя
    loadEditUserPage: async function (req, res) {
        try {
            const { id } = req.params;
            const user = await queries.getUserById(id);
            res.render('edit_user', { user });
        } catch (error) {
            res.status(500).send('Error loading edit user page');
        }
    },

    // Обновление данных пользователя
    updateUser: async function (req, res) {
        const { id } = req.params;
        const { name, login } = req.body;
        try {
            await queries.updateUser(id, name, login);
            res.redirect('/users');
        } catch (error) {
            res.status(500).send('Error updating user');
        }
    },

    // Удаление пользователя
    deleteUser: async function (req, res) {
        const { id } = req.params;
        try {
            await queries.deleteUser(id);
            res.redirect('/users');
        } catch (error) {
            res.status(500).send('Error deleting user');
        }
    }
};
