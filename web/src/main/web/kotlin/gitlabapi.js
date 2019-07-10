(function (root, factory) {
    if (typeof define === 'function' && define.amd)
        define(['exports', 'kotlin', 'kotlinx-serialization-kotlinx-serialization-runtime', 'ktor-ktor-client-core', 'kotlinx-io', 'kotlinx-coroutines-core'], factory);
    else if (typeof exports === 'object')
        factory(module.exports, require('kotlin'), require('kotlinx-serialization-kotlinx-serialization-runtime'), require('ktor-ktor-client-core'), require('kotlinx-io'), require('kotlinx-coroutines-core'));
    else {
        if (typeof kotlin === 'undefined') {
            throw new Error("Error loading module 'gitlabapi'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'gitlabapi'.");
        }
        if (typeof this['kotlinx-serialization-kotlinx-serialization-runtime'] === 'undefined') {
            throw new Error("Error loading module 'gitlabapi'. Its dependency 'kotlinx-serialization-kotlinx-serialization-runtime' was not found. Please, check whether 'kotlinx-serialization-kotlinx-serialization-runtime' is loaded prior to 'gitlabapi'.");
        }
        if (typeof this['ktor-ktor-client-core'] === 'undefined') {
            throw new Error("Error loading module 'gitlabapi'. Its dependency 'ktor-ktor-client-core' was not found. Please, check whether 'ktor-ktor-client-core' is loaded prior to 'gitlabapi'.");
        }
        if (typeof this['kotlinx-io'] === 'undefined') {
            throw new Error("Error loading module 'gitlabapi'. Its dependency 'kotlinx-io' was not found. Please, check whether 'kotlinx-io' is loaded prior to 'gitlabapi'.");
        }
        if (typeof this['kotlinx-coroutines-core'] === 'undefined') {
            throw new Error("Error loading module 'gitlabapi'. Its dependency 'kotlinx-coroutines-core' was not found. Please, check whether 'kotlinx-coroutines-core' is loaded prior to 'gitlabapi'.");
        }
        root.gitlabapi = factory(typeof gitlabapi === 'undefined' ? {} : gitlabapi, kotlin, this['kotlinx-serialization-kotlinx-serialization-runtime'], this['ktor-ktor-client-core'], this['kotlinx-io'], this['kotlinx-coroutines-core']);
    }
}(this, function (_, Kotlin, $module$kotlinx_serialization_kotlinx_serialization_runtime, $module$ktor_ktor_client_core, $module$kotlinx_io, $module$kotlinx_coroutines_core) {
    'use strict';
    var $$importsForInline$$ = _.$$importsForInline$$ || (_.$$importsForInline$$ = {});
    var Enum = Kotlin.kotlin.Enum;
    var Kind_CLASS = Kotlin.Kind.CLASS;
    var throwISE = Kotlin.throwISE;
    var println = Kotlin.kotlin.io.println_s8jyv4$;
    var Json = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.json.Json;
    var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
    var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
    var HttpClient = $module$ktor_ktor_client_core.io.ktor.client.HttpClient_f0veat$;
    var header = $module$ktor_ktor_client_core.io.ktor.client.request.header_xadl6p$;
    var Unit = Kotlin.kotlin.Unit;
    var String_0 = String;
    var throwCCE = Kotlin.throwCCE;
    var toString = Kotlin.toString;
    var Throwable = Error;
    var takeFrom = $module$ktor_ktor_client_core.$$importsForInline$$['ktor-ktor-http'].io.ktor.http.takeFrom_jl1sg7$;
    var utils = $module$ktor_ktor_client_core.io.ktor.client.utils;
    var url = $module$ktor_ktor_client_core.io.ktor.client.request.url_3rzbk2$;
    var HttpMethod = $module$ktor_ktor_client_core.$$importsForInline$$['ktor-ktor-http'].io.ktor.http.HttpMethod;
    var HttpRequestBuilder_init = $module$ktor_ktor_client_core.io.ktor.client.request.HttpRequestBuilder;
    var call = $module$ktor_ktor_client_core.io.ktor.client.call.call_30bfl5$;
    var getKClass = Kotlin.getKClass;
    var call_0 = $module$ktor_ktor_client_core.io.ktor.client.call;
    var TypeInfo_init = $module$ktor_ktor_client_core.io.ktor.client.call.TypeInfo;
    var getContextualOrDefault = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.modules.getContextualOrDefault_6za9kt$;
    var addSuppressedInternal = $module$kotlinx_io.kotlinx.io.core.addSuppressedInternal_oh0dqn$;
    var get_list = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.get_list_gekvwj$;
    var Kind_OBJECT = Kotlin.Kind.OBJECT;
    var SerialClassDescImpl = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.SerialClassDescImpl;
    var NullableSerializer = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.NullableSerializer;
    var L_1 = Kotlin.Long.NEG_ONE;
    var equals = Kotlin.equals;
    var internal = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal;
    var UnknownFieldException = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.UnknownFieldException;
    var GeneratedSerializer = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.GeneratedSerializer;
    var MissingFieldException = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.MissingFieldException;
    var EnumSerializer = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.EnumSerializer;
    var coroutines = $module$kotlinx_coroutines_core.kotlinx.coroutines;
    var promise = $module$kotlinx_coroutines_core.kotlinx.coroutines.promise_pda6u4$;
    LogLevel.prototype = Object.create(Enum.prototype);
    LogLevel.prototype.constructor = LogLevel;
    FileModes.prototype = Object.create(Enum.prototype);
    FileModes.prototype.constructor = FileModes;
    var logLevel;

    function LogLevel(name, ordinal, verbosity) {
        Enum.call(this);
        this.verbosity = verbosity;
        this.name$ = name;
        this.ordinal$ = ordinal;
    }

    function LogLevel_initFields() {
        LogLevel_initFields = function () {
        };
        LogLevel$QUIET_instance = new LogLevel('QUIET', 0, 0);
        LogLevel$ERROR_instance = new LogLevel('ERROR', 1, 1);
        LogLevel$WARN_instance = new LogLevel('WARN', 2, 2);
        LogLevel$INFO_instance = new LogLevel('INFO', 3, 3);
        LogLevel$DEBUG_instance = new LogLevel('DEBUG', 4, 4);
        LogLevel$TRACE_instance = new LogLevel('TRACE', 5, 5);
    }

    var LogLevel$QUIET_instance;

    function LogLevel$QUIET_getInstance() {
        LogLevel_initFields();
        return LogLevel$QUIET_instance;
    }

    var LogLevel$ERROR_instance;

    function LogLevel$ERROR_getInstance() {
        LogLevel_initFields();
        return LogLevel$ERROR_instance;
    }

    var LogLevel$WARN_instance;

    function LogLevel$WARN_getInstance() {
        LogLevel_initFields();
        return LogLevel$WARN_instance;
    }

    var LogLevel$INFO_instance;

    function LogLevel$INFO_getInstance() {
        LogLevel_initFields();
        return LogLevel$INFO_instance;
    }

    var LogLevel$DEBUG_instance;

    function LogLevel$DEBUG_getInstance() {
        LogLevel_initFields();
        return LogLevel$DEBUG_instance;
    }

    var LogLevel$TRACE_instance;

    function LogLevel$TRACE_getInstance() {
        LogLevel_initFields();
        return LogLevel$TRACE_instance;
    }

    LogLevel.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'LogLevel',
        interfaces: [Enum]
    };

    function LogLevel$values() {
        return [LogLevel$QUIET_getInstance(), LogLevel$ERROR_getInstance(), LogLevel$WARN_getInstance(), LogLevel$INFO_getInstance(), LogLevel$DEBUG_getInstance(), LogLevel$TRACE_getInstance()];
    }

    LogLevel.values = LogLevel$values;

    function LogLevel$valueOf(name) {
        switch (name) {
            case 'QUIET':
                return LogLevel$QUIET_getInstance();
            case 'ERROR':
                return LogLevel$ERROR_getInstance();
            case 'WARN':
                return LogLevel$WARN_getInstance();
            case 'INFO':
                return LogLevel$INFO_getInstance();
            case 'DEBUG':
                return LogLevel$DEBUG_getInstance();
            case 'TRACE':
                return LogLevel$TRACE_getInstance();
            default:
                throwISE('No enum constant com.mlreef.gitlabapi.v4.LogLevel.' + name);
        }
    }

    LogLevel.valueOf_61zpoe$ = LogLevel$valueOf;

    function error(message) {
        if (logLevel.verbosity >= LogLevel$ERROR_getInstance().verbosity)
            println(message);
    }

    function warn(message) {
        if (logLevel.verbosity >= LogLevel$WARN_getInstance().verbosity)
            println(message);
    }

    function info(message) {
        if (logLevel.verbosity >= LogLevel$INFO_getInstance().verbosity)
            println(message);
    }

    function debug(message) {
        if (logLevel.verbosity >= LogLevel$DEBUG_getInstance().verbosity)
            println(message);
    }

    function trace(message) {
        if (logLevel.verbosity >= LogLevel$TRACE_getInstance().verbosity)
            println(message);
    }

    function get$lambda($receiver) {
        return Unit;
    }

    function doAuthenticatedRequest$lambda$lambda(closure$token) {
        return function ($receiver) {
            if (closure$token != null) {
                header($receiver, 'PRIVATE-TOKEN', closure$token);
            }
            return Unit;
        };
    }

    function get$lambda_0($receiver) {
        return Unit;
    }

    function doAuthenticatedCollectionRequest$lambda$lambda(closure$token) {
        return function ($receiver) {
            if (closure$token != null) {
                header($receiver, 'PRIVATE-TOKEN', closure$token);
            }
            return Unit;
        };
    }

    var gitlabSerializer;
    var requestNumber;

    function Coroutine$doAuthenticatedRequest(T_0_0, isT_0, url_0, token_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 8;
        this.local$tmp$_0 = void 0;
        this.local$i = void 0;
        this.local$$receiver = void 0;
        this.local$tmp$_1 = void 0;
        this.local$closed = void 0;
        this.local$T_0 = T_0_0;
        this.local$url = url_0;
        this.local$token = token_0;
    }

    Coroutine$doAuthenticatedRequest.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$doAuthenticatedRequest.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$doAuthenticatedRequest.prototype.constructor = Coroutine$doAuthenticatedRequest;
    Coroutine$doAuthenticatedRequest.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        if (this.local$token === void 0)
                            this.local$token = '';
                        var tmp$;
                        this.local$i = (tmp$ = requestNumber, requestNumber = tmp$ + 1 | 0, tmp$);
                        this.exceptionState_0 = 6;
                        info('Request ' + this.local$i + ' to: ' + this.local$url);
                        this.local$$receiver = HttpClient();
                        this.local$closed = false;
                        this.exceptionState_0 = 3;
                        var tmp$_0;
                        var host_0;
                        var body_0;
                        host_0 = 'localhost';
                        body_0 = utils.EmptyContent;
                        var $receiver_1 = new HttpRequestBuilder_init();
                        url($receiver_1, 'http', host_0, 0, '/');
                        $receiver_1.method = HttpMethod.Companion.Get;
                        $receiver_1.body = body_0;
                        takeFrom($receiver_1.url, this.local$url);
                        doAuthenticatedRequest$lambda$lambda(this.local$token)($receiver_1);
                        this.state_0 = 1;
                        this.result_0 = call(this.local$$receiver, $receiver_1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        var tmp$_0_0;
                        this.state_0 = 2;
                        this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 2:
                        this.result_0 = typeof (tmp$_0_0 = this.result_0) === 'string' ? tmp$_0_0 : throwCCE();
                        this.result_0;
                        this.local$tmp$_1 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
                        this.exceptionState_0 = 6;
                        this.finallyPath_0 = [5];
                        this.state_0 = 4;
                        continue;
                    case 3:
                        this.finallyPath_0 = [6];
                        this.exceptionState_0 = 4;
                        var first = this.exception_0;
                        if (Kotlin.isType(first, Throwable)) {
                            try {
                                this.local$closed = true;
                                this.local$$receiver.close();
                            } catch (second) {
                                if (Kotlin.isType(second, Throwable)) {
                                    addSuppressedInternal(first, second);
                                } else
                                    throw second;
                            }
                            throw first;
                        } else
                            throw first;
                    case 4:
                        this.exceptionState_0 = 6;
                        if (!this.local$closed) {
                            this.local$$receiver.close();
                        }

                        this.state_0 = this.finallyPath_0.shift();
                        continue;
                    case 5:
                        trace('Request ' + this.local$i + ' response body: ' + this.local$tmp$_1);
                        debug('Request ' + this.local$i + ' End');
                        var $receiver = gitlabSerializer;
                        this.local$tmp$_0 = $receiver.parse_awif5v$(getContextualOrDefault($receiver.context, getKClass(this.local$T_0)), this.local$tmp$_1);
                        this.exceptionState_0 = 8;
                        this.state_0 = 7;
                        continue;
                    case 6:
                        this.exceptionState_0 = 8;
                        var t = this.exception_0;
                        if (Kotlin.isType(t, Throwable)) {
                            error('Request ' + this.local$i + ' threw exception ' + toString(Kotlin.getKClassFromExpression(t).simpleName) + ' with message: ' + toString(t.message));
                            throw t;
                        } else
                            throw t;
                    case 7:
                        return this.local$tmp$_0;
                    case 8:
                        throw this.exception_0;
                    default:
                        this.state_0 = 8;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 8) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function doAuthenticatedRequest(T_0_0, isT_0, url_0, token_0, continuation_0, suspended) {
        var instance = new Coroutine$doAuthenticatedRequest(T_0_0, isT_0, url_0, token_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$doAuthenticatedCollectionRequest(T_0_0, isT_0, url_0, token_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 8;
        this.local$tmp$_0 = void 0;
        this.local$i = void 0;
        this.local$$receiver = void 0;
        this.local$tmp$_1 = void 0;
        this.local$closed = void 0;
        this.local$T_0 = T_0_0;
        this.local$url = url_0;
        this.local$token = token_0;
    }

    Coroutine$doAuthenticatedCollectionRequest.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$doAuthenticatedCollectionRequest.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$doAuthenticatedCollectionRequest.prototype.constructor = Coroutine$doAuthenticatedCollectionRequest;
    Coroutine$doAuthenticatedCollectionRequest.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        if (this.local$token === void 0)
                            this.local$token = '';
                        var tmp$;
                        this.local$i = (tmp$ = requestNumber, requestNumber = tmp$ + 1 | 0, tmp$);
                        this.exceptionState_0 = 6;
                        info('Request ' + this.local$i + ' to: ' + this.local$url);
                        this.local$$receiver = HttpClient();
                        this.local$closed = false;
                        this.exceptionState_0 = 3;
                        var tmp$_0;
                        var host_0;
                        var body_0;
                        host_0 = 'localhost';
                        body_0 = utils.EmptyContent;
                        var $receiver_1 = new HttpRequestBuilder_init();
                        url($receiver_1, 'http', host_0, 0, '/');
                        $receiver_1.method = HttpMethod.Companion.Get;
                        $receiver_1.body = body_0;
                        takeFrom($receiver_1.url, this.local$url);
                        doAuthenticatedCollectionRequest$lambda$lambda(this.local$token)($receiver_1);
                        this.state_0 = 1;
                        this.result_0 = call(this.local$$receiver, $receiver_1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        var tmp$_0_0;
                        this.state_0 = 2;
                        this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 2:
                        this.result_0 = typeof (tmp$_0_0 = this.result_0) === 'string' ? tmp$_0_0 : throwCCE();
                        this.result_0;
                        this.local$tmp$_1 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
                        this.exceptionState_0 = 6;
                        this.finallyPath_0 = [5];
                        this.state_0 = 4;
                        continue;
                    case 3:
                        this.finallyPath_0 = [6];
                        this.exceptionState_0 = 4;
                        var first = this.exception_0;
                        if (Kotlin.isType(first, Throwable)) {
                            try {
                                this.local$closed = true;
                                this.local$$receiver.close();
                            } catch (second) {
                                if (Kotlin.isType(second, Throwable)) {
                                    addSuppressedInternal(first, second);
                                } else
                                    throw second;
                            }
                            throw first;
                        } else
                            throw first;
                    case 4:
                        this.exceptionState_0 = 6;
                        if (!this.local$closed) {
                            this.local$$receiver.close();
                        }

                        this.state_0 = this.finallyPath_0.shift();
                        continue;
                    case 5:
                        debug('Request ' + this.local$i + ' End');
                        var $receiver = gitlabSerializer;
                        this.local$tmp$_0 = $receiver.parse_awif5v$(get_list(getContextualOrDefault($receiver.context, getKClass(this.local$T_0))), this.local$tmp$_1);
                        this.exceptionState_0 = 8;
                        this.state_0 = 7;
                        continue;
                    case 6:
                        this.exceptionState_0 = 8;
                        var t = this.exception_0;
                        if (Kotlin.isType(t, Throwable)) {
                            error('Request ' + this.local$i + ' threw exception ' + toString(Kotlin.getKClassFromExpression(t).simpleName) + ' with message: ' + toString(t.message));
                            throw t;
                        } else
                            throw t;
                    case 7:
                        return this.local$tmp$_0;
                    case 8:
                        throw this.exception_0;
                    default:
                        this.state_0 = 8;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 8) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function doAuthenticatedCollectionRequest(T_0_0, isT_0, url_0, token_0, continuation_0, suspended) {
        var instance = new Coroutine$doAuthenticatedCollectionRequest(T_0_0, isT_0, url_0, token_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$getGroup(token_0, groupName_0, domainName_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 8;
        this.local$tmp$_0 = void 0;
        this.local$i = void 0;
        this.local$$receiver = void 0;
        this.local$tmp$_1 = void 0;
        this.local$closed = void 0;
        this.local$token = token_0;
        this.local$groupName = groupName_0;
        this.local$domainName = domainName_0;
    }

    Coroutine$getGroup.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$getGroup.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$getGroup.prototype.constructor = Coroutine$getGroup;
    Coroutine$getGroup.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        if (this.local$token === void 0)
                            this.local$token = null;
                        if (this.local$domainName === void 0)
                            this.local$domainName = 'gitlab.com';
                        var url_0 = 'https://' + this.local$domainName + '/api/v4/groups/' + this.local$groupName + '/';
                        var tmp$;
                        this.local$i = (tmp$ = requestNumber, requestNumber = tmp$ + 1 | 0, tmp$);
                        this.exceptionState_0 = 6;
                        info('Request ' + this.local$i + ' to: ' + url_0);
                        this.local$$receiver = HttpClient();
                        this.local$closed = false;
                        this.exceptionState_0 = 3;
                        var tmp$_0;
                        var host_0;
                        var body_0;
                        host_0 = 'localhost';
                        body_0 = utils.EmptyContent;
                        var $receiver_1 = new HttpRequestBuilder_init();
                        url($receiver_1, 'http', host_0, 0, '/');
                        $receiver_1.method = HttpMethod.Companion.Get;
                        $receiver_1.body = body_0;
                        takeFrom($receiver_1.url, url_0);
                        doAuthenticatedRequest$lambda$lambda(this.local$token)($receiver_1);
                        this.state_0 = 1;
                        this.result_0 = call(this.local$$receiver, $receiver_1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        var tmp$_0_0;
                        this.state_0 = 2;
                        this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 2:
                        this.result_0 = typeof (tmp$_0_0 = this.result_0) === 'string' ? tmp$_0_0 : throwCCE();
                        this.result_0;
                        this.local$tmp$_1 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
                        this.exceptionState_0 = 6;
                        this.finallyPath_0 = [5];
                        this.state_0 = 4;
                        continue;
                    case 3:
                        this.finallyPath_0 = [6];
                        this.exceptionState_0 = 4;
                        var first = this.exception_0;
                        if (Kotlin.isType(first, Throwable)) {
                            try {
                                this.local$closed = true;
                                this.local$$receiver.close();
                            } catch (second) {
                                if (Kotlin.isType(second, Throwable)) {
                                    addSuppressedInternal(first, second);
                                } else
                                    throw second;
                            }
                            throw first;
                        } else
                            throw first;
                    case 4:
                        this.exceptionState_0 = 6;
                        if (!this.local$closed) {
                            this.local$$receiver.close();
                        }

                        this.state_0 = this.finallyPath_0.shift();
                        continue;
                    case 5:
                        trace('Request ' + this.local$i + ' response body: ' + this.local$tmp$_1);
                        debug('Request ' + this.local$i + ' End');
                        var $receiver = gitlabSerializer;
                        this.local$tmp$_0 = $receiver.parse_awif5v$(getContextualOrDefault($receiver.context, getKClass(Group)), this.local$tmp$_1);
                        this.exceptionState_0 = 8;
                        this.state_0 = 7;
                        continue;
                    case 6:
                        this.exceptionState_0 = 8;
                        var t = this.exception_0;
                        if (Kotlin.isType(t, Throwable)) {
                            error('Request ' + this.local$i + ' threw exception ' + toString(Kotlin.getKClassFromExpression(t).simpleName) + ' with message: ' + toString(t.message));
                            throw t;
                        } else
                            throw t;
                    case 7:
                        this.result_0 = this.local$tmp$_0;
                        return this.result_0;
                    case 8:
                        throw this.exception_0;
                    default:
                        this.state_0 = 8;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 8) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function getGroup(token_0, groupName_0, domainName_0, continuation_0, suspended) {
        var instance = new Coroutine$getGroup(token_0, groupName_0, domainName_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$getGroups(token_0, domainName_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 8;
        this.local$tmp$_0 = void 0;
        this.local$i = void 0;
        this.local$$receiver = void 0;
        this.local$tmp$_1 = void 0;
        this.local$closed = void 0;
        this.local$token = token_0;
        this.local$domainName = domainName_0;
    }

    Coroutine$getGroups.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$getGroups.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$getGroups.prototype.constructor = Coroutine$getGroups;
    Coroutine$getGroups.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        if (this.local$token === void 0)
                            this.local$token = null;
                        if (this.local$domainName === void 0)
                            this.local$domainName = 'gitlab.com';
                        var url_0 = 'https://' + this.local$domainName + '/api/v4/groups/';
                        var tmp$;
                        this.local$i = (tmp$ = requestNumber, requestNumber = tmp$ + 1 | 0, tmp$);
                        this.exceptionState_0 = 6;
                        info('Request ' + this.local$i + ' to: ' + url_0);
                        this.local$$receiver = HttpClient();
                        this.local$closed = false;
                        this.exceptionState_0 = 3;
                        var tmp$_0;
                        var host_0;
                        var body_0;
                        host_0 = 'localhost';
                        body_0 = utils.EmptyContent;
                        var $receiver_1 = new HttpRequestBuilder_init();
                        url($receiver_1, 'http', host_0, 0, '/');
                        $receiver_1.method = HttpMethod.Companion.Get;
                        $receiver_1.body = body_0;
                        takeFrom($receiver_1.url, url_0);
                        doAuthenticatedCollectionRequest$lambda$lambda(this.local$token)($receiver_1);
                        this.state_0 = 1;
                        this.result_0 = call(this.local$$receiver, $receiver_1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        var tmp$_0_0;
                        this.state_0 = 2;
                        this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 2:
                        this.result_0 = typeof (tmp$_0_0 = this.result_0) === 'string' ? tmp$_0_0 : throwCCE();
                        this.result_0;
                        this.local$tmp$_1 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
                        this.exceptionState_0 = 6;
                        this.finallyPath_0 = [5];
                        this.state_0 = 4;
                        continue;
                    case 3:
                        this.finallyPath_0 = [6];
                        this.exceptionState_0 = 4;
                        var first = this.exception_0;
                        if (Kotlin.isType(first, Throwable)) {
                            try {
                                this.local$closed = true;
                                this.local$$receiver.close();
                            } catch (second) {
                                if (Kotlin.isType(second, Throwable)) {
                                    addSuppressedInternal(first, second);
                                } else
                                    throw second;
                            }
                            throw first;
                        } else
                            throw first;
                    case 4:
                        this.exceptionState_0 = 6;
                        if (!this.local$closed) {
                            this.local$$receiver.close();
                        }

                        this.state_0 = this.finallyPath_0.shift();
                        continue;
                    case 5:
                        debug('Request ' + this.local$i + ' End');
                        var $receiver = gitlabSerializer;
                        this.local$tmp$_0 = $receiver.parse_awif5v$(get_list(getContextualOrDefault($receiver.context, getKClass(Group))), this.local$tmp$_1);
                        this.exceptionState_0 = 8;
                        this.state_0 = 7;
                        continue;
                    case 6:
                        this.exceptionState_0 = 8;
                        var t = this.exception_0;
                        if (Kotlin.isType(t, Throwable)) {
                            error('Request ' + this.local$i + ' threw exception ' + toString(Kotlin.getKClassFromExpression(t).simpleName) + ' with message: ' + toString(t.message));
                            throw t;
                        } else
                            throw t;
                    case 7:
                        this.result_0 = this.local$tmp$_0;
                        return this.result_0;
                    case 8:
                        throw this.exception_0;
                    default:
                        this.state_0 = 8;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 8) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function getGroups(token_0, domainName_0, continuation_0, suspended) {
        var instance = new Coroutine$getGroups(token_0, domainName_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$listRepoDirectory(token_0, projectId_0, path_0, recursive_0, domainName_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 8;
        this.local$tmp$_0 = void 0;
        this.local$i = void 0;
        this.local$$receiver = void 0;
        this.local$tmp$_1 = void 0;
        this.local$closed = void 0;
        this.local$token = token_0;
        this.local$projectId = projectId_0;
        this.local$path = path_0;
        this.local$recursive = recursive_0;
        this.local$domainName = domainName_0;
    }

    Coroutine$listRepoDirectory.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$listRepoDirectory.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$listRepoDirectory.prototype.constructor = Coroutine$listRepoDirectory;
    Coroutine$listRepoDirectory.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        if (this.local$token === void 0)
                            this.local$token = null;
                        if (this.local$path === void 0)
                            this.local$path = '/';
                        if (this.local$recursive === void 0)
                            this.local$recursive = false;
                        if (this.local$domainName === void 0)
                            this.local$domainName = 'gitlab.com';
                        var url_0 = 'https://' + this.local$domainName + '/api/v4/projects/' + this.local$projectId.toString() + '/repository/tree?ref=master&recursive=' + this.local$recursive + '&path=' + this.local$path;
                        var tmp$;
                        this.local$i = (tmp$ = requestNumber, requestNumber = tmp$ + 1 | 0, tmp$);
                        this.exceptionState_0 = 6;
                        info('Request ' + this.local$i + ' to: ' + url_0);
                        this.local$$receiver = HttpClient();
                        this.local$closed = false;
                        this.exceptionState_0 = 3;
                        var tmp$_0;
                        var host_0;
                        var body_0;
                        host_0 = 'localhost';
                        body_0 = utils.EmptyContent;
                        var $receiver_1 = new HttpRequestBuilder_init();
                        url($receiver_1, 'http', host_0, 0, '/');
                        $receiver_1.method = HttpMethod.Companion.Get;
                        $receiver_1.body = body_0;
                        takeFrom($receiver_1.url, url_0);
                        doAuthenticatedCollectionRequest$lambda$lambda(this.local$token)($receiver_1);
                        this.state_0 = 1;
                        this.result_0 = call(this.local$$receiver, $receiver_1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        var tmp$_0_0;
                        this.state_0 = 2;
                        this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 2:
                        this.result_0 = typeof (tmp$_0_0 = this.result_0) === 'string' ? tmp$_0_0 : throwCCE();
                        this.result_0;
                        this.local$tmp$_1 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
                        this.exceptionState_0 = 6;
                        this.finallyPath_0 = [5];
                        this.state_0 = 4;
                        continue;
                    case 3:
                        this.finallyPath_0 = [6];
                        this.exceptionState_0 = 4;
                        var first = this.exception_0;
                        if (Kotlin.isType(first, Throwable)) {
                            try {
                                this.local$closed = true;
                                this.local$$receiver.close();
                            } catch (second) {
                                if (Kotlin.isType(second, Throwable)) {
                                    addSuppressedInternal(first, second);
                                } else
                                    throw second;
                            }
                            throw first;
                        } else
                            throw first;
                    case 4:
                        this.exceptionState_0 = 6;
                        if (!this.local$closed) {
                            this.local$$receiver.close();
                        }

                        this.state_0 = this.finallyPath_0.shift();
                        continue;
                    case 5:
                        debug('Request ' + this.local$i + ' End');
                        var $receiver = gitlabSerializer;
                        this.local$tmp$_0 = $receiver.parse_awif5v$(get_list(getContextualOrDefault($receiver.context, getKClass(TreeItem))), this.local$tmp$_1);
                        this.exceptionState_0 = 8;
                        this.state_0 = 7;
                        continue;
                    case 6:
                        this.exceptionState_0 = 8;
                        var t = this.exception_0;
                        if (Kotlin.isType(t, Throwable)) {
                            error('Request ' + this.local$i + ' threw exception ' + toString(Kotlin.getKClassFromExpression(t).simpleName) + ' with message: ' + toString(t.message));
                            throw t;
                        } else
                            throw t;
                    case 7:
                        this.result_0 = this.local$tmp$_0;
                        return this.result_0;
                    case 8:
                        throw this.exception_0;
                    default:
                        this.state_0 = 8;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 8) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function listRepoDirectory(token_0, projectId_0, path_0, recursive_0, domainName_0, continuation_0, suspended) {
        var instance = new Coroutine$listRepoDirectory(token_0, projectId_0, path_0, recursive_0, domainName_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Group(id, webUrl, name, path, description, visibility, lfsEnabled, avatarUrl, requestAccessEnabled, fullName, fullPath, parentId, ldapCn, ldapAccess) {
        Group$Companion_getInstance();
        if (id === void 0)
            id = L_1;
        if (webUrl === void 0)
            webUrl = '';
        if (name === void 0)
            name = '';
        if (path === void 0)
            path = '';
        if (description === void 0)
            description = '';
        if (visibility === void 0)
            visibility = '';
        if (lfsEnabled === void 0)
            lfsEnabled = false;
        if (avatarUrl === void 0)
            avatarUrl = null;
        if (requestAccessEnabled === void 0)
            requestAccessEnabled = false;
        if (fullName === void 0)
            fullName = '';
        if (fullPath === void 0)
            fullPath = '';
        if (parentId === void 0)
            parentId = null;
        if (ldapCn === void 0)
            ldapCn = null;
        if (ldapAccess === void 0)
            ldapAccess = null;
        this.id = id;
        this.webUrl = webUrl;
        this.name = name;
        this.path = path;
        this.description = description;
        this.visibility = visibility;
        this.lfsEnabled = lfsEnabled;
        this.avatarUrl = avatarUrl;
        this.requestAccessEnabled = requestAccessEnabled;
        this.fullName = fullName;
        this.fullPath = fullPath;
        this.parentId = parentId;
        this.ldapCn = ldapCn;
        this.ldapAccess = ldapAccess;
    }

    function Group$Companion() {
        Group$Companion_instance = this;
    }

    Group$Companion.prototype.serializer = function () {
        return Group$$serializer_getInstance();
    };
    Group$Companion.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: 'Companion',
        interfaces: []
    };
    var Group$Companion_instance = null;

    function Group$Companion_getInstance() {
        if (Group$Companion_instance === null) {
            new Group$Companion();
        }
        return Group$Companion_instance;
    }

    function Group$$serializer() {
        this.descriptor_t6qwj5$_0 = new SerialClassDescImpl('com.mlreef.gitlabapi.v4.Group', this);
        this.descriptor.addElement_ivxn3r$('id', true);
        this.descriptor.addElement_ivxn3r$('web_url', true);
        this.descriptor.addElement_ivxn3r$('name', true);
        this.descriptor.addElement_ivxn3r$('path', true);
        this.descriptor.addElement_ivxn3r$('description', true);
        this.descriptor.addElement_ivxn3r$('visibility', true);
        this.descriptor.addElement_ivxn3r$('lfs_enabled', true);
        this.descriptor.addElement_ivxn3r$('avatar_url', true);
        this.descriptor.addElement_ivxn3r$('request_access_enabled', true);
        this.descriptor.addElement_ivxn3r$('full_name', true);
        this.descriptor.addElement_ivxn3r$('full_path', true);
        this.descriptor.addElement_ivxn3r$('parent_id', true);
        this.descriptor.addElement_ivxn3r$('ldap_cn', true);
        this.descriptor.addElement_ivxn3r$('ldap_access', true);
        Group$$serializer_instance = this;
    }

    Object.defineProperty(Group$$serializer.prototype, 'descriptor', {
        get: function () {
            return this.descriptor_t6qwj5$_0;
        }
    });
    Group$$serializer.prototype.serialize_awe97i$ = function (encoder, obj) {
        var output = encoder.beginStructure_r0sa6z$(this.descriptor, []);
        if (!equals(obj.id, L_1) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 0))
            output.encodeLongElement_a3zgoj$(this.descriptor, 0, obj.id);
        if (!equals(obj.webUrl, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 1))
            output.encodeStringElement_bgm7zs$(this.descriptor, 1, obj.webUrl);
        if (!equals(obj.name, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 2))
            output.encodeStringElement_bgm7zs$(this.descriptor, 2, obj.name);
        if (!equals(obj.path, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 3))
            output.encodeStringElement_bgm7zs$(this.descriptor, 3, obj.path);
        if (!equals(obj.description, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 4))
            output.encodeStringElement_bgm7zs$(this.descriptor, 4, obj.description);
        if (!equals(obj.visibility, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 5))
            output.encodeStringElement_bgm7zs$(this.descriptor, 5, obj.visibility);
        if (!equals(obj.lfsEnabled, false) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 6))
            output.encodeBooleanElement_w1b0nl$(this.descriptor, 6, obj.lfsEnabled);
        if (!equals(obj.avatarUrl, null) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 7))
            output.encodeNullableSerializableElement_orpvvi$(this.descriptor, 7, internal.StringSerializer, obj.avatarUrl);
        if (!equals(obj.requestAccessEnabled, false) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 8))
            output.encodeBooleanElement_w1b0nl$(this.descriptor, 8, obj.requestAccessEnabled);
        if (!equals(obj.fullName, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 9))
            output.encodeStringElement_bgm7zs$(this.descriptor, 9, obj.fullName);
        if (!equals(obj.fullPath, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 10))
            output.encodeStringElement_bgm7zs$(this.descriptor, 10, obj.fullPath);
        if (!equals(obj.parentId, null) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 11))
            output.encodeNullableSerializableElement_orpvvi$(this.descriptor, 11, internal.IntSerializer, obj.parentId);
        if (!equals(obj.ldapCn, null) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 12))
            output.encodeNullableSerializableElement_orpvvi$(this.descriptor, 12, internal.StringSerializer, obj.ldapCn);
        if (!equals(obj.ldapAccess, null) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 13))
            output.encodeNullableSerializableElement_orpvvi$(this.descriptor, 13, internal.StringSerializer, obj.ldapAccess);
        output.endStructure_qatsm0$(this.descriptor);
    };
    Group$$serializer.prototype.deserialize_nts5qn$ = function (decoder) {
        var index, readAll = false;
        var bitMask0 = 0;
        var local0
            , local1
            , local2
            , local3
            , local4
            , local5
            , local6
            , local7
            , local8
            , local9
            , local10
            , local11
            , local12
            , local13;
        var input = decoder.beginStructure_r0sa6z$(this.descriptor, []);
        loopLabel: while (true) {
            index = input.decodeElementIndex_qatsm0$(this.descriptor);
            switch (index) {
                case -2:
                    readAll = true;
                case 0:
                    local0 = input.decodeLongElement_3zr2iy$(this.descriptor, 0);
                    bitMask0 |= 1;
                    if (!readAll)
                        break;
                case 1:
                    local1 = input.decodeStringElement_3zr2iy$(this.descriptor, 1);
                    bitMask0 |= 2;
                    if (!readAll)
                        break;
                case 2:
                    local2 = input.decodeStringElement_3zr2iy$(this.descriptor, 2);
                    bitMask0 |= 4;
                    if (!readAll)
                        break;
                case 3:
                    local3 = input.decodeStringElement_3zr2iy$(this.descriptor, 3);
                    bitMask0 |= 8;
                    if (!readAll)
                        break;
                case 4:
                    local4 = input.decodeStringElement_3zr2iy$(this.descriptor, 4);
                    bitMask0 |= 16;
                    if (!readAll)
                        break;
                case 5:
                    local5 = input.decodeStringElement_3zr2iy$(this.descriptor, 5);
                    bitMask0 |= 32;
                    if (!readAll)
                        break;
                case 6:
                    local6 = input.decodeBooleanElement_3zr2iy$(this.descriptor, 6);
                    bitMask0 |= 64;
                    if (!readAll)
                        break;
                case 7:
                    local7 = (bitMask0 & 128) === 0 ? input.decodeNullableSerializableElement_cwlm4k$(this.descriptor, 7, internal.StringSerializer) : input.updateNullableSerializableElement_u33s02$(this.descriptor, 7, internal.StringSerializer, local7);
                    bitMask0 |= 128;
                    if (!readAll)
                        break;
                case 8:
                    local8 = input.decodeBooleanElement_3zr2iy$(this.descriptor, 8);
                    bitMask0 |= 256;
                    if (!readAll)
                        break;
                case 9:
                    local9 = input.decodeStringElement_3zr2iy$(this.descriptor, 9);
                    bitMask0 |= 512;
                    if (!readAll)
                        break;
                case 10:
                    local10 = input.decodeStringElement_3zr2iy$(this.descriptor, 10);
                    bitMask0 |= 1024;
                    if (!readAll)
                        break;
                case 11:
                    local11 = (bitMask0 & 2048) === 0 ? input.decodeNullableSerializableElement_cwlm4k$(this.descriptor, 11, internal.IntSerializer) : input.updateNullableSerializableElement_u33s02$(this.descriptor, 11, internal.IntSerializer, local11);
                    bitMask0 |= 2048;
                    if (!readAll)
                        break;
                case 12:
                    local12 = (bitMask0 & 4096) === 0 ? input.decodeNullableSerializableElement_cwlm4k$(this.descriptor, 12, internal.StringSerializer) : input.updateNullableSerializableElement_u33s02$(this.descriptor, 12, internal.StringSerializer, local12);
                    bitMask0 |= 4096;
                    if (!readAll)
                        break;
                case 13:
                    local13 = (bitMask0 & 8192) === 0 ? input.decodeNullableSerializableElement_cwlm4k$(this.descriptor, 13, internal.StringSerializer) : input.updateNullableSerializableElement_u33s02$(this.descriptor, 13, internal.StringSerializer, local13);
                    bitMask0 |= 8192;
                    if (!readAll)
                        break;
                case -1:
                    break loopLabel;
                default:
                    throw new UnknownFieldException(index);
            }
        }
        input.endStructure_qatsm0$(this.descriptor);
        return Group_init(bitMask0, local0, local1, local2, local3, local4, local5, local6, local7, local8, local9, local10, local11, local12, local13, null);
    };
    Group$$serializer.prototype.childSerializers = function () {
        return [internal.LongSerializer, internal.StringSerializer, internal.StringSerializer, internal.StringSerializer, internal.StringSerializer, internal.StringSerializer, internal.BooleanSerializer, new NullableSerializer(internal.StringSerializer), internal.BooleanSerializer, internal.StringSerializer, internal.StringSerializer, new NullableSerializer(internal.IntSerializer), new NullableSerializer(internal.StringSerializer), new NullableSerializer(internal.StringSerializer)];
    };
    Group$$serializer.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: '$serializer',
        interfaces: [GeneratedSerializer]
    };
    var Group$$serializer_instance = null;

    function Group$$serializer_getInstance() {
        if (Group$$serializer_instance === null) {
            new Group$$serializer();
        }
        return Group$$serializer_instance;
    }

    function Group_init(seen1, id, webUrl, name, path, description, visibility, lfsEnabled, avatarUrl, requestAccessEnabled, fullName, fullPath, parentId, ldapCn, ldapAccess, serializationConstructorMarker) {
        var $this = serializationConstructorMarker || Object.create(Group.prototype);
        if ((seen1 & 1) === 0)
            $this.id = L_1;
        else
            $this.id = id;
        if ((seen1 & 2) === 0)
            $this.webUrl = '';
        else
            $this.webUrl = webUrl;
        if ((seen1 & 4) === 0)
            $this.name = '';
        else
            $this.name = name;
        if ((seen1 & 8) === 0)
            $this.path = '';
        else
            $this.path = path;
        if ((seen1 & 16) === 0)
            $this.description = '';
        else
            $this.description = description;
        if ((seen1 & 32) === 0)
            $this.visibility = '';
        else
            $this.visibility = visibility;
        if ((seen1 & 64) === 0)
            $this.lfsEnabled = false;
        else
            $this.lfsEnabled = lfsEnabled;
        if ((seen1 & 128) === 0)
            $this.avatarUrl = null;
        else
            $this.avatarUrl = avatarUrl;
        if ((seen1 & 256) === 0)
            $this.requestAccessEnabled = false;
        else
            $this.requestAccessEnabled = requestAccessEnabled;
        if ((seen1 & 512) === 0)
            $this.fullName = '';
        else
            $this.fullName = fullName;
        if ((seen1 & 1024) === 0)
            $this.fullPath = '';
        else
            $this.fullPath = fullPath;
        if ((seen1 & 2048) === 0)
            $this.parentId = null;
        else
            $this.parentId = parentId;
        if ((seen1 & 4096) === 0)
            $this.ldapCn = null;
        else
            $this.ldapCn = ldapCn;
        if ((seen1 & 8192) === 0)
            $this.ldapAccess = null;
        else
            $this.ldapAccess = ldapAccess;
        return $this;
    }

    Group.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'Group',
        interfaces: []
    };
    Group.prototype.component1 = function () {
        return this.id;
    };
    Group.prototype.component2 = function () {
        return this.webUrl;
    };
    Group.prototype.component3 = function () {
        return this.name;
    };
    Group.prototype.component4 = function () {
        return this.path;
    };
    Group.prototype.component5 = function () {
        return this.description;
    };
    Group.prototype.component6 = function () {
        return this.visibility;
    };
    Group.prototype.component7 = function () {
        return this.lfsEnabled;
    };
    Group.prototype.component8 = function () {
        return this.avatarUrl;
    };
    Group.prototype.component9 = function () {
        return this.requestAccessEnabled;
    };
    Group.prototype.component10 = function () {
        return this.fullName;
    };
    Group.prototype.component11 = function () {
        return this.fullPath;
    };
    Group.prototype.component12 = function () {
        return this.parentId;
    };
    Group.prototype.component13 = function () {
        return this.ldapCn;
    };
    Group.prototype.component14 = function () {
        return this.ldapAccess;
    };
    Group.prototype.copy_ofjsyb$ = function (id, webUrl, name, path, description, visibility, lfsEnabled, avatarUrl, requestAccessEnabled, fullName, fullPath, parentId, ldapCn, ldapAccess) {
        return new Group(id === void 0 ? this.id : id, webUrl === void 0 ? this.webUrl : webUrl, name === void 0 ? this.name : name, path === void 0 ? this.path : path, description === void 0 ? this.description : description, visibility === void 0 ? this.visibility : visibility, lfsEnabled === void 0 ? this.lfsEnabled : lfsEnabled, avatarUrl === void 0 ? this.avatarUrl : avatarUrl, requestAccessEnabled === void 0 ? this.requestAccessEnabled : requestAccessEnabled, fullName === void 0 ? this.fullName : fullName, fullPath === void 0 ? this.fullPath : fullPath, parentId === void 0 ? this.parentId : parentId, ldapCn === void 0 ? this.ldapCn : ldapCn, ldapAccess === void 0 ? this.ldapAccess : ldapAccess);
    };
    Group.prototype.toString = function () {
        return 'Group(id=' + Kotlin.toString(this.id) + (', webUrl=' + Kotlin.toString(this.webUrl)) + (', name=' + Kotlin.toString(this.name)) + (', path=' + Kotlin.toString(this.path)) + (', description=' + Kotlin.toString(this.description)) + (', visibility=' + Kotlin.toString(this.visibility)) + (', lfsEnabled=' + Kotlin.toString(this.lfsEnabled)) + (', avatarUrl=' + Kotlin.toString(this.avatarUrl)) + (', requestAccessEnabled=' + Kotlin.toString(this.requestAccessEnabled)) + (', fullName=' + Kotlin.toString(this.fullName)) + (', fullPath=' + Kotlin.toString(this.fullPath)) + (', parentId=' + Kotlin.toString(this.parentId)) + (', ldapCn=' + Kotlin.toString(this.ldapCn)) + (', ldapAccess=' + Kotlin.toString(this.ldapAccess)) + ')';
    };
    Group.prototype.hashCode = function () {
        var result = 0;
        result = result * 31 + Kotlin.hashCode(this.id) | 0;
        result = result * 31 + Kotlin.hashCode(this.webUrl) | 0;
        result = result * 31 + Kotlin.hashCode(this.name) | 0;
        result = result * 31 + Kotlin.hashCode(this.path) | 0;
        result = result * 31 + Kotlin.hashCode(this.description) | 0;
        result = result * 31 + Kotlin.hashCode(this.visibility) | 0;
        result = result * 31 + Kotlin.hashCode(this.lfsEnabled) | 0;
        result = result * 31 + Kotlin.hashCode(this.avatarUrl) | 0;
        result = result * 31 + Kotlin.hashCode(this.requestAccessEnabled) | 0;
        result = result * 31 + Kotlin.hashCode(this.fullName) | 0;
        result = result * 31 + Kotlin.hashCode(this.fullPath) | 0;
        result = result * 31 + Kotlin.hashCode(this.parentId) | 0;
        result = result * 31 + Kotlin.hashCode(this.ldapCn) | 0;
        result = result * 31 + Kotlin.hashCode(this.ldapAccess) | 0;
        return result;
    };
    Group.prototype.equals = function (other) {
        return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.id, other.id) && Kotlin.equals(this.webUrl, other.webUrl) && Kotlin.equals(this.name, other.name) && Kotlin.equals(this.path, other.path) && Kotlin.equals(this.description, other.description) && Kotlin.equals(this.visibility, other.visibility) && Kotlin.equals(this.lfsEnabled, other.lfsEnabled) && Kotlin.equals(this.avatarUrl, other.avatarUrl) && Kotlin.equals(this.requestAccessEnabled, other.requestAccessEnabled) && Kotlin.equals(this.fullName, other.fullName) && Kotlin.equals(this.fullPath, other.fullPath) && Kotlin.equals(this.parentId, other.parentId) && Kotlin.equals(this.ldapCn, other.ldapCn) && Kotlin.equals(this.ldapAccess, other.ldapAccess)))));
    };

    function TreeItem(id, name, type, path, mode) {
        TreeItem$Companion_getInstance();
        if (id === void 0)
            id = '';
        if (name === void 0)
            name = '';
        if (path === void 0)
            path = '';
        if (mode === void 0)
            mode = 100000;
        this.id = id;
        this.name = name;
        this.type = type;
        this.path = path;
        this.mode = mode;
        this.isDirectory = this.type === FileModes$tree_getInstance();
        this.isFile = this.type === FileModes$blob_getInstance();
    }

    function TreeItem$Companion() {
        TreeItem$Companion_instance = this;
    }

    TreeItem$Companion.prototype.serializer = function () {
        return TreeItem$$serializer_getInstance();
    };
    TreeItem$Companion.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: 'Companion',
        interfaces: []
    };
    var TreeItem$Companion_instance = null;

    function TreeItem$Companion_getInstance() {
        if (TreeItem$Companion_instance === null) {
            new TreeItem$Companion();
        }
        return TreeItem$Companion_instance;
    }

    function TreeItem$$serializer() {
        this.descriptor_cv4phl$_0 = new SerialClassDescImpl('com.mlreef.gitlabapi.v4.TreeItem', this);
        this.descriptor.addElement_ivxn3r$('id', true);
        this.descriptor.addElement_ivxn3r$('name', true);
        this.descriptor.addElement_ivxn3r$('type', false);
        this.descriptor.addElement_ivxn3r$('path', true);
        this.descriptor.addElement_ivxn3r$('mode', true);
        this.descriptor.addElement_ivxn3r$('isDirectory', true);
        this.descriptor.addElement_ivxn3r$('isFile', true);
        TreeItem$$serializer_instance = this;
    }

    Object.defineProperty(TreeItem$$serializer.prototype, 'descriptor', {
        get: function () {
            return this.descriptor_cv4phl$_0;
        }
    });
    TreeItem$$serializer.prototype.serialize_awe97i$ = function (encoder, obj) {
        var output = encoder.beginStructure_r0sa6z$(this.descriptor, []);
        if (!equals(obj.id, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 0))
            output.encodeStringElement_bgm7zs$(this.descriptor, 0, obj.id);
        if (!equals(obj.name, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 1))
            output.encodeStringElement_bgm7zs$(this.descriptor, 1, obj.name);
        output.encodeSerializableElement_blecud$(this.descriptor, 2, new EnumSerializer(getKClass(FileModes)), obj.type);
        if (!equals(obj.path, '') || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 3))
            output.encodeStringElement_bgm7zs$(this.descriptor, 3, obj.path);
        if (!equals(obj.mode, 100000) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 4))
            output.encodeIntElement_4wpqag$(this.descriptor, 4, obj.mode);
        if (!equals(obj.isDirectory, this.type === FileModes$tree_getInstance()) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 5))
            output.encodeBooleanElement_w1b0nl$(this.descriptor, 5, obj.isDirectory);
        if (!equals(obj.isFile, this.type === FileModes$blob_getInstance()) || output.shouldEncodeElementDefault_3zr2iy$(this.descriptor, 6))
            output.encodeBooleanElement_w1b0nl$(this.descriptor, 6, obj.isFile);
        output.endStructure_qatsm0$(this.descriptor);
    };
    TreeItem$$serializer.prototype.deserialize_nts5qn$ = function (decoder) {
        var index, readAll = false;
        var bitMask0 = 0;
        var local0
            , local1
            , local2
            , local3
            , local4
            , local5
            , local6;
        var input = decoder.beginStructure_r0sa6z$(this.descriptor, []);
        loopLabel: while (true) {
            index = input.decodeElementIndex_qatsm0$(this.descriptor);
            switch (index) {
                case -2:
                    readAll = true;
                case 0:
                    local0 = input.decodeStringElement_3zr2iy$(this.descriptor, 0);
                    bitMask0 |= 1;
                    if (!readAll)
                        break;
                case 1:
                    local1 = input.decodeStringElement_3zr2iy$(this.descriptor, 1);
                    bitMask0 |= 2;
                    if (!readAll)
                        break;
                case 2:
                    local2 = (bitMask0 & 4) === 0 ? input.decodeSerializableElement_s44l7r$(this.descriptor, 2, new EnumSerializer(getKClass(FileModes))) : input.updateSerializableElement_ehubvl$(this.descriptor, 2, new EnumSerializer(getKClass(FileModes)), local2);
                    bitMask0 |= 4;
                    if (!readAll)
                        break;
                case 3:
                    local3 = input.decodeStringElement_3zr2iy$(this.descriptor, 3);
                    bitMask0 |= 8;
                    if (!readAll)
                        break;
                case 4:
                    local4 = input.decodeIntElement_3zr2iy$(this.descriptor, 4);
                    bitMask0 |= 16;
                    if (!readAll)
                        break;
                case 5:
                    local5 = input.decodeBooleanElement_3zr2iy$(this.descriptor, 5);
                    bitMask0 |= 32;
                    if (!readAll)
                        break;
                case 6:
                    local6 = input.decodeBooleanElement_3zr2iy$(this.descriptor, 6);
                    bitMask0 |= 64;
                    if (!readAll)
                        break;
                case -1:
                    break loopLabel;
                default:
                    throw new UnknownFieldException(index);
            }
        }
        input.endStructure_qatsm0$(this.descriptor);
        return TreeItem_init(bitMask0, local0, local1, local2, local3, local4, local5, local6, null);
    };
    TreeItem$$serializer.prototype.childSerializers = function () {
        return [internal.StringSerializer, internal.StringSerializer, new EnumSerializer(getKClass(FileModes)), internal.StringSerializer, internal.IntSerializer, internal.BooleanSerializer, internal.BooleanSerializer];
    };
    TreeItem$$serializer.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: '$serializer',
        interfaces: [GeneratedSerializer]
    };
    var TreeItem$$serializer_instance = null;

    function TreeItem$$serializer_getInstance() {
        if (TreeItem$$serializer_instance === null) {
            new TreeItem$$serializer();
        }
        return TreeItem$$serializer_instance;
    }

    function TreeItem_init(seen1, id, name, type, path, mode, isDirectory, isFile, serializationConstructorMarker) {
        var $this = serializationConstructorMarker || Object.create(TreeItem.prototype);
        if ((seen1 & 1) === 0)
            $this.id = '';
        else
            $this.id = id;
        if ((seen1 & 2) === 0)
            $this.name = '';
        else
            $this.name = name;
        if ((seen1 & 4) === 0)
            throw new MissingFieldException('type');
        else
            $this.type = type;
        if ((seen1 & 8) === 0)
            $this.path = '';
        else
            $this.path = path;
        if ((seen1 & 16) === 0)
            $this.mode = 100000;
        else
            $this.mode = mode;
        if ((seen1 & 32) === 0)
            $this.isDirectory = $this.type === FileModes$tree_getInstance();
        else
            $this.isDirectory = isDirectory;
        if ((seen1 & 64) === 0)
            $this.isFile = $this.type === FileModes$blob_getInstance();
        else
            $this.isFile = isFile;
        return $this;
    }

    TreeItem.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'TreeItem',
        interfaces: []
    };
    TreeItem.prototype.component1 = function () {
        return this.id;
    };
    TreeItem.prototype.component2 = function () {
        return this.name;
    };
    TreeItem.prototype.component3 = function () {
        return this.type;
    };
    TreeItem.prototype.component4 = function () {
        return this.path;
    };
    TreeItem.prototype.component5 = function () {
        return this.mode;
    };
    TreeItem.prototype.copy_wg3r0p$ = function (id, name, type, path, mode) {
        return new TreeItem(id === void 0 ? this.id : id, name === void 0 ? this.name : name, type === void 0 ? this.type : type, path === void 0 ? this.path : path, mode === void 0 ? this.mode : mode);
    };
    TreeItem.prototype.toString = function () {
        return 'TreeItem(id=' + Kotlin.toString(this.id) + (', name=' + Kotlin.toString(this.name)) + (', type=' + Kotlin.toString(this.type)) + (', path=' + Kotlin.toString(this.path)) + (', mode=' + Kotlin.toString(this.mode)) + ')';
    };
    TreeItem.prototype.hashCode = function () {
        var result = 0;
        result = result * 31 + Kotlin.hashCode(this.id) | 0;
        result = result * 31 + Kotlin.hashCode(this.name) | 0;
        result = result * 31 + Kotlin.hashCode(this.type) | 0;
        result = result * 31 + Kotlin.hashCode(this.path) | 0;
        result = result * 31 + Kotlin.hashCode(this.mode) | 0;
        return result;
    };
    TreeItem.prototype.equals = function (other) {
        return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.id, other.id) && Kotlin.equals(this.name, other.name) && Kotlin.equals(this.type, other.type) && Kotlin.equals(this.path, other.path) && Kotlin.equals(this.mode, other.mode)))));
    };

    function FileModes(name, ordinal) {
        Enum.call(this);
        this.name$ = name;
        this.ordinal$ = ordinal;
    }

    function FileModes_initFields() {
        FileModes_initFields = function () {
        };
        FileModes$blob_instance = new FileModes('blob', 0);
        FileModes$tree_instance = new FileModes('tree', 1);
    }

    var FileModes$blob_instance;

    function FileModes$blob_getInstance() {
        FileModes_initFields();
        return FileModes$blob_instance;
    }

    var FileModes$tree_instance;

    function FileModes$tree_getInstance() {
        FileModes_initFields();
        return FileModes$tree_instance;
    }

    FileModes.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'FileModes',
        interfaces: [Enum]
    };

    function FileModes$values() {
        return [FileModes$blob_getInstance(), FileModes$tree_getInstance()];
    }

    FileModes.values = FileModes$values;

    function FileModes$valueOf(name) {
        switch (name) {
            case 'blob':
                return FileModes$blob_getInstance();
            case 'tree':
                return FileModes$tree_getInstance();
            default:
                throwISE('No enum constant com.mlreef.gitlabapi.v4.FileModes.' + name);
        }
    }

    FileModes.valueOf_61zpoe$ = FileModes$valueOf;

    function Coroutine$runTest$lambda(closure$block_0, $receiver_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 1;
        this.local$closure$block = closure$block_0;
    }

    Coroutine$runTest$lambda.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$runTest$lambda.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$runTest$lambda.prototype.constructor = Coroutine$runTest$lambda;
    Coroutine$runTest$lambda.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        this.state_0 = 2;
                        this.result_0 = this.local$closure$block(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        throw this.exception_0;
                    case 2:
                        return this.result_0;
                    default:
                        this.state_0 = 1;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 1) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function runTest$lambda(closure$block_0) {
        return function ($receiver_0, continuation_0, suspended) {
            var instance = new Coroutine$runTest$lambda(closure$block_0, $receiver_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    function runTest(block) {
        return promise(coroutines.GlobalScope, void 0, void 0, runTest$lambda(block));
    }

    function Coroutine$getGroupWrapper$lambda(closure$token_0, closure$groupName_0, $receiver_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 1;
        this.local$closure$token = closure$token_0;
        this.local$closure$groupName = closure$groupName_0;
    }

    Coroutine$getGroupWrapper$lambda.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$getGroupWrapper$lambda.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$getGroupWrapper$lambda.prototype.constructor = Coroutine$getGroupWrapper$lambda;
    Coroutine$getGroupWrapper$lambda.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        this.state_0 = 2;
                        this.result_0 = getGroup(this.local$closure$token, this.local$closure$groupName, void 0, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        throw this.exception_0;
                    case 2:
                        return this.result_0;
                    default:
                        this.state_0 = 1;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 1) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function getGroupWrapper$lambda(closure$token_0, closure$groupName_0) {
        return function ($receiver_0, continuation_0, suspended) {
            var instance = new Coroutine$getGroupWrapper$lambda(closure$token_0, closure$groupName_0, $receiver_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    function getGroupWrapper(token, groupName) {
        return promise(coroutines.GlobalScope, void 0, void 0, getGroupWrapper$lambda(token, groupName));
    }

    function Coroutine$getGroupWrapper$lambda_0(closure$token_0, closure$projectId_0, closure$path_0, closure$recursive_0, closure$domainName_0, $receiver_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 1;
        this.local$closure$token = closure$token_0;
        this.local$closure$projectId = closure$projectId_0;
        this.local$closure$path = closure$path_0;
        this.local$closure$recursive = closure$recursive_0;
        this.local$closure$domainName = closure$domainName_0;
    }

    Coroutine$getGroupWrapper$lambda_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$getGroupWrapper$lambda_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$getGroupWrapper$lambda_0.prototype.constructor = Coroutine$getGroupWrapper$lambda_0;
    Coroutine$getGroupWrapper$lambda_0.prototype.doResume = function () {
        do
            try {
                switch (this.state_0) {
                    case 0:
                        this.state_0 = 2;
                        this.result_0 = listRepoDirectory(this.local$closure$token, this.local$closure$projectId, this.local$closure$path, this.local$closure$recursive, this.local$closure$domainName, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    case 1:
                        throw this.exception_0;
                    case 2:
                        return this.result_0;
                    default:
                        this.state_0 = 1;
                        throw new Error('State Machine Unreachable execution');
                }
            } catch (e) {
                if (this.state_0 === 1) {
                    this.exceptionState_0 = this.state_0;
                    throw e;
                } else {
                    this.state_0 = this.exceptionState_0;
                    this.exception_0 = e;
                }
            }
        while (true);
    };

    function getGroupWrapper$lambda_0(closure$token_0, closure$projectId_0, closure$path_0, closure$recursive_0, closure$domainName_0) {
        return function ($receiver_0, continuation_0, suspended) {
            var instance = new Coroutine$getGroupWrapper$lambda_0(closure$token_0, closure$projectId_0, closure$path_0, closure$recursive_0, closure$domainName_0, $receiver_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    function getGroupWrapper_0(token, projectId, path, recursive, domainName) {
        if (token === void 0)
            token = null;
        if (path === void 0)
            path = '/';
        if (recursive === void 0)
            recursive = false;
        if (domainName === void 0)
            domainName = 'gitlab.com';
        return promise(coroutines.GlobalScope, void 0, void 0, getGroupWrapper$lambda_0(token, projectId, path, recursive, domainName));
    }

    var package$com = _.com || (_.com = {});
    var package$mlreef = package$com.mlreef || (package$com.mlreef = {});
    var package$gitlabapi = package$mlreef.gitlabapi || (package$mlreef.gitlabapi = {});
    var package$v4 = package$gitlabapi.v4 || (package$gitlabapi.v4 = {});
    Object.defineProperty(package$v4, 'logLevel', {
        get: function () {
            return logLevel;
        },
        set: function (value) {
            logLevel = value;
        }
    });
    Object.defineProperty(LogLevel, 'QUIET', {
        get: LogLevel$QUIET_getInstance
    });
    Object.defineProperty(LogLevel, 'ERROR', {
        get: LogLevel$ERROR_getInstance
    });
    Object.defineProperty(LogLevel, 'WARN', {
        get: LogLevel$WARN_getInstance
    });
    Object.defineProperty(LogLevel, 'INFO', {
        get: LogLevel$INFO_getInstance
    });
    Object.defineProperty(LogLevel, 'DEBUG', {
        get: LogLevel$DEBUG_getInstance
    });
    Object.defineProperty(LogLevel, 'TRACE', {
        get: LogLevel$TRACE_getInstance
    });
    package$v4.LogLevel = LogLevel;
    package$v4.error_61zpoe$ = error;
    package$v4.warn_61zpoe$ = warn;
    package$v4.info_61zpoe$ = info;
    package$v4.debug_61zpoe$ = debug;
    package$v4.trace_61zpoe$ = trace;
    Object.defineProperty(package$v4, 'gitlabSerializer', {
        get: function () {
            return gitlabSerializer;
        }
    });
    Object.defineProperty(package$v4, 'requestNumber', {
        get: function () {
            return requestNumber;
        },
        set: function (value) {
            requestNumber = value;
        }
    });
    $$importsForInline$$['ktor-ktor-client-core'] = $module$ktor_ktor_client_core;
    $$importsForInline$$['kotlinx-io'] = $module$kotlinx_io;
    $$importsForInline$$['kotlinx-serialization-kotlinx-serialization-runtime'] = $module$kotlinx_serialization_kotlinx_serialization_runtime;
    $$importsForInline$$.gitlabapi = _;
    package$v4.getGroup_kunee3$ = getGroup;
    package$v4.getGroups_f5e6j7$ = getGroups;
    package$v4.listRepoDirectory_xsc6q1$ = listRepoDirectory;
    Object.defineProperty(Group, 'Companion', {
        get: Group$Companion_getInstance
    });
    Object.defineProperty(Group, '$serializer', {
        get: Group$$serializer_getInstance
    });
    package$v4.Group = Group;
    Object.defineProperty(TreeItem, 'Companion', {
        get: TreeItem$Companion_getInstance
    });
    Object.defineProperty(TreeItem, '$serializer', {
        get: TreeItem$$serializer_getInstance
    });
    package$v4.TreeItem = TreeItem;
    Object.defineProperty(FileModes, 'blob', {
        get: FileModes$blob_getInstance
    });
    Object.defineProperty(FileModes, 'tree', {
        get: FileModes$tree_getInstance
    });
    package$v4.FileModes = FileModes;
    package$v4.runTest_lnyleu$ = runTest;
    _.getGroup = getGroupWrapper;
    _.listRepoDirectory = getGroupWrapper_0;
    Group$$serializer.prototype.patch_mynpiu$ = GeneratedSerializer.prototype.patch_mynpiu$;
    TreeItem$$serializer.prototype.patch_mynpiu$ = GeneratedSerializer.prototype.patch_mynpiu$;
    logLevel = LogLevel$TRACE_getInstance();
    gitlabSerializer = Json.Companion.nonstrict;
    requestNumber = 0;
    Kotlin.defineModule('gitlabapi', _);
    return _;
}));

//# sourceMappingURL=gitlabapi.js.map
