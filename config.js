module.exports =  {
    token: '6162797200:AAHEW85jl7QbQfsgAX5UFU3dvk4UhurzEIo',
    webhook: {
        url: 'https://tgbot-seven-eta.vercel.app/api/tg/updateMessage'
    },
    polling: { // Optional. Use polling.
        interval: 1000, // Optional. How often check updates (in ms).
        timeout: 0, // Optional. Update polling timeout (0 - short polling).
        limit: 100, // Optional. Limits the number of updates to be retrieved.
        retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
        proxy: 'http://127.0.0.1:33210' //本地代理，否则node里的请求不会通过vpn
    }
}