var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var insertHandler = require('./js/insertHandler');
var port = 8080;

// Установка генератора шаблонов
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));

// Подгрузка статических файлов из папки css
app.use('/static', express.static(path.join(__dirname, 'css')));

// Middleware для обработки данных в формате JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Маршруты
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', insertHandler.loginUser);
app.post('/register', insertHandler.registerUser);

// Маршрут для отображения всех пользователей
app.get('/users', insertHandler.displayUsers);

// Маршруты для редактирования и удаления пользователей
app.get('/edit/:id', insertHandler.loadEditUserPage);
app.post('/edit/:id', insertHandler.updateUser);
app.post('/delete/:id', insertHandler.deleteUser);

// Обработка ошибок
app.use(function (err, req, res, next) {
    if (err) console.log(err.stack);
    res.status(500).send('Oops... something went wrong');
});

app.listen(port, function () {
    console.log(`App listening on port ${port}`);
});
