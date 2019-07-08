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
  var Kind_CLASS = Kotlin.Kind.CLASS;
  var Json = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.json.Json;
  var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
  var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
  var HttpClient = $module$ktor_ktor_client_core.io.ktor.client.HttpClient_f0veat$;
  var header = $module$ktor_ktor_client_core.io.ktor.client.request.header_xadl6p$;
  var Unit = Kotlin.kotlin.Unit;
  var String_0 = String;
  var SerializationException = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.SerializationException;
  var JsonParsingException = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.json.JsonParsingException;
  var println = Kotlin.kotlin.io.println_s8jyv4$;
  var Kind_OBJECT = Kotlin.Kind.OBJECT;
  var SerialClassDescImpl = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.SerialClassDescImpl;
  var NullableSerializer = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.NullableSerializer;
  var L_1 = Kotlin.Long.NEG_ONE;
  var equals = Kotlin.equals;
  var internal = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal;
  var UnknownFieldException = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.UnknownFieldException;
  var GeneratedSerializer = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.internal.GeneratedSerializer;
  var takeFrom = $module$ktor_ktor_client_core.$$importsForInline$$['ktor-ktor-http'].io.ktor.http.takeFrom_jl1sg7$;
  var utils = $module$ktor_ktor_client_core.io.ktor.client.utils;
  var url = $module$ktor_ktor_client_core.io.ktor.client.request.url_3rzbk2$;
  var HttpMethod = $module$ktor_ktor_client_core.$$importsForInline$$['ktor-ktor-http'].io.ktor.http.HttpMethod;
  var HttpRequestBuilder_init = $module$ktor_ktor_client_core.io.ktor.client.request.HttpRequestBuilder;
  var call = $module$ktor_ktor_client_core.io.ktor.client.call.call_30bfl5$;
  var throwCCE = Kotlin.throwCCE;
  var getKClass = Kotlin.getKClass;
  var call_0 = $module$ktor_ktor_client_core.io.ktor.client.call;
  var TypeInfo_init = $module$ktor_ktor_client_core.io.ktor.client.call.TypeInfo;
  var addSuppressedInternal = $module$kotlinx_io.kotlinx.io.core.addSuppressedInternal_oh0dqn$;
  var Throwable = Error;
  var getContextualOrDefault = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.modules.getContextualOrDefault_6za9kt$;
  var get_list = $module$kotlinx_serialization_kotlinx_serialization_runtime.kotlinx.serialization.get_list_gekvwj$;
  var coroutines = $module$kotlinx_coroutines_core.kotlinx.coroutines;
  var promise = $module$kotlinx_coroutines_core.kotlinx.coroutines.promise_pda6u4$;
  var NullPointerException_init = Kotlin.kotlin.NullPointerException_init;
  function get$lambda($receiver) {
    return Unit;
  }
  function Version(version, revision) {
    this.version = version;
    this.revision = revision;
  }
  Version.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Version',
    interfaces: []
  };
  Version.prototype.component1 = function () {
    return this.version;
  };
  Version.prototype.component2 = function () {
    return this.revision;
  };
  Version.prototype.copy_puj7f4$ = function (version, revision) {
    return new Version(version === void 0 ? this.version : version, revision === void 0 ? this.revision : revision);
  };
  Version.prototype.toString = function () {
    return 'Version(version=' + Kotlin.toString(this.version) + (', revision=' + Kotlin.toString(this.revision)) + ')';
  };
  Version.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.version) | 0;
    result = result * 31 + Kotlin.hashCode(this.revision) | 0;
    return result;
  };
  Version.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.version, other.version) && Kotlin.equals(this.revision, other.revision)))));
  };
  var gitlabSerializer;
  function getGroups$lambda$lambda(closure$token) {
    return function ($receiver) {
      if (closure$token != null) {
        header($receiver, 'PRIVATE-TOKEN', closure$token);
      }
      return Unit;
    };
  }
  function Coroutine$getGroups(token_0, domainName_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 6;
    this.local$$receiver = void 0;
    this.local$tmp$ = void 0;
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
            var tmp$;
            this.local$$receiver = HttpClient();
            this.local$closed = false;
            this.exceptionState_0 = 3;
            var urlString = 'https://' + this.local$domainName + '/api/v4/groups/';
            var host_0;
            var body_0;
            host_0 = 'localhost';
            body_0 = utils.EmptyContent;
            var $receiver_1 = new HttpRequestBuilder_init();
            url($receiver_1, 'http', host_0, 0, '/');
            $receiver_1.method = HttpMethod.Companion.Get;
            $receiver_1.body = body_0;
            takeFrom($receiver_1.url, urlString);
            getGroups$lambda$lambda(this.local$token)($receiver_1);
            this.state_0 = 1;
            this.result_0 = call(this.local$$receiver, $receiver_1, this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            var tmp$_0;
            this.state_0 = 2;
            this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 2:
            this.result_0 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
            this.result_0;
            this.local$tmp$ = this.result_0;
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
              }
               catch (second) {
                if (Kotlin.isType(second, Throwable)) {
                  addSuppressedInternal(first, second);
                }
                 else
                  throw second;
              }
              throw first;
            }
             else
              throw first;
          case 4:
            this.exceptionState_0 = 6;
            if (!this.local$closed) {
              this.local$$receiver.close();
            }

            this.state_0 = this.finallyPath_0.shift();
            continue;
          case 5:
            var res = this.local$tmp$;
            try {
              var $receiver = gitlabSerializer;
              tmp$ = $receiver.parse_awif5v$(get_list(getContextualOrDefault($receiver.context, getKClass(Group))), res);
            }
             catch (e) {
              if (Kotlin.isType(e, JsonParsingException)) {
                throw new SerializationException('Parsing of following json failed: ' + '\\' + 'n ' + res, e);
              }
               else
                throw e;
            }

            return tmp$;
          case 6:
            throw this.exception_0;
          default:this.state_0 = 6;
            throw new Error('State Machine Unreachable execution');
        }
      }
       catch (e) {
        if (this.state_0 === 6) {
          this.exceptionState_0 = this.state_0;
          throw e;
        }
         else {
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
  function getGroup$lambda$lambda(closure$token) {
    return function ($receiver) {
      if (closure$token != null) {
        header($receiver, 'PRIVATE-TOKEN', closure$token);
      }
      return Unit;
    };
  }
  function Coroutine$getGroup(token_0, groupName_0, domainName_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 6;
    this.local$$receiver = void 0;
    this.local$tmp$ = void 0;
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
            var tmp$;
            println('Sarting getGroup request to gitlabApi');
            this.local$$receiver = HttpClient();
            this.local$closed = false;
            this.exceptionState_0 = 3;
            var urlString = 'https://' + this.local$domainName + '/api/v4/groups/' + this.local$groupName + '/';
            var host_0;
            var body_0;
            host_0 = 'localhost';
            body_0 = utils.EmptyContent;
            var $receiver_1 = new HttpRequestBuilder_init();
            url($receiver_1, 'http', host_0, 0, '/');
            $receiver_1.method = HttpMethod.Companion.Get;
            $receiver_1.body = body_0;
            takeFrom($receiver_1.url, urlString);
            getGroup$lambda$lambda(this.local$token)($receiver_1);
            this.state_0 = 1;
            this.result_0 = call(this.local$$receiver, $receiver_1, this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            var tmp$_0;
            this.state_0 = 2;
            this.result_0 = this.result_0.receive_jo9acv$(new TypeInfo_init(getKClass(String_0), call_0.JsType), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 2:
            this.result_0 = typeof (tmp$_0 = this.result_0) === 'string' ? tmp$_0 : throwCCE();
            this.result_0;
            this.local$tmp$ = this.result_0;
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
              }
               catch (second) {
                if (Kotlin.isType(second, Throwable)) {
                  addSuppressedInternal(first, second);
                }
                 else
                  throw second;
              }
              throw first;
            }
             else
              throw first;
          case 4:
            this.exceptionState_0 = 6;
            if (!this.local$closed) {
              this.local$$receiver.close();
            }

            this.state_0 = this.finallyPath_0.shift();
            continue;
          case 5:
            var res = this.local$tmp$;
            println('Ending getGroup request to gitlabApi');
            try {
              var $receiver = gitlabSerializer;
              tmp$ = $receiver.parse_awif5v$(getContextualOrDefault($receiver.context, getKClass(Group)), res);
            }
             catch (e) {
              if (Kotlin.isType(e, JsonParsingException)) {
                throw new SerializationException('Parsing of following json failed: ' + '\\' + 'n ' + res, e);
              }
               else
                throw e;
            }

            return tmp$;
          case 6:
            throw this.exception_0;
          default:this.state_0 = 6;
            throw new Error('State Machine Unreachable execution');
        }
      }
       catch (e) {
        if (this.state_0 === 6) {
          this.exceptionState_0 = this.state_0;
          throw e;
        }
         else {
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
    this.descriptor_6wa5hj$_0 = new SerialClassDescImpl('com.mlreef.gitlabapi.Group', this);
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
      return this.descriptor_6wa5hj$_0;
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
        default:throw new UnknownFieldException(index);
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
  function Coroutine$notMain(continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 1;
  }
  Coroutine$notMain.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$notMain.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$notMain.prototype.constructor = Coroutine$notMain;
  Coroutine$notMain.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            var testToken = '4s129mSs6v1iw_uDzDc7';
            this.state_0 = 2;
            this.result_0 = getGroup(testToken, 'mlreef', void 0, this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            var group = this.result_0;
            println('Hellooooo');
            println('Group: ' + group.name + ', id: ' + group.id.toString());
            return;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      }
       catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        }
         else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function notMain(continuation_0, suspended) {
    var instance = new Coroutine$notMain(continuation_0);
    if (suspended)
      return instance;
    else
      return instance.doResume(null);
  }
  function hello() {
    return 'Hello from JS';
  }
  function commonHello() {
    return 'Hello Commoners';
  }
  function Coroutine$jsGetGroup$lambda(closure$token_0, closure$groupName_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$token = closure$token_0;
    this.local$closure$groupName = closure$groupName_0;
  }
  Coroutine$jsGetGroup$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$jsGetGroup$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$jsGetGroup$lambda.prototype.constructor = Coroutine$jsGetGroup$lambda;
  Coroutine$jsGetGroup$lambda.prototype.doResume = function () {
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
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      }
       catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        }
         else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function jsGetGroup$lambda(closure$token_0, closure$groupName_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$jsGetGroup$lambda(closure$token_0, closure$groupName_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  function jsGetGroup(token, groupName) {
    return promise(coroutines.GlobalScope, void 0, void 0, jsGetGroup$lambda(token, groupName));
  }
  function runTest(block) {
    throw NullPointerException_init();
  }
  function Sample() {
  }
  Sample.prototype.checkMe = function () {
    return 12;
  };
  Sample.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Sample',
    interfaces: []
  };
  function Platform() {
    Platform_instance = this;
    this.name = 'JS';
  }
  Platform.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Platform',
    interfaces: []
  };
  var Platform_instance = null;
  function Platform_getInstance() {
    if (Platform_instance === null) {
      new Platform();
    }
    return Platform_instance;
  }
  var package$com = _.com || (_.com = {});
  var package$mlreef = package$com.mlreef || (package$com.mlreef = {});
  var package$gitlabapi = package$mlreef.gitlabapi || (package$mlreef.gitlabapi = {});
  package$gitlabapi.Version = Version;
  Object.defineProperty(package$gitlabapi, 'gitlabSerializer', {
    get: function () {
      return gitlabSerializer;
    }
  });
  $$importsForInline$$['ktor-ktor-client-core'] = $module$ktor_ktor_client_core;
  $$importsForInline$$['kotlinx-io'] = $module$kotlinx_io;
  $$importsForInline$$['kotlinx-serialization-kotlinx-serialization-runtime'] = $module$kotlinx_serialization_kotlinx_serialization_runtime;
  package$gitlabapi.actualGetGroups = getGroups;
  package$gitlabapi.actualGetGroup = getGroup;
  Object.defineProperty(Group, 'Companion', {
    get: Group$Companion_getInstance
  });
  Object.defineProperty(Group, '$serializer', {
    get: Group$$serializer_getInstance
  });
  package$gitlabapi.Group = Group;
  package$mlreef.notMain = notMain;
  var package$sample = _.sample || (_.sample = {});
  package$sample.hello = hello;
  package$sample.commonHello = commonHello;
  package$gitlabapi.getGroup = jsGetGroup;
  package$mlreef.runTest_lnyleu$ = runTest;
  package$sample.Sample = Sample;
  Object.defineProperty(package$sample, 'Platform', {
    get: Platform_getInstance
  });
  Group$$serializer.prototype.patch_mynpiu$ = GeneratedSerializer.prototype.patch_mynpiu$;
  gitlabSerializer = Json.Companion.nonstrict;
  Kotlin.defineModule('gitlabapi', _);
  return _;
}));

//# sourceMappingURL=gitlabapi.js.map
