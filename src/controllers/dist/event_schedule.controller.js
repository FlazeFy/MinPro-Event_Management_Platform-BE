"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.EventScheduleController = void 0;
var event_schedule_repository_1 = require("../repositories/event_schedule.repository");
var EventScheduleController = /** @class */ (function () {
    function EventScheduleController() {
        var _this = this;
        this.getAllEventScheduleController = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var page, limit, startDateRaw, endDateRaw, startDate, endDate, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        page = Number(req.query.page) || 1;
                        limit = Number(req.query.limit) || 14;
                        startDateRaw = typeof req.query.start_date === 'string' ? req.query.start_date.trim() : null;
                        endDateRaw = typeof req.query.end_date === 'string' ? req.query.end_date.trim() : null;
                        startDate = startDateRaw ? new Date(startDateRaw) : null;
                        endDate = endDateRaw ? new Date(endDateRaw) : null;
                        if (startDate && Number.isNaN(startDate.getTime()))
                            throw { code: 400, message: "Invalid start_date format" };
                        if (endDate && Number.isNaN(endDate.getTime()))
                            throw { code: 400, message: "Invalid end_date format" };
                        if (startDate && endDate && startDate > endDate)
                            throw { code: 400, message: "start_date cannot be greater than end_date" };
                        return [4 /*yield*/, this.eventScheduleRepository.findAllEventScheduleRepo(page, limit, startDate, endDate)];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            throw { code: 404, message: "Event Schedule not found" };
                        // Success response
                        res.status(200).json({
                            message: "Get Event schedule successful",
                            data: result.data,
                            meta: {
                                page: page, limit: limit,
                                total: result.total, total_page: Math.ceil(result.total / limit)
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.eventScheduleRepository = new event_schedule_repository_1.EventScheduleRepository();
    }
    return EventScheduleController;
}());
exports.EventScheduleController = EventScheduleController;
