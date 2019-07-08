(function (root, factory) {
    if (typeof define === 'function' && define.amd)
        define(['exports', 'kotlin', 'ktor-ktor-http', 'ktor-ktor-client-core', 'kotlinx-coroutines-io', 'ktor-ktor-utils'], factory);
    else if (typeof exports === 'object')
        factory(module.exports, require('kotlin'), require('ktor-ktor-http'), require('ktor-ktor-client-core'), require('kotlinx-coroutines-io'), require('ktor-ktor-utils'));
    else {
        if (typeof kotlin === 'undefined') {
            throw new Error("Error loading module 'ktor-ktor-client-json'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'ktor-ktor-client-json'.");
        }
        if (typeof this['ktor-ktor-http'] === 'undefined') {
            throw new Error("Error loading module 'ktor-ktor-client-json'. Its dependency 'ktor-ktor-http' was not found. Please, check whether 'ktor-ktor-http' is loaded prior to 'ktor-ktor-client-json'.");
        }
        if (typeof this['ktor-ktor-client-core'] === 'undefined') {
            throw new Error("Error loading module 'ktor-ktor-client-json'. Its dependency 'ktor-ktor-client-core' was not found. Please, check whether 'ktor-ktor-client-core' is loaded prior to 'ktor-ktor-client-json'.");
        }
        if (typeof this['kotlinx-coroutines-io'] === 'undefined') {
            throw new Error("Error loading module 'ktor-ktor-client-json'. Its dependency 'kotlinx-coroutines-io' was not found. Please, check whether 'kotlinx-coroutines-io' is loaded prior to 'ktor-ktor-client-json'.");
        }
        if (typeof this['ktor-ktor-utils'] === 'undefined') {
            throw new Error("Error loading module 'ktor-ktor-client-json'. Its dependency 'ktor-ktor-utils' was not found. Please, check whether 'ktor-ktor-utils' is loaded prior to 'ktor-ktor-client-json'.");
        }
        root['ktor-ktor-client-json'] = factory(typeof this['ktor-ktor-client-json'] === 'undefined' ? {} : this['ktor-ktor-client-json'], kotlin, this['ktor-ktor-http'], this['ktor-ktor-client-core'], this['kotlinx-coroutines-io'], this['ktor-ktor-utils']);
    }
}(this, function (_, Kotlin, $module$ktor_ktor_http, $module$ktor_ktor_client_core, $module$kotlinx_coroutines_io, $module$ktor_ktor_utils) {
    'use strict';
    var ContentType = $module$ktor_ktor_http.io.ktor.http.ContentType;
    var listOf = Kotlin.kotlin.collections.listOf_mh5how$;
    var Kind_CLASS = Kotlin.Kind.CLASS;
    var toList = Kotlin.kotlin.collections.toList_7wnvza$;
    var HttpRequestPipeline = $module$ktor_ktor_client_core.io.ktor.client.request.HttpRequestPipeline;
    var accept = $module$ktor_ktor_client_core.io.ktor.client.request.accept_fohfhi$;
    var Unit = Kotlin.kotlin.Unit;
    var contentType = $module$ktor_ktor_http.io.ktor.http.contentType_jzzg3d$;
    var http = $module$ktor_ktor_http.io.ktor.http;
    var utils = $module$ktor_ktor_client_core.io.ktor.client.utils;
    var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
    var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
    var HttpResponsePipeline = $module$ktor_ktor_client_core.io.ktor.client.response.HttpResponsePipeline;
    var ByteReadChannel = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.ByteReadChannel;
    var contentType_0 = $module$ktor_ktor_http.io.ktor.http.contentType_v1wgmc$;
    var readRemaining = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.readRemaining_ep79e2$;
    var HttpResponseContainer = $module$ktor_ktor_client_core.io.ktor.client.response.HttpResponseContainer;
    var AttributeKey = $module$ktor_ktor_utils.io.ktor.util.AttributeKey;
    var Kind_OBJECT = Kotlin.Kind.OBJECT;
    var HttpClientFeature = $module$ktor_ktor_client_core.io.ktor.client.features.HttpClientFeature;
    var IllegalArgumentException_init = Kotlin.kotlin.IllegalArgumentException_init_pdl1vj$;
    var Collection = Kotlin.kotlin.collections.Collection;
    var Kind_INTERFACE = Kotlin.Kind.INTERFACE;
    var first = Kotlin.kotlin.collections.first_2p1efm$;
    var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_287e2$;

    function JsonFeature(serializer, acceptContentTypes) {
        JsonFeature$Feature_getInstance();
        this.serializer = serializer;
        this.acceptContentTypes = acceptContentTypes;
    }

    function JsonFeature$Config() {
        this.serializer = null;
        this.acceptContentTypes_pj7ap0$_0 = listOf(ContentType.Application.Json);
    }

    Object.defineProperty(JsonFeature$Config.prototype, 'acceptContentTypes', {
        get: function () {
            return this.acceptContentTypes_pj7ap0$_0;
        },
        set: function (newList) {
            if (!!newList.isEmpty()) {
                var message = 'At least one content type should be provided to acceptContentTypes';
                throw IllegalArgumentException_init(message.toString());
            }
            this.acceptContentTypes_pj7ap0$_0 = newList;
        }
    });
    JsonFeature$Config.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'Config',
        interfaces: []
    };

    function JsonFeature$Feature() {
        JsonFeature$Feature_instance = this;
        this.key_nhnsxd$_0 = new AttributeKey('Json');
    }

    Object.defineProperty(JsonFeature$Feature.prototype, 'key', {
        get: function () {
            return this.key_nhnsxd$_0;
        }
    });
    JsonFeature$Feature.prototype.prepare_oh3mgy$$default = function (block) {
        var tmp$;
        var $receiver = new JsonFeature$Config();
        block($receiver);
        var config = $receiver;
        var serializer = (tmp$ = config.serializer) != null ? tmp$ : defaultSerializer();
        var allowedContentTypes = toList(config.acceptContentTypes);
        return new JsonFeature(serializer, allowedContentTypes);
    };

    function Coroutine$JsonFeature$Feature$install$lambda(closure$feature_0, $receiver_0, payload_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 1;
        this.local$closure$feature = closure$feature_0;
        this.local$tmp$ = void 0;
        this.local$contentType = void 0;
        this.local$$receiver = $receiver_0;
        this.local$payload = payload_0;
    }

    Coroutine$JsonFeature$Feature$install$lambda.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$JsonFeature$Feature$install$lambda.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$JsonFeature$Feature$install$lambda.prototype.constructor = Coroutine$JsonFeature$Feature$install$lambda;
    Coroutine$JsonFeature$Feature$install$lambda.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    var tmp$_0;
                    tmp$_0 = this.local$closure$feature.acceptContentTypes.iterator();
                    while (tmp$_0.hasNext()) {
                        var element = tmp$_0.next();
                        accept(this.local$$receiver.context, element);
                    }
                    this.local$tmp$ = contentType(this.local$$receiver.context);
                    if (this.local$tmp$ == null) {
                        return;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$contentType = this.local$tmp$;
                    var $receiver = this.local$closure$feature.acceptContentTypes;
                    var none$result;
                    none$break:
                        do {
                            var tmp$_1;
                            if (Kotlin.isType($receiver, Collection) && $receiver.isEmpty()) {
                                none$result = true;
                                break;
                            }
                            tmp$_1 = $receiver.iterator();
                            while (tmp$_1.hasNext()) {
                                var element_0 = tmp$_1.next();
                                if (this.local$contentType.match_9v5yzd$(element_0)) {
                                    none$result = false;
                                    break none$break;
                                }
                            }
                            none$result = true;
                        } while (false);
                    if (none$result) {
                        return;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 3:
                    this.local$$receiver.context.headers.remove_61zpoe$(http.HttpHeaders.ContentType);
                    if (Kotlin.isType(this.local$payload, Object.getPrototypeOf(utils.EmptyContent).constructor))
                        tmp$ = this.local$closure$feature.serializer.write_ydd6c4$(Unit, this.local$contentType);
                    else
                        tmp$ = this.local$closure$feature.serializer.write_ydd6c4$(this.local$payload, this.local$contentType);
                    var serializedContent = tmp$;
                    this.state_0 = 4;
                    this.result_0 = this.local$$receiver.proceedWith_trkh7z$(serializedContent, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 4:
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
        } while (true);
    };

    function JsonFeature$Feature$install$lambda(closure$feature_0) {
        return function ($receiver_0, payload_0, continuation_0, suspended) {
            var instance = new Coroutine$JsonFeature$Feature$install$lambda(closure$feature_0, $receiver_0, payload_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    function Coroutine$JsonFeature$Feature$install$lambda_0(closure$feature_0, $receiver_0, f_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 9;
        this.local$closure$feature = closure$feature_0;
        this.local$info = void 0;
        this.local$body = void 0;
        this.local$tmp$ = void 0;
        this.local$$receiver = $receiver_0;
        this.local$f = f_0;
    }

    Coroutine$JsonFeature$Feature$install$lambda_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$JsonFeature$Feature$install$lambda_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$JsonFeature$Feature$install$lambda_0.prototype.constructor = Coroutine$JsonFeature$Feature$install$lambda_0;
    Coroutine$JsonFeature$Feature$install$lambda_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$info = this.local$f.component1() , this.local$body = this.local$f.component2();
                    if (!Kotlin.isType(this.local$body, ByteReadChannel)) {
                        return;
                    } else {
                        this.state_0 = 1;
                        continue;
                    }
                case 1:
                    var $receiver = this.local$closure$feature.acceptContentTypes;
                    var none$result;
                    none$break:
                        do {
                            var tmp$;
                            if (Kotlin.isType($receiver, Collection) && $receiver.isEmpty()) {
                                none$result = true;
                                break;
                            }
                            tmp$ = $receiver.iterator();
                            while (tmp$.hasNext()) {
                                var element = tmp$.next();
                                var tmp$_0;
                                if (((tmp$_0 = contentType_0(this.local$$receiver.context.response)) != null ? tmp$_0.match_9v5yzd$(element) : null) === true) {
                                    none$result = false;
                                    break none$break;
                                }
                            }
                            none$result = true;
                        } while (false);
                    if (none$result) {
                        return;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 2:
                    this.exceptionState_0 = 7;
                    this.local$tmp$ = this.local$closure$feature.serializer;
                    this.state_0 = 3;
                    this.result_0 = readRemaining(this.local$body, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    this.state_0 = 4;
                    this.result_0 = this.local$$receiver.proceedWith_trkh7z$(new HttpResponseContainer(this.local$info, this.local$tmp$.read_2ov5dd$(this.local$info, this.result_0)), this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 4:
                    this.exceptionState_0 = 9;
                    this.finallyPath_0 = [5];
                    this.state_0 = 8;
                    this.$returnValue = this.result_0;
                    continue;
                case 5:
                    return this.$returnValue;
                case 6:
                    return;
                case 7:
                    this.finallyPath_0 = [9];
                    this.state_0 = 8;
                    continue;
                case 8:
                    this.exceptionState_0 = 9;
                    this.local$$receiver.context.close();
                    this.state_0 = this.finallyPath_0.shift();
                    continue;
                case 9:
                    throw this.exception_0;
                default:
                    this.state_0 = 9;
                    throw new Error('State Machine Unreachable execution');
            }
        } catch (e) {
            if (this.state_0 === 9) {
                this.exceptionState_0 = this.state_0;
                throw e;
            } else {
                this.state_0 = this.exceptionState_0;
                this.exception_0 = e;
            }
        } while (true);
    };

    function JsonFeature$Feature$install$lambda_0(closure$feature_0) {
        return function ($receiver_0, f_0, continuation_0, suspended) {
            var instance = new Coroutine$JsonFeature$Feature$install$lambda_0(closure$feature_0, $receiver_0, f_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    JsonFeature$Feature.prototype.install_wojrb5$ = function (feature, scope) {
        scope.requestPipeline.intercept_h71y74$(HttpRequestPipeline.Phases.Transform, JsonFeature$Feature$install$lambda(feature));
        scope.responsePipeline.intercept_h71y74$(HttpResponsePipeline.Phases.Transform, JsonFeature$Feature$install$lambda_0(feature));
    };
    JsonFeature$Feature.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: 'Feature',
        interfaces: [HttpClientFeature]
    };
    var JsonFeature$Feature_instance = null;

    function JsonFeature$Feature_getInstance() {
        if (JsonFeature$Feature_instance === null) {
            new JsonFeature$Feature();
        }
        return JsonFeature$Feature_instance;
    }

    JsonFeature.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'JsonFeature',
        interfaces: []
    };

    function JsonFeature_init(serializer, $this) {
        $this = $this || Object.create(JsonFeature.prototype);
        JsonFeature.call($this, serializer, listOf(ContentType.Application.Json));
        return $this;
    }

    function Json($receiver, block) {
        $receiver.install_xlxg29$(JsonFeature$Feature_getInstance(), block);
    }

    function JsonSerializer() {
    }

    JsonSerializer.prototype.write_za3rmp$ = function (data) {
        return this.write_ydd6c4$(data, ContentType.Application.Json);
    };
    JsonSerializer.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'JsonSerializer',
        interfaces: []
    };

    function defaultSerializer() {
        return first(serializersStore);
    }

    var serializersStore;
    JsonFeature.Config = JsonFeature$Config;
    Object.defineProperty(JsonFeature, 'Feature', {
        get: JsonFeature$Feature_getInstance
    });
    var package$io = _.io || (_.io = {});
    var package$ktor = package$io.ktor || (package$io.ktor = {});
    var package$client = package$ktor.client || (package$ktor.client = {});
    var package$features = package$client.features || (package$client.features = {});
    var package$json = package$features.json || (package$features.json = {});
    package$json.JsonFeature_init_gooyo8$ = JsonFeature_init;
    package$json.JsonFeature = JsonFeature;
    package$json.Json_ok8fqq$ = Json;
    package$json.JsonSerializer = JsonSerializer;
    package$json.defaultSerializer = defaultSerializer;
    Object.defineProperty(package$json, 'serializersStore', {
        get: function () {
            return serializersStore;
        }
    });
    JsonFeature$Feature.prototype.prepare_oh3mgy$ = HttpClientFeature.prototype.prepare_oh3mgy$;
    serializersStore = ArrayList_init();
    Kotlin.defineModule('ktor-ktor-client-json', _);
    return _;
}));
