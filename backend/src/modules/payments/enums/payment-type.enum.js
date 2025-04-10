"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentType = void 0;
var PaymentType;
(function (PaymentType) {
    PaymentType["ORDER"] = "order";
    PaymentType["DEPOSIT"] = "deposit";
    PaymentType["WITHDRAWAL"] = "withdrawal";
    PaymentType["REFUND"] = "refund";
    PaymentType["FEE"] = "fee";
    PaymentType["COMMISSION"] = "commission";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
