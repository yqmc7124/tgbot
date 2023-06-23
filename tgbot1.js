const config = require('./config')
const TelegramBot = require('./src/telegram');

var lastMessage;
var photoUrl = 'https://telegram.org/img/tl_card_destruct.gif';

var bot
if (config.webhook) {
    bot = new TelegramBot(config.token);
    bot.setWebHook(config.webhook.url)
} else {
    bot = new TelegramBot(config.token, {polling: config.polling, request: {proxy: config.polling.proxy}})
    // bot.startPolling({restart: true})
}

bot.onText(/\/start/, msg => {
    console.log("start:")

    // Send image with caption
    return bot.sendPhoto(
        msg.from.id, photoUrl, {caption: 'This is a default caption.'}
    ).then(re => {
        // Get message id and chat
        console.log("/start re:", re)
        lastMessage = [msg.from.id, re.message_id];
       return bot.sendMessage(msg.from.id, 'Now set a new caption using /edit <caption>');
    })

});

bot.onText(/\/edit/, msg => {
    if (!lastMessage) {
        return bot.sendMessage(msg.from.id, 'Type /start and then /edit <caption>');
    }

    let [chatId, messageId] = lastMessage;
    let caption = msg.text.replace('/edit ', '');

    if (caption == '/edit') caption = 'No caption.';

    // Change caption
    return bot.editMessageCaption(caption, {chat_id: chatId, message_id: messageId}).then(() => {
      return bot.sendMessage(msg.from.id, `Caption changed to: ${ caption }`);
    })
});

bot.onText(/^[^/].*/, msg => {
   return bot.sendMessage(msg.chat.id, 'I am alive!')
})

function handleUpdateMessage(body) {
    console.log("handleUpdateMessage:", body)
    if (body) bot.processUpdate(body);
}

module.exports = {
    listener: function (req, res, next) {
        console.log("url:", req.url)
        switch (req.url) {
            case '/updateMessage': {
                let body = '';
                req.on('data', (data) => body += data);
                req.on('end', () => {
                    res.end()
                    handleUpdateMessage(JSON.parse(body))
                })
                break
            }
            default: {
                res.end()
            }
        }
    }
}