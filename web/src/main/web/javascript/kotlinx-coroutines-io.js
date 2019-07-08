(function (root, factory) {
    if (typeof define === 'function' && define.amd)
        define(['exports', 'kotlin', 'kotlinx-io', 'kotlinx-coroutines-core'], factory);
    else if (typeof exports === 'object')
        factory(module.exports, require('kotlin'), require('kotlinx-io'), require('kotlinx-coroutines-core'));
    else {
        if (typeof kotlin === 'undefined') {
            throw new Error("Error loading module 'kotlinx-coroutines-io'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'kotlinx-coroutines-io'.");
        }
        if (typeof this['kotlinx-io'] === 'undefined') {
            throw new Error("Error loading module 'kotlinx-coroutines-io'. Its dependency 'kotlinx-io' was not found. Please, check whether 'kotlinx-io' is loaded prior to 'kotlinx-coroutines-io'.");
        }
        if (typeof this['kotlinx-coroutines-core'] === 'undefined') {
            throw new Error("Error loading module 'kotlinx-coroutines-io'. Its dependency 'kotlinx-coroutines-core' was not found. Please, check whether 'kotlinx-coroutines-core' is loaded prior to 'kotlinx-coroutines-io'.");
        }
        root['kotlinx-coroutines-io'] = factory(typeof this['kotlinx-coroutines-io'] === 'undefined' ? {} : this['kotlinx-coroutines-io'], kotlin, this['kotlinx-io'], this['kotlinx-coroutines-core']);
    }
}(this, function (_, Kotlin, $module$kotlinx_io, $module$kotlinx_coroutines_core) {
    'use strict';
    var $$importsForInline$$ = _.$$importsForInline$$ || (_.$$importsForInline$$ = {});
    var Kind_INTERFACE = Kotlin.Kind.INTERFACE;
    var charsets = $module$kotlinx_io.kotlinx.io.charsets;
    var encodeToByteArray = $module$kotlinx_io.kotlinx.io.charsets.encodeToByteArray_478lbv$;
    var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
    var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
    var Long$Companion$MAX_VALUE = Kotlin.Long.MAX_VALUE;
    var L0 = Kotlin.Long.ZERO;
    var $unsafeAppend$ = $module$kotlinx_io.kotlinx.io.core.internal.$unsafeAppend$_a3tlu$;
    var writeFully = $module$kotlinx_io.kotlinx.io.core.writeFully_bc6dmu$;
    var Kind_CLASS = Kotlin.Kind.CLASS;
    var Unit = Kotlin.kotlin.Unit;
    var EOFException = $module$kotlinx_io.kotlinx.io.errors.EOFException;
    var BytePacketBuilder = $module$kotlinx_io.kotlinx.io.core.BytePacketBuilder_za3lpa$;
    var equals = Kotlin.equals;
    var ensureNotNull = Kotlin.ensureNotNull;
    var toByte = Kotlin.toByte;
    var IoBuffer = $module$kotlinx_io.kotlinx.io.core.IoBuffer;
    var discardExact = $module$kotlinx_io.kotlinx.io.core.discardExact_x7yx39$;
    var decodeUTF8LineLoopSuspend = $module$kotlinx_io.kotlinx.io.core.internal.decodeUTF8LineLoopSuspend_a47po6$;
    var StringBuilder_init = Kotlin.kotlin.text.StringBuilder_init;
    var CancellationException = $module$kotlinx_coroutines_core.kotlinx.coroutines.CancellationException;
    var ByteReadPacket_init = $module$kotlinx_io.kotlinx.io.core.ByteReadPacket_init_3npcxq$;
    var L4088 = Kotlin.Long.fromInt(4088);
    var ByteOrder = $module$kotlinx_io.kotlinx.io.core.ByteOrder;
    var Math_0 = Math;
    var IllegalArgumentException_init = Kotlin.kotlin.IllegalArgumentException_init_pdl1vj$;
    var defineInlineFunction = Kotlin.defineInlineFunction;
    var wrapFunction = Kotlin.wrapFunction;
    var toShort = Kotlin.toShort;
    var Throwable = Error;
    var reverseByteOrder = $module$kotlinx_io.kotlinx.io.bits.reverseByteOrder_5vcgdc$;
    var reverseByteOrder_0 = $module$kotlinx_io.kotlinx.io.bits.reverseByteOrder_s8ev3n$;
    var reverseByteOrder_1 = $module$kotlinx_io.kotlinx.io.bits.reverseByteOrder_mts6qi$;
    var reverseByteOrder_2 = $module$kotlinx_io.kotlinx.io.bits.reverseByteOrder_81szk$;
    var reverseByteOrder_3 = $module$kotlinx_io.kotlinx.io.bits.reverseByteOrder_yrwdxr$;
    var Job = $module$kotlinx_coroutines_core.kotlinx.coroutines.Job;
    var CoroutineScope = $module$kotlinx_coroutines_core.kotlinx.coroutines.CoroutineScope;
    var coroutines = Kotlin.kotlin.coroutines;
    var coroutines_0 = $module$kotlinx_coroutines_core.kotlinx.coroutines;
    var newCoroutineContext = $module$kotlinx_coroutines_core.kotlinx.coroutines.newCoroutineContext_7n4184$;
    var CoroutineScope_0 = $module$kotlinx_coroutines_core.kotlinx.coroutines.CoroutineScope_1fupul$;
    var throwCCE = Kotlin.throwCCE;
    var launch = $module$kotlinx_coroutines_core.kotlinx.coroutines.launch_s496o7$;
    var coerceAtMost = Kotlin.kotlin.ranges.coerceAtMost_2p08ub$;
    var toString = Kotlin.toString;
    var lazy = Kotlin.kotlin.lazy_klfg04$;
    var Kind_OBJECT = Kotlin.Kind.OBJECT;
    var Result = Kotlin.kotlin.Result;
    var intercepted = Kotlin.kotlin.coroutines.intrinsics.intercepted_f9mg25$;
    var SafeContinuation_init = Kotlin.kotlin.coroutines.SafeContinuation_init_wj8d80$;
    ClosedWriteChannelException.prototype = Object.create(CancellationException.prototype);
    ClosedWriteChannelException.prototype.constructor = ClosedWriteChannelException;
    ByteChannelJS.prototype = Object.create(ByteChannelSequentialBase.prototype);
    ByteChannelJS.prototype.constructor = ByteChannelJS;

    function ByteChannel() {
    }

    ByteChannel.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ByteChannel',
        interfaces: [ByteWriteChannel, ByteReadChannel_4]
    };

    function ByteReadChannel(text, charset) {
        if (charset === void 0)
            charset = charsets.Charsets.UTF_8;
        return ByteReadChannel_2(encodeToByteArray(charset.newEncoder(), text, 0, text.length));
    }

    function get_EmptyByteReadChannel() {
        return ByteReadChannel$Companion_getInstance().Empty;
    }

    function joinTo($receiver, dst, closeOnEnd, continuation) {
        return joinToImpl($receiver, dst, closeOnEnd, continuation);
    }

    function copyTo($receiver, dst, limit, continuation) {
        if (limit === void 0)
            limit = Long$Companion$MAX_VALUE;
        return copyToSequentialImpl($receiver, dst, limit, continuation);
    }

    function ByteChannelSequentialBase(initial, autoFlush) {
        this.autoFlush_nmxe0k$_0 = autoFlush;
        this.closed = false;
        this.writable = BytePacketBuilder(0);
        this.readable = ByteReadPacket_init(initial, IoBuffer.Companion.Pool);
        this.notFull_8be2vx$ = new Condition(ByteChannelSequentialBase$notFull$lambda(this));
        this.waitingForSize_5346xe$_0 = 1;
        this.atLeastNBytesAvailableForWrite_rbo04f$_0 = new Condition(ByteChannelSequentialBase$atLeastNBytesAvailableForWrite$lambda(this));
        this.waitingForRead_53r213$_0 = 1;
        this.atLeastNBytesAvailableForRead_q03xc0$_0 = new Condition(ByteChannelSequentialBase$atLeastNBytesAvailableForRead$lambda(this));
        this.readByteOrder_tz235l$_0 = ByteOrder.BIG_ENDIAN;
        this.writeByteOrder_t9bb0k$_0 = ByteOrder.BIG_ENDIAN;
        this.closedCause_hoxb9w$_0 = null;
        this.lastReadAvailable_rm45jo$_0 = 0;
        this.lastReadView_g6geey$_0 = IoBuffer.Companion.Empty;
    }

    Object.defineProperty(ByteChannelSequentialBase.prototype, 'autoFlush', {
        get: function () {
            return this.autoFlush_nmxe0k$_0;
        }
    });
    ByteChannelSequentialBase.prototype.totalPending_z7ii0$_0 = function () {
        return this.readable.remaining.toInt() + this.writable.size | 0;
    };
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'availableForRead', {
        get: function () {
            return this.readable.remaining.toInt();
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'availableForWrite', {
        get: function () {
            var b = 4088 - (this.readable.remaining.toInt() + this.writable.size | 0) | 0;
            return Math_0.max(0, b);
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'readByteOrder', {
        get: function () {
            return this.readByteOrder_tz235l$_0;
        },
        set: function (newOrder) {
            if (this.readByteOrder_tz235l$_0 !== newOrder) {
                this.readByteOrder_tz235l$_0 = newOrder;
                this.readable.byteOrder = newOrder;
            }
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'writeByteOrder', {
        get: function () {
            return this.writeByteOrder_t9bb0k$_0;
        },
        set: function (newOrder) {
            if (this.writeByteOrder_t9bb0k$_0 !== newOrder) {
                this.writeByteOrder_t9bb0k$_0 = newOrder;
                this.writable.byteOrder = newOrder;
            }
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'isClosedForRead', {
        get: function () {
            return this.closed && this.readable.isEmpty;
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'isClosedForWrite', {
        get: function () {
            return this.closed;
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'totalBytesRead', {
        get: function () {
            return L0;
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'totalBytesWritten', {
        get: function () {
            return L0;
        }
    });
    Object.defineProperty(ByteChannelSequentialBase.prototype, 'closedCause', {
        get: function () {
            return this.closedCause_hoxb9w$_0;
        },
        set: function (closedCause) {
            this.closedCause_hoxb9w$_0 = closedCause;
        }
    });
    ByteChannelSequentialBase.prototype.flush = function () {
        if (this.writable.isNotEmpty) {
            $unsafeAppend$(this.readable, this.writable);
            this.atLeastNBytesAvailableForRead_q03xc0$_0.signal();
        }
    };
    ByteChannelSequentialBase.prototype.ensureNotClosed_p0draw$_0 = function () {
        if (this.closed)
            throw new ClosedWriteChannelException('Channel is already closed');
    };
    ByteChannelSequentialBase.prototype.writeByte_s8j3t7$ = function (b, continuation) {
        this.writable.writeByte_s8j3t7$(b);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeShort_mq22fl$ = function (s, continuation) {
        this.writable.writeShort_mq22fl$(s);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeInt_za3lpa$ = function (i, continuation) {
        this.writable.writeInt_za3lpa$(i);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeLong_s8cxhz$ = function (l, continuation) {
        this.writable.writeLong_s8cxhz$(l);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeFloat_mx4ult$ = function (f, continuation) {
        this.writable.writeFloat_mx4ult$(f);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeDouble_14dthe$ = function (d, continuation) {
        this.writable.writeDouble_14dthe$(d);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writePacket_8awntw$ = function (packet, continuation) {
        this.writable.writePacket_8awntw$(packet);
        return this.awaitFreeSpace(continuation);
    };
    ByteChannelSequentialBase.prototype.writeFully_g6eaik$ = function (src, continuation) {
        writeFully(this.writable, src);
        return this.awaitFreeSpace(continuation);
    };

    function Coroutine$writeFully_mj6st8$($this, src_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$src = src_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$writeFully_mj6st8$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeFully_mj6st8$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeFully_mj6st8$.prototype.constructor = Coroutine$writeFully_mj6st8$;
    Coroutine$writeFully_mj6st8$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.$this.writable.writeFully_mj6st8$(this.local$src, this.local$offset, this.local$length);
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitFreeSpace(this);
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
    ByteChannelSequentialBase.prototype.writeFully_mj6st8$ = function (src_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$writeFully_mj6st8$(this, src_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$writeAvailable_g6eaik$($this, src_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$srcRemaining = void 0;
        this.local$size = void 0;
        this.local$src = src_0;
    }

    Coroutine$writeAvailable_g6eaik$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeAvailable_g6eaik$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeAvailable_g6eaik$.prototype.constructor = Coroutine$writeAvailable_g6eaik$;
    Coroutine$writeAvailable_g6eaik$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$srcRemaining = this.local$src.readRemaining;
                    if (this.local$srcRemaining === 0) {
                        return 0;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    var b = this.$this.availableForWrite;
                    this.local$size = Math_0.min(this.local$srcRemaining, b);
                    if (this.local$size === 0) {
                        this.state_0 = 4;
                        this.result_0 = this.$this.writeAvailableSuspend_xallvf$_0(this.local$src, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        this.$this.writable.writeFully_bj0s3a$(this.local$src, this.local$size);
                        this.state_0 = 3;
                        this.result_0 = this.$this.awaitFreeSpace(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 3:
                    this.local$tmp$ = this.local$size;
                    this.state_0 = 5;
                    continue;
                case 4:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 5;
                    continue;
                case 5:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.writeAvailable_g6eaik$ = function (src_0, continuation_0, suspended) {
        var instance = new Coroutine$writeAvailable_g6eaik$(this, src_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$writeAvailable_mj6st8$($this, src_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$size = void 0;
        this.local$src = src_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$writeAvailable_mj6st8$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeAvailable_mj6st8$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeAvailable_mj6st8$.prototype.constructor = Coroutine$writeAvailable_mj6st8$;
    Coroutine$writeAvailable_mj6st8$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.local$length === 0) {
                        return 0;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    var b = this.$this.availableForWrite;
                    this.local$size = Math_0.min(this.local$length, b);
                    if (this.local$size === 0) {
                        this.state_0 = 4;
                        this.result_0 = this.$this.writeAvailableSuspend_f978it$_0(this.local$src, this.local$offset, this.local$length, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        this.$this.writable.writeFully_mj6st8$(this.local$src, this.local$offset, this.local$size);
                        this.state_0 = 3;
                        this.result_0 = this.$this.awaitFreeSpace(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 3:
                    this.local$tmp$ = this.local$size;
                    this.state_0 = 5;
                    continue;
                case 4:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 5;
                    continue;
                case 5:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.writeAvailable_mj6st8$ = function (src_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$writeAvailable_mj6st8$(this, src_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral(this$ByteChannelSequentialBase) {
        this.this$ByteChannelSequentialBase = this$ByteChannelSequentialBase;
    }

    ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral.prototype.request_za3lpa$ = function (min) {
        if (this.this$ByteChannelSequentialBase.availableForWrite === 0)
            return null;
        return this.this$ByteChannelSequentialBase.writable.prepareWriteHead_za3lpa$(min);
    };
    ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral.prototype.written_za3lpa$ = function (n) {
        this.this$ByteChannelSequentialBase.writable.afterHeadWrite();
        this.this$ByteChannelSequentialBase.afterWrite();
    };
    ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral.prototype.flush = function () {
        this.this$ByteChannelSequentialBase.flush();
    };

    function Coroutine$tryAwait_za3lpa$($this, n_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$n = n_0;
    }

    Coroutine$tryAwait_za3lpa$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$tryAwait_za3lpa$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$tryAwait_za3lpa$.prototype.constructor = Coroutine$tryAwait_za3lpa$;
    Coroutine$tryAwait_za3lpa$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.this$ByteChannelSequentialBase.availableForWrite < this.local$n) {
                        this.$this.this$ByteChannelSequentialBase.waitingForSize_5346xe$_0 = this.local$n;
                        this.state_0 = 2;
                        this.result_0 = this.$this.this$ByteChannelSequentialBase.atLeastNBytesAvailableForWrite_rbo04f$_0.await(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    continue;
                case 3:
                    return;
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
    ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral.prototype.tryAwait_za3lpa$ = function (n_0, continuation_0, suspended) {
        var instance = new Coroutine$tryAwait_za3lpa$(this, n_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral.$metadata$ = {
        kind: Kind_CLASS,
        interfaces: [WriterSuspendSession]
    };

    function Coroutine$writeSuspendSession_2048yo$($this, visitor_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$visitor = visitor_0;
    }

    Coroutine$writeSuspendSession_2048yo$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeSuspendSession_2048yo$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeSuspendSession_2048yo$.prototype.constructor = Coroutine$writeSuspendSession_2048yo$;
    Coroutine$writeSuspendSession_2048yo$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var session = new ByteChannelSequentialBase$writeSuspendSession$ObjectLiteral(this.$this);
                    this.state_0 = 2;
                    this.result_0 = this.local$visitor(session, this);
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
    ByteChannelSequentialBase.prototype.writeSuspendSession_2048yo$ = function (visitor_0, continuation_0, suspended) {
        var instance = new Coroutine$writeSuspendSession_2048yo$(this, visitor_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readByte($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readByte.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readByte.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readByte.prototype.constructor = Coroutine$readByte;
    Coroutine$readByte.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.isNotEmpty) {
                        var $receiver = this.$this.readable.readByte();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readByteSlow_19kv84$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readByte = function (continuation_0, suspended) {
        var instance = new Coroutine$readByte(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.checkClosed_ry7trr$_0 = function (n) {
        var tmp$;
        if (this.closed) {
            throw (tmp$ = this.closedCause) != null ? tmp$ : new EOFException(n.toString() + ' bytes required but EOF reached');
        }
    };

    function Coroutine$readByteSlow_19kv84$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readByteSlow_19kv84$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readByteSlow_19kv84$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readByteSlow_19kv84$_0.prototype.constructor = Coroutine$readByteSlow_19kv84$_0;
    Coroutine$readByteSlow_19kv84$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.isNotEmpty) {
                        var $receiver = this.$this.readable.readByte();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(1);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readByteSlow_19kv84$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readByteSlow_19kv84$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readShort($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readShort.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readShort.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readShort.prototype.constructor = Coroutine$readShort;
    Coroutine$readShort.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.hasBytes_za3lpa$(2)) {
                        var $receiver = this.$this.readable.readShort();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readShortSlow_lm4dge$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readShort = function (continuation_0, suspended) {
        var instance = new Coroutine$readShort(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readShortSlow_lm4dge$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readShortSlow_lm4dge$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readShortSlow_lm4dge$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readShortSlow_lm4dge$_0.prototype.constructor = Coroutine$readShortSlow_lm4dge$_0;
    Coroutine$readShortSlow_lm4dge$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(2, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(2)) {
                        var $receiver = this.$this.readable.readShort();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(2);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readShortSlow_lm4dge$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readShortSlow_lm4dge$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.afterRead = function () {
        this.atLeastNBytesAvailableForWrite_rbo04f$_0.signal();
        this.notFull_8be2vx$.signal();
    };

    function Coroutine$readInt($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readInt.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readInt.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readInt.prototype.constructor = Coroutine$readInt;
    Coroutine$readInt.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.hasBytes_za3lpa$(4)) {
                        var $receiver = this.$this.readable.readInt();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readIntSlow_7x9aj3$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readInt = function (continuation_0, suspended) {
        var instance = new Coroutine$readInt(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readIntSlow_7x9aj3$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readIntSlow_7x9aj3$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readIntSlow_7x9aj3$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readIntSlow_7x9aj3$_0.prototype.constructor = Coroutine$readIntSlow_7x9aj3$_0;
    Coroutine$readIntSlow_7x9aj3$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(4, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(4)) {
                        var $receiver = this.$this.readable.readInt();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(4);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readIntSlow_7x9aj3$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readIntSlow_7x9aj3$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readLong($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readLong.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readLong.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readLong.prototype.constructor = Coroutine$readLong;
    Coroutine$readLong.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.hasBytes_za3lpa$(8)) {
                        var $receiver = this.$this.readable.readLong();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readLongSlow_yrw9h4$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readLong = function (continuation_0, suspended) {
        var instance = new Coroutine$readLong(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readLongSlow_yrw9h4$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readLongSlow_yrw9h4$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readLongSlow_yrw9h4$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readLongSlow_yrw9h4$_0.prototype.constructor = Coroutine$readLongSlow_yrw9h4$_0;
    Coroutine$readLongSlow_yrw9h4$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(8, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(8)) {
                        var $receiver = this.$this.readable.readLong();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(8);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readLongSlow_yrw9h4$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readLongSlow_yrw9h4$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFloat($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readFloat.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFloat.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFloat.prototype.constructor = Coroutine$readFloat;
    Coroutine$readFloat.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.hasBytes_za3lpa$(4)) {
                        var $receiver = this.$this.readable.readFloat();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readFloatSlow_6p8jr6$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readFloat = function (continuation_0, suspended) {
        var instance = new Coroutine$readFloat(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFloatSlow_6p8jr6$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readFloatSlow_6p8jr6$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFloatSlow_6p8jr6$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFloatSlow_6p8jr6$_0.prototype.constructor = Coroutine$readFloatSlow_6p8jr6$_0;
    Coroutine$readFloatSlow_6p8jr6$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(4, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(4)) {
                        var $receiver = this.$this.readable.readFloat();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(4);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readFloatSlow_6p8jr6$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readFloatSlow_6p8jr6$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readDouble($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readDouble.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readDouble.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readDouble.prototype.constructor = Coroutine$readDouble;
    Coroutine$readDouble.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.hasBytes_za3lpa$(8)) {
                        var $receiver = this.$this.readable.readDouble();
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readDoubleSlow_2e4ph9$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readDouble = function (continuation_0, suspended) {
        var instance = new Coroutine$readDouble(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readDoubleSlow_2e4ph9$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readDoubleSlow_2e4ph9$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readDoubleSlow_2e4ph9$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readDoubleSlow_2e4ph9$_0.prototype.constructor = Coroutine$readDoubleSlow_2e4ph9$_0;
    Coroutine$readDoubleSlow_2e4ph9$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(8, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(8)) {
                        var $receiver = this.$this.readable.readDouble();
                        this.$this.afterRead();
                        return $receiver;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.$this.checkClosed_ry7trr$_0(8);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readDoubleSlow_2e4ph9$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readDoubleSlow_2e4ph9$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readRemaining_yhmem3$($this, limit_0, headerSizeHint_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$limit = limit_0;
        this.local$headerSizeHint = headerSizeHint_0;
    }

    Coroutine$readRemaining_yhmem3$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readRemaining_yhmem3$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readRemaining_yhmem3$.prototype.constructor = Coroutine$readRemaining_yhmem3$;
    Coroutine$readRemaining_yhmem3$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var builder = BytePacketBuilder(this.local$headerSizeHint);
                    var tmp$ = this.$this.readable;
                    var b = this.$this.readable.remaining;
                    builder.writePacket_o4mqn5$(tmp$, this.local$limit.compareTo_11rb$(b) <= 0 ? this.local$limit : b);
                    var remaining = this.local$limit.subtract(Kotlin.Long.fromInt(builder.size));
                    if (equals(remaining, L0) || (this.$this.readable.isEmpty && this.$this.closed)) {
                        this.$this.afterRead();
                        this.local$tmp$ = builder.build();
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readRemainingSuspend_y32kbp$_0(builder, remaining, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readRemaining_yhmem3$ = function (limit_0, headerSizeHint_0, continuation_0, suspended) {
        var instance = new Coroutine$readRemaining_yhmem3$(this, limit_0, headerSizeHint_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readRemainingSuspend_y32kbp$_0($this, builder_0, limit_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$builder = builder_0;
        this.local$limit = limit_0;
    }

    Coroutine$readRemainingSuspend_y32kbp$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readRemainingSuspend_y32kbp$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readRemainingSuspend_y32kbp$_0.prototype.constructor = Coroutine$readRemainingSuspend_y32kbp$_0;
    Coroutine$readRemainingSuspend_y32kbp$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (this.local$builder.size >= this.local$limit.toNumber()) {
                        this.state_0 = 5;
                        continue;
                    }
                    this.local$builder.writePacket_8awntw$(this.$this.readable);
                    this.$this.afterRead();
                    if (equals(this.$this.readable.remaining, L0) && this.$this.writable.size === 0 && this.$this.closed) {
                        this.state_0 = 5;
                        continue;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 3:
                    this.state_0 = 4;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 4:
                    this.state_0 = 2;
                    continue;
                case 5:
                    return this.local$builder.build();
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
    ByteChannelSequentialBase.prototype.readRemainingSuspend_y32kbp$_0 = function (builder_0, limit_0, continuation_0, suspended) {
        var instance = new Coroutine$readRemainingSuspend_y32kbp$_0(this, builder_0, limit_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readPacket_vux9f0$($this, size_0, headerSizeHint_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$size = size_0;
        this.local$headerSizeHint = headerSizeHint_0;
    }

    Coroutine$readPacket_vux9f0$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readPacket_vux9f0$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readPacket_vux9f0$.prototype.constructor = Coroutine$readPacket_vux9f0$;
    Coroutine$readPacket_vux9f0$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var builder = BytePacketBuilder(this.local$headerSizeHint);
                    var remaining = this.local$size;
                    var a = Kotlin.Long.fromInt(remaining);
                    var b = this.$this.readable.remaining;
                    var partSize = (a.compareTo_11rb$(b) <= 0 ? a : b).toInt();
                    remaining = remaining - partSize | 0;
                    builder.writePacket_eixyzu$(this.$this.readable, partSize);
                    this.$this.afterRead();
                    if (remaining > 0) {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readPacketSuspend_n6t78s$_0(builder, remaining, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        this.local$tmp$ = builder.build();
                        this.state_0 = 3;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readPacket_vux9f0$ = function (size_0, headerSizeHint_0, continuation_0, suspended) {
        var instance = new Coroutine$readPacket_vux9f0$(this, size_0, headerSizeHint_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readPacketSuspend_n6t78s$_0($this, builder_0, size_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$remaining = void 0;
        this.local$builder = builder_0;
        this.local$size = size_0;
    }

    Coroutine$readPacketSuspend_n6t78s$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readPacketSuspend_n6t78s$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readPacketSuspend_n6t78s$_0.prototype.constructor = Coroutine$readPacketSuspend_n6t78s$_0;
    Coroutine$readPacketSuspend_n6t78s$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$remaining = this.local$size;
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (this.local$remaining <= 0) {
                        this.state_0 = 5;
                        continue;
                    }
                    var a = Kotlin.Long.fromInt(this.local$remaining);
                    var b = this.$this.readable.remaining;
                    var partSize = (a.compareTo_11rb$(b) <= 0 ? a : b).toInt();
                    this.local$remaining = this.local$remaining - partSize | 0;
                    this.local$builder.writePacket_eixyzu$(this.$this.readable, partSize);
                    this.$this.afterRead();
                    if (this.local$remaining > 0) {
                        this.state_0 = 3;
                        this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 3:
                    this.state_0 = 4;
                    continue;
                case 4:
                    this.state_0 = 2;
                    continue;
                case 5:
                    return this.local$builder.build();
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
    ByteChannelSequentialBase.prototype.readPacketSuspend_n6t78s$_0 = function (builder_0, size_0, continuation_0, suspended) {
        var instance = new Coroutine$readPacketSuspend_n6t78s$_0(this, builder_0, size_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.readAvailableClosed = function () {
        var tmp$;
        if ((tmp$ = this.closedCause) != null) {
            throw tmp$;
        }
        -1;
        return -1;
    };

    function Coroutine$readAvailable_g6eaik$($this, dst_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$dst = dst_0;
    }

    Coroutine$readAvailable_g6eaik$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailable_g6eaik$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailable_g6eaik$.prototype.constructor = Coroutine$readAvailable_g6eaik$;
    Coroutine$readAvailable_g6eaik$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.closedCause != null) {
                        throw ensureNotNull(this.$this.closedCause);
                    } else {
                        if (this.$this.readable.canRead()) {
                            var a = Kotlin.Long.fromInt(this.local$dst.writeRemaining);
                            var b = this.$this.readable.remaining;
                            var size = (a.compareTo_11rb$(b) <= 0 ? a : b).toInt();
                            this.$this.readable.readFully_bj0s3a$(this.local$dst, size);
                            this.$this.afterRead();
                            this.local$tmp$ = size;
                            this.state_0 = 5;
                            continue;
                        } else {
                            if (this.$this.closed) {
                                this.local$tmp$ = this.$this.readAvailableClosed();
                                this.state_0 = 4;
                                continue;
                            } else {
                                if (!this.local$dst.canWrite()) {
                                    this.local$tmp$ = 0;
                                    this.state_0 = 3;
                                    continue;
                                } else {
                                    this.state_0 = 2;
                                    this.result_0 = this.$this.readAvailableSuspend_7leiqu$_0(this.local$dst, this);
                                    if (this.result_0 === COROUTINE_SUSPENDED)
                                        return COROUTINE_SUSPENDED;
                                    continue;
                                }
                            }
                        }
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    this.state_0 = 4;
                    continue;
                case 4:
                    this.state_0 = 5;
                    continue;
                case 5:
                    this.state_0 = 6;
                    continue;
                case 6:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readAvailable_g6eaik$ = function (dst_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailable_g6eaik$(this, dst_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readAvailableSuspend_7leiqu$_0($this, dst_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$dst = dst_0;
    }

    Coroutine$readAvailableSuspend_7leiqu$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailableSuspend_7leiqu$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailableSuspend_7leiqu$_0.prototype.constructor = Coroutine$readAvailableSuspend_7leiqu$_0;
    Coroutine$readAvailableSuspend_7leiqu$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.readAvailable_g6eaik$(this.local$dst, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.readAvailableSuspend_7leiqu$_0 = function (dst_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailableSuspend_7leiqu$_0(this, dst_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFully_bj0s3a$($this, dst_0, n_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$dst = dst_0;
        this.local$n = n_0;
    }

    Coroutine$readFully_bj0s3a$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFully_bj0s3a$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFully_bj0s3a$.prototype.constructor = Coroutine$readFully_bj0s3a$;
    Coroutine$readFully_bj0s3a$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (!(this.local$n <= this.local$dst.writeRemaining)) {
                        var message = 'Not enough space in the destination buffer to write ' + this.local$n + ' bytes';
                        throw IllegalArgumentException_init(message.toString());
                    }
                    if (!(this.local$n >= 0)) {
                        var message_0 = "n shouldn't be negative";
                        throw IllegalArgumentException_init(message_0.toString());
                    }
                    if (this.$this.closedCause != null) {
                        throw ensureNotNull(this.$this.closedCause);
                    } else {
                        if (this.$this.readable.remaining.toNumber() >= this.local$n) {
                            var $receiver = (this.$this.readable.readFully_bj0s3a$(this.local$dst, this.local$n) , Unit);
                            this.$this.afterRead();
                            this.local$tmp$ = $receiver;
                            this.state_0 = 4;
                            continue;
                        } else {
                            if (this.$this.closed) {
                                throw new EOFException('Channel is closed and not enough bytes available: required ' + this.local$n + ' but ' + this.$this.availableForRead + ' available');
                            } else {
                                this.state_0 = 2;
                                this.result_0 = this.$this.readFullySuspend_67q9ix$_0(this.local$dst, this.local$n, this);
                                if (this.result_0 === COROUTINE_SUSPENDED)
                                    return COROUTINE_SUSPENDED;
                                continue;
                            }
                        }
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    this.state_0 = 4;
                    continue;
                case 4:
                    this.state_0 = 5;
                    continue;
                case 5:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readFully_bj0s3a$ = function (dst_0, n_0, continuation_0, suspended) {
        var instance = new Coroutine$readFully_bj0s3a$(this, dst_0, n_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFullySuspend_67q9ix$_0($this, dst_0, n_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$dst = dst_0;
        this.local$n = n_0;
    }

    Coroutine$readFullySuspend_67q9ix$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFullySuspend_67q9ix$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFullySuspend_67q9ix$_0.prototype.constructor = Coroutine$readFullySuspend_67q9ix$_0;
    Coroutine$readFullySuspend_67q9ix$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(this.local$n, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.readFully_bj0s3a$(this.local$dst, this.local$n, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.readFullySuspend_67q9ix$_0 = function (dst_0, n_0, continuation_0, suspended) {
        var instance = new Coroutine$readFullySuspend_67q9ix$_0(this, dst_0, n_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readAvailable_mj6st8$($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readAvailable_mj6st8$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailable_mj6st8$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailable_mj6st8$.prototype.constructor = Coroutine$readAvailable_mj6st8$;
    Coroutine$readAvailable_mj6st8$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.canRead()) {
                        var a = Kotlin.Long.fromInt(this.local$length);
                        var b = this.$this.readable.remaining;
                        var size = (a.compareTo_11rb$(b) <= 0 ? a : b).toInt();
                        this.$this.readable.readFully_mj6st8$(this.local$dst, this.local$offset, size);
                        this.$this.afterRead();
                        this.local$tmp$ = size;
                        this.state_0 = 4;
                        continue;
                    } else {
                        if (this.$this.closed) {
                            this.local$tmp$ = this.$this.readAvailableClosed();
                            this.state_0 = 3;
                            continue;
                        } else {
                            this.state_0 = 2;
                            this.result_0 = this.$this.readAvailableSuspend_k9vph6$_0(this.local$dst, this.local$offset, this.local$length, this);
                            if (this.result_0 === COROUTINE_SUSPENDED)
                                return COROUTINE_SUSPENDED;
                            continue;
                        }
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    this.state_0 = 4;
                    continue;
                case 4:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readAvailable_mj6st8$ = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailable_mj6st8$(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readAvailableSuspend_k9vph6$_0($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readAvailableSuspend_k9vph6$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailableSuspend_k9vph6$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailableSuspend_k9vph6$_0.prototype.constructor = Coroutine$readAvailableSuspend_k9vph6$_0;
    Coroutine$readAvailableSuspend_k9vph6$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.readAvailable_mj6st8$(this.local$dst, this.local$offset, this.local$length, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.readAvailableSuspend_k9vph6$_0 = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailableSuspend_k9vph6$_0(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFully_mj6st8$($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$rc = void 0;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readFully_mj6st8$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFully_mj6st8$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFully_mj6st8$.prototype.constructor = Coroutine$readFully_mj6st8$;
    Coroutine$readFully_mj6st8$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.readAvailable_mj6st8$(this.local$dst, this.local$offset, this.local$length, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$rc = this.result_0;
                    if (this.local$rc === this.local$length) {
                        return;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 3:
                    if (this.local$rc === -1)
                        throw new EOFException('Unexpected end of stream');
                    this.state_0 = 4;
                    this.result_0 = this.$this.readFullySuspend_k4whl3$_0(this.local$dst, this.local$offset + this.local$rc | 0, this.local$length - this.local$rc | 0, this);
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
    ByteChannelSequentialBase.prototype.readFully_mj6st8$ = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readFully_mj6st8$(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readFullySuspend_k4whl3$_0($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$written = void 0;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readFullySuspend_k4whl3$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFullySuspend_k4whl3$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFullySuspend_k4whl3$_0.prototype.constructor = Coroutine$readFullySuspend_k4whl3$_0;
    Coroutine$readFullySuspend_k4whl3$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$written = 0;
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (this.local$written >= this.local$length) {
                        this.state_0 = 4;
                        continue;
                    }
                    this.state_0 = 3;
                    this.result_0 = this.$this.readAvailable_mj6st8$(this.local$dst, this.local$offset + this.local$written | 0, this.local$length - this.local$written | 0, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    var rc = this.result_0;
                    if (rc === -1)
                        throw new EOFException('Unexpected end of stream');
                    this.local$written = this.local$written + rc | 0;
                    this.state_0 = 2;
                    continue;
                case 4:
                    return;
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
    ByteChannelSequentialBase.prototype.readFullySuspend_k4whl3$_0 = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readFullySuspend_k4whl3$_0(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readBoolean($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
    }

    Coroutine$readBoolean.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readBoolean.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readBoolean.prototype.constructor = Coroutine$readBoolean;
    Coroutine$readBoolean.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.readable.canRead()) {
                        var $receiver = this.$this.readable.readByte() === toByte(1);
                        this.$this.afterRead();
                        this.local$tmp$ = $receiver;
                        this.state_0 = 3;
                        continue;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readBooleanSlow_xcl75i$_0(this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.readBoolean = function (continuation_0, suspended) {
        var instance = new Coroutine$readBoolean(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readBooleanSlow_xcl75i$_0($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$readBooleanSlow_xcl75i$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readBooleanSlow_xcl75i$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readBooleanSlow_xcl75i$_0.prototype.constructor = Coroutine$readBooleanSlow_xcl75i$_0;
    Coroutine$readBooleanSlow_xcl75i$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.$this.checkClosed_ry7trr$_0(1);
                    this.state_0 = 3;
                    this.result_0 = this.$this.readBoolean(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.readBooleanSlow_xcl75i$_0 = function (continuation_0, suspended) {
        var instance = new Coroutine$readBooleanSlow_xcl75i$_0(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.completeReading_jdkw5m$_0 = function () {
        var remaining = this.lastReadView_g6geey$_0.readRemaining;
        var delta = this.lastReadAvailable_rm45jo$_0 - remaining | 0;
        if (this.lastReadView_g6geey$_0 !== IoBuffer.Companion.Empty) {
            this.readable.updateHeadRemaining_za3lpa$(remaining);
        }
        if (delta > 0) {
            this.afterRead();
        }
        this.lastReadAvailable_rm45jo$_0 = 0;
        this.lastReadView_g6geey$_0 = IoBuffer.Companion.Empty;
    };
    ByteChannelSequentialBase.prototype.await_za3lpa$$default = function (atLeast, continuation) {
        if (!(atLeast >= 0)) {
            var message = "atLeast parameter shouldn't be negative: " + atLeast;
            throw IllegalArgumentException_init(message.toString());
        }
        if (!(atLeast <= 4088)) {
            var message_0 = "atLeast parameter shouldn't be larger than max buffer size of 4088: " + atLeast;
            throw IllegalArgumentException_init(message_0.toString());
        }
        this.completeReading_jdkw5m$_0();
        if (atLeast === 0)
            return !this.isClosedForRead;
        if (this.availableForRead >= atLeast)
            return true;
        return this.awaitSuspend_za3lpa$(atLeast, continuation);
    };
    ByteChannelSequentialBase.prototype.awaitInternalAtLeast1_8be2vx$ = function (continuation) {
        if (this.readable.isNotEmpty)
            return true;
        return this.awaitSuspend_za3lpa$(1, continuation);
    };

    function ByteChannelSequentialBase$awaitSuspend$lambda(this$ByteChannelSequentialBase) {
        return function () {
            this$ByteChannelSequentialBase.afterRead();
            return Unit;
        };
    }

    function Coroutine$awaitSuspend_za3lpa$($this, atLeast_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$atLeast = atLeast_0;
    }

    Coroutine$awaitSuspend_za3lpa$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$awaitSuspend_za3lpa$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$awaitSuspend_za3lpa$.prototype.constructor = Coroutine$awaitSuspend_za3lpa$;
    Coroutine$awaitSuspend_za3lpa$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (!(this.local$atLeast >= 0)) {
                        var message = 'Failed requirement.';
                        throw IllegalArgumentException_init(message.toString());
                    }
                    this.$this.waitingForRead_53r213$_0 = this.local$atLeast;
                    this.state_0 = 2;
                    this.result_0 = this.$this.atLeastNBytesAvailableForRead_q03xc0$_0.await_o14v8n$(ByteChannelSequentialBase$awaitSuspend$lambda(this.$this), this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if ((tmp$ = this.$this.closedCause) != null) {
                        throw tmp$;
                    }
                    return !this.$this.isClosedForRead && this.$this.availableForRead >= this.local$atLeast;
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
    ByteChannelSequentialBase.prototype.awaitSuspend_za3lpa$ = function (atLeast_0, continuation_0, suspended) {
        var instance = new Coroutine$awaitSuspend_za3lpa$(this, atLeast_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.discard_za3lpa$ = function (n) {
        var tmp$;
        if ((tmp$ = this.closedCause) != null) {
            throw tmp$;
        }
        var a = this.readable.remaining;
        var b = Kotlin.Long.fromInt(n);
        var quantity = (a.compareTo_11rb$(b) <= 0 ? a : b).toInt();
        discardExact(this.readable, quantity);
        this.afterRead();
        return quantity;
    };
    ByteChannelSequentialBase.prototype.request_za3lpa$$default = function (atLeast) {
        var tmp$;
        if ((tmp$ = this.closedCause) != null) {
            throw tmp$;
        }
        this.completeReading_jdkw5m$_0();
        var view = this.readable.prepareReadHead_za3lpa$(atLeast);
        if (view == null) {
            this.lastReadView_g6geey$_0 = IoBuffer.Companion.Empty;
            this.lastReadAvailable_rm45jo$_0 = 0;
        } else {
            this.lastReadView_g6geey$_0 = view;
            this.lastReadAvailable_rm45jo$_0 = view.readRemaining;
        }
        view != null ? (view.byteOrder = this.readByteOrder) : null;
        return view;
    };

    function Coroutine$discard_s8cxhz$($this, max_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$ = void 0;
        this.local$max = max_0;
    }

    Coroutine$discard_s8cxhz$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$discard_s8cxhz$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$discard_s8cxhz$.prototype.constructor = Coroutine$discard_s8cxhz$;
    Coroutine$discard_s8cxhz$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var discarded = this.$this.readable.discard_s8cxhz$(this.local$max);
                    if (equals(discarded, this.local$max) || this.$this.isClosedForRead) {
                        return discarded;
                    } else {
                        this.state_0 = 2;
                        this.result_0 = this.$this.discardSuspend_txuyzr$_0(this.local$max, discarded, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$ = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$;
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
    ByteChannelSequentialBase.prototype.discard_s8cxhz$ = function (max_0, continuation_0, suspended) {
        var instance = new Coroutine$discard_s8cxhz$(this, max_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$discardSuspend_txuyzr$_0($this, max_0, discarded0_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$discarded = void 0;
        this.local$max = max_0;
        this.local$discarded0 = discarded0_0;
    }

    Coroutine$discardSuspend_txuyzr$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$discardSuspend_txuyzr$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$discardSuspend_txuyzr$_0.prototype.constructor = Coroutine$discardSuspend_txuyzr$_0;
    Coroutine$discardSuspend_txuyzr$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$discarded = this.local$discarded0;
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.await_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (!this.result_0) {
                        this.state_0 = 5;
                        continue;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.local$discarded = this.local$discarded.add(this.$this.readable.discard_s8cxhz$(this.local$max.subtract(this.local$discarded)));
                    if (this.local$discarded.compareTo_11rb$(this.local$max) >= 0 || this.$this.isClosedForRead) {
                        this.state_0 = 5;
                        continue;
                    }
                    this.state_0 = 2;
                    continue;
                case 5:
                    return this.local$discarded;
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
    ByteChannelSequentialBase.prototype.discardSuspend_txuyzr$_0 = function (max_0, discarded0_0, continuation_0, suspended) {
        var instance = new Coroutine$discardSuspend_txuyzr$_0(this, max_0, discarded0_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.readSession_wf20rh$ = function (consumer) {
        try {
            consumer(this);
        } finally {
            this.completeReading_jdkw5m$_0();
        }
    };

    function Coroutine$readSuspendableSession_2gofpf$($this, consumer_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 5;
        this.$this = $this;
        this.local$consumer = consumer_0;
    }

    Coroutine$readSuspendableSession_2gofpf$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readSuspendableSession_2gofpf$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readSuspendableSession_2gofpf$.prototype.constructor = Coroutine$readSuspendableSession_2gofpf$;
    Coroutine$readSuspendableSession_2gofpf$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.exceptionState_0 = 3;
                    this.state_0 = 1;
                    this.result_0 = this.local$consumer(this.$this, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    this.exceptionState_0 = 5;
                    this.finallyPath_0 = [2];
                    this.state_0 = 4;
                    continue;
                case 2:
                    return;
                case 3:
                    this.finallyPath_0 = [5];
                    this.state_0 = 4;
                    continue;
                case 4:
                    this.exceptionState_0 = 5;
                    this.$this.completeReading_jdkw5m$_0();
                    this.state_0 = this.finallyPath_0.shift();
                    continue;
                case 5:
                    throw this.exception_0;
                default:
                    this.state_0 = 5;
                    throw new Error('State Machine Unreachable execution');
            }
        } catch (e) {
            if (this.state_0 === 5) {
                this.exceptionState_0 = this.state_0;
                throw e;
            } else {
                this.state_0 = this.exceptionState_0;
                this.exception_0 = e;
            }
        } while (true);
    };
    ByteChannelSequentialBase.prototype.readSuspendableSession_2gofpf$ = function (consumer_0, continuation_0, suspended) {
        var instance = new Coroutine$readSuspendableSession_2gofpf$(this, consumer_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda(this$ByteChannelSequentialBase_0, size_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$this$ByteChannelSequentialBase = this$ByteChannelSequentialBase_0;
        this.local$size = size_0;
    }

    Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda.prototype.constructor = Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda;
    Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$this$ByteChannelSequentialBase.afterRead();
                    this.state_0 = 2;
                    this.result_0 = this.local$this$ByteChannelSequentialBase.await_za3lpa$(this.local$size, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    return this.result_0 ? this.local$this$ByteChannelSequentialBase.readable : null;
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

    function ByteChannelSequentialBase$readUTF8LineTo$lambda(this$ByteChannelSequentialBase_0) {
        return function (size_0, continuation_0, suspended) {
            var instance = new Coroutine$ByteChannelSequentialBase$readUTF8LineTo$lambda(this$ByteChannelSequentialBase_0, size_0, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    ByteChannelSequentialBase.prototype.readUTF8LineTo_yhx0yw$ = function (out, limit, continuation) {
        if (this.isClosedForRead)
            return false;
        return decodeUTF8LineLoopSuspend(out, limit, ByteChannelSequentialBase$readUTF8LineTo$lambda(this), continuation);
    };

    function Coroutine$readUTF8Line_za3lpa$($this, limit_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$sb = void 0;
        this.local$limit = limit_0;
    }

    Coroutine$readUTF8Line_za3lpa$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readUTF8Line_za3lpa$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readUTF8Line_za3lpa$.prototype.constructor = Coroutine$readUTF8Line_za3lpa$;
    Coroutine$readUTF8Line_za3lpa$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$sb = StringBuilder_init();
                    this.state_0 = 2;
                    this.result_0 = this.$this.readUTF8LineTo_yhx0yw$(this.local$sb, this.local$limit, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (!this.result_0) {
                        return null;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 3:
                    return this.local$sb.toString();
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
    ByteChannelSequentialBase.prototype.readUTF8Line_za3lpa$ = function (limit_0, continuation_0, suspended) {
        var instance = new Coroutine$readUTF8Line_za3lpa$(this, limit_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.cancel_dbl4no$ = function (cause) {
        if (this.closedCause != null || this.closed)
            return false;
        return this.close_dbl4no$(cause != null ? cause : new CancellationException('Channel cancelled'));
    };
    ByteChannelSequentialBase.prototype.close_dbl4no$ = function (cause) {
        if (this.closed || this.closedCause != null)
            return false;
        this.closedCause = cause;
        this.closed = true;
        if (cause != null) {
            this.readable.release();
            this.writable.release();
        } else {
            this.flush();
        }
        this.atLeastNBytesAvailableForRead_q03xc0$_0.signal();
        this.atLeastNBytesAvailableForWrite_rbo04f$_0.signal();
        return true;
    };
    ByteChannelSequentialBase.prototype.transferTo_9mppk1$ = function (dst, limit) {
        var tmp$;
        var size = this.readable.remaining;
        if (size.compareTo_11rb$(limit) <= 0) {
            dst.writable.writePacket_8awntw$(this.readable);
            dst.afterWrite();
            this.afterRead();
            tmp$ = size;
        } else {
            tmp$ = L0;
        }
        return tmp$;
    };

    function Coroutine$readNSlow_cfq0pi$_0($this, n_0, block_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$n = n_0;
        this.local$block = block_0;
    }

    Coroutine$readNSlow_cfq0pi$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readNSlow_cfq0pi$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readNSlow_cfq0pi$_0.prototype.constructor = Coroutine$readNSlow_cfq0pi$_0;
    Coroutine$readNSlow_cfq0pi$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.awaitSuspend_za3lpa$(this.local$n, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (this.$this.readable.hasBytes_za3lpa$(this.local$n))
                        this.local$block();
                    this.$this.checkClosed_ry7trr$_0(this.local$n);
                    this.state_0 = 2;
                    continue;
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
    ByteChannelSequentialBase.prototype.readNSlow_cfq0pi$_0 = function (n_0, block_0, continuation_0, suspended) {
        var instance = new Coroutine$readNSlow_cfq0pi$_0(this, n_0, block_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$writeAvailableSuspend_xallvf$_0($this, src_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$src = src_0;
    }

    Coroutine$writeAvailableSuspend_xallvf$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeAvailableSuspend_xallvf$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeAvailableSuspend_xallvf$_0.prototype.constructor = Coroutine$writeAvailableSuspend_xallvf$_0;
    Coroutine$writeAvailableSuspend_xallvf$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitFreeSpace(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.writeAvailable_g6eaik$(this.local$src, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.writeAvailableSuspend_xallvf$_0 = function (src_0, continuation_0, suspended) {
        var instance = new Coroutine$writeAvailableSuspend_xallvf$_0(this, src_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$writeAvailableSuspend_f978it$_0($this, src_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$src = src_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$writeAvailableSuspend_f978it$_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeAvailableSuspend_f978it$_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeAvailableSuspend_f978it$_0.prototype.constructor = Coroutine$writeAvailableSuspend_f978it$_0;
    Coroutine$writeAvailableSuspend_f978it$_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.awaitFreeSpace(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.$this.writeAvailable_mj6st8$(this.local$src, this.local$offset, this.local$length, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
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
    ByteChannelSequentialBase.prototype.writeAvailableSuspend_f978it$_0 = function (src_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$writeAvailableSuspend_f978it$_0(this, src_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelSequentialBase.prototype.afterWrite = function () {
        var tmp$;
        if (this.closed) {
            this.writable.release();
            throw (tmp$ = this.closedCause) != null ? tmp$ : new ClosedWriteChannelException('Channel is already closed');
        }
        if (this.autoFlush || this.availableForWrite === 0) {
            this.flush();
        }
    };

    function ByteChannelSequentialBase$awaitFreeSpace$lambda(this$ByteChannelSequentialBase) {
        return function () {
            this$ByteChannelSequentialBase.flush();
            return Unit;
        };
    }

    ByteChannelSequentialBase.prototype.awaitFreeSpace = function (continuation) {
        this.afterWrite();
        return this.notFull_8be2vx$.await_o14v8n$(ByteChannelSequentialBase$awaitFreeSpace$lambda(this), continuation);
    };

    function ByteChannelSequentialBase$notFull$lambda(this$ByteChannelSequentialBase) {
        return function () {
            var $this = this$ByteChannelSequentialBase;
            return ($this.readable.remaining.toInt() + $this.writable.size | 0) <= L4088.toNumber();
        };
    }

    function ByteChannelSequentialBase$atLeastNBytesAvailableForWrite$lambda(this$ByteChannelSequentialBase) {
        return function () {
            return this$ByteChannelSequentialBase.availableForWrite >= this$ByteChannelSequentialBase.waitingForSize_5346xe$_0 || this$ByteChannelSequentialBase.closed;
        };
    }

    function ByteChannelSequentialBase$atLeastNBytesAvailableForRead$lambda(this$ByteChannelSequentialBase) {
        return function () {
            return this$ByteChannelSequentialBase.availableForRead >= this$ByteChannelSequentialBase.waitingForRead_53r213$_0 || this$ByteChannelSequentialBase.closed;
        };
    }

    ByteChannelSequentialBase.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'ByteChannelSequentialBase',
        interfaces: [SuspendableReadSession, ByteChannel, ByteWriteChannel, ByteReadChannel_4]
    };

    function readPacket($receiver, size, continuation) {
        return $receiver.readPacket_vux9f0$(size, 0, continuation);
    }

    function readRemaining($receiver, limit, continuation) {
        return $receiver.readRemaining_yhmem3$(limit, 0, continuation);
    }

    function readRemaining_0($receiver, continuation) {
        return $receiver.readRemaining_yhmem3$(Long$Companion$MAX_VALUE, 0, continuation);
    }

    function readFully($receiver, dst, continuation) {
        return $receiver.readFully_bj0s3a$(dst, dst.writeRemaining, continuation);
    }

    function readUTF8LineTo($receiver, out, continuation) {
        return $receiver.readUTF8LineTo_yhx0yw$(out, 2147483647, continuation);
    }

    function readUTF8Line($receiver, continuation) {
        return $receiver.readUTF8Line_za3lpa$(2147483647, continuation);
    }

    function cancel($receiver) {
        return $receiver.cancel_dbl4no$(null);
    }

    function discard($receiver, continuation) {
        return $receiver.discard_s8cxhz$(Long$Companion$MAX_VALUE, continuation);
    }

    function Coroutine$discardExact($receiver_0, n_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$n = n_0;
    }

    Coroutine$discardExact.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$discardExact.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$discardExact.prototype.constructor = Coroutine$discardExact;
    Coroutine$discardExact.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.discard_s8cxhz$(this.local$n, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (!equals(this.result_0, this.local$n))
                        throw new EOFException('Unable to discard ' + this.local$n.toString() + ' bytes');
                    return;
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

    function discardExact_0($receiver_0, n_0, continuation_0, suspended) {
        var instance = new Coroutine$discardExact($receiver_0, n_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.discardExact_5joj65$', wrapFunction(function () {
        var equals = Kotlin.equals;
        var EOFException_init = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.errors.EOFException;
        return function ($receiver, n, continuation) {
            Kotlin.suspendCall($receiver.discard_s8cxhz$(n, Kotlin.coroutineReceiver()));
            if (!equals(Kotlin.coroutineResult(Kotlin.coroutineReceiver()), n))
                throw new EOFException_init('Unable to discard ' + n.toString() + ' bytes');
        };
    }));

    function readAvailable($receiver, dst, continuation) {
        return $receiver.readAvailable_mj6st8$(dst, 0, dst.length, continuation);
    }

    function readFully_0($receiver, dst, continuation) {
        return $receiver.readFully_mj6st8$(dst, 0, dst.length, continuation);
    }

    function Coroutine$copyAndClose($receiver_0, dst_0, limit_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$dst = dst_0;
        this.local$limit = limit_0;
    }

    Coroutine$copyAndClose.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$copyAndClose.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$copyAndClose.prototype.constructor = Coroutine$copyAndClose;
    Coroutine$copyAndClose.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.local$limit === void 0)
                        this.local$limit = Long$Companion$MAX_VALUE;
                    this.state_0 = 2;
                    this.result_0 = copyTo_0(this.local$$receiver, this.local$dst, this.local$limit, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var count = this.result_0;
                    close(this.local$dst);
                    return count;
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

    function copyAndClose($receiver_0, dst_0, limit_0, continuation_0, suspended) {
        var instance = new Coroutine$copyAndClose($receiver_0, dst_0, limit_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function writeAvailable($receiver, src, continuation) {
        return $receiver.writeAvailable_mj6st8$(src, 0, src.length, continuation);
    }

    function writeFully_0($receiver, src, continuation) {
        return $receiver.writeFully_mj6st8$(src, 0, src.length, continuation);
    }

    function writeShort($receiver, s, continuation) {
        return $receiver.writeShort_mq22fl$(toShort(s & 65535), continuation);
    }

    function writeShort_0($receiver, s, byteOrder, continuation) {
        return writeShort_1($receiver, toShort(s & 65535), byteOrder, continuation);
    }

    function writeByte($receiver, b, continuation) {
        return $receiver.writeByte_s8j3t7$(toByte(b & 255), continuation);
    }

    function writeInt($receiver, i, continuation) {
        return $receiver.writeInt_za3lpa$(i.toInt(), continuation);
    }

    function writeInt_0($receiver, i, byteOrder, continuation) {
        return writeInt_1($receiver, i.toInt(), byteOrder, continuation);
    }

    function close($receiver) {
        return $receiver.close_dbl4no$(null);
    }

    function writeStringUtf8($receiver, s, continuation) {
        var buildPacket$result;
        var builder = BytePacketBuilder(0);
        try {
            builder.writeStringUtf8_6bul2c$(s);
            buildPacket$result = builder.build();
        } catch (t) {
            if (Kotlin.isType(t, Throwable)) {
                builder.release();
                throw t;
            } else
                throw t;
        }
        var packet = buildPacket$result;
        return $receiver.writePacket_8awntw$(packet, continuation);
    }

    function writeStringUtf8_0($receiver, s, continuation) {
        var buildPacket$result;
        var builder = BytePacketBuilder(0);
        try {
            builder.writeStringUtf8_61zpoe$(s);
            buildPacket$result = builder.build();
        } catch (t) {
            if (Kotlin.isType(t, Throwable)) {
                builder.release();
                throw t;
            } else
                throw t;
        }
        var packet = buildPacket$result;
        return $receiver.writePacket_8awntw$(packet, continuation);
    }

    function writeBoolean($receiver, b, continuation) {
        return writeByte($receiver, b ? 1 : 0, continuation);
    }

    function writeChar($receiver, ch, continuation) {
        return writeShort($receiver, ch | 0, continuation);
    }

    function writePacket($receiver, headerSizeHint, builder, continuation) {
        if (headerSizeHint === void 0)
            headerSizeHint = 0;
        var buildPacket$result_0;
        var builder_1 = BytePacketBuilder(headerSizeHint);
        try {
            builder(builder_1);
            buildPacket$result_0 = builder_1.build();
        } catch (t_0) {
            if (Kotlin.isType(t_0, Throwable)) {
                builder_1.release();
                throw t_0;
            } else
                throw t_0;
        }
        return $receiver.writePacket_8awntw$(buildPacket$result_0, continuation);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.writePacket_okw089$', wrapFunction(function () {
        var BytePacketBuilder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.BytePacketBuilder_za3lpa$;
        var Throwable = Error;
        return function ($receiver, headerSizeHint, builder, continuation) {
            if (headerSizeHint === void 0)
                headerSizeHint = 0;
            var buildPacket$result_0;
            var builder_1 = BytePacketBuilder(headerSizeHint);
            try {
                builder(builder_1);
                buildPacket$result_0 = builder_1.build();
            } catch (t_0) {
                if (Kotlin.isType(t_0, Throwable)) {
                    builder_1.release();
                    throw t_0;
                } else
                    throw t_0;
            }
            Kotlin.suspendCall($receiver.writePacket_8awntw$(buildPacket$result_0, Kotlin.coroutineReceiver()));
            return Kotlin.coroutineResult(Kotlin.coroutineReceiver());
        };
    }));

    function Coroutine$writePacketSuspend($receiver_0, builder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 5;
        this.local$buildPacket$result = void 0;
        this.local$builder = void 0;
        this.local$$receiver = $receiver_0;
        this.local$builder_0 = builder_0;
    }

    Coroutine$writePacketSuspend.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writePacketSuspend.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writePacketSuspend.prototype.constructor = Coroutine$writePacketSuspend;
    Coroutine$writePacketSuspend.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$builder = BytePacketBuilder(0);
                    this.exceptionState_0 = 2;
                    this.state_0 = 1;
                    this.result_0 = this.local$builder_0(this.local$builder, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    this.local$buildPacket$result = this.local$builder.build();
                    this.exceptionState_0 = 5;
                    this.state_0 = 3;
                    continue;
                case 2:
                    this.exceptionState_0 = 5;
                    var t = this.exception_0;
                    if (Kotlin.isType(t, Throwable)) {
                        this.local$builder.release();
                        throw t;
                    } else
                        throw t;
                case 3:
                    this.state_0 = 4;
                    this.result_0 = this.local$$receiver.writePacket_8awntw$(this.local$buildPacket$result, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 4:
                    return this.result_0;
                case 5:
                    throw this.exception_0;
                default:
                    this.state_0 = 5;
                    throw new Error('State Machine Unreachable execution');
            }
        } catch (e) {
            if (this.state_0 === 5) {
                this.exceptionState_0 = this.state_0;
                throw e;
            } else {
                this.state_0 = this.exceptionState_0;
                this.exception_0 = e;
            }
        } while (true);
    };

    function writePacketSuspend($receiver_0, builder_0, continuation_0, suspended) {
        var instance = new Coroutine$writePacketSuspend($receiver_0, builder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function ClosedWriteChannelException(message) {
        CancellationException.call(this, message);
        this.name = 'ClosedWriteChannelException';
    }

    ClosedWriteChannelException.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'ClosedWriteChannelException',
        interfaces: [CancellationException]
    };

    function Coroutine$readShort_0($receiver_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$readShort_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readShort_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readShort_0.prototype.constructor = Coroutine$readShort_0;
    Coroutine$readShort_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readShort(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var $receiver_1 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$_0 = $receiver_1;
                    else {
                        tmp$_0 = reverseByteOrder($receiver_1);
                    }
                    return tmp$_0;
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

    function readShort($receiver_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$readShort_0($receiver_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readShort_s4cdki$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_5vcgdc$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver_0, byteOrder, continuation) {
            Kotlin.suspendCall($receiver_0.readShort(Kotlin.coroutineReceiver()));
            var $receiver_1 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$_0 = $receiver_1;
            else {
                tmp$_0 = reverseByteOrder($receiver_1);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readInt_0($receiver_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$readInt_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readInt_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readInt_0.prototype.constructor = Coroutine$readInt_0;
    Coroutine$readInt_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readInt(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var $receiver_1 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$_0 = $receiver_1;
                    else {
                        tmp$_0 = reverseByteOrder_0($receiver_1);
                    }
                    return tmp$_0;
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

    function readInt($receiver_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$readInt_0($receiver_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readInt_s4cdki$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_s8ev3n$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver_0, byteOrder, continuation) {
            Kotlin.suspendCall($receiver_0.readInt(Kotlin.coroutineReceiver()));
            var $receiver_1 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$_0 = $receiver_1;
            else {
                tmp$_0 = reverseByteOrder($receiver_1);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readLong_0($receiver_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$readLong_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readLong_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readLong_0.prototype.constructor = Coroutine$readLong_0;
    Coroutine$readLong_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readLong(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var $receiver_1 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$_0 = $receiver_1;
                    else {
                        tmp$_0 = reverseByteOrder_1($receiver_1);
                    }
                    return tmp$_0;
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

    function readLong($receiver_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$readLong_0($receiver_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readLong_s4cdki$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_mts6qi$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver_0, byteOrder, continuation) {
            Kotlin.suspendCall($receiver_0.readLong(Kotlin.coroutineReceiver()));
            var $receiver_1 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$_0 = $receiver_1;
            else {
                tmp$_0 = reverseByteOrder($receiver_1);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readFloat_0($receiver_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$readFloat_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFloat_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFloat_0.prototype.constructor = Coroutine$readFloat_0;
    Coroutine$readFloat_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readFloat(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var $receiver_1 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$_0 = $receiver_1;
                    else {
                        tmp$_0 = reverseByteOrder_2($receiver_1);
                    }
                    return tmp$_0;
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

    function readFloat($receiver_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$readFloat_0($receiver_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readFloat_s4cdki$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_81szk$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver_0, byteOrder, continuation) {
            Kotlin.suspendCall($receiver_0.readFloat(Kotlin.coroutineReceiver()));
            var $receiver_1 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$_0 = $receiver_1;
            else {
                tmp$_0 = reverseByteOrder($receiver_1);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readDouble_0($receiver_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$readDouble_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readDouble_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readDouble_0.prototype.constructor = Coroutine$readDouble_0;
    Coroutine$readDouble_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readDouble(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var $receiver_1 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$_0 = $receiver_1;
                    else {
                        tmp$_0 = reverseByteOrder_3($receiver_1);
                    }
                    return tmp$_0;
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

    function readDouble($receiver_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$readDouble_0($receiver_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readDouble_s4cdki$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_yrwdxr$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver_0, byteOrder, continuation) {
            Kotlin.suspendCall($receiver_0.readDouble(Kotlin.coroutineReceiver()));
            var $receiver_1 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$_0 = $receiver_1;
            else {
                tmp$_0 = reverseByteOrder($receiver_1);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readShortLittleEndian($receiver_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$readShortLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readShortLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readShortLittleEndian.prototype.constructor = Coroutine$readShortLittleEndian;
    Coroutine$readShortLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readShort(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var value_0 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$$receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$_0 = value_0;
                    else {
                        tmp$_0 = reverseByteOrder(value_0);
                    }
                    return tmp$_0;
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

    function readShortLittleEndian($receiver_0, continuation_0, suspended) {
        var instance = new Coroutine$readShortLittleEndian($receiver_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readShortLittleEndian_ep79e2$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_5vcgdc$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, continuation) {
            Kotlin.suspendCall($receiver.readShort(Kotlin.coroutineReceiver()));
            var value_0 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$_0 = value_0;
            else {
                tmp$_0 = reverseByteOrder(value_0);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readIntLittleEndian($receiver_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$readIntLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readIntLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readIntLittleEndian.prototype.constructor = Coroutine$readIntLittleEndian;
    Coroutine$readIntLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readInt(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var value_0 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$$receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$_0 = value_0;
                    else {
                        tmp$_0 = reverseByteOrder_0(value_0);
                    }
                    return tmp$_0;
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

    function readIntLittleEndian($receiver_0, continuation_0, suspended) {
        var instance = new Coroutine$readIntLittleEndian($receiver_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readIntLittleEndian_ep79e2$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_s8ev3n$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, continuation) {
            Kotlin.suspendCall($receiver.readInt(Kotlin.coroutineReceiver()));
            var value_0 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$_0 = value_0;
            else {
                tmp$_0 = reverseByteOrder(value_0);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readLongLittleEndian($receiver_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$readLongLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readLongLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readLongLittleEndian.prototype.constructor = Coroutine$readLongLittleEndian;
    Coroutine$readLongLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readLong(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var value_0 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$$receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$_0 = value_0;
                    else {
                        tmp$_0 = reverseByteOrder_1(value_0);
                    }
                    return tmp$_0;
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

    function readLongLittleEndian($receiver_0, continuation_0, suspended) {
        var instance = new Coroutine$readLongLittleEndian($receiver_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readLongLittleEndian_ep79e2$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_mts6qi$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, continuation) {
            Kotlin.suspendCall($receiver.readLong(Kotlin.coroutineReceiver()));
            var value_0 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$_0 = value_0;
            else {
                tmp$_0 = reverseByteOrder(value_0);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readFloatLittleEndian($receiver_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$readFloatLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFloatLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFloatLittleEndian.prototype.constructor = Coroutine$readFloatLittleEndian;
    Coroutine$readFloatLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readFloat(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var value_0 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$$receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$_0 = value_0;
                    else {
                        tmp$_0 = reverseByteOrder_2(value_0);
                    }
                    return tmp$_0;
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

    function readFloatLittleEndian($receiver_0, continuation_0, suspended) {
        var instance = new Coroutine$readFloatLittleEndian($receiver_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readFloatLittleEndian_ep79e2$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_81szk$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, continuation) {
            Kotlin.suspendCall($receiver.readFloat(Kotlin.coroutineReceiver()));
            var value_0 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$_0 = value_0;
            else {
                tmp$_0 = reverseByteOrder(value_0);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$readDoubleLittleEndian($receiver_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$readDoubleLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readDoubleLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readDoubleLittleEndian.prototype.constructor = Coroutine$readDoubleLittleEndian;
    Coroutine$readDoubleLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.readDouble(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    var value_0 = this.result_0;
                    var tmp$_0;
                    if (equals(this.local$$receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$_0 = value_0;
                    else {
                        tmp$_0 = reverseByteOrder_3(value_0);
                    }
                    return tmp$_0;
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

    function readDoubleLittleEndian($receiver_0, continuation_0, suspended) {
        var instance = new Coroutine$readDoubleLittleEndian($receiver_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.readDoubleLittleEndian_ep79e2$', wrapFunction(function () {
        var reverseByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.bits.reverseByteOrder_yrwdxr$;
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, continuation) {
            Kotlin.suspendCall($receiver.readDouble(Kotlin.coroutineReceiver()));
            var value_0 = Kotlin.coroutineResult(Kotlin.coroutineReceiver());
            var tmp$_0;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$_0 = value_0;
            else {
                tmp$_0 = reverseByteOrder(value_0);
            }
            return tmp$_0;
        };
    }));

    function Coroutine$writeShort($receiver_0, value_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$writeShort.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeShort.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeShort.prototype.constructor = Coroutine$writeShort;
    Coroutine$writeShort.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeShort_mq22fl$(tmp$, this);
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

    function writeShort_1($receiver_0, value_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$writeShort($receiver_0, value_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeInt($receiver_0, value_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$writeInt.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeInt.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeInt.prototype.constructor = Coroutine$writeInt;
    Coroutine$writeInt.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_0(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeInt_za3lpa$(tmp$, this);
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

    function writeInt_1($receiver_0, value_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$writeInt($receiver_0, value_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeLong($receiver_0, value_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$writeLong.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeLong.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeLong.prototype.constructor = Coroutine$writeLong;
    Coroutine$writeLong.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_1(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeLong_s8cxhz$(tmp$, this);
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

    function writeLong($receiver_0, value_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$writeLong($receiver_0, value_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeFloat($receiver_0, value_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$writeFloat.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeFloat.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeFloat.prototype.constructor = Coroutine$writeFloat;
    Coroutine$writeFloat.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_2(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeFloat_mx4ult$(tmp$, this);
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

    function writeFloat($receiver_0, value_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$writeFloat($receiver_0, value_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeDouble($receiver_0, value_0, byteOrder_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
        this.local$byteOrder = byteOrder_0;
    }

    Coroutine$writeDouble.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeDouble.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeDouble.prototype.constructor = Coroutine$writeDouble;
    Coroutine$writeDouble.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$byteOrder, ByteOrder.BIG_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_3(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeDouble_14dthe$(tmp$, this);
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

    function writeDouble($receiver_0, value_0, byteOrder_0, continuation_0, suspended) {
        var instance = new Coroutine$writeDouble($receiver_0, value_0, byteOrder_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeShortLittleEndian($receiver_0, value_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
    }

    Coroutine$writeShortLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeShortLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeShortLittleEndian.prototype.constructor = Coroutine$writeShortLittleEndian;
    Coroutine$writeShortLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$$receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeShort_mq22fl$(tmp$, this);
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

    function writeShortLittleEndian($receiver_0, value_0, continuation_0, suspended) {
        var instance = new Coroutine$writeShortLittleEndian($receiver_0, value_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeIntLittleEndian($receiver_0, value_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
    }

    Coroutine$writeIntLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeIntLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeIntLittleEndian.prototype.constructor = Coroutine$writeIntLittleEndian;
    Coroutine$writeIntLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$$receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_0(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeInt_za3lpa$(tmp$, this);
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

    function writeIntLittleEndian($receiver_0, value_0, continuation_0, suspended) {
        var instance = new Coroutine$writeIntLittleEndian($receiver_0, value_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeLongLittleEndian($receiver_0, value_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
    }

    Coroutine$writeLongLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeLongLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeLongLittleEndian.prototype.constructor = Coroutine$writeLongLittleEndian;
    Coroutine$writeLongLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$$receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_1(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeLong_s8cxhz$(tmp$, this);
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

    function writeLongLittleEndian($receiver_0, value_0, continuation_0, suspended) {
        var instance = new Coroutine$writeLongLittleEndian($receiver_0, value_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeFloatLittleEndian($receiver_0, value_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
    }

    Coroutine$writeFloatLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeFloatLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeFloatLittleEndian.prototype.constructor = Coroutine$writeFloatLittleEndian;
    Coroutine$writeFloatLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$$receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_2(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeFloat_mx4ult$(tmp$, this);
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

    function writeFloatLittleEndian($receiver_0, value_0, continuation_0, suspended) {
        var instance = new Coroutine$writeFloatLittleEndian($receiver_0, value_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$writeDoubleLittleEndian($receiver_0, value_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$value = value_0;
    }

    Coroutine$writeDoubleLittleEndian.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$writeDoubleLittleEndian.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$writeDoubleLittleEndian.prototype.constructor = Coroutine$writeDoubleLittleEndian;
    Coroutine$writeDoubleLittleEndian.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (equals(this.local$$receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
                        tmp$ = this.local$value;
                    else {
                        tmp$ = reverseByteOrder_3(this.local$value);
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$$receiver.writeDouble_14dthe$(tmp$, this);
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

    function writeDoubleLittleEndian($receiver_0, value_0, continuation_0, suspended) {
        var instance = new Coroutine$writeDoubleLittleEndian($receiver_0, value_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    var toLittleEndian = defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.toLittleEndian_2q0caa$', wrapFunction(function () {
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, value, reverseBlock) {
            var tmp$;
            if (equals($receiver.readByteOrder, ByteOrder.LITTLE_ENDIAN))
                tmp$ = value;
            else
                tmp$ = reverseBlock(value);
            return tmp$;
        };
    }));

    function toLittleEndian_0($receiver, value, reverseBlock) {
        var tmp$;
        if (equals($receiver.writeByteOrder, ByteOrder.LITTLE_ENDIAN))
            tmp$ = value;
        else
            tmp$ = reverseBlock(value);
        return tmp$;
    }

    var reverseIfNeeded = defineInlineFunction('kotlinx-coroutines-io.kotlinx.coroutines.io.reverseIfNeeded_5i8cf7$', wrapFunction(function () {
        var ByteOrder = _.$$importsForInline$$['kotlinx-io'].kotlinx.io.core.ByteOrder;
        var equals = Kotlin.equals;
        return function ($receiver, byteOrder, reverseBlock) {
            var tmp$;
            if (equals(byteOrder, ByteOrder.BIG_ENDIAN))
                tmp$ = $receiver;
            else
                tmp$ = reverseBlock($receiver);
            return tmp$;
        };
    }));

    function ReaderJob() {
    }

    ReaderJob.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ReaderJob',
        interfaces: [Job]
    };

    function WriterJob() {
    }

    WriterJob.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'WriterJob',
        interfaces: [Job]
    };

    function ReaderScope() {
    }

    ReaderScope.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ReaderScope',
        interfaces: [CoroutineScope]
    };

    function WriterScope() {
    }

    WriterScope.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'WriterScope',
        interfaces: [CoroutineScope]
    };

    function reader($receiver, coroutineContext, channel, block) {
        if (coroutineContext === void 0)
            coroutineContext = coroutines.EmptyCoroutineContext;
        return launchChannel($receiver, coroutineContext, channel, false, block);
    }

    function reader_0($receiver, coroutineContext, autoFlush, block) {
        if (coroutineContext === void 0)
            coroutineContext = coroutines.EmptyCoroutineContext;
        if (autoFlush === void 0)
            autoFlush = false;
        return launchChannel($receiver, coroutineContext, ByteChannel_1(autoFlush), true, block);
    }

    function reader_1(coroutineContext, channel, parent, block) {
        if (parent === void 0)
            parent = null;
        var newContext = parent != null ? newCoroutineContext(coroutines_0.GlobalScope, coroutineContext.plus_1fupul$(parent)) : newCoroutineContext(coroutines_0.GlobalScope, coroutineContext);
        return reader(CoroutineScope_0(newContext), coroutines.EmptyCoroutineContext, channel, block);
    }

    function reader_2(coroutineContext, autoFlush, parent, block) {
        if (autoFlush === void 0)
            autoFlush = false;
        if (parent === void 0)
            parent = null;
        var channel = ByteChannel_1(autoFlush);
        var $receiver = reader_1(coroutineContext, channel, parent, block);
        channel.attachJob_dqr1mp$($receiver);
        return $receiver;
    }

    function writer($receiver, coroutineContext, channel, block) {
        if (coroutineContext === void 0)
            coroutineContext = coroutines.EmptyCoroutineContext;
        return launchChannel($receiver, coroutineContext, channel, false, block);
    }

    function writer_0($receiver, coroutineContext, autoFlush, block) {
        if (coroutineContext === void 0)
            coroutineContext = coroutines.EmptyCoroutineContext;
        if (autoFlush === void 0)
            autoFlush = false;
        return launchChannel($receiver, coroutineContext, ByteChannel_1(autoFlush), true, block);
    }

    function writer_1(coroutineContext, channel, parent, block) {
        if (parent === void 0)
            parent = null;
        var newContext = parent != null ? newCoroutineContext(coroutines_0.GlobalScope, coroutineContext.plus_1fupul$(parent)) : newCoroutineContext(coroutines_0.GlobalScope, coroutineContext);
        return writer(CoroutineScope_0(newContext), coroutines.EmptyCoroutineContext, channel, block);
    }

    function writer_2(coroutineContext, autoFlush, parent, block) {
        if (autoFlush === void 0)
            autoFlush = false;
        if (parent === void 0)
            parent = null;
        var channel = ByteChannel_1(autoFlush);
        var $receiver = writer_1(coroutineContext, channel, parent, block);
        channel.attachJob_dqr1mp$($receiver);
        return $receiver;
    }

    function Coroutine$launchChannel$lambda(closure$attachJob_0, closure$channel_0, closure$block_0, $receiver_0, controller, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.$controller = controller;
        this.exceptionState_0 = 1;
        this.local$closure$attachJob = closure$attachJob_0;
        this.local$closure$channel = closure$channel_0;
        this.local$closure$block = closure$block_0;
        this.local$$receiver = $receiver_0;
    }

    Coroutine$launchChannel$lambda.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$launchChannel$lambda.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$launchChannel$lambda.prototype.constructor = Coroutine$launchChannel$lambda;
    Coroutine$launchChannel$lambda.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (this.local$closure$attachJob) {
                        this.local$closure$channel.attachJob_dqr1mp$(ensureNotNull(this.local$$receiver.coroutineContext.get_j3r2sn$(Job.Key)));
                    }
                    this.state_0 = 2;
                    this.result_0 = this.local$closure$block(Kotlin.isType(tmp$ = new ChannelScope(this.local$$receiver, this.local$closure$channel), CoroutineScope) ? tmp$ : throwCCE(), this);
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
        } while (true);
    };

    function launchChannel$lambda(closure$attachJob_0, closure$channel_0, closure$block_0) {
        return function ($receiver_0, continuation_0, suspended) {
            var instance = new Coroutine$launchChannel$lambda(closure$attachJob_0, closure$channel_0, closure$block_0, $receiver_0, this, continuation_0);
            if (suspended)
                return instance;
            else
                return instance.doResume(null);
        };
    }

    function launchChannel$lambda_0(closure$channel) {
        return function (cause) {
            closure$channel.close_dbl4no$(cause);
            return Unit;
        };
    }

    function launchChannel($receiver, context, channel, attachJob, block) {
        var job = launch($receiver, context, void 0, launchChannel$lambda(attachJob, channel, block));
        job.invokeOnCompletion_f05bi3$(launchChannel$lambda_0(channel));
        return new ChannelJob(job, channel);
    }

    function ChannelScope(delegate, channel) {
        this.channel_4gjax4$_0 = channel;
        this.$delegate_c95e3n$_0 = delegate;
    }

    Object.defineProperty(ChannelScope.prototype, 'channel', {
        get: function () {
            return this.channel_4gjax4$_0;
        }
    });
    Object.defineProperty(ChannelScope.prototype, 'coroutineContext', {
        get: function () {
            return this.$delegate_c95e3n$_0.coroutineContext;
        }
    });
    ChannelScope.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'ChannelScope',
        interfaces: [WriterScope, ReaderScope, CoroutineScope]
    };

    function ChannelJob(delegate, channel) {
        this.channel_i5u4qn$_0 = channel;
        this.$delegate_3ev4sa$_0 = delegate;
    }

    Object.defineProperty(ChannelJob.prototype, 'channel', {
        get: function () {
            return this.channel_i5u4qn$_0;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'children', {
        get: function () {
            return this.$delegate_3ev4sa$_0.children;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'isActive', {
        get: function () {
            return this.$delegate_3ev4sa$_0.isActive;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'isCancelled', {
        get: function () {
            return this.$delegate_3ev4sa$_0.isCancelled;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'isCompleted', {
        get: function () {
            return this.$delegate_3ev4sa$_0.isCompleted;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'key', {
        get: function () {
            return this.$delegate_3ev4sa$_0.key;
        }
    });
    Object.defineProperty(ChannelJob.prototype, 'onJoin', {
        get: function () {
            return this.$delegate_3ev4sa$_0.onJoin;
        }
    });
    ChannelJob.prototype.attachChild_kx8v25$ = function (child) {
        return this.$delegate_3ev4sa$_0.attachChild_kx8v25$(child);
    };
    ChannelJob.prototype.cancel = function () {
        return this.$delegate_3ev4sa$_0.cancel();
    };
    ChannelJob.prototype.cancel_dbl4no$$default = function (cause) {
        return this.$delegate_3ev4sa$_0.cancel_dbl4no$$default(cause);
    };
    ChannelJob.prototype.cancel_m4sck1$$default = function (cause) {
        return this.$delegate_3ev4sa$_0.cancel_m4sck1$$default(cause);
    };
    ChannelJob.prototype.fold_3cc69b$ = function (initial, operation) {
        return this.$delegate_3ev4sa$_0.fold_3cc69b$(initial, operation);
    };
    ChannelJob.prototype.get_j3r2sn$ = function (key) {
        return this.$delegate_3ev4sa$_0.get_j3r2sn$(key);
    };
    ChannelJob.prototype.getCancellationException = function () {
        return this.$delegate_3ev4sa$_0.getCancellationException();
    };
    ChannelJob.prototype.invokeOnCompletion_ct2b2z$$default = function (onCancelling, invokeImmediately, handler) {
        return this.$delegate_3ev4sa$_0.invokeOnCompletion_ct2b2z$$default(onCancelling, invokeImmediately, handler);
    };
    ChannelJob.prototype.invokeOnCompletion_f05bi3$ = function (handler) {
        return this.$delegate_3ev4sa$_0.invokeOnCompletion_f05bi3$(handler);
    };
    ChannelJob.prototype.join = function (continuation) {
        return this.$delegate_3ev4sa$_0.join(continuation);
    };
    ChannelJob.prototype.minusKey_yeqjby$ = function (key) {
        return this.$delegate_3ev4sa$_0.minusKey_yeqjby$(key);
    };
    ChannelJob.prototype.plus_1fupul$ = function (context) {
        return this.$delegate_3ev4sa$_0.plus_1fupul$(context);
    };
    ChannelJob.prototype.plus_dqr1mp$ = function (other) {
        return this.$delegate_3ev4sa$_0.plus_dqr1mp$(other);
    };
    ChannelJob.prototype.start = function () {
        return this.$delegate_3ev4sa$_0.start();
    };
    ChannelJob.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'ChannelJob',
        interfaces: [WriterJob, ReaderJob, Job]
    };

    function ByteChannel_0(autoFlush) {
        if (autoFlush === void 0)
            autoFlush = false;
        return ByteChannel_1(autoFlush);
    }

    function ByteReadChannel_0(content, offset, length) {
        if (offset === void 0)
            offset = 0;
        if (length === void 0)
            length = content.length;
        return ByteReadChannel_2(content, offset, length);
    }

    function ByteReadChannel_1(text, charset) {
        if (charset === void 0)
            charset = charsets.Charsets.UTF_8;
        return ByteReadChannel(text, charset);
    }

    function reader_3(coroutineContext, channel, parent, block) {
        if (parent === void 0)
            parent = null;
        return reader_1(coroutineContext, channel, parent, block);
    }

    function reader_4(coroutineContext, autoFlush, parent, block) {
        if (autoFlush === void 0)
            autoFlush = false;
        if (parent === void 0)
            parent = null;
        return reader_2(coroutineContext, autoFlush, parent, block);
    }

    function writer_3(coroutineContext, channel, parent, block) {
        if (parent === void 0)
            parent = null;
        return writer_1(coroutineContext, channel, parent, block);
    }

    function writer_4(coroutineContext, autoFlush, parent, block) {
        if (autoFlush === void 0)
            autoFlush = false;
        if (parent === void 0)
            parent = null;
        return writer_2(coroutineContext, autoFlush, parent, block);
    }

    function ReadSession() {
    }

    ReadSession.prototype.request_za3lpa$ = function (atLeast, callback$default) {
        if (atLeast === void 0)
            atLeast = 1;
        return callback$default ? callback$default(atLeast) : this.request_za3lpa$$default(atLeast);
    };
    ReadSession.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ReadSession',
        interfaces: []
    };

    function SuspendableReadSession() {
    }

    SuspendableReadSession.prototype.await_za3lpa$ = function (atLeast, continuation, callback$default) {
        if (atLeast === void 0)
            atLeast = 1;
        return callback$default ? callback$default(atLeast, continuation) : this.await_za3lpa$$default(atLeast, continuation);
    };
    SuspendableReadSession.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'SuspendableReadSession',
        interfaces: [ReadSession]
    };

    function WriterSession() {
    }

    WriterSession.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'WriterSession',
        interfaces: []
    };

    function WriterSuspendSession() {
    }

    WriterSuspendSession.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'WriterSuspendSession',
        interfaces: [WriterSession]
    };

    function Coroutine$joinToImpl($receiver_0, dst_0, closeOnEnd_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$dst = dst_0;
        this.local$closeOnEnd = closeOnEnd_0;
    }

    Coroutine$joinToImpl.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$joinToImpl.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$joinToImpl.prototype.constructor = Coroutine$joinToImpl;
    Coroutine$joinToImpl.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = copyToSequentialImpl(this.local$$receiver, this.local$dst, Long$Companion$MAX_VALUE, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (this.local$closeOnEnd)
                        close(this.local$dst);
                    return;
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

    function joinToImpl($receiver_0, dst_0, closeOnEnd_0, continuation_0, suspended) {
        var instance = new Coroutine$joinToImpl($receiver_0, dst_0, closeOnEnd_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$copyToSequentialImpl($receiver_0, dst_0, limit_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$tmp$ = void 0;
        this.local$remainingLimit = void 0;
        this.local$transferred = void 0;
        this.local$tail = void 0;
        this.local$$receiver = $receiver_0;
        this.local$dst = dst_0;
        this.local$limit = limit_0;
    }

    Coroutine$copyToSequentialImpl.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$copyToSequentialImpl.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$copyToSequentialImpl.prototype.constructor = Coroutine$copyToSequentialImpl;
    Coroutine$copyToSequentialImpl.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (!(this.local$$receiver !== this.local$dst)) {
                        var message = 'Failed requirement.';
                        throw IllegalArgumentException_init(message.toString());
                    }
                    this.local$remainingLimit = this.local$limit;
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = this.local$$receiver.awaitInternalAtLeast1_8be2vx$(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    if (!this.result_0) {
                        this.state_0 = 10;
                        continue;
                    } else {
                        this.state_0 = 4;
                        continue;
                    }
                case 4:
                    this.local$transferred = this.local$$receiver.transferTo_9mppk1$(this.local$dst, this.local$remainingLimit);
                    if (equals(this.local$transferred, L0)) {
                        this.state_0 = 7;
                        this.result_0 = copyToTail(this.local$$receiver, this.local$dst, this.local$remainingLimit, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        if (this.local$dst.availableForWrite === 0) {
                            this.state_0 = 5;
                            this.result_0 = this.local$dst.notFull_8be2vx$.await(this);
                            if (this.result_0 === COROUTINE_SUSPENDED)
                                return COROUTINE_SUSPENDED;
                            continue;
                        } else {
                            this.state_0 = 6;
                            continue;
                        }
                    }
                case 5:
                    this.state_0 = 6;
                    continue;
                case 6:
                    this.local$tmp$ = this.local$transferred;
                    this.state_0 = 9;
                    continue;
                case 7:
                    this.local$tail = this.result_0;
                    if (equals(this.local$tail, L0)) {
                        this.state_0 = 10;
                        continue;
                    } else {
                        this.state_0 = 8;
                        continue;
                    }
                case 8:
                    this.local$tmp$ = this.local$tail;
                    this.state_0 = 9;
                    continue;
                case 9:
                    var copied = this.local$tmp$;
                    this.local$remainingLimit = this.local$remainingLimit.subtract(copied);
                    this.state_0 = 2;
                    continue;
                case 10:
                    return this.local$limit.subtract(this.local$remainingLimit);
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

    function copyToSequentialImpl($receiver_0, dst_0, limit_0, continuation_0, suspended) {
        var instance = new Coroutine$copyToSequentialImpl($receiver_0, dst_0, limit_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function Coroutine$copyToTail($receiver_0, dst_0, limit_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 9;
        this.local$lastPiece = void 0;
        this.local$rc = void 0;
        this.local$$receiver = $receiver_0;
        this.local$dst = dst_0;
        this.local$limit = limit_0;
    }

    Coroutine$copyToTail.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$copyToTail.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$copyToTail.prototype.constructor = Coroutine$copyToTail;
    Coroutine$copyToTail.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$lastPiece = IoBuffer.Companion.Pool.borrow();
                    this.exceptionState_0 = 7;
                    this.local$lastPiece.resetForWrite_za3lpa$(coerceAtMost(this.local$limit, Kotlin.Long.fromInt(this.local$lastPiece.capacity)).toInt());
                    this.state_0 = 1;
                    this.result_0 = this.local$$receiver.readAvailable_g6eaik$(this.local$lastPiece, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    this.local$rc = this.result_0;
                    if (this.local$rc === -1) {
                        this.local$lastPiece.release_cqjh9i$(IoBuffer.Companion.Pool);
                        this.exceptionState_0 = 9;
                        this.finallyPath_0 = [2];
                        this.state_0 = 8;
                        this.$returnValue = L0;
                        continue;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 2:
                    return this.$returnValue;
                case 3:
                    this.state_0 = 4;
                    this.result_0 = this.local$dst.writeFully_g6eaik$(this.local$lastPiece, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 4:
                    this.exceptionState_0 = 9;
                    this.finallyPath_0 = [5];
                    this.state_0 = 8;
                    this.$returnValue = Kotlin.Long.fromInt(this.local$rc);
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
                    this.local$lastPiece.release_cqjh9i$(IoBuffer.Companion.Pool);
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

    function copyToTail($receiver_0, dst_0, limit_0, continuation_0, suspended) {
        var instance = new Coroutine$copyToTail($receiver_0, dst_0, limit_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function ByteChannel_1(autoFlush) {
        if (autoFlush === void 0)
            autoFlush = false;
        return new ByteChannelJS(IoBuffer.Companion.Empty, autoFlush);
    }

    function ByteReadChannel_2(content, offset, length) {
        if (offset === void 0)
            offset = 0;
        if (length === void 0)
            length = content.length;
        if (content.length === 0)
            return ByteReadChannel$Companion_getInstance().Empty;
        var head = IoBuffer.Companion.Pool.borrow();
        var tail = head;
        var start = offset;
        var end = start + length | 0;
        while (true) {
            tail.reserveEndGap_za3lpa$(8);
            var a = end - start | 0;
            var b = tail.writeRemaining;
            var size = Math_0.min(a, b);
            tail.writeFully_mj6st8$(content, start, size);
            start = start + size | 0;
            if (start === end)
                break;
            tail = IoBuffer.Companion.Pool.borrow();
        }
        var $receiver = new ByteChannelJS(head, false);
        close($receiver);
        return $receiver;
    }

    function ByteReadChannel_3(content) {
        if (content.byteLength === 0)
            return ByteReadChannel$Companion_getInstance().Empty;
        var head = IoBuffer.Companion.Pool.borrow();
        var tail = head;
        var start = 0;
        var remaining = content.byteLength - content.byteOffset | 0;
        while (true) {
            tail.reserveEndGap_za3lpa$(8);
            var a = remaining;
            var b = tail.writeRemaining;
            var size = Math_0.min(a, b);
            tail.writeFully_p0d4q1$(content, start, size);
            start = start + size | 0;
            remaining = remaining - size | 0;
            if (remaining === 0)
                break;
            tail = IoBuffer.Companion.Pool.borrow();
        }
        var $receiver = new ByteChannelJS(head, false);
        close($receiver);
        return $receiver;
    }

    function Coroutine$joinTo($receiver_0, dst_0, closeOnEnd_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.local$$receiver = $receiver_0;
        this.local$dst = dst_0;
        this.local$closeOnEnd = closeOnEnd_0;
    }

    Coroutine$joinTo.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$joinTo.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$joinTo.prototype.constructor = Coroutine$joinTo;
    Coroutine$joinTo.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$, tmp$_0;
                    this.state_0 = 2;
                    this.result_0 = joinToImpl(Kotlin.isType(tmp$ = this.local$$receiver, ByteChannelSequentialBase) ? tmp$ : throwCCE(), Kotlin.isType(tmp$_0 = this.local$dst, ByteChannelSequentialBase) ? tmp$_0 : throwCCE(), this.local$closeOnEnd, this);
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

    function joinTo_0($receiver_0, dst_0, closeOnEnd_0, continuation_0, suspended) {
        var instance = new Coroutine$joinTo($receiver_0, dst_0, closeOnEnd_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    }

    function copyTo_0($receiver, dst, limit, continuation) {
        if (limit === void 0)
            limit = Long$Companion$MAX_VALUE;
        var tmp$, tmp$_0;
        return copyToSequentialImpl(Kotlin.isType(tmp$ = $receiver, ByteChannelSequentialBase) ? tmp$ : throwCCE(), Kotlin.isType(tmp$_0 = dst, ByteChannelSequentialBase) ? tmp$_0 : throwCCE(), limit, continuation);
    }

    function ByteChannelJS(initial, autoFlush) {
        ByteChannelSequentialBase.call(this, initial, autoFlush);
        this.attachedJob_0 = null;
    }

    function ByteChannelJS$attachJob$lambda(this$ByteChannelJS) {
        return function (cause) {
            this$ByteChannelJS.attachedJob_0 = null;
            if (cause != null) {
                this$ByteChannelJS.cancel_dbl4no$(new CancellationException('Channel closed due to job failure: ' + toString(cause)));
            }
            return Unit;
        };
    }

    ByteChannelJS.prototype.attachJob_dqr1mp$ = function (job) {
        var tmp$;
        (tmp$ = this.attachedJob_0) != null ? (tmp$.cancel_m4sck1$() , Unit) : null;
        this.attachedJob_0 = job;
        job.invokeOnCompletion_ct2b2z$(true, void 0, ByteChannelJS$attachJob$lambda(this));
    };

    function Coroutine$readAvailable_qmgm5g$($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$tmp$_0 = void 0;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readAvailable_qmgm5g$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailable_qmgm5g$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailable_qmgm5g$.prototype.constructor = Coroutine$readAvailable_qmgm5g$;
    Coroutine$readAvailable_qmgm5g$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    var tmp$;
                    if (this.$this.readable.isEmpty) {
                        this.state_0 = 2;
                        this.result_0 = this.$this.readAvailableSuspend_0(this.local$dst, this.local$offset, this.local$length, this);
                        if (this.result_0 === COROUTINE_SUSPENDED)
                            return COROUTINE_SUSPENDED;
                        continue;
                    } else {
                        if ((tmp$ = this.$this.closedCause) != null) {
                            throw tmp$;
                        }
                        this.local$tmp$_0 = this.$this.readable.readAvailable_qmgm5g$(this.local$dst, this.local$offset, this.local$length);
                        this.state_0 = 3;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.local$tmp$_0 = this.result_0;
                    this.state_0 = 3;
                    continue;
                case 3:
                    return this.local$tmp$_0;
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
    ByteChannelJS.prototype.readAvailable_qmgm5g$ = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailable_qmgm5g$(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Coroutine$readAvailableSuspend_0($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readAvailableSuspend_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readAvailableSuspend_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readAvailableSuspend_0.prototype.constructor = Coroutine$readAvailableSuspend_0;
    Coroutine$readAvailableSuspend_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.state_0 = 2;
                    this.result_0 = this.$this.await_za3lpa$(1, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (!this.result_0) {
                        return -1;
                    } else {
                        this.state_0 = 3;
                        continue;
                    }
                case 3:
                    this.state_0 = 4;
                    this.result_0 = this.$this.readAvailable_qmgm5g$(this.local$dst, this.local$offset, this.local$length, this);
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
    ByteChannelJS.prototype.readAvailableSuspend_0 = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readAvailableSuspend_0(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelJS.prototype.readFully_qmgm5g$ = function (dst, offset, length, continuation) {
        var tmp$;
        if (this.availableForRead >= length) {
            if ((tmp$ = this.closedCause) != null) {
                throw tmp$;
            }
            this.readable.readFully_qmgm5g$(dst, offset, length);
            return;
        }
        return this.readFullySuspend_0(dst, offset, length, continuation);
    };

    function Coroutine$readFullySuspend_0($this, dst_0, offset_0, length_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$start = void 0;
        this.local$end = void 0;
        this.local$remaining = void 0;
        this.local$dst = dst_0;
        this.local$offset = offset_0;
        this.local$length = length_0;
    }

    Coroutine$readFullySuspend_0.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$readFullySuspend_0.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$readFullySuspend_0.prototype.constructor = Coroutine$readFullySuspend_0;
    Coroutine$readFullySuspend_0.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    this.local$start = this.local$offset;
                    this.local$end = this.local$offset + this.local$length | 0;
                    this.local$remaining = this.local$length;
                    this.state_0 = 2;
                    continue;
                case 1:
                    throw this.exception_0;
                case 2:
                    if (this.local$start >= this.local$end) {
                        this.state_0 = 4;
                        continue;
                    }
                    this.state_0 = 3;
                    this.result_0 = this.$this.readAvailable_qmgm5g$(this.local$dst, this.local$start, this.local$remaining, this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    var rc = this.result_0;
                    if (rc === -1)
                        throw new EOFException('Premature end of stream: required ' + this.local$remaining + ' more bytes');
                    this.local$start = this.local$start + rc | 0;
                    this.local$remaining = this.local$remaining - rc | 0;
                    this.state_0 = 2;
                    continue;
                case 4:
                    return;
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
    ByteChannelJS.prototype.readFullySuspend_0 = function (dst_0, offset_0, length_0, continuation_0, suspended) {
        var instance = new Coroutine$readFullySuspend_0(this, dst_0, offset_0, length_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    ByteChannelJS.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'ByteChannelJS',
        interfaces: [ByteChannelSequentialBase]
    };

    function ByteReadChannel_4() {
        ByteReadChannel$Companion_getInstance();
    }

    function ByteReadChannel$Companion() {
        ByteReadChannel$Companion_instance = this;
        this.Empty_6xsrq4$_0 = lazy(ByteReadChannel$Companion$Empty$lambda);
    }

    Object.defineProperty(ByteReadChannel$Companion.prototype, 'Empty', {
        get: function () {
            return this.Empty_6xsrq4$_0.value;
        }
    });

    function ByteReadChannel$Companion$Empty$lambda() {
        var $receiver = new ByteChannelJS(IoBuffer.Companion.Empty, false);
        $receiver.close_dbl4no$(null);
        return $receiver;
    }

    ByteReadChannel$Companion.$metadata$ = {
        kind: Kind_OBJECT,
        simpleName: 'Companion',
        interfaces: []
    };
    var ByteReadChannel$Companion_instance = null;

    function ByteReadChannel$Companion_getInstance() {
        if (ByteReadChannel$Companion_instance === null) {
            new ByteReadChannel$Companion();
        }
        return ByteReadChannel$Companion_instance;
    }

    ByteReadChannel_4.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ByteReadChannel',
        interfaces: []
    };

    function ByteWriteChannel() {
    }

    ByteWriteChannel.$metadata$ = {
        kind: Kind_INTERFACE,
        simpleName: 'ByteWriteChannel',
        interfaces: []
    };

    function suspendCoroutine$lambda(closure$block) {
        return function (c) {
            var safe = SafeContinuation_init(intercepted(c));
            closure$block(safe);
            return safe.getOrThrow();
        };
    }

    function Condition(predicate) {
        this.predicate = predicate;
        this.cont_0 = null;
    }

    Condition.prototype.check = function () {
        return this.predicate();
    };
    Condition.prototype.signal = function () {
        var cont = this.cont_0;
        if (cont != null && this.predicate()) {
            this.cont_0 = null;
            cont.resumeWith_tl1gpc$(new Result(Unit));
        }
    };

    function Condition$await$lambda(this$Condition, closure$block) {
        return function (c) {
            this$Condition.cont_0 = c;
            closure$block();
            return Unit;
        };
    }

    function Coroutine$await_o14v8n$($this, block_0, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
        this.local$block = block_0;
    }

    Coroutine$await_o14v8n$.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$await_o14v8n$.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$await_o14v8n$.prototype.constructor = Coroutine$await_o14v8n$;
    Coroutine$await_o14v8n$.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.predicate()) {
                        return;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = suspendCoroutine$lambda(Condition$await$lambda(this.$this, this.local$block))(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    this.result_0;
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
    Condition.prototype.await_o14v8n$ = function (block_0, continuation_0, suspended) {
        var instance = new Coroutine$await_o14v8n$(this, block_0, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };

    function Condition$await$lambda_0(this$Condition) {
        return function (c) {
            this$Condition.cont_0 = c;
            return Unit;
        };
    }

    function Coroutine$await($this, continuation_0) {
        CoroutineImpl.call(this, continuation_0);
        this.exceptionState_0 = 1;
        this.$this = $this;
    }

    Coroutine$await.$metadata$ = {
        kind: Kotlin.Kind.CLASS,
        simpleName: null,
        interfaces: [CoroutineImpl]
    };
    Coroutine$await.prototype = Object.create(CoroutineImpl.prototype);
    Coroutine$await.prototype.constructor = Coroutine$await;
    Coroutine$await.prototype.doResume = function () {
        do try {
            switch (this.state_0) {
                case 0:
                    if (this.$this.predicate()) {
                        return;
                    } else {
                        this.state_0 = 2;
                        continue;
                    }
                case 1:
                    throw this.exception_0;
                case 2:
                    this.state_0 = 3;
                    this.result_0 = suspendCoroutine$lambda(Condition$await$lambda_0(this.$this))(this);
                    if (this.result_0 === COROUTINE_SUSPENDED)
                        return COROUTINE_SUSPENDED;
                    continue;
                case 3:
                    this.result_0;
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
    Condition.prototype.await = function (continuation_0, suspended) {
        var instance = new Coroutine$await(this, continuation_0);
        if (suspended)
            return instance;
        else
            return instance.doResume(null);
    };
    Condition.$metadata$ = {
        kind: Kind_CLASS,
        simpleName: 'Condition',
        interfaces: []
    };
    var package$kotlinx = _.kotlinx || (_.kotlinx = {});
    var package$coroutines = package$kotlinx.coroutines || (package$kotlinx.coroutines = {});
    var package$io = package$coroutines.io || (package$coroutines.io = {});
    package$io.ByteChannel = ByteChannel;
    $$importsForInline$$['kotlinx-io'] = $module$kotlinx_io;
    package$io.ByteReadChannel_rq8efs$ = ByteReadChannel;
    Object.defineProperty(package$io, 'EmptyByteReadChannel', {
        get: get_EmptyByteReadChannel
    });
    package$io.joinTo_iw04lk$ = joinTo;
    package$io.copyTo_qm3w9g$ = copyTo;
    $$importsForInline$$['kotlinx-coroutines-io'] = _;
    package$io.ByteChannelSequentialBase = ByteChannelSequentialBase;
    package$io.readPacket_b9zst4$ = readPacket;
    package$io.readRemaining_5joj65$ = readRemaining;
    package$io.readRemaining_ep79e2$ = readRemaining_0;
    package$io.readFully_ot6lty$ = readFully;
    package$io.readUTF8LineTo_97ohtq$ = readUTF8LineTo;
    package$io.readUTF8Line_ep79e2$ = readUTF8Line;
    package$io.cancel_ep79e2$ = cancel;
    package$io.discard_ep79e2$ = discard;
    package$io.discardExact_5joj65$ = discardExact_0;
    package$io.readAvailable_5l0546$ = readAvailable;
    package$io.readFully_5l0546$ = readFully_0;
    package$io.copyAndClose_lhug7f$ = copyAndClose;
    package$io.writeAvailable_p8yv3v$ = writeAvailable;
    package$io.writeFully_p8yv3v$ = writeFully_0;
    package$io.writeShort_ff48jd$ = writeShort;
    package$io.writeShort_5klqlx$ = writeShort_0;
    package$io.writeByte_ff48jd$ = writeByte;
    package$io.writeInt_j733im$ = writeInt;
    package$io.writeInt_u0qivm$ = writeInt_0;
    package$io.close_sypobt$ = close;
    package$io.writeStringUtf8_9jvjdf$ = writeStringUtf8;
    package$io.writeStringUtf8_n9qdmv$ = writeStringUtf8_0;
    package$io.writeBoolean_rrn8ge$ = writeBoolean;
    package$io.writeChar_j78zw4$ = writeChar;
    package$io.writePacket_okw089$ = writePacket;
    package$io.writePacketSuspend_o2rnsb$ = writePacketSuspend;
    package$io.ClosedWriteChannelException = ClosedWriteChannelException;
    package$io.reverseIfNeeded_5i8cf7$ = reverseIfNeeded;
    package$io.readShort_s4cdki$ = readShort;
    package$io.readInt_s4cdki$ = readInt;
    package$io.readLong_s4cdki$ = readLong;
    package$io.readFloat_s4cdki$ = readFloat;
    package$io.readDouble_s4cdki$ = readDouble;
    package$io.toLittleEndian_2q0caa$ = toLittleEndian;
    package$io.readShortLittleEndian_ep79e2$ = readShortLittleEndian;
    package$io.readIntLittleEndian_ep79e2$ = readIntLittleEndian;
    package$io.readLongLittleEndian_ep79e2$ = readLongLittleEndian;
    package$io.readFloatLittleEndian_ep79e2$ = readFloatLittleEndian;
    package$io.readDoubleLittleEndian_ep79e2$ = readDoubleLittleEndian;
    package$io.writeShort_ywdznm$ = writeShort_1;
    package$io.writeInt_5klqlx$ = writeInt_1;
    package$io.writeLong_u0qivm$ = writeLong;
    package$io.writeFloat_vuh31e$ = writeFloat;
    package$io.writeDouble_6thxtp$ = writeDouble;
    package$io.writeShortLittleEndian_qr1gvu$ = writeShortLittleEndian;
    package$io.writeIntLittleEndian_ff48jd$ = writeIntLittleEndian;
    package$io.writeLongLittleEndian_j733im$ = writeLongLittleEndian;
    package$io.writeFloatLittleEndian_qy4922$ = writeFloatLittleEndian;
    package$io.writeDoubleLittleEndian_g3cuh3$ = writeDoubleLittleEndian;
    package$io.ReaderJob = ReaderJob;
    package$io.WriterJob = WriterJob;
    package$io.ReaderScope = ReaderScope;
    package$io.WriterScope = WriterScope;
    package$io.reader_cdz757$ = reader;
    package$io.reader_ymoia9$ = reader_0;
    package$io.reader_x3phv4$ = reader_1;
    package$io.reader_cy3u8q$ = reader_2;
    package$io.writer_juz8zf$ = writer;
    package$io.writer_r5ogg1$ = writer_0;
    package$io.writer_ugei9s$ = writer_1;
    package$io.writer_5h3sei$ = writer_2;
    var package$experimental = package$coroutines.experimental || (package$coroutines.experimental = {});
    var package$io_0 = package$experimental.io || (package$experimental.io = {});
    package$io_0.ByteChannel_6taknv$ = ByteChannel_0;
    package$io_0.ByteReadChannel_mj6st8$ = ByteReadChannel_0;
    package$io_0.ByteReadChannel_rq8efs$ = ByteReadChannel_1;
    package$io_0.reader_x3phv4$ = reader_3;
    package$io_0.reader_cy3u8q$ = reader_4;
    package$io_0.writer_ugei9s$ = writer_3;
    package$io_0.writer_5h3sei$ = writer_4;
    package$io.ReadSession = ReadSession;
    package$io.SuspendableReadSession = SuspendableReadSession;
    package$io.WriterSession = WriterSession;
    package$io.WriterSuspendSession = WriterSuspendSession;
    var package$internal = package$io.internal || (package$io.internal = {});
    package$internal.joinToImpl_b4me3v$ = joinToImpl;
    package$internal.copyToSequentialImpl_d9rkgh$ = copyToSequentialImpl;
    package$io.ByteChannel_6taknv$ = ByteChannel_1;
    package$io.ByteReadChannel_mj6st8$ = ByteReadChannel_2;
    package$io.ByteReadChannel_c2mund$ = ByteReadChannel_3;
    package$io.joinTo_ulwomx$ = joinTo_0;
    package$io.copyTo_lhug7f$ = copyTo_0;
    package$io.ByteChannelJS = ByteChannelJS;
    Object.defineProperty(ByteReadChannel_4, 'Companion', {
        get: ByteReadChannel$Companion_getInstance
    });
    package$io.ByteReadChannel = ByteReadChannel_4;
    package$io.ByteWriteChannel = ByteWriteChannel;
    package$io.Condition = Condition;
    SuspendableReadSession.prototype.request_za3lpa$ = ReadSession.prototype.request_za3lpa$;
    ByteChannelSequentialBase.prototype.await_za3lpa$ = SuspendableReadSession.prototype.await_za3lpa$;
    ByteChannelSequentialBase.prototype.request_za3lpa$ = SuspendableReadSession.prototype.request_za3lpa$;
    ReaderJob.prototype.cancel = Job.prototype.cancel;
    ReaderJob.prototype.fold_3cc69b$ = Job.prototype.fold_3cc69b$;
    ReaderJob.prototype.get_j3r2sn$ = Job.prototype.get_j3r2sn$;
    ReaderJob.prototype.minusKey_yeqjby$ = Job.prototype.minusKey_yeqjby$;
    ReaderJob.prototype.plus_dqr1mp$ = Job.prototype.plus_dqr1mp$;
    ReaderJob.prototype.plus_1fupul$ = Job.prototype.plus_1fupul$;
    ReaderJob.prototype.cancel_dbl4no$ = Job.prototype.cancel_dbl4no$;
    ReaderJob.prototype.cancel_m4sck1$ = Job.prototype.cancel_m4sck1$;
    ReaderJob.prototype.invokeOnCompletion_ct2b2z$ = Job.prototype.invokeOnCompletion_ct2b2z$;
    WriterJob.prototype.cancel = Job.prototype.cancel;
    WriterJob.prototype.fold_3cc69b$ = Job.prototype.fold_3cc69b$;
    WriterJob.prototype.get_j3r2sn$ = Job.prototype.get_j3r2sn$;
    WriterJob.prototype.minusKey_yeqjby$ = Job.prototype.minusKey_yeqjby$;
    WriterJob.prototype.plus_dqr1mp$ = Job.prototype.plus_dqr1mp$;
    WriterJob.prototype.plus_1fupul$ = Job.prototype.plus_1fupul$;
    WriterJob.prototype.cancel_dbl4no$ = Job.prototype.cancel_dbl4no$;
    WriterJob.prototype.cancel_m4sck1$ = Job.prototype.cancel_m4sck1$;
    WriterJob.prototype.invokeOnCompletion_ct2b2z$ = Job.prototype.invokeOnCompletion_ct2b2z$;
    ChannelJob.prototype.cancel_m4sck1$ = ReaderJob.prototype.cancel_m4sck1$;
    ChannelJob.prototype.cancel_dbl4no$ = ReaderJob.prototype.cancel_dbl4no$;
    ChannelJob.prototype.invokeOnCompletion_ct2b2z$ = ReaderJob.prototype.invokeOnCompletion_ct2b2z$;
    Kotlin.defineModule('kotlinx-coroutines-io', _);
    return _;
}));
