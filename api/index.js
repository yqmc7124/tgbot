const bot = require('../tgbot')

const express = require('express');
const app = express();
app.use(function (req, res, next) {
    if (req.path === '/') {
        res.send('welcome!')
    } else {
        next()
    }
})
app.use('/api/tg', function (req, res, next) {
    bot.listener(req, res, next)
})
app.get('/api', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item:`);
});
module.exports = app;