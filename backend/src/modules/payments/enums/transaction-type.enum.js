"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["PAYMENT"] = "payment";
    TransactionType["REFUND"] = "refund";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["PAYOUT"] = "payout";
    TransactionType["FEE"] = "fee";
    TransactionType["BONUS"] = "bonus";
    TransactionType["ADJUSTMENT"] = "adjustment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
