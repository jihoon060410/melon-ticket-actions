"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const webhook_1 = require("@slack/webhook");
const axios_1 = require("axios");
const qs = require("querystring");

(async () => {
    var _a;
    // Validate parameters
    const [productId, scheduleId, webhookUrl] = [
        "product-id",
        "schedule-id",
        "slack-incoming-webhook-url",
    ].map((name) => {
        const value = core.getInput(name);
        if (!value) {
            throw new Error(`melon-ticket-actions: Please set ${name} input parameter`);
        }
        return value;
    });

    // 좌석 ID 배열: Floor M=1, Y=2, AE=3, S=4, PA=5
    const seatIds = ['1', '2', '3', '4', '5'];

    const message = (_a = core.getInput("message")) !== null && _a !== void 0 ? _a : "티켓사세요";
    const webhook = new webhook_1.IncomingWebhook(webhookUrl);

    for (const seatId of seatIds) {
        try {
            const res = await axios_1.default({
                method: "POST",
                url: "https://ticket.melon.com/tktapi/product/seatStateInfo.json",
                params: {
                    v: "1",
                },
                data: qs.stringify({
                    prodId: productId,
                    scheduleNo: scheduleId,
                    seatId,
                    volume: 1,
                    selectedGradeVolume: 1,
                }),
            });
            console.log(`Seat ID ${seatId} response:`, res.data);

            if (res.data.chkResult) {
                const link = `http://ticket.melon.com/performance/index.htm?${qs.stringify({
                    prodId: productId,
                })}`;
                await webhook.send(`${message} 좌석 ID ${seatId} 예매 가능! ${link}`);
            }
        } catch (error) {
            console.error(`Error checking seat ID ${seatId}:`, error);
        }
    }
})().catch((e) => {
    console.error(e.stack); // tslint:disable-line
    core.setFailed(e.message);
});
