(function(root, factory) {
  if (typeof define === 'function' && define.amd) 
    define(['exports', 'kotlin', 'ktor-ktor-http', 'kotlinx-io', 'kotlinx-coroutines-io', 'kotlinx-coroutines-core'], factory);
  else if (typeof exports === 'object') 
    factory(module.exports, require('kotlin'), require('ktor-ktor-http'), require('kotlinx-io'), require('kotlinx-coroutines-io'), require('kotlinx-coroutines-core'));
  else {
    if (typeof kotlin === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-http-cio'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'ktor-ktor-http-cio'.");
    }
    if (typeof this['ktor-ktor-http'] === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-http-cio'. Its dependency 'ktor-ktor-http' was not found. Please, check whether 'ktor-ktor-http' is loaded prior to 'ktor-ktor-http-cio'.");
    }
    if (typeof this['kotlinx-io'] === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-http-cio'. Its dependency 'kotlinx-io' was not found. Please, check whether 'kotlinx-io' is loaded prior to 'ktor-ktor-http-cio'.");
    }
    if (typeof this['kotlinx-coroutines-io'] === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-http-cio'. Its dependency 'kotlinx-coroutines-io' was not found. Please, check whether 'kotlinx-coroutines-io' is loaded prior to 'ktor-ktor-http-cio'.");
    }
    if (typeof this['kotlinx-coroutines-core'] === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-http-cio'. Its dependency 'kotlinx-coroutines-core' was not found. Please, check whether 'kotlinx-coroutines-core' is loaded prior to 'ktor-ktor-http-cio'.");
    }
    root['ktor-ktor-http-cio'] = factory(typeof this['ktor-ktor-http-cio'] === 'undefined' ? {} : this['ktor-ktor-http-cio'], kotlin, this['ktor-ktor-http'], this['kotlinx-io'], this['kotlinx-coroutines-io'], this['kotlinx-coroutines-core']);
  }
}(this, function(_, Kotlin, $module$ktor_ktor_http, $module$kotlinx_io, $module$kotlinx_coroutines_io, $module$kotlinx_coroutines_core) {
  'use strict';
  var $$importsForInline$$ = _.$$importsForInline$$ || (_.$$importsForInline$$ = {});
  var map = Kotlin.kotlin.sequences.map_z5avom$;
  var toList = Kotlin.kotlin.sequences.toList_veqyi0$;
  var until = Kotlin.kotlin.ranges.until_dqglrj$;
  var toSet = Kotlin.kotlin.collections.toSet_7wnvza$;
  var listOf = Kotlin.kotlin.collections.listOf_mh5how$;
  var Kind_CLASS = Kotlin.Kind.CLASS;
  var Map$Entry = Kotlin.kotlin.collections.Map.Entry;
  var LazyThreadSafetyMode = Kotlin.kotlin.LazyThreadSafetyMode;
  var LinkedHashSet_init = Kotlin.kotlin.collections.LinkedHashSet_init_ww73n8$;
  var lazy = Kotlin.kotlin.lazy_kls4a0$;
  var Headers = $module$ktor_ktor_http.io.ktor.http.Headers;
  var collectionSizeOrDefault = Kotlin.kotlin.collections.collectionSizeOrDefault_ba2ldo$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  var StringBuilder_init = Kotlin.kotlin.text.StringBuilder_init_za3lpa$;
  var Unit = Kotlin.kotlin.Unit;
  var DefaultPool = $module$kotlinx_io.kotlinx.io.pool.DefaultPool;
  var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
  var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
  var writer = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.writer_r5ogg1$;
  var EOFException = $module$kotlinx_io.kotlinx.io.errors.EOFException;
  var L0 = Kotlin.Long.ZERO;
  var copyTo = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.copyTo_lhug7f$;
  var equals = Kotlin.equals;
  var Throwable = Error;
  var close = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.close_sypobt$;
  var coroutines = $module$kotlinx_coroutines_core.kotlinx.coroutines;
  var reader = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.reader_ymoia9$;
  var IoBuffer = $module$kotlinx_io.kotlinx.io.core.IoBuffer;
  var ByteOrder = $module$kotlinx_io.kotlinx.io.core.ByteOrder;
  var writeFully = $module$kotlinx_coroutines_io.kotlinx.coroutines.io.writeFully_p8yv3v$;
  var charsets = $module$kotlinx_io.kotlinx.io.charsets;
  var encodeToByteArray = $module$kotlinx_io.kotlinx.io.charsets.encodeToByteArray_478lbv$;
  var singleOrNull = Kotlin.kotlin.collections.singleOrNull_2p1efm$;
  var ArrayList_init_0 = Kotlin.kotlin.collections.ArrayList_init_287e2$;
  var emptyList = Kotlin.kotlin.collections.emptyList_287e2$;
  var to = Kotlin.kotlin.to_ujzrz7$;
  var listOf_0 = Kotlin.kotlin.collections.listOf_i5x0yv$;
  var toBoxedChar = Kotlin.toBoxedChar;
  var Kind_OBJECT = Kotlin.Kind.OBJECT;
  var joinTo = Kotlin.kotlin.collections.joinTo_gcc71v$;
  var throwCCE = Kotlin.throwCCE;
  var hashCode = Kotlin.hashCode;
  var StringBuilder_init_0 = Kotlin.kotlin.text.StringBuilder_init;
  var HttpMethod = $module$ktor_ktor_http.io.ktor.http.HttpMethod;
  var L_1 = Kotlin.Long.NEG_ONE;
  var toString = Kotlin.toString;
  var IllegalStateException_init = Kotlin.kotlin.IllegalStateException_init_pdl1vj$;
  var Long$Companion$MAX_VALUE = Kotlin.Long.MAX_VALUE;
  var trimIndent = Kotlin.kotlin.text.trimIndent_pdl1vz$;
  var generateSequence = Kotlin.kotlin.sequences.generateSequence_gexuht$;
  var filter = Kotlin.kotlin.sequences.filter_euau3h$;
  var NotImplementedError_init = Kotlin.kotlin.NotImplementedError;
  var IllegalArgumentException_init = Kotlin.kotlin.IllegalArgumentException_init_pdl1vj$;
  var Exception_init = Kotlin.kotlin.Exception_init_pdl1vj$;
  var Exception = Kotlin.kotlin.Exception;
  var unboxChar = Kotlin.unboxChar;
  var CharRange = Kotlin.kotlin.ranges.CharRange;
  var NumberFormatException = Kotlin.kotlin.NumberFormatException;
  var Closeable = $module$kotlinx_io.kotlinx.io.core.Closeable;
  var NoSuchElementException = Kotlin.kotlin.NoSuchElementException;
  var Array_0 = Array;
  var toChar = Kotlin.toChar;
  var Collection = Kotlin.kotlin.collections.Collection;
  var LinkedHashMap_init = Kotlin.kotlin.collections.LinkedHashMap_init_q3lmfv$;
  var ensureNotNull = Kotlin.ensureNotNull;
  var CharSequence = Kotlin.kotlin.CharSequence;
  var IndexOutOfBoundsException = Kotlin.kotlin.IndexOutOfBoundsException;
  var Appendable = Kotlin.kotlin.text.Appendable;
  var Math_0 = Math;
  var IntRange = Kotlin.kotlin.ranges.IntRange;
  var L48 = Kotlin.Long.fromInt(48);
  var L97 = Kotlin.Long.fromInt(97);
  var L102 = Kotlin.Long.fromInt(102);
  var L65 = Kotlin.Long.fromInt(65);
  var L70 = Kotlin.Long.fromInt(70);
  var toByte = Kotlin.toByte;
  var copyToArray = Kotlin.kotlin.collections.copyToArray;
  var Enum = Kotlin.kotlin.Enum;
  var throwISE = Kotlin.throwISE;
  var mapCapacity = Kotlin.kotlin.collections.mapCapacity_za3lpa$;
  var coerceAtLeast = Kotlin.kotlin.ranges.coerceAtLeast_dqglrj$;
  var LinkedHashMap_init_0 = Kotlin.kotlin.collections.LinkedHashMap_init_bwtc7$;
  var writeFully_0 = $module$kotlinx_io.kotlinx.io.core.writeFully_u129dg$;
  var decode = $module$kotlinx_io.kotlinx.io.charsets.decode_4lddy5$;
  var DisposableHandle = $module$kotlinx_coroutines_core.kotlinx.coroutines.DisposableHandle;
  var BytePacketBuilder = $module$kotlinx_io.kotlinx.io.core.BytePacketBuilder_za3lpa$;
  var get_lastIndex = Kotlin.kotlin.collections.get_lastIndex_m7z4lg$;
  var defineInlineFunction = Kotlin.defineInlineFunction;
  var wrapFunction = Kotlin.wrapFunction;
  var Annotation = Kotlin.kotlin.Annotation;
  var ClosedSendChannelException = $module$kotlinx_coroutines_core.kotlinx.coroutines.channels.ClosedSendChannelException;
  var Kind_INTERFACE = Kotlin.Kind.INTERFACE;
  var readBytes = $module$kotlinx_io.kotlinx.io.core.readBytes_3lionn$;
  var CoroutineScope = $module$kotlinx_coroutines_core.kotlinx.coroutines.CoroutineScope;
  ChunkSizeBufferPool$ObjectLiteral.prototype = Object.create(DefaultPool.prototype);
  ChunkSizeBufferPool$ObjectLiteral.prototype.constructor = ChunkSizeBufferPool$ObjectLiteral;
  IntArrayPool$ObjectLiteral.prototype = Object.create(DefaultPool.prototype);
  IntArrayPool$ObjectLiteral.prototype.constructor = IntArrayPool$ObjectLiteral;
  ParserException.prototype = Object.create(Exception.prototype);
  ParserException.prototype.constructor = ParserException;
  Request.prototype = Object.create(HttpMessage.prototype);
  Request.prototype.constructor = Request;
  Response.prototype = Object.create(HttpMessage.prototype);
  Response.prototype.constructor = Response;
  CharArrayPool$ObjectLiteral.prototype = Object.create(DefaultPool.prototype);
  CharArrayPool$ObjectLiteral.prototype.constructor = CharArrayPool$ObjectLiteral;
  CloseReason$Codes.prototype = Object.create(Enum.prototype);
  CloseReason$Codes.prototype.constructor = CloseReason$Codes;
  FrameType.prototype = Object.create(Enum.prototype);
  FrameType.prototype.constructor = FrameType;
  Frame$Binary.prototype = Object.create(Frame.prototype);
  Frame$Binary.prototype.constructor = Frame$Binary;
  Frame$Text.prototype = Object.create(Frame.prototype);
  Frame$Text.prototype.constructor = Frame$Text;
  Frame$Close.prototype = Object.create(Frame.prototype);
  Frame$Close.prototype.constructor = Frame$Close;
  Frame$Ping.prototype = Object.create(Frame.prototype);
  Frame$Ping.prototype.constructor = Frame$Ping;
  Frame$Pong.prototype = Object.create(Frame.prototype);
  Frame$Pong.prototype.constructor = Frame$Pong;
  function CIOHeaders(headers) {
    this.headers_0 = headers;
    this.names_pj02dq$_0 = lazy(LazyThreadSafetyMode.NONE, CIOHeaders$names$lambda(this));
  }
  Object.defineProperty(CIOHeaders.prototype, 'names_0', {
  get: function() {
  return this.names_pj02dq$_0.value;
}});
  Object.defineProperty(CIOHeaders.prototype, 'caseInsensitiveName', {
  get: function() {
  return true;
}});
  CIOHeaders.prototype.names = function() {
  return this.names_0;
};
  CIOHeaders.prototype.get_61zpoe$ = function(name) {
  var tmp$;
  return (tmp$ = this.headers_0.get_61zpoe$(name)) != null ? tmp$.toString() : null;
};
  function CIOHeaders$getAll$lambda(it) {
    return it.toString();
  }
  CIOHeaders.prototype.getAll_61zpoe$ = function(name) {
  return toList(map(this.headers_0.getAll_61zpoe$(name), CIOHeaders$getAll$lambda));
};
  CIOHeaders.prototype.isEmpty = function() {
  return this.headers_0.size === 0;
};
  CIOHeaders.prototype.entries = function() {
  var $receiver = until(0, this.headers_0.size);
  var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
  var tmp$;
  tmp$ = $receiver.iterator();
  while (tmp$.hasNext()) {
    var item = tmp$.next();
    destination.add_11rb$(new CIOHeaders$Entry(this, item));
  }
  return toSet(destination);
};
  function CIOHeaders$Entry($outer, idx) {
    this.$outer = $outer;
    this.idx_0 = idx;
  }
  Object.defineProperty(CIOHeaders$Entry.prototype, 'key', {
  get: function() {
  return this.$outer.headers_0.nameAt_za3lpa$(this.idx_0).toString();
}});
  Object.defineProperty(CIOHeaders$Entry.prototype, 'value', {
  get: function() {
  return listOf(this.$outer.headers_0.valueAt_za3lpa$(this.idx_0).toString());
}});
  CIOHeaders$Entry.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Entry', 
  interfaces: [Map$Entry]};
  function CIOHeaders$names$lambda(this$CIOHeaders) {
    return function() {
  var $receiver = LinkedHashSet_init(this$CIOHeaders.headers_0.size);
  var this$CIOHeaders_0 = this$CIOHeaders;
  var tmp$;
  tmp$ = this$CIOHeaders_0.headers_0.size;
  for (var i = 0; i < tmp$; i++) {
    $receiver.add_11rb$(this$CIOHeaders_0.headers_0.nameAt_za3lpa$(i).toString());
  }
  return $receiver;
};
  }
  CIOHeaders.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'CIOHeaders', 
  interfaces: [Headers]};
  var MAX_CHUNK_SIZE_LENGTH;
  var CHUNK_BUFFER_POOL_SIZE;
  var DEFAULT_BYTE_BUFFER_SIZE;
  function ChunkSizeBufferPool$ObjectLiteral(capacity) {
    DefaultPool.call(this, capacity);
  }
  ChunkSizeBufferPool$ObjectLiteral.prototype.produceInstance = function() {
  return StringBuilder_init(128);
};
  ChunkSizeBufferPool$ObjectLiteral.prototype.clearInstance_trkh7z$ = function(instance) {
  instance.clear();
  return instance;
};
  ChunkSizeBufferPool$ObjectLiteral.$metadata$ = {
  kind: Kind_CLASS, 
  interfaces: [DefaultPool]};
  var ChunkSizeBufferPool;
  function Coroutine$decodeChunked$lambda(closure$input_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$input = closure$input_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$decodeChunked$lambda.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$decodeChunked$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$decodeChunked$lambda.prototype.constructor = Coroutine$decodeChunked$lambda;
  Coroutine$decodeChunked$lambda.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.state_0 = 2;
        this.result_0 = decodeChunked_0(this.local$closure$input, this.local$$receiver.channel, this);
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
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function decodeChunked$lambda(closure$input_0) {
    return function($receiver_0, continuation_0, suspended) {
  var instance = new Coroutine$decodeChunked$lambda(closure$input_0, $receiver_0, this, continuation_0);
  if (suspended) 
    return instance;
  else 
    return instance.doResume(null);
};
  }
  function decodeChunked($receiver, input) {
    return writer($receiver, $receiver.coroutineContext, void 0, decodeChunked$lambda(input));
  }
  function Coroutine$decodeChunked(input_0, out_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 11;
    this.local$chunkSizeBuffer = void 0;
    this.local$chunkSize = void 0;
    this.local$input = input_0;
    this.local$out = out_0;
  }
  Coroutine$decodeChunked.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$decodeChunked.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$decodeChunked.prototype.constructor = Coroutine$decodeChunked;
  Coroutine$decodeChunked.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.local$chunkSizeBuffer = ChunkSizeBufferPool.borrow();
        this.exceptionState_0 = 8;
        this.state_0 = 1;
        continue;
      case 1:
        this.local$chunkSizeBuffer.clear();
        this.state_0 = 2;
        this.result_0 = this.local$input.readUTF8LineTo_yhx0yw$(this.local$chunkSizeBuffer, 128, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 2:
        if (!this.result_0) {
          throw new EOFException('Chunked stream has ended unexpectedly: no chunk size');
        } else {
          if (this.local$chunkSizeBuffer.length === 0) {
            throw new EOFException('Invalid chunk size: empty');
          }
        }
        this.local$chunkSize = this.local$chunkSizeBuffer.length === 1 && this.local$chunkSizeBuffer.charCodeAt(0) === 48 ? L0 : parseHexLong(this.local$chunkSizeBuffer);
        if (this.local$chunkSize.toNumber() > 0) {
          this.state_0 = 3;
          this.result_0 = copyTo(this.local$input, this.local$out, this.local$chunkSize, this);
          if (this.result_0 === COROUTINE_SUSPENDED) 
            return COROUTINE_SUSPENDED;
          continue;
        } else {
          this.state_0 = 4;
          continue;
        }
      case 3:
        this.local$out.flush();
        this.state_0 = 4;
        continue;
      case 4:
        this.local$chunkSizeBuffer.clear();
        this.state_0 = 5;
        this.result_0 = this.local$input.readUTF8LineTo_yhx0yw$(this.local$chunkSizeBuffer, 2, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 5:
        if (!this.result_0) {
          throw new EOFException('Invalid chunk: content block of size ' + this.local$chunkSize.toString() + ' ended unexpectedly');
        }
        if (this.local$chunkSizeBuffer.length > 0) {
          throw new EOFException('Invalid chunk: content block should end with CR+LF');
        }
        if (equals(this.local$chunkSize, L0)) {
          this.state_0 = 7;
          continue;
        } else {
          this.state_0 = 6;
          continue;
        }
      case 6:
        this.state_0 = 1;
        continue;
      case 7:
        this.exceptionState_0 = 11;
        this.finallyPath_0 = [10];
        this.state_0 = 9;
        continue;
      case 8:
        this.finallyPath_0 = [11];
        this.exceptionState_0 = 9;
        var t = this.exception_0;
        if (Kotlin.isType(t, Throwable)) {
          this.local$out.close_dbl4no$(t);
          throw t;
        } else 
          throw t;
      case 9:
        this.exceptionState_0 = 11;
        ChunkSizeBufferPool.recycle_trkh7z$(this.local$chunkSizeBuffer);
        close(this.local$out);
        this.state_0 = this.finallyPath_0.shift();
        continue;
      case 10:
        return;
      case 11:
        throw this.exception_0;
      default:
        this.state_0 = 11;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 11) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function decodeChunked_0(input_0, out_0, continuation_0, suspended) {
    var instance = new Coroutine$decodeChunked(input_0, out_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function Coroutine$encodeChunked$lambda(closure$output_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$output = closure$output_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$encodeChunked$lambda.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$encodeChunked$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$encodeChunked$lambda.prototype.constructor = Coroutine$encodeChunked$lambda;
  Coroutine$encodeChunked$lambda.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.state_0 = 2;
        this.result_0 = encodeChunked_0(this.local$closure$output, this.local$$receiver.channel, this);
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
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function encodeChunked$lambda(closure$output_0) {
    return function($receiver_0, continuation_0, suspended) {
  var instance = new Coroutine$encodeChunked$lambda(closure$output_0, $receiver_0, this, continuation_0);
  if (suspended) 
    return instance;
  else 
    return instance.doResume(null);
};
  }
  function encodeChunked(output, coroutineContext, continuation) {
    return reader(coroutines.GlobalScope, coroutineContext, false, encodeChunked$lambda(output));
  }
  function Coroutine$encodeChunked$lambda_0(closure$output_0, closure$view_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$output = closure$output_0;
    this.local$closure$view = closure$view_0;
    this.local$tmp$ = void 0;
    this.local$tmp$_0 = void 0;
    this.local$content = void 0;
    this.local$$receiver_0 = void 0;
    this.local$tmp$_1 = void 0;
    this.local$closure$output_0 = void 0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$encodeChunked$lambda_0.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$encodeChunked$lambda_0.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$encodeChunked$lambda_0.prototype.constructor = Coroutine$encodeChunked$lambda_0;
  Coroutine$encodeChunked$lambda_0.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.state_0 = 2;
        continue;
      case 1:
        throw this.exception_0;
      case 2:
        this.state_0 = 3;
        this.result_0 = this.local$$receiver.await_za3lpa$(4088, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 3:
        if (!this.result_0) {
          this.state_0 = 9;
          continue;
        } else {
          this.state_0 = 4;
          continue;
        }
      case 4:
        this.local$tmp$ = this.local$$receiver.request_za3lpa$();
        if (this.local$tmp$ == null) {
          return;
        } else {
          this.state_0 = 5;
          continue;
        }
      case 5:
        this.local$content = this.local$tmp$;
        this.local$$receiver_0 = this.local$closure$output;
        var tempBuffer = this.local$closure$view;
        var size = this.local$content.readRemaining;
        tempBuffer.resetForWrite();
        writeIntHex(tempBuffer, size);
        tempBuffer.writeShort_mq22fl$(CrLfShort);
        this.state_0 = 6;
        this.result_0 = this.local$$receiver_0.writeFully_g6eaik$(tempBuffer, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 6:
        this.state_0 = 7;
        this.result_0 = this.local$$receiver_0.writeFully_g6eaik$(this.local$content, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 7:
        this.state_0 = 8;
        this.result_0 = writeFully(this.local$$receiver_0, CrLf, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 8:
        this.local$$receiver_0.flush();
        this.state_0 = 2;
        continue;
      case 9:
        if ((this.local$tmp$_0 = this.local$$receiver.request_za3lpa$()) != null) {
          this.local$closure$output_0 = this.local$closure$output;
          var tempBuffer_0 = this.local$closure$view;
          var size_0 = this.local$tmp$_0.readRemaining;
          tempBuffer_0.resetForWrite();
          writeIntHex(tempBuffer_0, size_0);
          tempBuffer_0.writeShort_mq22fl$(CrLfShort);
          this.state_0 = 10;
          this.result_0 = this.local$closure$output_0.writeFully_g6eaik$(tempBuffer_0, this);
          if (this.result_0 === COROUTINE_SUSPENDED) 
            return COROUTINE_SUSPENDED;
          continue;
        } else {
          this.local$tmp$_1 = null;
          this.state_0 = 13;
          continue;
        }
      case 10:
        this.state_0 = 11;
        this.result_0 = this.local$closure$output_0.writeFully_g6eaik$(this.local$tmp$_0, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 11:
        this.state_0 = 12;
        this.result_0 = writeFully(this.local$closure$output_0, CrLf, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 12:
        this.local$closure$output_0.flush();
        this.local$tmp$_1 = Unit;
        this.state_0 = 13;
        continue;
      case 13:
        return this.local$tmp$_1;
      default:
        this.state_0 = 1;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function encodeChunked$lambda_0(closure$output_0, closure$view_0) {
    return function($receiver_0, continuation_0, suspended) {
  var instance = new Coroutine$encodeChunked$lambda_0(closure$output_0, closure$view_0, $receiver_0, this, continuation_0);
  if (suspended) 
    return instance;
  else 
    return instance.doResume(null);
};
  }
  function Coroutine$encodeChunked(output_0, input_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 6;
    this.local$view = void 0;
    this.local$output = output_0;
    this.local$input = input_0;
  }
  Coroutine$encodeChunked.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$encodeChunked.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$encodeChunked.prototype.constructor = Coroutine$encodeChunked;
  Coroutine$encodeChunked.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.local$view = IoBuffer.Companion.Pool.borrow();
        this.local$view.byteOrder = ByteOrder.BIG_ENDIAN;
        this.exceptionState_0 = 3;
        this.state_0 = 1;
        this.result_0 = this.local$input.readSuspendableSession_2gofpf$(encodeChunked$lambda_0(this.local$output, this.local$view), this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        this.state_0 = 2;
        this.result_0 = writeFully(this.local$output, LastChunkBytes, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 2:
        this.exceptionState_0 = 6;
        this.finallyPath_0 = [5];
        this.state_0 = 4;
        continue;
      case 3:
        this.finallyPath_0 = [6];
        this.exceptionState_0 = 4;
        var cause = this.exception_0;
        if (Kotlin.isType(cause, Throwable)) {
          this.local$output.close_dbl4no$(cause);
        } else 
          throw cause;
        this.finallyPath_0 = [5];
        this.state_0 = 4;
        continue;
      case 4:
        this.exceptionState_0 = 6;
        this.local$output.flush();
        this.local$view.release_cqjh9i$(IoBuffer.Companion.Pool);
        this.state_0 = this.finallyPath_0.shift();
        continue;
      case 5:
        return;
      case 6:
        throw this.exception_0;
      default:
        this.state_0 = 6;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 6) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function encodeChunked_0(output_0, input_0, continuation_0, suspended) {
    var instance = new Coroutine$encodeChunked(output_0, input_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  var CrLfShort;
  var CrLf;
  var LastChunkBytes;
  function Coroutine$writeChunk($receiver_0, chunk_0, tempBuffer_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 1;
    this.local$$receiver = $receiver_0;
    this.local$chunk = chunk_0;
    this.local$tempBuffer = tempBuffer_0;
  }
  Coroutine$writeChunk.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$writeChunk.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$writeChunk.prototype.constructor = Coroutine$writeChunk;
  Coroutine$writeChunk.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        var size = this.local$chunk.readRemaining;
        this.local$tempBuffer.resetForWrite();
        writeIntHex(this.local$tempBuffer, size);
        this.local$tempBuffer.writeShort_mq22fl$(CrLfShort);
        this.state_0 = 2;
        this.result_0 = this.local$$receiver.writeFully_g6eaik$(this.local$tempBuffer, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        throw this.exception_0;
      case 2:
        this.state_0 = 3;
        this.result_0 = this.local$$receiver.writeFully_g6eaik$(this.local$chunk, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 3:
        this.state_0 = 4;
        this.result_0 = writeFully(this.local$$receiver, CrLf, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 4:
        this.local$$receiver.flush();
        return;
      default:
        this.state_0 = 1;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function writeChunk($receiver_0, chunk_0, tempBuffer_0, continuation_0, suspended) {
    var instance = new Coroutine$writeChunk($receiver_0, chunk_0, tempBuffer_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function ConnectionOptions(close, keepAlive, upgrade, extraOptions) {
    ConnectionOptions$Companion_getInstance();
    if (close === void 0) 
      close = false;
    if (keepAlive === void 0) 
      keepAlive = false;
    if (upgrade === void 0) 
      upgrade = false;
    if (extraOptions === void 0) 
      extraOptions = emptyList();
    this.close = close;
    this.keepAlive = keepAlive;
    this.upgrade = upgrade;
    this.extraOptions = extraOptions;
  }
  function ConnectionOptions$Companion() {
    ConnectionOptions$Companion_instance = this;
    this.Close = new ConnectionOptions(true);
    this.KeepAlive = new ConnectionOptions(void 0, true);
    this.Upgrade = new ConnectionOptions(void 0, void 0, true);
    this.knownTypes_0 = AsciiCharTree$Companion_getInstance().build_za6fmz$(listOf_0([to('close', this.Close), to('keep-alive', this.KeepAlive), to('upgrade', this.Upgrade)]), ConnectionOptions$Companion$knownTypes$lambda, ConnectionOptions$Companion$knownTypes$lambda_0);
  }
  function ConnectionOptions$Companion$parse$lambda(f, f_0) {
    return false;
  }
  ConnectionOptions$Companion.prototype.parse_gw00v9$ = function(connection) {
  if (connection == null) 
    return null;
  var known = this.knownTypes_0.search_5wmzmj$(connection, void 0, void 0, true, ConnectionOptions$Companion$parse$lambda);
  if (known.size === 1) 
    return known.get_za3lpa$(0).second;
  return this.parseSlow_0(connection);
};
  function ConnectionOptions$Companion$parseSlow$lambda(f, f_0) {
    return false;
  }
  ConnectionOptions$Companion.prototype.parseSlow_0 = function(connection) {
  var idx = 0;
  var start = 0;
  var length = connection.length;
  var connectionOptions = null;
  var hopHeadersList = null;
  while (idx < length) {
    do {
      var ch = connection.charCodeAt(idx);
      if (ch !== 32 && ch !== 44) {
        start = idx;
        break;
      }
      idx = idx + 1 | 0;
    } while (idx < length);
    while (idx < length) {
      var ch_0 = connection.charCodeAt(idx);
      if (ch_0 === 32 || ch_0 === 44) 
        break;
      idx = idx + 1 | 0;
    }
    var detected = singleOrNull(this.knownTypes_0.search_5wmzmj$(connection, start, idx, true, ConnectionOptions$Companion$parseSlow$lambda));
    if (detected == null) {
      if (hopHeadersList == null) {
        hopHeadersList = ArrayList_init_0();
      }
      var tmp$ = hopHeadersList;
      var startIndex = start;
      var endIndex = idx;
      tmp$.add_11rb$(Kotlin.subSequence(connection, startIndex, endIndex).toString());
    } else if (connectionOptions == null) 
      connectionOptions = detected.second;
    else {
      connectionOptions = new ConnectionOptions(connectionOptions.close || detected.second.close, connectionOptions.keepAlive || detected.second.keepAlive, connectionOptions.upgrade || detected.second.upgrade, emptyList());
    }
  }
  if (connectionOptions == null) 
    connectionOptions = this.KeepAlive;
  return hopHeadersList == null ? connectionOptions : new ConnectionOptions(connectionOptions.close, connectionOptions.keepAlive, connectionOptions.upgrade, hopHeadersList);
};
  function ConnectionOptions$Companion$knownTypes$lambda(it) {
    return it.first.length;
  }
  function ConnectionOptions$Companion$knownTypes$lambda_0(t, idx) {
    return toBoxedChar(t.first.charCodeAt(idx));
  }
  ConnectionOptions$Companion.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'Companion', 
  interfaces: []};
  var ConnectionOptions$Companion_instance = null;
  function ConnectionOptions$Companion_getInstance() {
    if (ConnectionOptions$Companion_instance === null) {
      new ConnectionOptions$Companion();
    }
    return ConnectionOptions$Companion_instance;
  }
  ConnectionOptions.prototype.toString = function() {
  if (this.extraOptions.isEmpty()) 
    if (this.close && !this.keepAlive && !this.upgrade) 
    return 'close';
  else if (!this.close && this.keepAlive && !this.upgrade) 
    return 'keep-alive';
  else if (!this.close && this.keepAlive && this.upgrade) 
    return 'keep-alive, Upgrade';
  else 
    return this.buildToString_0();
  else 
    return this.buildToString_0();
};
  ConnectionOptions.prototype.buildToString_0 = function() {
  var $receiver = StringBuilder_init_0();
  var items = ArrayList_init(this.extraOptions.size + 3 | 0);
  if (this.close) 
    items.add_11rb$('close');
  if (this.keepAlive) 
    items.add_11rb$('keep-alive');
  if (this.upgrade) 
    items.add_11rb$('Upgrade');
  if (!this.extraOptions.isEmpty()) {
    items.addAll_brywnq$(this.extraOptions);
  }
  joinTo(items, $receiver);
  return $receiver.toString();
};
  ConnectionOptions.prototype.equals = function(other) {
  var tmp$, tmp$_0;
  if (this === other) 
    return true;
  if (other == null || !((tmp$ = Kotlin.getKClassFromExpression(this)) != null ? tmp$.equals(Kotlin.getKClassFromExpression(other)) : null)) 
    return false;
    Kotlin.isType(tmp$_0 = other, ConnectionOptions) ? tmp$_0 : throwCCE();
  if (this.close !== other.close) 
    return false;
  if (this.keepAlive !== other.keepAlive) 
    return false;
  if (this.upgrade !== other.upgrade) 
    return false;
  if (!equals(this.extraOptions, other.extraOptions)) 
    return false;
  return true;
};
  ConnectionOptions.prototype.hashCode = function() {
  var result = hashCode(this.close);
  result = (31 * result | 0) + hashCode(this.keepAlive) | 0;
  result = (31 * result | 0) + hashCode(this.upgrade) | 0;
  result = (31 * result | 0) + hashCode(this.extraOptions) | 0;
  return result;
};
  ConnectionOptions.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'ConnectionOptions', 
  interfaces: []};
  function expectHttpUpgrade(method, upgrade, connectionOptions) {
    return (method != null ? method.equals(HttpMethod.Companion.Get) : null) && upgrade != null && (connectionOptions != null ? connectionOptions.upgrade : null) === true;
  }
  function expectHttpUpgrade_0(request) {
    return expectHttpUpgrade(request.method, request.headers.get_61zpoe$('Upgrade'), ConnectionOptions$Companion_getInstance().parse_gw00v9$(request.headers.get_61zpoe$('Connection')));
  }
  function expectHttpBody(method, contentLength, transferEncoding, connectionOptions, contentType) {
    if ((method != null ? method.equals(HttpMethod.Companion.Get) : null) || (method != null ? method.equals(HttpMethod.Companion.Head) : null) || (method != null ? method.equals(HttpMethod.Companion.Options) : null)) 
      return false;
    if (transferEncoding != null || (connectionOptions != null ? connectionOptions.close : null) === true) 
      return true;
    if (!equals(contentLength, L_1)) 
      return contentLength.compareTo_11rb$(L0) > 0;
    if (contentType != null) 
      return true;
    return false;
  }
  function expectHttpBody_0(request) {
    var tmp$, tmp$_0;
    return expectHttpBody(request.method, (tmp$_0 = (tmp$ = request.headers.get_61zpoe$('Content-Length')) != null ? parseDecLong(tmp$) : null) != null ? tmp$_0 : L_1, request.headers.get_61zpoe$('Transfer-Encoding'), ConnectionOptions$Companion_getInstance().parse_gw00v9$(request.headers.get_61zpoe$('Connection')), request.headers.get_61zpoe$('Content-Type'));
  }
  function Coroutine$parseHttpBody(contentLength_0, transferEncoding_0, connectionOptions_0, input_0, out_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 1;
    this.local$contentLength = contentLength_0;
    this.local$transferEncoding = transferEncoding_0;
    this.local$connectionOptions = connectionOptions_0;
    this.local$input = input_0;
    this.local$out = out_0;
  }
  Coroutine$parseHttpBody.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$parseHttpBody.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$parseHttpBody.prototype.constructor = Coroutine$parseHttpBody;
  Coroutine$parseHttpBody.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        if (this.local$transferEncoding != null) {
          if (equalsLowerCase(this.local$transferEncoding, void 0, void 0, 'chunked')) {
            this.state_0 = 2;
            this.result_0 = decodeChunked_0(this.local$input, this.local$out, this);
            if (this.result_0 === COROUTINE_SUSPENDED) 
              return COROUTINE_SUSPENDED;
            continue;
          } else {
            if (!equalsLowerCase(this.local$transferEncoding, void 0, void 0, 'identity')) 
              this.local$out.close_dbl4no$(IllegalStateException_init('Unsupported transfer-encoding ' + toString(this.local$transferEncoding)));
            this.state_0 = 3;
            continue;
          }
        } else {
          this.state_0 = 4;
          continue;
        }
      case 1:
        throw this.exception_0;
      case 2:
        return this.result_0;
      case 3:
        this.state_0 = 4;
        continue;
      case 4:
        if (!equals(this.local$contentLength, L_1)) {
          this.state_0 = 5;
          this.result_0 = copyTo(this.local$input, this.local$out, this.local$contentLength, this);
          if (this.result_0 === COROUTINE_SUSPENDED) 
            return COROUTINE_SUSPENDED;
          continue;
        } else {
          this.state_0 = 6;
          continue;
        }
      case 5:
        return;
      case 6:
        if ((this.local$connectionOptions != null ? this.local$connectionOptions.close : null) === true) {
          this.state_0 = 7;
          this.result_0 = copyTo(this.local$input, this.local$out, Long$Companion$MAX_VALUE, this);
          if (this.result_0 === COROUTINE_SUSPENDED) 
            return COROUTINE_SUSPENDED;
          continue;
        } else {
          this.state_0 = 8;
          continue;
        }
      case 7:
        return;
      case 8:
        var cause = IllegalStateException_init(trimIndent('\n            Failed to parse request body: request body length should be specified,\n            chunked transfer encoding should be used or\n            keep-alive should be disabled (connection: close)\n        '));
        this.local$out.close_dbl4no$(cause);
        return;
      default:
        this.state_0 = 1;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function parseHttpBody(contentLength_0, transferEncoding_0, connectionOptions_0, input_0, out_0, continuation_0, suspended) {
    var instance = new Coroutine$parseHttpBody(contentLength_0, transferEncoding_0, connectionOptions_0, input_0, out_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function parseHttpBody_0(headers, input, out, continuation) {
    var tmp$, tmp$_0;
    return parseHttpBody((tmp$_0 = (tmp$ = headers.get_61zpoe$('Content-Length')) != null ? parseDecLong(tmp$) : null) != null ? tmp$_0 : L_1, headers.get_61zpoe$('Transfer-Encoding'), ConnectionOptions$Companion_getInstance().parse_gw00v9$(headers.get_61zpoe$('Connection')), input, out, continuation);
  }
  var EXPECTED_HEADERS_QTY;
  var HEADER_SIZE;
  var HEADER_ARRAY_POOL_SIZE;
  var EMPTY_INT_ARRAY;
  function HttpHeadersMap(builder) {
    this.builder_0 = builder;
    this.size_gizlxi$_0 = 0;
    this.indexes_0 = IntArrayPool.borrow();
  }
  Object.defineProperty(HttpHeadersMap.prototype, 'size', {
  get: function() {
  return this.size_gizlxi$_0;
}, 
  set: function(size) {
  this.size_gizlxi$_0 = size;
}});
  HttpHeadersMap.prototype.put_mbbjvw$ = function(nameHash, valueHash, nameStartIndex, nameEndIndex, valueStartIndex, valueEndIndex) {
  var base = this.size * 8 | 0;
  var array = this.indexes_0;
  if (base >= this.indexes_0.length) {
    throw new NotImplementedError_init('An operation is not implemented: ' + 'Implement headers overflow');
  }
  array[base + 0 | 0] = nameHash;
  array[base + 1 | 0] = valueHash;
  array[base + 2 | 0] = nameStartIndex;
  array[base + 3 | 0] = nameEndIndex;
  array[base + 4 | 0] = valueStartIndex;
  array[base + 5 | 0] = valueEndIndex;
  array[base + 6 | 0] = -1;
  array[base + 7 | 0] = -1;
  this.size = this.size + 1 | 0;
};
  HttpHeadersMap.prototype.find_bm4lxs$ = function(name, fromIndex) {
  if (fromIndex === void 0) 
    fromIndex = 0;
  var tmp$;
  var nameHash = hashCodeLowerCase(name);
  tmp$ = this.size;
  for (var i = fromIndex; i < tmp$; i++) {
    var offset = i * 8 | 0;
    if (this.indexes_0[offset] === nameHash) {
      return i;
    }
  }
  return -1;
};
  HttpHeadersMap.prototype.get_61zpoe$ = function(name) {
  var tmp$;
  var nameHash = hashCodeLowerCase(name);
  tmp$ = this.size;
  for (var i = 0; i < tmp$; i++) {
    var offset = i * 8 | 0;
    if (this.indexes_0[offset] === nameHash) {
      return this.builder_0.subSequence_vux9f0$(this.indexes_0[offset + 4 | 0], this.indexes_0[offset + 5 | 0]);
    }
  }
  return null;
};
  function HttpHeadersMap$getAll$lambda(this$HttpHeadersMap) {
    return function(it) {
  return (it + 1 | 0) >= this$HttpHeadersMap.size ? null : it + 1 | 0;
};
  }
  function HttpHeadersMap$getAll$lambda_0(it) {
    return it * 8 | 0;
  }
  function HttpHeadersMap$getAll$lambda_1(this$HttpHeadersMap, closure$nameHash) {
    return function(it) {
  return this$HttpHeadersMap.indexes_0[it] === closure$nameHash;
};
  }
  function HttpHeadersMap$getAll$lambda_2(this$HttpHeadersMap) {
    return function(it) {
  return this$HttpHeadersMap.builder_0.subSequence_vux9f0$(this$HttpHeadersMap.indexes_0[it + 4 | 0], this$HttpHeadersMap.indexes_0[it + 5 | 0]);
};
  }
  HttpHeadersMap.prototype.getAll_61zpoe$ = function(name) {
  var nameHash = hashCodeLowerCase(name);
  return map(filter(map(generateSequence(0, HttpHeadersMap$getAll$lambda(this)), HttpHeadersMap$getAll$lambda_0), HttpHeadersMap$getAll$lambda_1(this, nameHash)), HttpHeadersMap$getAll$lambda_2(this));
};
  HttpHeadersMap.prototype.nameAt_za3lpa$ = function(idx) {
  if (!(idx >= 0)) {
    var message = 'Failed requirement.';
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(idx < this.size)) {
    var message_0 = 'Failed requirement.';
    throw IllegalArgumentException_init(message_0.toString());
  }
  var offset = idx * 8 | 0;
  var array = this.indexes_0;
  var nameStart = array[offset + 2 | 0];
  var nameEnd = array[offset + 3 | 0];
  return this.builder_0.subSequence_vux9f0$(nameStart, nameEnd);
};
  HttpHeadersMap.prototype.valueAt_za3lpa$ = function(idx) {
  if (!(idx >= 0)) {
    var message = 'Failed requirement.';
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(idx < this.size)) {
    var message_0 = 'Failed requirement.';
    throw IllegalArgumentException_init(message_0.toString());
  }
  var offset = idx * 8 | 0;
  var array = this.indexes_0;
  var nameStart = array[offset + 4 | 0];
  var nameEnd = array[offset + 5 | 0];
  return this.builder_0.subSequence_vux9f0$(nameStart, nameEnd);
};
  HttpHeadersMap.prototype.release = function() {
  this.size = 0;
  var indexes = this.indexes_0;
  this.indexes_0 = EMPTY_INT_ARRAY;
  if (indexes !== EMPTY_INT_ARRAY) 
    IntArrayPool.recycle_trkh7z$(indexes);
};
  HttpHeadersMap.prototype.toString = function() {
  var $receiver = StringBuilder_init_0();
  dumpTo(this, '', $receiver);
  return $receiver.toString();
};
  HttpHeadersMap.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'HttpHeadersMap', 
  interfaces: []};
  function dumpTo($receiver, indent, out) {
    var tmp$;
    tmp$ = $receiver.size;
    for (var i = 0; i < tmp$; i++) {
      out.append_gw00v9$(indent);
      out.append_gw00v9$($receiver.nameAt_za3lpa$(i));
      out.append_gw00v9$(' => ');
      out.append_gw00v9$($receiver.valueAt_za3lpa$(i));
      out.append_gw00v9$('\n');
    }
  }
  function IntArrayPool$ObjectLiteral(capacity) {
    DefaultPool.call(this, capacity);
  }
  IntArrayPool$ObjectLiteral.prototype.produceInstance = function() {
  return new Int32Array(256);
};
  IntArrayPool$ObjectLiteral.$metadata$ = {
  kind: Kind_CLASS, 
  interfaces: [DefaultPool]};
  var IntArrayPool;
  function ParserException(message) {
    Exception_init(message, this);
    this.name = 'ParserException';
  }
  ParserException.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'ParserException', 
  interfaces: [Exception]};
  var HTTP_LINE_LIMIT;
  function Coroutine$parseRequest(input_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 9;
    this.local$tmp$ = void 0;
    this.local$builder = void 0;
    this.local$range = void 0;
    this.local$method = void 0;
    this.local$uri = void 0;
    this.local$version = void 0;
    this.local$input = input_0;
  }
  Coroutine$parseRequest.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$parseRequest.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$parseRequest.prototype.constructor = Coroutine$parseRequest;
  Coroutine$parseRequest.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.local$builder = new CharArrayBuilder();
        this.local$range = new MutableRange(0, 0);
        this.exceptionState_0 = 7;
        this.state_0 = 1;
        continue;
      case 1:
        this.state_0 = 2;
        this.result_0 = this.local$input.readUTF8LineTo_yhx0yw$(this.local$builder, 8192, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 2:
        if (!this.result_0) {
          return null;
        } else {
          this.state_0 = 3;
          continue;
        }
      case 3:
        this.local$range.end = this.local$builder.length;
        if (this.local$range.start === this.local$range.end) {
          this.state_0 = 1;
          continue;
        } else {
          this.state_0 = 4;
          continue;
        }
      case 4:
        this.local$method = parseHttpMethod(this.local$builder, this.local$range);
        this.local$uri = parseUri(this.local$builder, this.local$range);
        this.local$version = parseVersion(this.local$builder, this.local$range);
        skipSpaces(this.local$builder, this.local$range);
        if (this.local$range.start !== this.local$range.end) {
          var startIndex = this.local$range.start;
          var endIndex = this.local$range.end;
          throw new ParserException('Extra characters in request line: ' + Kotlin.subSequence(this.local$builder, startIndex, endIndex).toString());
        }
        if (this.local$uri.length === 0) 
          throw new ParserException('URI is not specified');
        if (this.local$version.length === 0) 
          throw new ParserException('HTTP version is not specified');
        this.state_0 = 5;
        this.result_0 = parseHeaders_0(this.local$input, this.local$builder, this.local$range, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 5:
        this.local$tmp$ = this.result_0;
        if (this.local$tmp$ == null) {
          return null;
        } else {
          this.state_0 = 6;
          continue;
        }
      case 6:
        var headers = this.local$tmp$;
        return new Request(this.local$method, this.local$uri, this.local$version, headers, this.local$builder);
      case 7:
        this.exceptionState_0 = 9;
        var t = this.exception_0;
        if (Kotlin.isType(t, Throwable)) {
          this.local$builder.release();
          throw t;
        } else 
          throw t;
      case 8:
        return;
      case 9:
        throw this.exception_0;
      default:
        this.state_0 = 9;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 9) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function parseRequest(input_0, continuation_0, suspended) {
    var instance = new Coroutine$parseRequest(input_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function Coroutine$parseResponse(input_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 6;
    this.local$builder = void 0;
    this.local$range = void 0;
    this.local$version = void 0;
    this.local$statusCode = void 0;
    this.local$statusText = void 0;
    this.local$input = input_0;
  }
  Coroutine$parseResponse.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$parseResponse.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$parseResponse.prototype.constructor = Coroutine$parseResponse;
  Coroutine$parseResponse.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        var tmp$;
        this.local$builder = new CharArrayBuilder();
        this.local$range = new MutableRange(0, 0);
        this.exceptionState_0 = 4;
        this.state_0 = 1;
        this.result_0 = this.local$input.readUTF8LineTo_yhx0yw$(this.local$builder, 8192, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        if (!this.result_0) {
          return null;
        } else {
          this.state_0 = 2;
          continue;
        }
      case 2:
        this.local$range.end = this.local$builder.length;
        this.local$version = parseVersion(this.local$builder, this.local$range);
        this.local$statusCode = parseStatusCode(this.local$builder, this.local$range);
        skipSpaces(this.local$builder, this.local$range);
        this.local$statusText = this.local$builder.subSequence_vux9f0$(this.local$range.start, this.local$range.end);
        this.local$range.start = this.local$range.end;
        this.state_0 = 3;
        this.result_0 = parseHeaders_0(this.local$input, this.local$builder, this.local$range, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 3:
        var headers = (tmp$ = this.result_0) != null ? tmp$ : new HttpHeadersMap(this.local$builder);
        return new Response(this.local$version, this.local$statusCode, this.local$statusText, headers, this.local$builder);
      case 4:
        this.exceptionState_0 = 6;
        var t = this.exception_0;
        if (Kotlin.isType(t, Throwable)) {
          this.local$builder.release();
          throw t;
        } else 
          throw t;
      case 5:
        return;
      case 6:
        throw this.exception_0;
      default:
        this.state_0 = 6;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 6) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function parseResponse(input_0, continuation_0, suspended) {
    var instance = new Coroutine$parseResponse(input_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function Coroutine$parseHeaders(input_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 1;
    this.local$builder = void 0;
    this.local$input = input_0;
  }
  Coroutine$parseHeaders.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$parseHeaders.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$parseHeaders.prototype.constructor = Coroutine$parseHeaders;
  Coroutine$parseHeaders.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        var tmp$;
        this.local$builder = new CharArrayBuilder();
        this.state_0 = 2;
        this.result_0 = parseHeaders_0(this.local$input, this.local$builder, void 0, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        throw this.exception_0;
      case 2:
        return (tmp$ = this.result_0) != null ? tmp$ : new HttpHeadersMap(this.local$builder);
      default:
        this.state_0 = 1;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function parseHeaders(input_0, continuation_0, suspended) {
    var instance = new Coroutine$parseHeaders(input_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function Coroutine$parseHeaders_0(input_0, builder_0, range_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 8;
    this.local$headers = void 0;
    this.local$input = input_0;
    this.local$builder = builder_0;
    this.local$range = range_0;
  }
  Coroutine$parseHeaders_0.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$parseHeaders_0.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$parseHeaders_0.prototype.constructor = Coroutine$parseHeaders_0;
  Coroutine$parseHeaders_0.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        if (this.local$range === void 0) 
          this.local$range = new MutableRange(0, 0);
        this.local$headers = new HttpHeadersMap(this.local$builder);
        this.exceptionState_0 = 6;
        this.state_0 = 1;
        continue;
      case 1:
        this.state_0 = 2;
        this.result_0 = this.local$input.readUTF8LineTo_yhx0yw$(this.local$builder, 8192, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 2:
        if (!this.result_0) {
          this.local$headers.release();
          return null;
        } else {
          this.state_0 = 3;
          continue;
        }
      case 3:
        this.local$range.end = this.local$builder.length;
        skipSpaces(this.local$builder, this.local$range);
        this.local$range.end = this.local$builder.length;
        if (this.local$range.start === this.local$range.end) {
          this.state_0 = 5;
          continue;
        } else {
          this.state_0 = 4;
          continue;
        }
      case 4:
        var nameStart = this.local$range.start;
        var nameEnd = findLetterBeforeColon(this.local$builder, this.local$range) + 1 | 0;
        if (nameEnd <= 0) {
          var endIndex = this.local$builder.length;
          var header = Kotlin.subSequence(this.local$builder, nameStart, endIndex).toString();
          throw new ParserException('No colon in HTTP header in ' + header + ' in builder: ' + '\n' + this.local$builder);
        }
        var nameHash = hashCodeLowerCase(this.local$builder, nameStart, nameEnd);
        this.local$range.start = nameEnd;
        skipSpacesAndColon(this.local$builder, this.local$range);
        var valueStart = this.local$range.start;
        var valueEnd = this.local$range.end;
        var valueHash = hashCodeLowerCase(this.local$builder, valueStart, valueEnd);
        this.local$range.start = valueEnd;
        this.local$headers.put_mbbjvw$(nameHash, valueHash, nameStart, nameEnd, valueStart, valueEnd);
        this.state_0 = 1;
        continue;
      case 5:
        return this.local$headers;
      case 6:
        this.exceptionState_0 = 8;
        var t = this.exception_0;
        if (Kotlin.isType(t, Throwable)) {
          this.local$headers.release();
          throw t;
        } else 
          throw t;
      case 7:
        return;
      case 8:
        throw this.exception_0;
      default:
        this.state_0 = 8;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 8) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function parseHeaders_0(input_0, builder_0, range_0, continuation_0, suspended) {
    var instance = new Coroutine$parseHeaders_0(input_0, builder_0, range_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function parseHttpMethod$lambda(ch, f) {
    return unboxChar(ch) === 32;
  }
  function parseHttpMethod(text, range) {
    skipSpaces(text, range);
    var exact = singleOrNull(DefaultHttpMethods.search_5wmzmj$(text, range.start, range.end, void 0, parseHttpMethod$lambda));
    if (exact != null) {
      range.start = range.start + exact.value.length | 0;
      return exact;
    }
    return parseHttpMethodFull(text, range);
  }
  function parseHttpMethodFull(text, range) {
    return new HttpMethod(nextToken(text, range).toString());
  }
  function parseUri(text, range) {
    skipSpaces(text, range);
    var start = range.start;
    var spaceOrEnd = findSpaceOrEnd(text, range);
    var length = spaceOrEnd - start | 0;
    if (length <= 0) 
      return '';
    if (length === 1 && text.charCodeAt(start) === 47) {
      range.start = spaceOrEnd;
      return '/';
    }
    var s = Kotlin.subSequence(text, start, spaceOrEnd);
    range.start = spaceOrEnd;
    return s;
  }
  var versions;
  function parseVersion$lambda(ch, f) {
    return unboxChar(ch) === 32;
  }
  function parseVersion(text, range) {
    skipSpaces(text, range);
    if (!(range.start < range.end)) {
      var message = 'Failed to parse version: ' + text;
      throw IllegalStateException_init(message.toString());
    }
    var exact = singleOrNull(versions.search_5wmzmj$(text, range.start, range.end, void 0, parseVersion$lambda));
    if (exact != null) {
      range.start = range.start + exact.length | 0;
      return exact;
    }
    return nextToken(text, range);
  }
  function parseStatusCode(text, range) {
    var tmp$, tmp$_0;
    skipSpaces(text, range);
    var status = 0;
    var newStart = range.end;
    tmp$ = range.start;
    tmp$_0 = range.end;
    for (var idx = tmp$; idx < tmp$_0; idx++) {
      var ch = text.charCodeAt(idx);
      if (ch === 32) {
        newStart = idx;
        break;
      } else if ((new CharRange(48, 57)).contains_mef7kx$(ch)) {
        status = (status * 10 | 0) + (ch - 48) | 0;
      } else {
        var startIndex = range.start;
        var endIndex = findSpaceOrEnd(text, range);
        var code = Kotlin.subSequence(text, startIndex, endIndex).toString();
        throw new NumberFormatException('Illegal digit ' + String.fromCharCode(ch) + ' in status code ' + code);
      }
    }
    range.start = newStart;
    return status;
  }
  function HttpMessage(headers, builder) {
    this.headers = headers;
    this.builder_210afz$_0 = builder;
  }
  HttpMessage.prototype.release = function() {
  this.builder_210afz$_0.release();
  this.headers.release();
};
  HttpMessage.prototype.close = function() {
  this.release();
};
  HttpMessage.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'HttpMessage', 
  interfaces: [Closeable]};
  function Request(method, uri, version, headers, builder) {
    HttpMessage.call(this, headers, builder);
    this.method = method;
    this.uri = uri;
    this.version = version;
  }
  Request.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Request', 
  interfaces: [HttpMessage]};
  function Response(version, status, statusText, headers, builder) {
    HttpMessage.call(this, headers, builder);
    this.version = version;
    this.status = status;
    this.statusText = statusText;
  }
  Response.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Response', 
  interfaces: [HttpMessage]};
  function AsciiCharTree(root) {
    AsciiCharTree$Companion_getInstance();
    this.root = root;
  }
  function AsciiCharTree$Node(ch, exact, children) {
    this.ch = toBoxedChar(ch);
    this.exact = exact;
    this.children = children;
    var array = Array_0(256);
    var tmp$;
    tmp$ = array.length - 1 | 0;
    loop_label:
      for (var i = 0; i <= tmp$; i++) {
        var $receiver = this.children;
        var singleOrNull$result;
        singleOrNull$break:
          do {
            var tmp$_0;
            var single = null;
            var found = false;
            tmp$_0 = $receiver.iterator();
            while (tmp$_0.hasNext()) {
              var element = tmp$_0.next();
              if ((unboxChar(element.ch) | 0) === i) {
                if (found) {
                  singleOrNull$result = null;
                  break singleOrNull$break;
                }
                single = element;
                found = true;
              }
            }
            if (!found) {
              singleOrNull$result = null;
              break singleOrNull$break;
            }
            singleOrNull$result = single;
          } while (false);
        array[i] = singleOrNull$result;
      }
    this.array = array;
  }
  AsciiCharTree$Node.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Node', 
  interfaces: []};
  AsciiCharTree.prototype.search_5wmzmj$ = function(sequence, fromIdx, end, lowerCase, stopPredicate) {
  if (fromIdx === void 0) 
    fromIdx = 0;
  if (end === void 0) 
    end = sequence.length;
  if (lowerCase === void 0) 
    lowerCase = false;
  var tmp$, tmp$_0;
  if (sequence.length === 0) 
    throw IllegalArgumentException_init("Couldn't search in char tree for empty string");
  var node = this.root;
  for (var index = fromIdx; index < end; index++) {
    var current = sequence.charCodeAt(index);
    var currentCode = current | 0;
    if (stopPredicate(toBoxedChar(current), currentCode)) 
      break;
    tmp$_0 = (tmp$ = node.array[currentCode]) != null ? tmp$ : lowerCase ? node.array[toChar(String.fromCharCode(current | 0).toLowerCase().charCodeAt(0)) | 0] : null;
    if (tmp$_0 == null) {
      return emptyList();
    }
    var nextNode = tmp$_0;
    node = nextNode;
  }
  return node.exact;
};
  function AsciiCharTree$Companion() {
    AsciiCharTree$Companion_instance = this;
  }
  function AsciiCharTree$Companion$build$lambda(it) {
    return it.length;
  }
  function AsciiCharTree$Companion$build$lambda_0(s, idx) {
    return toBoxedChar(s.charCodeAt(idx));
  }
  AsciiCharTree$Companion.prototype.build_mowv1r$ = function(from) {
  return this.build_za6fmz$(from, AsciiCharTree$Companion$build$lambda, AsciiCharTree$Companion$build$lambda_0);
};
  AsciiCharTree$Companion.prototype.build_za6fmz$ = function(from, length, charAt) {
  var tmp$, tmp$_0;
  var maxBy$result;
  maxBy$break:
    do {
      var iterator = from.iterator();
      if (!iterator.hasNext()) {
        maxBy$result = null;
        break maxBy$break;
      }
      var maxElem = iterator.next();
      if (!iterator.hasNext()) {
        maxBy$result = maxElem;
        break maxBy$break;
      }
      var maxValue = length(maxElem);
      do {
        var e = iterator.next();
        var v = length(e);
        if (Kotlin.compareTo(maxValue, v) < 0) {
          maxElem = e;
          maxValue = v;
        }
      } while (iterator.hasNext());
      maxBy$result = maxElem;
    } while (false);
  tmp$_0 = (tmp$ = maxBy$result) != null ? length(tmp$) : null;
  if (tmp$_0 == null) {
    throw new NoSuchElementException('Unable to build char tree from an empty list');
  }
  var maxLen = tmp$_0;
  var any$result;
  any$break:
    do {
      var tmp$_1;
      if (Kotlin.isType(from, Collection) && from.isEmpty()) {
        any$result = false;
        break any$break;
      }
      tmp$_1 = from.iterator();
      while (tmp$_1.hasNext()) {
        var element = tmp$_1.next();
        if (length(element) === 0) {
          any$result = true;
          break any$break;
        }
      }
      any$result = false;
    } while (false);
  if (any$result) 
    throw IllegalArgumentException_init('There should be no empty entries');
  var root = ArrayList_init_0();
  this.build_0(root, from, maxLen, 0, length, charAt);
  root.trimToSize();
  return new AsciiCharTree(new AsciiCharTree$Node(0, emptyList(), root));
};
  AsciiCharTree$Companion.prototype.build_0 = function(resultList, from, maxLength, idx, length, charAt) {
  var destination = LinkedHashMap_init();
  var tmp$;
  tmp$ = from.iterator();
  while (tmp$.hasNext()) {
    var element = tmp$.next();
    var key = charAt(element, idx);
    var tmp$_0;
    var value = destination.get_11rb$(key);
    if (value == null) {
      var answer = ArrayList_init_0();
      destination.put_xwzc9p$(key, answer);
      tmp$_0 = answer;
    } else {
      tmp$_0 = value;
    }
    var list = tmp$_0;
    list.add_11rb$(element);
  }
  var tmp$_1;
  tmp$_1 = destination.entries.iterator();
  while (tmp$_1.hasNext()) {
    var element_0 = tmp$_1.next();
    var ch = unboxChar(element_0.key);
    var list_0 = element_0.value;
    var nextIdx = idx + 1 | 0;
    var children = ArrayList_init_0();
    var destination_0 = ArrayList_init_0();
    var tmp$_2;
    tmp$_2 = list_0.iterator();
    while (tmp$_2.hasNext()) {
      var element_1 = tmp$_2.next();
      if (length(element_1) > nextIdx) 
        destination_0.add_11rb$(element_1);
    }
    this.build_0(children, destination_0, maxLength, nextIdx, length, charAt);
    children.trimToSize();
    var destination_1 = ArrayList_init_0();
    var tmp$_3;
    tmp$_3 = list_0.iterator();
    while (tmp$_3.hasNext()) {
      var element_2 = tmp$_3.next();
      if (length(element_2) === nextIdx) 
        destination_1.add_11rb$(element_2);
    }
    resultList.add_11rb$(new AsciiCharTree$Node(ch, destination_1, children));
  }
};
  AsciiCharTree$Companion.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'Companion', 
  interfaces: []};
  var AsciiCharTree$Companion_instance = null;
  function AsciiCharTree$Companion_getInstance() {
    if (AsciiCharTree$Companion_instance === null) {
      new AsciiCharTree$Companion();
    }
    return AsciiCharTree$Companion_instance;
  }
  AsciiCharTree.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'AsciiCharTree', 
  interfaces: []};
  function CharArrayBuilder(pool) {
    if (pool === void 0) 
      pool = CharArrayPool;
    this.pool = pool;
    this.buffers_0 = null;
    this.current_0 = null;
    this.stringified_0 = null;
    this.released_0 = false;
    this.remaining_0 = 0;
    this.length_fgvvix$_0 = 0;
  }
  Object.defineProperty(CharArrayBuilder.prototype, 'length', {
  get: function() {
  return this.length_fgvvix$_0;
}, 
  set: function(length) {
  this.length_fgvvix$_0 = length;
}});
  CharArrayBuilder.prototype.charCodeAt = function(index) {
  if (!(index >= 0)) {
    var message = 'index is negative: ' + index;
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(index < this.length)) {
    var message_0 = 'index ' + index + ' is not in range [0, ' + this.length + ')';
    throw IllegalArgumentException_init(message_0.toString());
  }
  return this.getImpl_0(index);
};
  CharArrayBuilder.prototype.getImpl_0 = function(index) {
  return this.bufferForIndex_0(index)[index % ensureNotNull(this.current_0).length];
};
  CharArrayBuilder.prototype.subSequence_vux9f0$ = function(startIndex, endIndex) {
  if (!(startIndex <= endIndex)) {
    var message = 'startIndex (' + startIndex + ') should be less or equal to endIndex (' + endIndex + ')';
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(startIndex >= 0)) {
    var message_0 = 'startIndex is negative: ' + startIndex;
    throw IllegalArgumentException_init(message_0.toString());
  }
  if (!(endIndex <= this.length)) {
    var message_1 = 'endIndex (' + endIndex + ') is greater than length (' + this.length + ')';
    throw IllegalArgumentException_init(message_1.toString());
  }
  return new CharArrayBuilder$SubSequenceImpl(this, startIndex, endIndex);
};
  CharArrayBuilder.prototype.toString = function() {
  var tmp$;
  var tmp$_0;
  if ((tmp$ = this.stringified_0) != null) 
    tmp$_0 = tmp$;
  else {
    var $receiver = this.copy_0(0, this.length).toString();
    this.stringified_0 = $receiver;
    tmp$_0 = $receiver;
  }
  return tmp$_0;
};
  CharArrayBuilder.prototype.equals = function(other) {
  if (!Kotlin.isCharSequence(other)) 
    return false;
  if (this.length !== other.length) 
    return false;
  return this.rangeEqualsImpl_0(0, other, 0, this.length);
};
  CharArrayBuilder.prototype.hashCode = function() {
  var tmp$, tmp$_0;
  return (tmp$_0 = (tmp$ = this.stringified_0) != null ? hashCode(tmp$) : null) != null ? tmp$_0 : this.hashCodeImpl_0(0, this.length);
};
  CharArrayBuilder.prototype.append_s8itvh$ = function(c) {
  this.nonFullBuffer_0()[ensureNotNull(this.current_0).length - this.remaining_0 | 0] = c;
  this.stringified_0 = null;
  this.remaining_0 = this.remaining_0 - 1 | 0;
  this.length = this.length + 1 | 0;
  return this;
};
  CharArrayBuilder.prototype.append_ezbsdh$ = function(csq, start, end) {
  if (csq == null) 
    return this;
  var current = start;
  while (current < end) {
    var buffer = this.nonFullBuffer_0();
    var offset = buffer.length - this.remaining_0 | 0;
    var a = end - current | 0;
    var b = this.remaining_0;
    var bytesToCopy = Math_0.min(a, b);
    for (var i = 0; i < bytesToCopy; i++) {
      buffer[offset + i | 0] = csq.charCodeAt(current + i | 0);
    }
    current = current + bytesToCopy | 0;
    this.remaining_0 = this.remaining_0 - bytesToCopy | 0;
  }
  this.stringified_0 = null;
  this.length = this.length + (end - start) | 0;
  return this;
};
  CharArrayBuilder.prototype.append_gw00v9$ = function(csq) {
  if (csq == null) 
    return this;
  return this.append_ezbsdh$(csq, 0, csq.length);
};
  CharArrayBuilder.prototype.release = function() {
  var tmp$, tmp$_0;
  var list = this.buffers_0;
  if (list != null) {
    this.current_0 = null;
    tmp$ = list.size;
    for (var i = 0; i < tmp$; i++) {
      this.pool.recycle_trkh7z$(list.get_za3lpa$(i));
    }
  } else {
    if ((tmp$_0 = this.current_0) != null) {
      this.pool.recycle_trkh7z$(tmp$_0);
    }
    this.current_0 = null;
  }
  this.released_0 = true;
  this.buffers_0 = null;
  this.stringified_0 = null;
  this.length = 0;
  this.remaining_0 = 0;
};
  CharArrayBuilder.prototype.copy_0 = function(startIndex, endIndex) {
  if (startIndex === endIndex) 
    return '';
  var builder = StringBuilder_init(endIndex - startIndex | 0);
  var buffer;
  var base = startIndex - startIndex % 2048 | 0;
  while (base < endIndex) {
    buffer = this.bufferForIndex_0(base);
    var b = startIndex - base | 0;
    var innerStartIndex = Math_0.max(0, b);
    var a = endIndex - base | 0;
    var innerEndIndex = Math_0.min(a, 2048);
    for (var innerIndex = innerStartIndex; innerIndex < innerEndIndex; innerIndex++) {
      builder.append_s8itvh$(buffer[innerIndex]);
    }
    base = base + 2048 | 0;
  }
  return builder;
};
  function CharArrayBuilder$SubSequenceImpl($outer, start, end) {
    this.$outer = $outer;
    this.start = start;
    this.end = end;
    this.stringified_0 = null;
  }
  Object.defineProperty(CharArrayBuilder$SubSequenceImpl.prototype, 'length', {
  get: function() {
  return this.end - this.start | 0;
}});
  CharArrayBuilder$SubSequenceImpl.prototype.charCodeAt = function(index) {
  var withOffset = index + this.start | 0;
  if (!(index >= 0)) {
    var message = 'index is negative: ' + index;
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(withOffset < this.end)) {
    var message_0 = 'index (' + index + ') should be less than length (' + this.length + ')';
    throw IllegalArgumentException_init(message_0.toString());
  }
  return this.$outer.getImpl_0(withOffset);
};
  CharArrayBuilder$SubSequenceImpl.prototype.subSequence_vux9f0$ = function(startIndex, endIndex) {
  if (!(startIndex >= 0)) {
    var message = 'start is negative: ' + startIndex;
    throw IllegalArgumentException_init(message.toString());
  }
  if (!(startIndex <= endIndex)) {
    var message_0 = 'start (' + startIndex + ') should be less or equal to end (' + endIndex + ')';
    throw IllegalArgumentException_init(message_0.toString());
  }
  if (!(endIndex <= (this.end - this.start | 0))) {
    var message_1 = 'end should be less than length (' + this.length + ')';
    throw IllegalArgumentException_init(message_1.toString());
  }
  if (startIndex === endIndex) 
    return '';
  return new CharArrayBuilder$SubSequenceImpl(this.$outer, this.start + startIndex | 0, this.start + endIndex | 0);
};
  CharArrayBuilder$SubSequenceImpl.prototype.toString = function() {
  var tmp$;
  var tmp$_0;
  if ((tmp$ = this.stringified_0) != null) 
    tmp$_0 = tmp$;
  else {
    var $receiver = this.$outer.copy_0(this.start, this.end).toString();
    this.stringified_0 = $receiver;
    tmp$_0 = $receiver;
  }
  return tmp$_0;
};
  CharArrayBuilder$SubSequenceImpl.prototype.equals = function(other) {
  if (!Kotlin.isCharSequence(other)) 
    return false;
  if (other.length !== this.length) 
    return false;
  return this.$outer.rangeEqualsImpl_0(this.start, other, 0, this.length);
};
  CharArrayBuilder$SubSequenceImpl.prototype.hashCode = function() {
  var tmp$, tmp$_0;
  return (tmp$_0 = (tmp$ = this.stringified_0) != null ? hashCode(tmp$) : null) != null ? tmp$_0 : this.$outer.hashCodeImpl_0(this.start, this.end);
};
  CharArrayBuilder$SubSequenceImpl.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'SubSequenceImpl', 
  interfaces: [CharSequence]};
  CharArrayBuilder.prototype.bufferForIndex_0 = function(index) {
  var tmp$;
  var list = this.buffers_0;
  if (list == null) {
    if (index >= 2048) 
      this.throwSingleBuffer_0(index);
    return (tmp$ = this.current_0) != null ? tmp$ : this.throwSingleBuffer_0(index);
  }
  return list.get_za3lpa$(index / ensureNotNull(this.current_0).length | 0);
};
  CharArrayBuilder.prototype.throwSingleBuffer_0 = function(index) {
  if (this.released_0) 
    throw IllegalStateException_init('Buffer is already released');
  throw new IndexOutOfBoundsException(index.toString() + ' is not in range [0; ' + this.currentPosition_0() + ')');
};
  CharArrayBuilder.prototype.nonFullBuffer_0 = function() {
  return this.remaining_0 === 0 ? this.appendNewArray_0() : ensureNotNull(this.current_0);
};
  CharArrayBuilder.prototype.appendNewArray_0 = function() {
  var tmp$;
  var newBuffer = this.pool.borrow();
  var existing = this.current_0;
  this.current_0 = newBuffer;
  this.remaining_0 = newBuffer.length;
  this.released_0 = false;
  if (existing != null) {
    var tmp$_0;
    if ((tmp$ = this.buffers_0) != null) 
      tmp$_0 = tmp$;
    else {
      var $receiver = ArrayList_init_0();
      this.buffers_0 = $receiver;
      $receiver.add_11rb$(existing);
      tmp$_0 = $receiver;
    }
    var list = tmp$_0;
    list.add_11rb$(newBuffer);
  }
  return newBuffer;
};
  CharArrayBuilder.prototype.rangeEqualsImpl_0 = function(start, other, otherStart, length) {
  for (var i = 0; i < length; i++) {
    if (this.getImpl_0(start + i | 0) !== other.charCodeAt(otherStart + i | 0)) 
      return false;
  }
  return true;
};
  CharArrayBuilder.prototype.hashCodeImpl_0 = function(start, end) {
  var hc = 0;
  for (var i = start; i < end; i++) {
    hc = (31 * hc | 0) + (this.getImpl_0(i) | 0) | 0;
  }
  return hc;
};
  CharArrayBuilder.prototype.currentPosition_0 = function() {
  return ensureNotNull(this.current_0).length - this.remaining_0 | 0;
};
  CharArrayBuilder.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'CharArrayBuilder', 
  interfaces: [Appendable, CharSequence]};
  var CHAR_ARRAY_POOL_SIZE;
  var CHAR_BUFFER_ARRAY_LENGTH;
  function CharArrayPool$ObjectLiteral(capacity) {
    DefaultPool.call(this, capacity);
  }
  CharArrayPool$ObjectLiteral.prototype.produceInstance = function() {
  return Kotlin.charArray(2048);
};
  CharArrayPool$ObjectLiteral.$metadata$ = {
  kind: Kind_CLASS, 
  interfaces: [DefaultPool]};
  var CharArrayPool;
  function hashCodeLowerCase($receiver, start, end) {
    if (start === void 0) 
      start = 0;
    if (end === void 0) 
      end = $receiver.length;
    var hashCode = 0;
    for (var pos = start; pos < end; pos++) {
      var $receiver_0 = $receiver.charCodeAt(pos) | 0;
      var v = 65 <= $receiver_0 && $receiver_0 <= 90 ? 97 + ($receiver_0 - 65) | 0 : $receiver_0;
      hashCode = (31 * hashCode | 0) + v | 0;
    }
    return hashCode;
  }
  function equalsLowerCase($receiver, start, end, other) {
    if (start === void 0) 
      start = 0;
    if (end === void 0) 
      end = $receiver.length;
    if ((end - start | 0) !== other.length) 
      return false;
    for (var pos = start; pos < end; pos++) {
      var $receiver_0 = $receiver.charCodeAt(pos) | 0;
      var tmp$ = 65 <= $receiver_0 && $receiver_0 <= 90 ? 97 + ($receiver_0 - 65) | 0 : $receiver_0;
      var $receiver_1 = other.charCodeAt(pos - start | 0) | 0;
      if (tmp$ !== (65 <= $receiver_1 && $receiver_1 <= 90 ? 97 + ($receiver_1 - 65) | 0 : $receiver_1)) 
        return false;
    }
    return true;
  }
  function toLowerCase($receiver) {
    return 65 <= $receiver && $receiver <= 90 ? 97 + ($receiver - 65) | 0 : $receiver;
  }
  function DefaultHttpMethods$lambda(it) {
    return it.value.length;
  }
  function DefaultHttpMethods$lambda_0(m, idx) {
    return toBoxedChar(m.value.charCodeAt(idx));
  }
  var DefaultHttpMethods;
  var HexTable;
  var HexLetterTable;
  function parseHexLong($receiver) {
    var tmp$;
    var result = L0;
    var table = HexTable;
    tmp$ = $receiver.length;
    for (var i = 0; i < tmp$; i++) {
      var v = ($receiver.charCodeAt(i) | 0) & 65535;
      var digit = v < 255 ? table[v] : L_1;
      if (equals(digit, L_1)) 
        hexNumberFormatException($receiver, i);
      result = result.shiftLeft(4).or(digit);
    }
    return result;
  }
  function parseDecLong($receiver) {
    var length = $receiver.length;
    if (length > 19) 
      numberFormatException_0($receiver);
    if (length === 19) 
      return parseDecLongWithCheck($receiver);
    var result = L0;
    for (var i = 0; i < length; i++) {
      var digit = Kotlin.Long.fromInt($receiver.charCodeAt(i) | 0).subtract(L48);
      if (digit.toNumber() < 0 || digit.toNumber() > 9) 
        numberFormatException($receiver, i);
      result = result.shiftLeft(3).add(result.shiftLeft(1)).add(digit);
    }
    return result;
  }
  function parseDecLongWithCheck($receiver) {
    var tmp$;
    var result = L0;
    tmp$ = $receiver.length;
    for (var i = 0; i < tmp$; i++) {
      var digit = Kotlin.Long.fromInt($receiver.charCodeAt(i) | 0).subtract(L48);
      if (digit.toNumber() < 0 || digit.toNumber() > 9) 
        numberFormatException($receiver, i);
      result = result.shiftLeft(3).add(result.shiftLeft(1)).add(digit);
      if (result.toNumber() < 0) 
        numberFormatException_0($receiver);
    }
    return result;
  }
  function writeIntHex($receiver, value) {
    var tmp$, tmp$_0;
    if (!(value > 0)) {
      var message = 'Does only work for positive numbers';
      throw IllegalArgumentException_init(message.toString());
    }
    var current = value;
    var table = HexLetterTable;
    var digits = 0;
    while ((tmp$ = digits , digits = tmp$ + 1 | 0 , tmp$) < 8) {
      var v = current >>> 28;
      current = current << 4;
      if (v !== 0) {
        $receiver.writeByte_s8j3t7$(table[v]);
        break;
      }
    }
    while ((tmp$_0 = digits , digits = tmp$_0 + 1 | 0 , tmp$_0) < 8) {
      var v_0 = current >>> 28;
      current = current << 4;
      $receiver.writeByte_s8j3t7$(table[v_0]);
    }
  }
  function hexNumberFormatException(s, idx) {
    throw new NumberFormatException('Invalid HEX number: ' + s + ', wrong digit: ' + String.fromCharCode(s.charCodeAt(idx)));
  }
  function numberFormatException(cs, idx) {
    throw new NumberFormatException('Invalid number: ' + cs + ', wrong digit: ' + String.fromCharCode(cs.charCodeAt(idx)) + ' at position ' + idx);
  }
  function numberFormatException_0(cs) {
    throw new NumberFormatException('Invalid number ' + cs + ': too large for Long type');
  }
  function MutableRange(start, end) {
    this.start = start;
    this.end = end;
  }
  MutableRange.prototype.toString = function() {
  return 'MutableRange(start=' + this.start + ', end=' + this.end + ')';
};
  MutableRange.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'MutableRange', 
  interfaces: []};
  function nextToken(text, range) {
    var spaceOrEnd = findSpaceOrEnd(text, range);
    var s = Kotlin.subSequence(text, range.start, spaceOrEnd);
    range.start = spaceOrEnd;
    return s;
  }
  function skipSpaces(text, range) {
    var idx = range.start;
    var end = range.end;
    if (idx >= end || text.charCodeAt(idx) !== 32) 
      return;
    idx = idx + 1 | 0;
    while (idx < end && text.charCodeAt(idx) === 32) {
      idx = idx + 1 | 0;
    }
    range.start = idx;
  }
  function skipSpacesAndColon(text, range) {
    var idx = range.start;
    var end = range.end;
    var colons = 0;
    while (idx < end) {
      var ch = text.charCodeAt(idx);
      if (ch === 58) {
        if ((colons = colons + 1 | 0 , colons) > 1) {
          throw new ParserException('Multiple colons in header');
        }
      } else if (ch !== 32) {
        break;
      }
      idx = idx + 1 | 0;
    }
    range.start = idx;
  }
  function findSpaceOrEnd(text, range) {
    var idx = range.start;
    var end = range.end;
    if (idx >= end || text.charCodeAt(idx) === 32) 
      return idx;
    idx = idx + 1 | 0;
    while (idx < end) {
      if (text.charCodeAt(idx) === 32) 
        return idx;
      idx = idx + 1 | 0;
    }
    return idx;
  }
  function findLetterBeforeColon(text, range) {
    var index = range.start;
    var lastCharIndex = index;
    var end = range.end;
    while (index < end) {
      var ch = text.charCodeAt(index);
      if (ch === 58) 
        return lastCharIndex;
      if (ch !== 32) 
        lastCharIndex = index;
      index = index + 1 | 0;
    }
    return -1;
  }
  function CloseReason(code, message) {
    this.code = code;
    this.message = message;
  }
  Object.defineProperty(CloseReason.prototype, 'knownReason', {
  get: function() {
  return CloseReason$Codes$Companion_getInstance().byCode_mq22fl$(this.code);
}});
  CloseReason.prototype.toString = function() {
  var tmp$;
  return 'CloseReason(reason=' + ((tmp$ = this.knownReason) != null ? tmp$ : this.code).toString() + ', message=' + this.message + ')';
};
  function CloseReason$Codes(name, ordinal, code) {
    Enum.call(this);
    this.code = code;
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function CloseReason$Codes_initFields() {
    CloseReason$Codes_initFields = function() {
};
    CloseReason$Codes$NORMAL_instance = new CloseReason$Codes('NORMAL', 0, 1000);
    CloseReason$Codes$GOING_AWAY_instance = new CloseReason$Codes('GOING_AWAY', 1, 1001);
    CloseReason$Codes$PROTOCOL_ERROR_instance = new CloseReason$Codes('PROTOCOL_ERROR', 2, 1002);
    CloseReason$Codes$CANNOT_ACCEPT_instance = new CloseReason$Codes('CANNOT_ACCEPT', 3, 1003);
    CloseReason$Codes$NOT_CONSISTENT_instance = new CloseReason$Codes('NOT_CONSISTENT', 4, 1007);
    CloseReason$Codes$VIOLATED_POLICY_instance = new CloseReason$Codes('VIOLATED_POLICY', 5, 1008);
    CloseReason$Codes$TOO_BIG_instance = new CloseReason$Codes('TOO_BIG', 6, 1009);
    CloseReason$Codes$NO_EXTENSION_instance = new CloseReason$Codes('NO_EXTENSION', 7, 1010);
    CloseReason$Codes$UNEXPECTED_CONDITION_instance = new CloseReason$Codes('UNEXPECTED_CONDITION', 8, 1011);
    CloseReason$Codes$SERVICE_RESTART_instance = new CloseReason$Codes('SERVICE_RESTART', 9, 1012);
    CloseReason$Codes$TRY_AGAIN_LATER_instance = new CloseReason$Codes('TRY_AGAIN_LATER', 10, 1013);
    CloseReason$Codes$Companion_getInstance();
  }
  var CloseReason$Codes$NORMAL_instance;
  function CloseReason$Codes$NORMAL_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$NORMAL_instance;
  }
  var CloseReason$Codes$GOING_AWAY_instance;
  function CloseReason$Codes$GOING_AWAY_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$GOING_AWAY_instance;
  }
  var CloseReason$Codes$PROTOCOL_ERROR_instance;
  function CloseReason$Codes$PROTOCOL_ERROR_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$PROTOCOL_ERROR_instance;
  }
  var CloseReason$Codes$CANNOT_ACCEPT_instance;
  function CloseReason$Codes$CANNOT_ACCEPT_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$CANNOT_ACCEPT_instance;
  }
  var CloseReason$Codes$NOT_CONSISTENT_instance;
  function CloseReason$Codes$NOT_CONSISTENT_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$NOT_CONSISTENT_instance;
  }
  var CloseReason$Codes$VIOLATED_POLICY_instance;
  function CloseReason$Codes$VIOLATED_POLICY_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$VIOLATED_POLICY_instance;
  }
  var CloseReason$Codes$TOO_BIG_instance;
  function CloseReason$Codes$TOO_BIG_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$TOO_BIG_instance;
  }
  var CloseReason$Codes$NO_EXTENSION_instance;
  function CloseReason$Codes$NO_EXTENSION_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$NO_EXTENSION_instance;
  }
  var CloseReason$Codes$UNEXPECTED_CONDITION_instance;
  function CloseReason$Codes$UNEXPECTED_CONDITION_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$UNEXPECTED_CONDITION_instance;
  }
  var CloseReason$Codes$SERVICE_RESTART_instance;
  function CloseReason$Codes$SERVICE_RESTART_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$SERVICE_RESTART_instance;
  }
  var CloseReason$Codes$TRY_AGAIN_LATER_instance;
  function CloseReason$Codes$TRY_AGAIN_LATER_getInstance() {
    CloseReason$Codes_initFields();
    return CloseReason$Codes$TRY_AGAIN_LATER_instance;
  }
  function CloseReason$Codes$Companion() {
    CloseReason$Codes$Companion_instance = this;
    var $receiver = CloseReason$Codes$values();
    var capacity = coerceAtLeast(mapCapacity($receiver.length), 16);
    var destination = LinkedHashMap_init_0(capacity);
    var tmp$;
    for (tmp$ = 0; tmp$ !== $receiver.length; ++tmp$) {
      var element = $receiver[tmp$];
      destination.put_xwzc9p$(element.code, element);
    }
    this.byCodeMap_0 = destination;
  }
  CloseReason$Codes$Companion.prototype.byCode_mq22fl$ = function(code) {
  return this.byCodeMap_0.get_11rb$(code);
};
  CloseReason$Codes$Companion.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'Companion', 
  interfaces: []};
  var CloseReason$Codes$Companion_instance = null;
  function CloseReason$Codes$Companion_getInstance() {
    CloseReason$Codes_initFields();
    if (CloseReason$Codes$Companion_instance === null) {
      new CloseReason$Codes$Companion();
    }
    return CloseReason$Codes$Companion_instance;
  }
  CloseReason$Codes.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Codes', 
  interfaces: [Enum]};
  function CloseReason$Codes$values() {
    return [CloseReason$Codes$NORMAL_getInstance(), CloseReason$Codes$GOING_AWAY_getInstance(), CloseReason$Codes$PROTOCOL_ERROR_getInstance(), CloseReason$Codes$CANNOT_ACCEPT_getInstance(), CloseReason$Codes$NOT_CONSISTENT_getInstance(), CloseReason$Codes$VIOLATED_POLICY_getInstance(), CloseReason$Codes$TOO_BIG_getInstance(), CloseReason$Codes$NO_EXTENSION_getInstance(), CloseReason$Codes$UNEXPECTED_CONDITION_getInstance(), CloseReason$Codes$SERVICE_RESTART_getInstance(), CloseReason$Codes$TRY_AGAIN_LATER_getInstance()];
  }
  CloseReason$Codes.values = CloseReason$Codes$values;
  function CloseReason$Codes$valueOf(name) {
    switch (name) {
      case 'NORMAL':
        return CloseReason$Codes$NORMAL_getInstance();
      case 'GOING_AWAY':
        return CloseReason$Codes$GOING_AWAY_getInstance();
      case 'PROTOCOL_ERROR':
        return CloseReason$Codes$PROTOCOL_ERROR_getInstance();
      case 'CANNOT_ACCEPT':
        return CloseReason$Codes$CANNOT_ACCEPT_getInstance();
      case 'NOT_CONSISTENT':
        return CloseReason$Codes$NOT_CONSISTENT_getInstance();
      case 'VIOLATED_POLICY':
        return CloseReason$Codes$VIOLATED_POLICY_getInstance();
      case 'TOO_BIG':
        return CloseReason$Codes$TOO_BIG_getInstance();
      case 'NO_EXTENSION':
        return CloseReason$Codes$NO_EXTENSION_getInstance();
      case 'UNEXPECTED_CONDITION':
        return CloseReason$Codes$UNEXPECTED_CONDITION_getInstance();
      case 'SERVICE_RESTART':
        return CloseReason$Codes$SERVICE_RESTART_getInstance();
      case 'TRY_AGAIN_LATER':
        return CloseReason$Codes$TRY_AGAIN_LATER_getInstance();
      default:
        throwISE('No enum constant io.ktor.http.cio.websocket.CloseReason.Codes.' + name);
    }
  }
  CloseReason$Codes.valueOf_61zpoe$ = CloseReason$Codes$valueOf;
  CloseReason.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'CloseReason', 
  interfaces: []};
  function CloseReason_init(code, message, $this) {
    $this = $this || Object.create(CloseReason.prototype);
    CloseReason.call($this, code.code, message);
    return $this;
  }
  CloseReason.prototype.component1 = function() {
  return this.code;
};
  CloseReason.prototype.component2 = function() {
  return this.message;
};
  CloseReason.prototype.copy_qid81t$ = function(code, message) {
  return new CloseReason(code === void 0 ? this.code : code, message === void 0 ? this.message : message);
};
  CloseReason.prototype.hashCode = function() {
  var result = 0;
  result = result * 31 + Kotlin.hashCode(this.code) | 0;
  result = result * 31 + Kotlin.hashCode(this.message) | 0;
  return result;
};
  CloseReason.prototype.equals = function(other) {
  return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.code, other.code) && Kotlin.equals(this.message, other.message)))));
};
  function readText($receiver) {
    if (!$receiver.fin) {
      var message = 'Text could be only extracted from non-fragmented frame';
      throw IllegalArgumentException_init(message.toString());
    }
    var tmp$ = charsets.Charsets.UTF_8.newDecoder();
    var buildPacket$result;
    var builder = BytePacketBuilder(0);
    try {
      writeFully_0(builder, $receiver.data);
      buildPacket$result = builder.build();
    }    catch (t) {
  if (Kotlin.isType(t, Throwable)) {
    builder.release();
    throw t;
  } else 
    throw t;
}
    return decode(tmp$, buildPacket$result);
  }
  function readBytes_0($receiver) {
    return $receiver.data.slice();
  }
  function readReason($receiver) {
    if ($receiver.data.length < 2) {
      return null;
    }
    var buildPacket$result;
    var builder = BytePacketBuilder(0);
    try {
      writeFully_0(builder, $receiver.data);
      buildPacket$result = builder.build();
    }    catch (t) {
  if (Kotlin.isType(t, Throwable)) {
    builder.release();
    throw t;
  } else 
    throw t;
}
    var packet = buildPacket$result;
    var code = packet.readShort();
    var message = packet.readText_vux9f0$();
    return new CloseReason(code, message);
  }
  function NonDisposableHandle() {
    NonDisposableHandle_instance = this;
  }
  NonDisposableHandle.prototype.dispose = function() {
};
  NonDisposableHandle.prototype.toString = function() {
  return 'NonDisposableHandle';
};
  NonDisposableHandle.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'NonDisposableHandle', 
  interfaces: [DisposableHandle]};
  var NonDisposableHandle_instance = null;
  function NonDisposableHandle_getInstance() {
    if (NonDisposableHandle_instance === null) {
      new NonDisposableHandle();
    }
    return NonDisposableHandle_instance;
  }
  function FrameType(name, ordinal, controlFrame, opcode) {
    Enum.call(this);
    this.controlFrame = controlFrame;
    this.opcode = opcode;
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function FrameType_initFields() {
    FrameType_initFields = function() {
};
    FrameType$TEXT_instance = new FrameType('TEXT', 0, false, 1);
    FrameType$BINARY_instance = new FrameType('BINARY', 1, false, 2);
    FrameType$CLOSE_instance = new FrameType('CLOSE', 2, true, 8);
    FrameType$PING_instance = new FrameType('PING', 3, true, 9);
    FrameType$PONG_instance = new FrameType('PONG', 4, true, 10);
    FrameType$Companion_getInstance();
  }
  var FrameType$TEXT_instance;
  function FrameType$TEXT_getInstance() {
    FrameType_initFields();
    return FrameType$TEXT_instance;
  }
  var FrameType$BINARY_instance;
  function FrameType$BINARY_getInstance() {
    FrameType_initFields();
    return FrameType$BINARY_instance;
  }
  var FrameType$CLOSE_instance;
  function FrameType$CLOSE_getInstance() {
    FrameType_initFields();
    return FrameType$CLOSE_instance;
  }
  var FrameType$PING_instance;
  function FrameType$PING_getInstance() {
    FrameType_initFields();
    return FrameType$PING_instance;
  }
  var FrameType$PONG_instance;
  function FrameType$PONG_getInstance() {
    FrameType_initFields();
    return FrameType$PONG_instance;
  }
  function FrameType$Companion() {
    FrameType$Companion_instance = this;
    var $receiver = FrameType$values();
    var maxBy$result;
    maxBy$break:
      do {
        if ($receiver.length === 0) {
          maxBy$result = null;
          break maxBy$break;
        }
        var maxElem = $receiver[0];
        var lastIndex = get_lastIndex($receiver);
        if (lastIndex === 0) {
          maxBy$result = maxElem;
          break maxBy$break;
        }
        var maxValue = maxElem.opcode;
        for (var i = 1; i <= lastIndex; i++) {
          var e = $receiver[i];
          var v = e.opcode;
          if (Kotlin.compareTo(maxValue, v) < 0) {
            maxElem = e;
            maxValue = v;
          }
        }
        maxBy$result = maxElem;
      } while (false);
    this.maxOpcode_0 = ensureNotNull(maxBy$result).opcode;
    var array = Array_0(this.maxOpcode_0 + 1 | 0);
    var tmp$;
    tmp$ = array.length - 1 | 0;
    loop_label:
      for (var i_0 = 0; i_0 <= tmp$; i_0++) {
        var $receiver_0 = FrameType$values();
        var singleOrNull$result;
        singleOrNull$break:
          do {
            var tmp$_0;
            var single = null;
            var found = false;
            for (tmp$_0 = 0; tmp$_0 !== $receiver_0.length; ++tmp$_0) {
              var element = $receiver_0[tmp$_0];
              if (element.opcode === i_0) {
                if (found) {
                  singleOrNull$result = null;
                  break singleOrNull$break;
                }
                single = element;
                found = true;
              }
            }
            if (!found) {
              singleOrNull$result = null;
              break singleOrNull$break;
            }
            singleOrNull$result = single;
          } while (false);
        array[i_0] = singleOrNull$result;
      }
    this.byOpcodeArray_0 = array;
  }
  FrameType$Companion.prototype.get_za3lpa$ = function(opcode) {
  var tmp$;
  tmp$ = this.maxOpcode_0;
  return 0 <= opcode && opcode <= tmp$ ? this.byOpcodeArray_0[opcode] : null;
};
  FrameType$Companion.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'Companion', 
  interfaces: []};
  var FrameType$Companion_instance = null;
  function FrameType$Companion_getInstance() {
    FrameType_initFields();
    if (FrameType$Companion_instance === null) {
      new FrameType$Companion();
    }
    return FrameType$Companion_instance;
  }
  FrameType.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'FrameType', 
  interfaces: [Enum]};
  function FrameType$values() {
    return [FrameType$TEXT_getInstance(), FrameType$BINARY_getInstance(), FrameType$CLOSE_getInstance(), FrameType$PING_getInstance(), FrameType$PONG_getInstance()];
  }
  FrameType.values = FrameType$values;
  function FrameType$valueOf(name) {
    switch (name) {
      case 'TEXT':
        return FrameType$TEXT_getInstance();
      case 'BINARY':
        return FrameType$BINARY_getInstance();
      case 'CLOSE':
        return FrameType$CLOSE_getInstance();
      case 'PING':
        return FrameType$PING_getInstance();
      case 'PONG':
        return FrameType$PONG_getInstance();
      default:
        throwISE('No enum constant io.ktor.http.cio.websocket.FrameType.' + name);
    }
  }
  FrameType.valueOf_61zpoe$ = FrameType$valueOf;
  var xor = defineInlineFunction('ktor-ktor-http-cio.io.ktor.http.cio.websocket.xor_34yeqm$', wrapFunction(function() {
  var toByte = Kotlin.toByte;
  return function($receiver, other) {
  return toByte($receiver ^ other);
};
}));
  var flagAt = defineInlineFunction('ktor-ktor-http-cio.io.ktor.http.cio.websocket.flagAt_wndlt3$', function($receiver, at) {
  return $receiver ? 1 << at : 0;
});
  function WebSocketInternalAPI() {
  }
  WebSocketInternalAPI.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'WebSocketInternalAPI', 
  interfaces: [Annotation]};
  function send($receiver, content, continuation) {
    return $receiver.send_x9o3m3$(Frame$Frame$Text_init(content), continuation);
  }
  function send_0($receiver, content, continuation) {
    return $receiver.send_x9o3m3$(new Frame$Binary(true, content), continuation);
  }
  function Coroutine$close($receiver_0, reason_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 5;
    this.local$$receiver = $receiver_0;
    this.local$reason = reason_0;
  }
  Coroutine$close.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$close.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$close.prototype.constructor = Coroutine$close;
  Coroutine$close.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.state_0 = 1;
        this.result_0 = this.local$$receiver.send_x9o3m3$(Frame$Frame$Close_init(this.local$reason), this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        this.exceptionState_0 = 3;
        this.state_0 = 2;
        this.result_0 = this.local$$receiver.flush(this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 2:
        this.exceptionState_0 = 5;
        this.state_0 = 4;
        continue;
      case 3:
        this.exceptionState_0 = 5;
        var ignore = this.exception_0;
        if (!Kotlin.isType(ignore, ClosedSendChannelException)) 
          throw ignore;
        this.state_0 = 4;
        continue;
      case 4:
        return;
      case 5:
        throw this.exception_0;
      default:
        this.state_0 = 5;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 5) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  function close_0($receiver_0, reason_0, continuation_0, suspended) {
    var instance = new Coroutine$close($receiver_0, reason_0, continuation_0);
    if (suspended) 
      return instance;
    else 
      return instance.doResume(null);
  }
  function DefaultWebSocketSession() {
  }
  DefaultWebSocketSession.$metadata$ = {
  kind: Kind_INTERFACE, 
  simpleName: 'DefaultWebSocketSession', 
  interfaces: [WebSocketSession]};
  function DefaultWebSocketSession_0(session, pingInterval, timeoutMillis) {
    throw IllegalStateException_init('There is no CIO js websocket implementation. Consider using platform default.'.toString());
  }
  function Frame(fin, frameType, data, disposableHandle) {
    Frame$Companion_getInstance();
    if (disposableHandle === void 0) 
      disposableHandle = NonDisposableHandle_getInstance();
    this.fin = fin;
    this.frameType = frameType;
    this.data = data;
    this.disposableHandle = disposableHandle;
  }
  function Frame$Binary(fin, data) {
    Frame.call(this, fin, FrameType$BINARY_getInstance(), data);
  }
  Frame$Binary.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Binary', 
  interfaces: [Frame]};
  function Frame$Frame$Binary_init(fin, packet, $this) {
    $this = $this || Object.create(Frame$Binary.prototype);
    Frame$Binary.call($this, fin, readBytes(packet));
    return $this;
  }
  function Frame$Text(fin, data) {
    Frame.call(this, fin, FrameType$TEXT_getInstance(), data);
  }
  Frame$Text.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Text', 
  interfaces: [Frame]};
  function Frame$Frame$Text_init(text, $this) {
    $this = $this || Object.create(Frame$Text.prototype);
    Frame$Text.call($this, true, encodeToByteArray(charsets.Charsets.UTF_8.newEncoder(), text, 0, text.length));
    return $this;
  }
  function Frame$Frame$Text_init_0(fin, packet, $this) {
    $this = $this || Object.create(Frame$Text.prototype);
    Frame$Text.call($this, fin, readBytes(packet));
    return $this;
  }
  function Frame$Close(data) {
    Frame.call(this, true, FrameType$CLOSE_getInstance(), data);
  }
  Frame$Close.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Close', 
  interfaces: [Frame]};
  function Frame$Frame$Close_init(reason, $this) {
    $this = $this || Object.create(Frame$Close.prototype);
    var buildPacket$result;
    var builder = BytePacketBuilder(0);
    try {
      builder.writeShort_mq22fl$(reason.code);
      builder.writeStringUtf8_61zpoe$(reason.message);
      buildPacket$result = builder.build();
    }    catch (t) {
  if (Kotlin.isType(t, Throwable)) {
    builder.release();
    throw t;
  } else 
    throw t;
}
    Frame$Frame$Close_init_0(buildPacket$result, $this);
    return $this;
  }
  function Frame$Frame$Close_init_0(packet, $this) {
    $this = $this || Object.create(Frame$Close.prototype);
    Frame$Close.call($this, readBytes(packet));
    return $this;
  }
  function Frame$Frame$Close_init_1($this) {
    $this = $this || Object.create(Frame$Close.prototype);
    Frame$Close.call($this, Frame$Companion_getInstance().Empty_0);
    return $this;
  }
  function Frame$Ping(data) {
    Frame.call(this, true, FrameType$PING_getInstance(), data);
  }
  Frame$Ping.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Ping', 
  interfaces: [Frame]};
  function Frame$Frame$Ping_init(packet, $this) {
    $this = $this || Object.create(Frame$Ping.prototype);
    Frame$Ping.call($this, readBytes(packet));
    return $this;
  }
  function Frame$Pong(data, disposableHandle) {
    if (disposableHandle === void 0) 
      disposableHandle = NonDisposableHandle_getInstance();
    Frame.call(this, true, FrameType$PONG_getInstance(), data, disposableHandle);
  }
  Frame$Pong.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Pong', 
  interfaces: [Frame]};
  function Frame$Frame$Pong_init(packet, $this) {
    $this = $this || Object.create(Frame$Pong.prototype);
    Frame$Pong.call($this, readBytes(packet));
    return $this;
  }
  Frame.prototype.toString = function() {
  return 'Frame ' + this.frameType + ' (fin=' + this.fin + ', buffer len = ' + this.data.length + ')';
};
  Frame.prototype.copy = function() {
  return Frame$Companion_getInstance().byType_8ejoj4$(this.fin, this.frameType, this.data.slice());
};
  function Frame$Companion() {
    Frame$Companion_instance = this;
    this.Empty_0 = new Int8Array(0);
  }
  Frame$Companion.prototype.byType_8ejoj4$ = function(fin, frameType, data) {
  switch (frameType.name) {
    case 'BINARY':
      return new Frame$Binary(fin, data);
    case 'TEXT':
      return new Frame$Text(fin, data);
    case 'CLOSE':
      return new Frame$Close(data);
    case 'PING':
      return new Frame$Ping(data);
    case 'PONG':
      return new Frame$Pong(data);
    default:
      return Kotlin.noWhenBranchMatched();
  }
};
  Frame$Companion.$metadata$ = {
  kind: Kind_OBJECT, 
  simpleName: 'Companion', 
  interfaces: []};
  var Frame$Companion_instance = null;
  function Frame$Companion_getInstance() {
    if (Frame$Companion_instance === null) {
      new Frame$Companion();
    }
    return Frame$Companion_instance;
  }
  Frame.$metadata$ = {
  kind: Kind_CLASS, 
  simpleName: 'Frame', 
  interfaces: []};
  function WebSocketSession() {
  }
  function Coroutine$send_x9o3m3$($this, frame_0, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.exceptionState_0 = 1;
    this.$this = $this;
    this.local$frame = frame_0;
  }
  Coroutine$send_x9o3m3$.$metadata$ = {
  kind: Kotlin.Kind.CLASS, 
  simpleName: null, 
  interfaces: [CoroutineImpl]};
  Coroutine$send_x9o3m3$.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$send_x9o3m3$.prototype.constructor = Coroutine$send_x9o3m3$;
  Coroutine$send_x9o3m3$.prototype.doResume = function() {
  do try {
    switch (this.state_0) {
      case 0:
        this.state_0 = 2;
        this.result_0 = this.$this.outgoing.send_11rb$(this.local$frame, this);
        if (this.result_0 === COROUTINE_SUSPENDED) 
          return COROUTINE_SUSPENDED;
        continue;
      case 1:
        throw this.exception_0;
      case 2:
        return;
      default:
        this.state_0 = 1;
        throw new Error('State Machine Unreachable execution');
    }
  }  catch (e) {
  if (this.state_0 === 1) {
    this.exceptionState_0 = this.state_0;
    throw e;
  } else {
    this.state_0 = this.exceptionState_0;
    this.exception_0 = e;
  }
} while (true);
};
  WebSocketSession.prototype.send_x9o3m3$ = function(frame_0, continuation_0, suspended) {
  var instance = new Coroutine$send_x9o3m3$(this, frame_0, continuation_0);
  if (suspended) 
    return instance;
  else 
    return instance.doResume(null);
};
  WebSocketSession.prototype.close_dbl4no$ = function(cause, continuation, callback$default) {
  if (cause === void 0) 
    cause = null;
  return callback$default ? callback$default(cause, continuation) : this.close_dbl4no$$default(cause, continuation);
};
  WebSocketSession.$metadata$ = {
  kind: Kind_INTERFACE, 
  simpleName: 'WebSocketSession', 
  interfaces: [CoroutineScope]};
  var package$io = _.io || (_.io = {});
  var package$ktor = package$io.ktor || (package$io.ktor = {});
  var package$http = package$ktor.http || (package$ktor.http = {});
  var package$cio = package$http.cio || (package$http.cio = {});
  package$cio.CIOHeaders = CIOHeaders;
  package$cio.decodeChunked_cfn8te$ = decodeChunked;
  package$cio.decodeChunked_ow4zqt$ = decodeChunked_0;
  package$cio.encodeChunked_xfja4v$ = encodeChunked;
  $$importsForInline$$['ktor-ktor-http-cio'] = _;
  package$cio.encodeChunked_v6dke3$ = encodeChunked_0;
  $$importsForInline$$['kotlinx-io'] = $module$kotlinx_io;
  Object.defineProperty(ConnectionOptions, 'Companion', {
  get: ConnectionOptions$Companion_getInstance});
  package$cio.ConnectionOptions = ConnectionOptions;
  package$cio.expectHttpUpgrade_tafh3q$ = expectHttpUpgrade;
  package$cio.expectHttpUpgrade_4lahj6$ = expectHttpUpgrade_0;
  package$cio.expectHttpBody_1dl5qq$ = expectHttpBody;
  package$cio.expectHttpBody_4lahj6$ = expectHttpBody_0;
  package$cio.parseHttpBody_fe3u7f$ = parseHttpBody;
  package$cio.parseHttpBody_qvsfso$ = parseHttpBody_0;
  package$cio.HttpHeadersMap = HttpHeadersMap;
  package$cio.dumpTo_bybo3u$ = dumpTo;
  package$cio.ParserException = ParserException;
  package$cio.parseRequest_azd6zd$ = parseRequest;
  package$cio.parseResponse_azd6zd$ = parseResponse;
  package$cio.parseHeaders_azd6zd$ = parseHeaders;
  package$cio.parseHeaders_g64c1n$ = parseHeaders_0;
  package$cio.HttpMessage = HttpMessage;
  package$cio.Request = Request;
  package$cio.Response = Response;
  AsciiCharTree.Node = AsciiCharTree$Node;
  Object.defineProperty(AsciiCharTree, 'Companion', {
  get: AsciiCharTree$Companion_getInstance});
  var package$internals = package$cio.internals || (package$cio.internals = {});
  package$internals.AsciiCharTree = AsciiCharTree;
  package$internals.CharArrayBuilder = CharArrayBuilder;
  Object.defineProperty(package$internals, 'CHAR_BUFFER_ARRAY_LENGTH_8be2vx$', {
  get: function() {
  return CHAR_BUFFER_ARRAY_LENGTH;
}});
  Object.defineProperty(package$internals, 'CharArrayPool_8be2vx$', {
  get: function() {
  return CharArrayPool;
}});
  package$internals.hashCodeLowerCase_q3ltqc$ = hashCodeLowerCase;
  package$internals.equalsLowerCase_bscbb0$ = equalsLowerCase;
  Object.defineProperty(package$internals, 'DefaultHttpMethods_8be2vx$', {
  get: function() {
  return DefaultHttpMethods;
}});
  Object.defineProperty(package$internals, 'HexLetterTable_8be2vx$', {
  get: function() {
  return HexLetterTable;
}});
  package$internals.parseHexLong_hoxr6g$ = parseHexLong;
  package$internals.parseDecLong_hoxr6g$ = parseDecLong;
  package$internals.writeIntHex_wmafjk$ = writeIntHex;
  package$internals.MutableRange = MutableRange;
  package$internals.nextToken_z43h51$ = nextToken;
  package$internals.skipSpaces_z43h51$ = skipSpaces;
  package$internals.skipSpacesAndColon_z43h51$ = skipSpacesAndColon;
  package$internals.findSpaceOrEnd_z43h51$ = findSpaceOrEnd;
  package$internals.findLetterBeforeColon_z43h51$ = findLetterBeforeColon;
  Object.defineProperty(CloseReason$Codes, 'NORMAL', {
  get: CloseReason$Codes$NORMAL_getInstance});
  Object.defineProperty(CloseReason$Codes, 'GOING_AWAY', {
  get: CloseReason$Codes$GOING_AWAY_getInstance});
  Object.defineProperty(CloseReason$Codes, 'PROTOCOL_ERROR', {
  get: CloseReason$Codes$PROTOCOL_ERROR_getInstance});
  Object.defineProperty(CloseReason$Codes, 'CANNOT_ACCEPT', {
  get: CloseReason$Codes$CANNOT_ACCEPT_getInstance});
  Object.defineProperty(CloseReason$Codes, 'NOT_CONSISTENT', {
  get: CloseReason$Codes$NOT_CONSISTENT_getInstance});
  Object.defineProperty(CloseReason$Codes, 'VIOLATED_POLICY', {
  get: CloseReason$Codes$VIOLATED_POLICY_getInstance});
  Object.defineProperty(CloseReason$Codes, 'TOO_BIG', {
  get: CloseReason$Codes$TOO_BIG_getInstance});
  Object.defineProperty(CloseReason$Codes, 'NO_EXTENSION', {
  get: CloseReason$Codes$NO_EXTENSION_getInstance});
  Object.defineProperty(CloseReason$Codes, 'UNEXPECTED_CONDITION', {
  get: CloseReason$Codes$UNEXPECTED_CONDITION_getInstance});
  Object.defineProperty(CloseReason$Codes, 'SERVICE_RESTART', {
  get: CloseReason$Codes$SERVICE_RESTART_getInstance});
  Object.defineProperty(CloseReason$Codes, 'TRY_AGAIN_LATER', {
  get: CloseReason$Codes$TRY_AGAIN_LATER_getInstance});
  Object.defineProperty(CloseReason$Codes, 'Companion', {
  get: CloseReason$Codes$Companion_getInstance});
  CloseReason.Codes = CloseReason$Codes;
  var package$websocket = package$cio.websocket || (package$cio.websocket = {});
  package$websocket.CloseReason_init_ia8ci6$ = CloseReason_init;
  package$websocket.CloseReason = CloseReason;
  package$websocket.readText_2pdr7t$ = readText;
  package$websocket.readBytes_y4xpne$ = readBytes_0;
  package$websocket.readReason_4vnmwg$ = readReason;
  Object.defineProperty(package$websocket, 'NonDisposableHandle', {
  get: NonDisposableHandle_getInstance});
  Object.defineProperty(FrameType, 'TEXT', {
  get: FrameType$TEXT_getInstance});
  Object.defineProperty(FrameType, 'BINARY', {
  get: FrameType$BINARY_getInstance});
  Object.defineProperty(FrameType, 'CLOSE', {
  get: FrameType$CLOSE_getInstance});
  Object.defineProperty(FrameType, 'PING', {
  get: FrameType$PING_getInstance});
  Object.defineProperty(FrameType, 'PONG', {
  get: FrameType$PONG_getInstance});
  Object.defineProperty(FrameType, 'Companion', {
  get: FrameType$Companion_getInstance});
  package$websocket.FrameType = FrameType;
  package$websocket.xor_34yeqm$ = xor;
  package$websocket.flagAt_wndlt3$ = flagAt;
  package$websocket.WebSocketInternalAPI = WebSocketInternalAPI;
  package$websocket.send_tgf21i$ = send;
  package$websocket.send_limcqc$ = send_0;
  package$websocket.close_icv0wc$ = close_0;
  package$websocket.DefaultWebSocketSession = DefaultWebSocketSession;
  package$websocket.DefaultWebSocketSession_23cfxb$ = DefaultWebSocketSession_0;
  Frame.Binary_init_df2563$ = Frame$Frame$Binary_init;
  Frame.Binary = Frame$Binary;
  Frame.Text_init_61zpoe$ = Frame$Frame$Text_init;
  Frame.Text_init_df2563$ = Frame$Frame$Text_init_0;
  Frame.Text = Frame$Text;
  Frame.Close_init_p695es$ = Frame$Frame$Close_init;
  Frame.Close_init_8awntw$ = Frame$Frame$Close_init_0;
  Frame.Close_init = Frame$Frame$Close_init_1;
  Frame.Close = Frame$Close;
  Frame.Ping_init_8awntw$ = Frame$Frame$Ping_init;
  Frame.Ping = Frame$Ping;
  Frame.Pong_init_8awntw$ = Frame$Frame$Pong_init;
  Frame.Pong = Frame$Pong;
  Object.defineProperty(Frame, 'Companion', {
  get: Frame$Companion_getInstance});
  package$websocket.Frame = Frame;
  package$websocket.WebSocketSession = WebSocketSession;
  CIOHeaders.prototype.contains_61zpoe$ = Headers.prototype.contains_61zpoe$;
  CIOHeaders.prototype.contains_puj7f4$ = Headers.prototype.contains_puj7f4$;
  CIOHeaders.prototype.forEach_ubvtmq$ = Headers.prototype.forEach_ubvtmq$;
  DefaultWebSocketSession.prototype.send_x9o3m3$ = WebSocketSession.prototype.send_x9o3m3$;
  DefaultWebSocketSession.prototype.close_dbl4no$ = WebSocketSession.prototype.close_dbl4no$;
  MAX_CHUNK_SIZE_LENGTH = 128;
  CHUNK_BUFFER_POOL_SIZE = 2048;
  DEFAULT_BYTE_BUFFER_SIZE = 4088;
  ChunkSizeBufferPool = new ChunkSizeBufferPool$ObjectLiteral(2048);
  CrLfShort = 3338;
  CrLf = encodeToByteArray(charsets.Charsets.UTF_8.newEncoder(), '\r\n', 0, '\r\n'.length);
  var $receiver = '0\r\n\r\n';
  LastChunkBytes = encodeToByteArray(charsets.Charsets.UTF_8.newEncoder(), $receiver, 0, $receiver.length);
  EXPECTED_HEADERS_QTY = 32;
  HEADER_SIZE = 8;
  HEADER_ARRAY_POOL_SIZE = 1000;
  EMPTY_INT_ARRAY = new Int32Array(0);
  IntArrayPool = new IntArrayPool$ObjectLiteral(1000);
  HTTP_LINE_LIMIT = 8192;
  versions = AsciiCharTree$Companion_getInstance().build_mowv1r$(listOf_0(['HTTP/1.0', 'HTTP/1.1']));
  CHAR_ARRAY_POOL_SIZE = 4096;
  CHAR_BUFFER_ARRAY_LENGTH = 2048;
  CharArrayPool = new CharArrayPool$ObjectLiteral(4096);
  DefaultHttpMethods = AsciiCharTree$Companion_getInstance().build_za6fmz$(HttpMethod.Companion.DefaultMethods, DefaultHttpMethods$lambda, DefaultHttpMethods$lambda_0);
  var $receiver_0 = new IntRange(0, 255);
  var destination = ArrayList_init(collectionSizeOrDefault($receiver_0, 10));
  var tmp$;
  tmp$ = $receiver_0.iterator();
  while (tmp$.hasNext()) {
    var item = tmp$.next();
    var tmp$_0 = destination.add_11rb$;
    var transform$result;
    if (48 <= item && item <= 57) {
      transform$result = Kotlin.Long.fromInt(item).subtract(L48);
    } else if (item >= L97.toNumber() && item <= L102.toNumber()) {
      transform$result = Kotlin.Long.fromInt(item).subtract(L97).add(Kotlin.Long.fromInt(10));
    } else if (item >= L65.toNumber() && item <= L70.toNumber()) {
      transform$result = Kotlin.Long.fromInt(item).subtract(L65).add(Kotlin.Long.fromInt(10));
    } else {
      transform$result = L_1;
    }
    tmp$_0.call(destination, transform$result);
  }
  HexTable = copyToArray(destination);
  var $receiver_1 = new IntRange(0, 15);
  var destination_0 = ArrayList_init(collectionSizeOrDefault($receiver_1, 10));
  var tmp$_1;
  tmp$_1 = $receiver_1.iterator();
  while (tmp$_1.hasNext()) {
    var item_0 = tmp$_1.next();
    destination_0.add_11rb$(item_0 < 10 ? toByte(48 + item_0 | 0) : toByte(toChar(toChar(97 + item_0) - 10) | 0));
  }
  HexLetterTable = copyToArray(destination_0);
  Kotlin.defineModule('ktor-ktor-http-cio', _);
  return _;
}));
