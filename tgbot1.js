const config = require('./config')
const TelegramBot = require('./src/telegram');

const msgKey = ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'inline_query', 'chosen_inline_result', 'callback_query', 'shipping_query', 'pre_checkout_query',
'poll', 'poll_answer', 'chat_member', 'my_chat_member', 'chat_join_request']
var lastMessage;
var photoUrl = 'https://telegram.org/img/tl_card_destruct.gif';
var callback = {}

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
        .finally(() => {
            execCallback(msg)
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
        .finally(() => {
            execCallback(msg)
        })
});

bot.onText(/^[^/].*/, msg => {
   return bot.sendMessage(msg.chat.id, 'I am alive!')
       .finally(() => {
            execCallback(msg)
        })
})

function handleUpdateMessage(body) {
    console.log("handleUpdateMessage:", body)
    if (body) bot.processUpdate(body);
}
function addCallback(data, fun) {
    for (let k of msgKey) {
        if (data[k]) {
            data[k].update_id = data.update_id
            callback[data.update_id] = fun
        }
    }
}
function execCallback(msg) {
    if (msg && msg.update_id && callback[msg.update_id]) {
        callback[msg.update_id]()
        callback[msg.update_id] = undefined
    }
}
module.exports = {
    listener: function (req, res, next) {
        // console.log("url:", req.url)
        switch (req.url) {
            case '/updateMessage': {
                let body = '';
                req.on('data', (data) => body += data);
                req.on('end', () => {
                    let data = JSON.parse(body)
                    handleUpdateMessage(data)
                    //vercel部署后，项目不是持续监听的，而是只有webhook触发时才激活，res.end()后又会立刻挂起，从而导致异步操作无法完成
                    addCallback(data, () => {
                        res.end()
                    })
                })
                break
            }
            default: {
                res.end()
            }
        }
    }
}