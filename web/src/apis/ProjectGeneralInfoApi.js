"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ApiDirector_1 = require("./ApiDirector");
var ApiRequestCallBuilder_1 = require("./apiBuilders/ApiRequestCallBuilder");
var BLApiRequestCallBuilder_1 = require("./apiBuilders/BLApiRequestCallBuilder");
var requestEnums_1 = require("./apiBuilders/requestEnums");
var apiCalls_1 = require("../functions/apiCalls");
var apiHelpers_1 = require("./apiHelpers");
var BLApiRequestCallBuilder_2 = require("./apiBuilders/BLApiRequestCallBuilder");
var ProjectGeneralInfoApi = /** @class */ (function (_super) {
    __extends(ProjectGeneralInfoApi, _super);
    function ProjectGeneralInfoApi() {
        var _this = _super.call(this) || this;
        _this.listPublicProjects = _this.listPublicProjects.bind(_this);
        _this.getProjectDetails = _this.getProjectDetails.bind(_this);
        _this.getProjectDetailsNoAuth = _this.getProjectDetailsNoAuth.bind(_this);
        return _this;
    }
    ProjectGeneralInfoApi.prototype.create = function (body, projectType, isNamespaceAGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, apiReqBuilder, response, body_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseUrl = "/api/v1/" + projectType + "s";
                        apiReqBuilder = new ApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.POST, this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND), baseUrl, JSON.stringify(body));
                        return [4 /*yield*/, fetch(apiReqBuilder.build())];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        body_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(body_1.error_message)];
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        });
    };
    ProjectGeneralInfoApi.prototype.transferProjectToNamespace = function (projectId, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, body, apiReqBuilder, response, body_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseUrl = "/api/v4/projects/" + projectId + "/transfer";
                        body = {
                            namespace: namespace
                        };
                        apiReqBuilder = new ApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.PUT, this.buildBasicHeaders(requestEnums_1.validServicesToCall.GITLAB), baseUrl, JSON.stringify(body));
                        return [4 /*yield*/, fetch(apiReqBuilder.build())];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        body_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(body_2.error_message)];
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        });
    };
    ProjectGeneralInfoApi.prototype.getProjectInfoApi = function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, builder, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "/api/v4/projects/" + projectId + "?statistics=true";
                        builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, this.buildBasicHeaders(requestEnums_1.validServicesToCall.GITLAB), url);
                        return [4 /*yield*/, fetch(builder.build())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, Promise.reject(response)];
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    ProjectGeneralInfoApi.prototype.getProjectsList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, builder;
            return __generator(this, function (_a) {
                url = '/api/v1/projects';
                builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND), url);
                return [2 /*return*/, fetch(builder.build())
                        .then(apiCalls_1.handleResponse)];
            });
        });
    };
    ProjectGeneralInfoApi.prototype.listPublicProjects = function () {
        var url = '/api/v1/projects/public';
        return fetch(url)
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.getCodeProjectById = function (projectId) {
        var url = "/api/v1/code-projects/" + projectId;
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.getMembers = function (projectId) {
        var url = "/api/v1/data-projects/" + projectId + "/users";
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse)
            .then(apiHelpers_1.filterBots);
    };
    ProjectGeneralInfoApi.prototype.addMember = function (projectId, formData) {
        var url = "/api/v1/data-projects/" + projectId + "/users";
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new ApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.POST, headers, url, JSON.stringify(formData));
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.removeMember = function (projectId, userUuid) {
        var url = "/api/v1/data-projects/" + projectId + "/users/" + userUuid;
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.DELETE, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.updateProjectDetails = function (projectId, body) {
        var url = "/api/v1/data-projects/" + projectId;
        var data = __assign({}, body);
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new ApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.PUT, headers, url, JSON.stringify(data));
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.getSlugForValidName = function (name) {
        var url = "/api/v1/project-names/is-available?name=" + name;
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, headers, url);
        return fetch(builder.build());
    };
    // updateProjectAvatar(projectId: number, payload: FormData) {
    //   const url = `/api/v4/projects/${projectId}`;
    //   const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    //   const builder = new ApiRequestCallBuilder(METHODS.PUT, headers, url, payload);
    //   return fetch(builder.build())
    //     .then(handleResponse);
    // }
    /**
     * @param {*} id: project which will be forked
     * @param {*} namespace: space to fork project to
     * @param {*} name: forked project name
     */
    ProjectGeneralInfoApi.prototype.forkProject = function (id, namespace, name) {
        return __awaiter(this, void 0, void 0, function () {
            var builder;
            return __generator(this, function (_a) {
                builder = new ApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.POST, this.buildBasicHeaders(requestEnums_1.validServicesToCall.GITLAB), "/api/v4/projects/" + id + "/fork", JSON.stringify({
                    id: id, namespace: namespace, name: name
                }));
                return [2 /*return*/, fetch(builder.build())];
            });
        });
    };
    ProjectGeneralInfoApi.prototype.removeProject = function (id) {
        var url = "/api/v1/data-projects/" + id;
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.DELETE, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.getUsers = function (projectId) {
        var url = "/api/v4/projects/" + projectId + "/users";
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.GITLAB);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse)
            .then(apiHelpers_1.filterBots);
    };
    ProjectGeneralInfoApi.prototype.getProjectDetails = function (namespace, slug) {
        var url = "/api/v1/projects/slug/" + slug;
        var headers = this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND);
        var builder = new BLApiRequestCallBuilder_1["default"](requestEnums_1.METHODS.GET, headers, url);
        return fetch(builder.build())
            .then(apiCalls_1.handleResponse)
            .then(function (results) { return results.find(function (res) { return res.gitlab_namespace === namespace; }); });
    };
    ProjectGeneralInfoApi.prototype.getProjectDetailsNoAuth = function (namespace, slug) {
        return this.listPublicProjects()
            .then(apiCalls_1.handlePagination)
            .then(apiCalls_1.inspect)
            .then(function (results) { return results
            .filter(function (res) { return res.gitlab_namespace === namespace; })
            .find(function (res) { return res.slug === slug; }); });
    };
    ProjectGeneralInfoApi.prototype.star = function (projectId, isProjectStarred) {
        var baseUrl = "/api/v1/projects/" + projectId + "/star";
        var apiReqBuilder = new BLApiRequestCallBuilder_2["default"](isProjectStarred ? requestEnums_1.METHODS.DELETE : requestEnums_1.METHODS.POST, this.buildBasicHeaders(requestEnums_1.validServicesToCall.BACKEND), baseUrl);
        return fetch(apiReqBuilder.build())
            .then(apiCalls_1.handleResponse);
    };
    ProjectGeneralInfoApi.prototype.listStarrers = function (gId) {
        var baseUrl = "/api/v4/projects/" + gId + "/starrers";
        var apiReqBuilder = new BLApiRequestCallBuilder_2["default"](requestEnums_1.METHODS.GET, this.buildBasicHeaders(requestEnums_1.validServicesToCall.GITLAB), baseUrl);
        return fetch(apiReqBuilder.build())
            .then(apiCalls_1.handleResponse);
    };
    return ProjectGeneralInfoApi;
}(ApiDirector_1["default"]));
exports["default"] = ProjectGeneralInfoApi;
