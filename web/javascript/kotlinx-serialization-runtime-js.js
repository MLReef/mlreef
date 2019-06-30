(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define(['exports', 'kotlin'], factory);
  else if (typeof exports === 'object')
    factory(module.exports, require('kotlin'));
  else {
    if (typeof kotlin === 'undefined') {
      throw new Error("Error loading module 'kotlinx-serialization-runtime-js'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'kotlinx-serialization-runtime-js'.");
    }
    root['kotlinx-serialization-runtime-js'] = factory(typeof this['kotlinx-serialization-runtime-js'] === 'undefined' ? {} : this['kotlinx-serialization-runtime-js'], kotlin);
  }
}(this, function (_, Kotlin) {
  'use strict';
  var $$importsForInline$$ = _.$$importsForInline$$ || (_.$$importsForInline$$ = {});
  var Enum = Kotlin.kotlin.Enum;
  var Kind_CLASS = Kotlin.Kind.CLASS;
  var throwISE = Kotlin.throwISE;
  var getKClass = Kotlin.getKClass;
  var Annotation = Kotlin.kotlin.Annotation;
  var Kind_INTERFACE = Kotlin.Kind.INTERFACE;
  var Unit = Kotlin.kotlin.Unit;
  var Kind_OBJECT = Kotlin.Kind.OBJECT;
  var emptyList = Kotlin.kotlin.collections.emptyList_287e2$;
  var defineInlineFunction = Kotlin.defineInlineFunction;
  var wrapFunction = Kotlin.wrapFunction;
  var toBoxedChar = Kotlin.toBoxedChar;
  var throwCCE = Kotlin.throwCCE;
  var unboxChar = Kotlin.unboxChar;
  var RuntimeException = Kotlin.kotlin.RuntimeException;
  var getValue = Kotlin.kotlin.collections.getValue_t9ocha$;
  var ensureNotNull = Kotlin.ensureNotNull;
  var to = Kotlin.kotlin.to_ujzrz7$;
  var until = Kotlin.kotlin.ranges.until_dqglrj$;
  var last = Kotlin.kotlin.collections.last_2p1efm$;
  var lastOrNull = Kotlin.kotlin.collections.lastOrNull_2p1efm$;
  var get_lastIndex = Kotlin.kotlin.collections.get_lastIndex_55thoc$;
  var singleOrNull = Kotlin.kotlin.collections.singleOrNull_2p1efm$;
  var kotlin = Kotlin.kotlin;
  var equals = Kotlin.equals;
  var toByte = Kotlin.toByte;
  var IntRange = Kotlin.kotlin.ranges.IntRange;
  var contains = Kotlin.kotlin.ranges.contains_8sy4e8$;
  var kotlin_js_internal_ByteCompanionObject = Kotlin.kotlin.js.internal.ByteCompanionObject;
  var toShort = Kotlin.toShort;
  var kotlin_js_internal_ShortCompanionObject = Kotlin.kotlin.js.internal.ShortCompanionObject;
  var L2147483648 = new Kotlin.Long(-2147483648, 0);
  var Long$Companion$MAX_VALUE = Kotlin.Long.MAX_VALUE;
  var AssertionError_init = Kotlin.kotlin.AssertionError_init_pdl1vj$;
  var Long$Companion$MIN_VALUE = Kotlin.Long.MIN_VALUE;
  var toChar = Kotlin.toChar;
  var AssertionError_init_0 = Kotlin.kotlin.AssertionError_init;
  var KClass = Kotlin.kotlin.reflect.KClass;
  var toMutableList = Kotlin.kotlin.collections.toMutableList_4c7yge$;
  var toIntOrNull = Kotlin.kotlin.text.toIntOrNull_pdl1vz$;
  var IllegalArgumentException_init = Kotlin.kotlin.IllegalArgumentException_init_pdl1vj$;
  var hashCode = Kotlin.hashCode;
  var asList = Kotlin.kotlin.collections.asList_us0mfu$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_mqih57$;
  var ArrayList = Kotlin.kotlin.collections.ArrayList;
  var LinkedHashSet = Kotlin.kotlin.collections.LinkedHashSet;
  var LinkedHashSet_init = Kotlin.kotlin.collections.LinkedHashSet_init_mqih57$;
  var HashSet_init = Kotlin.kotlin.collections.HashSet_init_287e2$;
  var HashSet = Kotlin.kotlin.collections.HashSet;
  var HashSet_init_0 = Kotlin.kotlin.collections.HashSet_init_mqih57$;
  var LinkedHashMap_init = Kotlin.kotlin.collections.LinkedHashMap_init_q3lmfv$;
  var LinkedHashMap = Kotlin.kotlin.collections.LinkedHashMap;
  var LinkedHashMap_init_0 = Kotlin.kotlin.collections.LinkedHashMap_init_73mtqc$;
  var HashMap_init = Kotlin.kotlin.collections.HashMap_init_q3lmfv$;
  var HashMap = Kotlin.kotlin.collections.HashMap;
  var HashMap_init_0 = Kotlin.kotlin.collections.HashMap_init_73mtqc$;
  var indexOf = Kotlin.kotlin.collections.indexOf_mjy6jw$;
  var get_indices = Kotlin.kotlin.collections.get_indices_m7z4lg$;
  var toLong = Kotlin.kotlin.text.toLong_pdl1vz$;
  var IllegalStateException_init = Kotlin.kotlin.IllegalStateException_init_pdl1vj$;
  var PrimitiveClasses$stringClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.stringClass;
  var Char = Kotlin.BoxedChar;
  var PrimitiveClasses$doubleClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.doubleClass;
  var PrimitiveClasses$floatClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.floatClass;
  var Long = Kotlin.Long;
  var PrimitiveClasses$intClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.intClass;
  var PrimitiveClasses$shortClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.shortClass;
  var PrimitiveClasses$byteClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.byteClass;
  var PrimitiveClasses$booleanClass = Kotlin.kotlin.reflect.js.internal.PrimitiveClasses.booleanClass;
  var getOrNull = Kotlin.kotlin.collections.getOrNull_8ujjk8$;
  var getOrNull_0 = Kotlin.kotlin.collections.getOrNull_yzln2o$;
  var copyOf = Kotlin.kotlin.collections.copyOf_1qu12l$;
  var ArrayList_init_0 = Kotlin.kotlin.collections.ArrayList_init_287e2$;
  var lazy = Kotlin.kotlin.lazy_klfg04$;
  var Any = Object;
  var Map$Entry = Kotlin.kotlin.collections.Map.Entry;
  var Triple = Kotlin.kotlin.Triple;
  var CharRange = Kotlin.kotlin.ranges.CharRange;
  var StringBuilder_init = Kotlin.kotlin.text.StringBuilder_init_za3lpa$;
  var trimStart = Kotlin.kotlin.text.trimStart_wqw3xr$;
  var L4294967295 = new Kotlin.Long(-1, 0);
  var StringBuilder_init_0 = Kotlin.kotlin.text.StringBuilder_init;
  var toInt = Kotlin.kotlin.text.toInt_pdl1vz$;
  var toLongOrNull = Kotlin.kotlin.text.toLongOrNull_pdl1vz$;
  var toDouble = Kotlin.kotlin.text.toDouble_pdl1vz$;
  var toDoubleOrNull = Kotlin.kotlin.text.toDoubleOrNull_pdl1vz$;
  var NoSuchElementException = Kotlin.kotlin.NoSuchElementException;
  var joinToString = Kotlin.kotlin.collections.joinToString_fmv235$;
  var Map = Kotlin.kotlin.collections.Map;
  var List = Kotlin.kotlin.collections.List;
  var String_0 = Kotlin.kotlin.text.String_8chfmy$;
  var copyOf_0 = Kotlin.kotlin.collections.copyOf_gtcw5h$;
  var coerceAtLeast = Kotlin.kotlin.ranges.coerceAtLeast_dqglrj$;
  var toBoolean = Kotlin.kotlin.text.toBoolean_pdl1vz$;
  var toByte_0 = Kotlin.kotlin.text.toByte_pdl1vz$;
  var toShort_0 = Kotlin.kotlin.text.toShort_pdl1vz$;
  var single = Kotlin.kotlin.text.single_gw00vp$;
  var isFinite = Kotlin.kotlin.isFinite_81szk$;
  var isFinite_0 = Kotlin.kotlin.isFinite_yrwdxr$;
  var equals_0 = Kotlin.kotlin.text.equals_igcy3c$;
  var iterator = Kotlin.kotlin.text.iterator_gw00vp$;
  var HashSet_init_1 = Kotlin.kotlin.collections.HashSet_init_ww73n8$;
  var toList = Kotlin.kotlin.collections.toList_7wnvza$;
  var throwUPAE = Kotlin.throwUPAE;
  var L_128 = Kotlin.Long.fromInt(-128);
  var L0 = Kotlin.Long.ZERO;
  var L127 = Kotlin.Long.fromInt(127);
  var L128 = Kotlin.Long.fromInt(128);
  var L_1 = Kotlin.Long.NEG_ONE;
  var IllegalArgumentException_init_0 = Kotlin.kotlin.IllegalArgumentException_init;
  var Exception_init = Kotlin.kotlin.Exception_init_pdl1vj$;
  var Exception = Kotlin.kotlin.Exception;
  var IndexOutOfBoundsException_init = Kotlin.kotlin.IndexOutOfBoundsException_init;
  var NullPointerException_init = Kotlin.kotlin.NullPointerException_init;
  var get_indices_0 = Kotlin.kotlin.text.get_indices_gw00vp$;
  var toString = Kotlin.toString;
  var slice = Kotlin.kotlin.collections.slice_bq4su$;
  var L9007199254740991 = new Kotlin.Long(-1, 2097151);
  var numberToChar = Kotlin.numberToChar;
  var get_js = Kotlin.kotlin.js.get_js_1yb8b7$;
  var toList_0 = Kotlin.kotlin.text.toList_gw00vp$;
  var toByteArray = Kotlin.kotlin.collections.toByteArray_kdx1v$;
  ByteOrder.prototype = Object.create(Enum.prototype);
  ByteOrder.prototype.constructor = ByteOrder;
  ContextSerializer$descriptor$ObjectLiteral.prototype = Object.create(SerialClassDescImpl.prototype);
  ContextSerializer$descriptor$ObjectLiteral.prototype.constructor = ContextSerializer$descriptor$ObjectLiteral;
  UpdateMode.prototype = Object.create(Enum.prototype);
  UpdateMode.prototype.constructor = UpdateMode;
  PrimitiveKind.prototype = Object.create(SerialKind.prototype);
  PrimitiveKind.prototype.constructor = PrimitiveKind;
  PrimitiveKind$INT.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$INT.prototype.constructor = PrimitiveKind$INT;
  PrimitiveKind$UNIT.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$UNIT.prototype.constructor = PrimitiveKind$UNIT;
  PrimitiveKind$BOOLEAN.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$BOOLEAN.prototype.constructor = PrimitiveKind$BOOLEAN;
  PrimitiveKind$BYTE.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$BYTE.prototype.constructor = PrimitiveKind$BYTE;
  PrimitiveKind$SHORT.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$SHORT.prototype.constructor = PrimitiveKind$SHORT;
  PrimitiveKind$LONG.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$LONG.prototype.constructor = PrimitiveKind$LONG;
  PrimitiveKind$FLOAT.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$FLOAT.prototype.constructor = PrimitiveKind$FLOAT;
  PrimitiveKind$DOUBLE.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$DOUBLE.prototype.constructor = PrimitiveKind$DOUBLE;
  PrimitiveKind$CHAR.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$CHAR.prototype.constructor = PrimitiveKind$CHAR;
  PrimitiveKind$STRING.prototype = Object.create(PrimitiveKind.prototype);
  PrimitiveKind$STRING.prototype.constructor = PrimitiveKind$STRING;
  StructureKind.prototype = Object.create(SerialKind.prototype);
  StructureKind.prototype.constructor = StructureKind;
  StructureKind$CLASS.prototype = Object.create(StructureKind.prototype);
  StructureKind$CLASS.prototype.constructor = StructureKind$CLASS;
  StructureKind$LIST.prototype = Object.create(StructureKind.prototype);
  StructureKind$LIST.prototype.constructor = StructureKind$LIST;
  StructureKind$MAP.prototype = Object.create(StructureKind.prototype);
  StructureKind$MAP.prototype.constructor = StructureKind$MAP;
  UnionKind.prototype = Object.create(SerialKind.prototype);
  UnionKind.prototype.constructor = UnionKind;
  UnionKind$OBJECT.prototype = Object.create(UnionKind.prototype);
  UnionKind$OBJECT.prototype.constructor = UnionKind$OBJECT;
  UnionKind$ENUM_KIND.prototype = Object.create(UnionKind.prototype);
  UnionKind$ENUM_KIND.prototype.constructor = UnionKind$ENUM_KIND;
  UnionKind$SEALED.prototype = Object.create(UnionKind.prototype);
  UnionKind$SEALED.prototype.constructor = UnionKind$SEALED;
  UnionKind$POLYMORPHIC.prototype = Object.create(UnionKind.prototype);
  UnionKind$POLYMORPHIC.prototype.constructor = UnionKind$POLYMORPHIC;
  SerializationException.prototype = Object.create(RuntimeException.prototype);
  SerializationException.prototype.constructor = SerializationException;
  MissingFieldException.prototype = Object.create(SerializationException.prototype);
  MissingFieldException.prototype.constructor = MissingFieldException;
  UnknownFieldException.prototype = Object.create(SerializationException.prototype);
  UnknownFieldException.prototype.constructor = UnknownFieldException;
  UpdateNotSupportedException.prototype = Object.create(SerializationException.prototype);
  UpdateNotSupportedException.prototype.constructor = UpdateNotSupportedException;
  NamedValueEncoder.prototype = Object.create(TaggedEncoder.prototype);
  NamedValueEncoder.prototype.constructor = NamedValueEncoder;
  Mapper$OutMapper.prototype = Object.create(NamedValueEncoder.prototype);
  Mapper$OutMapper.prototype.constructor = Mapper$OutMapper;
  Mapper$OutNullableMapper.prototype = Object.create(NamedValueEncoder.prototype);
  Mapper$OutNullableMapper.prototype.constructor = Mapper$OutNullableMapper;
  NamedValueDecoder.prototype = Object.create(TaggedDecoder.prototype);
  NamedValueDecoder.prototype.constructor = NamedValueDecoder;
  Mapper$InMapper.prototype = Object.create(NamedValueDecoder.prototype);
  Mapper$InMapper.prototype.constructor = Mapper$InMapper;
  Mapper$InNullableMapper.prototype = Object.create(NamedValueDecoder.prototype);
  Mapper$InNullableMapper.prototype.constructor = Mapper$InNullableMapper;
  Mapper.prototype = Object.create(AbstractSerialFormat.prototype);
  Mapper.prototype.constructor = Mapper;
  IntTaggedEncoder.prototype = Object.create(TaggedEncoder.prototype);
  IntTaggedEncoder.prototype.constructor = IntTaggedEncoder;
  IntTaggedDecoder.prototype = Object.create(TaggedDecoder.prototype);
  IntTaggedDecoder.prototype.constructor = IntTaggedDecoder;
  StringTaggedDecoder.prototype = Object.create(TaggedDecoder.prototype);
  StringTaggedDecoder.prototype.constructor = StringTaggedDecoder;
  Cbor$CborWriter.prototype = Object.create(ElementValueEncoder.prototype);
  Cbor$CborWriter.prototype.constructor = Cbor$CborWriter;
  Cbor$CborEntryWriter.prototype = Object.create(Cbor$CborWriter.prototype);
  Cbor$CborEntryWriter.prototype.constructor = Cbor$CborEntryWriter;
  Cbor$CborListWriter.prototype = Object.create(Cbor$CborWriter.prototype);
  Cbor$CborListWriter.prototype.constructor = Cbor$CborListWriter;
  Cbor$CborMapWriter.prototype = Object.create(Cbor$CborListWriter.prototype);
  Cbor$CborMapWriter.prototype.constructor = Cbor$CborMapWriter;
  Cbor$CborReader.prototype = Object.create(ElementValueDecoder.prototype);
  Cbor$CborReader.prototype.constructor = Cbor$CborReader;
  Cbor$CborEntryReader.prototype = Object.create(Cbor$CborReader.prototype);
  Cbor$CborEntryReader.prototype.constructor = Cbor$CborEntryReader;
  Cbor$CborListReader.prototype = Object.create(Cbor$CborReader.prototype);
  Cbor$CborListReader.prototype.constructor = Cbor$CborListReader;
  Cbor$CborMapReader.prototype = Object.create(Cbor$CborListReader.prototype);
  Cbor$CborMapReader.prototype.constructor = Cbor$CborMapReader;
  Cbor.prototype = Object.create(AbstractSerialFormat.prototype);
  Cbor.prototype.constructor = Cbor;
  CborDecodingException.prototype = Object.create(SerializationException.prototype);
  CborDecodingException.prototype.constructor = CborDecodingException;
  ArrayClassDesc.prototype = Object.create(ListLikeDescriptor.prototype);
  ArrayClassDesc.prototype.constructor = ArrayClassDesc;
  ArrayListClassDesc.prototype = Object.create(ListLikeDescriptor.prototype);
  ArrayListClassDesc.prototype.constructor = ArrayListClassDesc;
  NamedListClassDescriptor.prototype = Object.create(ListLikeDescriptor.prototype);
  NamedListClassDescriptor.prototype.constructor = NamedListClassDescriptor;
  LinkedHashSetClassDesc.prototype = Object.create(ListLikeDescriptor.prototype);
  LinkedHashSetClassDesc.prototype.constructor = LinkedHashSetClassDesc;
  HashSetClassDesc.prototype = Object.create(ListLikeDescriptor.prototype);
  HashSetClassDesc.prototype.constructor = HashSetClassDesc;
  NamedMapClassDescriptor.prototype = Object.create(MapLikeDescriptor.prototype);
  NamedMapClassDescriptor.prototype.constructor = NamedMapClassDescriptor;
  LinkedHashMapClassDesc.prototype = Object.create(MapLikeDescriptor.prototype);
  LinkedHashMapClassDesc.prototype.constructor = LinkedHashMapClassDesc;
  HashMapClassDesc.prototype = Object.create(MapLikeDescriptor.prototype);
  HashMapClassDesc.prototype.constructor = HashMapClassDesc;
  ListLikeSerializer.prototype = Object.create(AbstractCollectionSerializer.prototype);
  ListLikeSerializer.prototype.constructor = ListLikeSerializer;
  MapLikeSerializer.prototype = Object.create(AbstractCollectionSerializer.prototype);
  MapLikeSerializer.prototype.constructor = MapLikeSerializer;
  ReferenceArraySerializer.prototype = Object.create(ListLikeSerializer.prototype);
  ReferenceArraySerializer.prototype.constructor = ReferenceArraySerializer;
  ArrayListSerializer.prototype = Object.create(ListLikeSerializer.prototype);
  ArrayListSerializer.prototype.constructor = ArrayListSerializer;
  LinkedHashSetSerializer.prototype = Object.create(ListLikeSerializer.prototype);
  LinkedHashSetSerializer.prototype.constructor = LinkedHashSetSerializer;
  HashSetSerializer.prototype = Object.create(ListLikeSerializer.prototype);
  HashSetSerializer.prototype.constructor = HashSetSerializer;
  LinkedHashMapSerializer.prototype = Object.create(MapLikeSerializer.prototype);
  LinkedHashMapSerializer.prototype.constructor = LinkedHashMapSerializer;
  HashMapSerializer.prototype = Object.create(MapLikeSerializer.prototype);
  HashMapSerializer.prototype.constructor = HashMapSerializer;
  EnumDescriptor.prototype = Object.create(SerialClassDescImpl.prototype);
  EnumDescriptor.prototype.constructor = EnumDescriptor;
  EnumSerializer.prototype = Object.create(CommonEnumSerializer.prototype);
  EnumSerializer.prototype.constructor = EnumSerializer;
  IntDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  IntDescriptor.prototype.constructor = IntDescriptor;
  UnitDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  UnitDescriptor.prototype.constructor = UnitDescriptor;
  BooleanDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  BooleanDescriptor.prototype.constructor = BooleanDescriptor;
  ByteDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  ByteDescriptor.prototype.constructor = ByteDescriptor;
  ShortDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  ShortDescriptor.prototype.constructor = ShortDescriptor;
  LongDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  LongDescriptor.prototype.constructor = LongDescriptor;
  FloatDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  FloatDescriptor.prototype.constructor = FloatDescriptor;
  DoubleDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  DoubleDescriptor.prototype.constructor = DoubleDescriptor;
  CharDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  CharDescriptor.prototype.constructor = CharDescriptor;
  StringDescriptor.prototype = Object.create(PrimitiveDescriptor.prototype);
  StringDescriptor.prototype.constructor = StringDescriptor;
  MissingDescriptorException.prototype = Object.create(SerializationException.prototype);
  MissingDescriptorException.prototype.constructor = MissingDescriptorException;
  MapEntryUpdatingSerializer.prototype = Object.create(KeyValueSerializer.prototype);
  MapEntryUpdatingSerializer.prototype.constructor = MapEntryUpdatingSerializer;
  MapEntrySerializer.prototype = Object.create(KeyValueSerializer.prototype);
  MapEntrySerializer.prototype.constructor = MapEntrySerializer;
  PairSerializer.prototype = Object.create(KeyValueSerializer.prototype);
  PairSerializer.prototype.constructor = PairSerializer;
  MapEntryClassDesc.prototype = Object.create(SerialClassDescImpl.prototype);
  MapEntryClassDesc.prototype.constructor = MapEntryClassDesc;
  PairClassDesc.prototype = Object.create(SerialClassDescImpl.prototype);
  PairClassDesc.prototype.constructor = PairClassDesc;
  TripleSerializer$TripleDesc.prototype = Object.create(SerialClassDescImpl.prototype);
  TripleSerializer$TripleDesc.prototype.constructor = TripleSerializer$TripleDesc;
  Json.prototype = Object.create(AbstractSerialFormat.prototype);
  Json.prototype.constructor = Json;
  JsonPrimitive.prototype = Object.create(JsonElement.prototype);
  JsonPrimitive.prototype.constructor = JsonPrimitive;
  JsonLiteral.prototype = Object.create(JsonPrimitive.prototype);
  JsonLiteral.prototype.constructor = JsonLiteral;
  JsonNull.prototype = Object.create(JsonPrimitive.prototype);
  JsonNull.prototype.constructor = JsonNull;
  JsonObject.prototype = Object.create(JsonElement.prototype);
  JsonObject.prototype.constructor = JsonObject;
  JsonArray.prototype = Object.create(JsonElement.prototype);
  JsonArray.prototype.constructor = JsonArray;
  JsonException.prototype = Object.create(SerializationException.prototype);
  JsonException.prototype.constructor = JsonException;
  JsonInvalidValueInStrictModeException.prototype = Object.create(JsonException.prototype);
  JsonInvalidValueInStrictModeException.prototype.constructor = JsonInvalidValueInStrictModeException;
  JsonUnknownKeyException.prototype = Object.create(JsonException.prototype);
  JsonUnknownKeyException.prototype.constructor = JsonUnknownKeyException;
  JsonParsingException.prototype = Object.create(JsonException.prototype);
  JsonParsingException.prototype.constructor = JsonParsingException;
  JsonElementTypeMismatchException.prototype = Object.create(JsonException.prototype);
  JsonElementTypeMismatchException.prototype.constructor = JsonElementTypeMismatchException;
  JsonTreeMapper.prototype = Object.create(AbstractSerialFormat.prototype);
  JsonTreeMapper.prototype.constructor = JsonTreeMapper;
  JsonElementSerializer$descriptor$ObjectLiteral.prototype = Object.create(SerialClassDescImpl.prototype);
  JsonElementSerializer$descriptor$ObjectLiteral.prototype.constructor = JsonElementSerializer$descriptor$ObjectLiteral;
  JsonPrimitiveSerializer$JsonPrimitiveDescriptor.prototype = Object.create(SerialClassDescImpl.prototype);
  JsonPrimitiveSerializer$JsonPrimitiveDescriptor.prototype.constructor = JsonPrimitiveSerializer$JsonPrimitiveDescriptor;
  JsonNullSerializer$JsonNullDescriptor.prototype = Object.create(SerialClassDescImpl.prototype);
  JsonNullSerializer$JsonNullDescriptor.prototype.constructor = JsonNullSerializer$JsonNullDescriptor;
  JsonLiteralSerializer$JsonLiteralDescriptor.prototype = Object.create(SerialClassDescImpl.prototype);
  JsonLiteralSerializer$JsonLiteralDescriptor.prototype.constructor = JsonLiteralSerializer$JsonLiteralDescriptor;
  StreamingJsonInput.prototype = Object.create(ElementValueDecoder.prototype);
  StreamingJsonInput.prototype.constructor = StreamingJsonInput;
  StreamingJsonOutput.prototype = Object.create(ElementValueEncoder.prototype);
  StreamingJsonOutput.prototype.constructor = StreamingJsonOutput;
  AbstractJsonTreeInput.prototype = Object.create(NamedValueDecoder.prototype);
  AbstractJsonTreeInput.prototype.constructor = AbstractJsonTreeInput;
  JsonPrimitiveInput.prototype = Object.create(AbstractJsonTreeInput.prototype);
  JsonPrimitiveInput.prototype.constructor = JsonPrimitiveInput;
  JsonTreeInput.prototype = Object.create(AbstractJsonTreeInput.prototype);
  JsonTreeInput.prototype.constructor = JsonTreeInput;
  JsonTreeMapInput.prototype = Object.create(JsonTreeInput.prototype);
  JsonTreeMapInput.prototype.constructor = JsonTreeMapInput;
  JsonTreeListInput.prototype = Object.create(AbstractJsonTreeInput.prototype);
  JsonTreeListInput.prototype.constructor = JsonTreeListInput;
  AbstractJsonTreeOutput.prototype = Object.create(NamedValueEncoder.prototype);
  AbstractJsonTreeOutput.prototype.constructor = AbstractJsonTreeOutput;
  JsonTreeOutput.prototype = Object.create(AbstractJsonTreeOutput.prototype);
  JsonTreeOutput.prototype.constructor = JsonTreeOutput;
  JsonTreeMapOutput.prototype = Object.create(JsonTreeOutput.prototype);
  JsonTreeMapOutput.prototype.constructor = JsonTreeMapOutput;
  JsonTreeListOutput.prototype = Object.create(AbstractJsonTreeOutput.prototype);
  JsonTreeListOutput.prototype.constructor = JsonTreeListOutput;
  WriteMode.prototype = Object.create(Enum.prototype);
  WriteMode.prototype.constructor = WriteMode;
  ProtoBuf$ProtobufWriter.prototype = Object.create(TaggedEncoder.prototype);
  ProtoBuf$ProtobufWriter.prototype.constructor = ProtoBuf$ProtobufWriter;
  ProtoBuf$ObjectWriter.prototype = Object.create(ProtoBuf$ProtobufWriter.prototype);
  ProtoBuf$ObjectWriter.prototype.constructor = ProtoBuf$ObjectWriter;
  ProtoBuf$MapRepeatedWriter.prototype = Object.create(ProtoBuf$ObjectWriter.prototype);
  ProtoBuf$MapRepeatedWriter.prototype.constructor = ProtoBuf$MapRepeatedWriter;
  ProtoBuf$RepeatedWriter.prototype = Object.create(ProtoBuf$ProtobufWriter.prototype);
  ProtoBuf$RepeatedWriter.prototype.constructor = ProtoBuf$RepeatedWriter;
  ProtoBuf$ProtobufReader.prototype = Object.create(TaggedDecoder.prototype);
  ProtoBuf$ProtobufReader.prototype.constructor = ProtoBuf$ProtobufReader;
  ProtoBuf$RepeatedReader.prototype = Object.create(ProtoBuf$ProtobufReader.prototype);
  ProtoBuf$RepeatedReader.prototype.constructor = ProtoBuf$RepeatedReader;
  ProtoBuf$MapEntryReader.prototype = Object.create(ProtoBuf$ProtobufReader.prototype);
  ProtoBuf$MapEntryReader.prototype.constructor = ProtoBuf$MapEntryReader;
  ProtoBuf.prototype = Object.create(AbstractSerialFormat.prototype);
  ProtoBuf.prototype.constructor = ProtoBuf;
  ProtoNumberType.prototype = Object.create(Enum.prototype);
  ProtoNumberType.prototype.constructor = ProtoNumberType;
  ProtobufDecodingException.prototype = Object.create(SerializationException.prototype);
  ProtobufDecodingException.prototype.constructor = ProtobufDecodingException;
  IOException.prototype = Object.create(Exception.prototype);
  IOException.prototype.constructor = IOException;
  ByteArrayInputStream.prototype = Object.create(InputStream.prototype);
  ByteArrayInputStream.prototype.constructor = ByteArrayInputStream;
  ByteArrayOutputStream.prototype = Object.create(OutputStream.prototype);
  ByteArrayOutputStream.prototype.constructor = ByteArrayOutputStream;
  PrintWriter.prototype = Object.create(Writer.prototype);
  PrintWriter.prototype.constructor = PrintWriter;
  StringWriter.prototype = Object.create(Writer.prototype);
  StringWriter.prototype.constructor = StringWriter;
  StringReader.prototype = Object.create(Reader.prototype);
  StringReader.prototype.constructor = StringReader;
  DynamicObjectParser$DynamicInput.prototype = Object.create(NamedValueDecoder.prototype);
  DynamicObjectParser$DynamicInput.prototype.constructor = DynamicObjectParser$DynamicInput;
  DynamicObjectParser$DynamicMapInput.prototype = Object.create(DynamicObjectParser$DynamicInput.prototype);
  DynamicObjectParser$DynamicMapInput.prototype.constructor = DynamicObjectParser$DynamicMapInput;
  DynamicObjectParser$DynamicListInput.prototype = Object.create(DynamicObjectParser$DynamicInput.prototype);
  DynamicObjectParser$DynamicListInput.prototype.constructor = DynamicObjectParser$DynamicListInput;
  DynamicObjectParser.prototype = Object.create(AbstractSerialFormat.prototype);
  DynamicObjectParser.prototype.constructor = DynamicObjectParser;
  function ByteOrder(name, ordinal) {
    Enum.call(this);
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function ByteOrder_initFields() {
    ByteOrder_initFields = function () {
    };
    ByteOrder$LITTLE_ENDIAN_instance = new ByteOrder('LITTLE_ENDIAN', 0);
    ByteOrder$BIG_ENDIAN_instance = new ByteOrder('BIG_ENDIAN', 1);
  }
  var ByteOrder$LITTLE_ENDIAN_instance;
  function ByteOrder$LITTLE_ENDIAN_getInstance() {
    ByteOrder_initFields();
    return ByteOrder$LITTLE_ENDIAN_instance;
  }
  var ByteOrder$BIG_ENDIAN_instance;
  function ByteOrder$BIG_ENDIAN_getInstance() {
    ByteOrder_initFields();
    return ByteOrder$BIG_ENDIAN_instance;
  }
  ByteOrder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ByteOrder',
    interfaces: [Enum]
  };
  function ByteOrder$values() {
    return [ByteOrder$LITTLE_ENDIAN_getInstance(), ByteOrder$BIG_ENDIAN_getInstance()];
  }
  ByteOrder.values = ByteOrder$values;
  function ByteOrder$valueOf(name) {
    switch (name) {
      case 'LITTLE_ENDIAN':
        return ByteOrder$LITTLE_ENDIAN_getInstance();
      case 'BIG_ENDIAN':
        return ByteOrder$BIG_ENDIAN_getInstance();
      default:throwISE('No enum constant kotlinx.io.ByteOrder.' + name);
    }
  }
  ByteOrder.valueOf_61zpoe$ = ByteOrder$valueOf;
  function Serializable(with_0) {
    if (with_0 === void 0)
      with_0 = getKClass(KSerializer);
    this.with = with_0;
  }
  Serializable.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Serializable',
    interfaces: [Annotation]
  };
  function Serializer(forClass) {
    this.forClass = forClass;
  }
  Serializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Serializer',
    interfaces: [Annotation]
  };
  function SerialName(value) {
    this.value = value;
  }
  SerialName.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialName',
    interfaces: [Annotation]
  };
  function Optional() {
  }
  Optional.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Optional',
    interfaces: [Annotation]
  };
  function Transient() {
  }
  Transient.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Transient',
    interfaces: [Annotation]
  };
  function SerialInfo() {
  }
  SerialInfo.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialInfo',
    interfaces: [Annotation]
  };
  function ContextualSerialization(forClasses) {
    this.forClasses = forClasses;
  }
  ContextualSerialization.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ContextualSerialization',
    interfaces: [Annotation]
  };
  function UseSerializers(serializerClasses) {
    this.serializerClasses = serializerClasses;
  }
  UseSerializers.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UseSerializers',
    interfaces: [Annotation]
  };
  function Polymorphic() {
  }
  Polymorphic.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Polymorphic',
    interfaces: [Annotation]
  };
  function Encoder() {
  }
  Encoder.prototype.encodeSerializableValue_tf03ej$ = function (serializer, value) {
    serializer.serialize_awe97i$(this, value);
  };
  Encoder.prototype.encodeNullableSerializableValue_f4686g$ = function (serializer, value) {
    if (value == null) {
      this.encodeNull();
    }
     else {
      this.encodeNotNullMark();
      this.encodeSerializableValue_tf03ej$(serializer, value);
    }
  };
  Encoder.prototype.beginCollection_gly1x5$ = function (desc, collectionSize, typeParams) {
    return this.beginStructure_r0sa6z$(desc, typeParams.slice());
  };
  Encoder.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'Encoder',
    interfaces: []
  };
  function CompositeEncoder() {
  }
  CompositeEncoder.prototype.endStructure_qatsm0$ = function (desc) {
  };
  CompositeEncoder.prototype.shouldEncodeElementDefault_3zr2iy$ = function (desc, index) {
    return true;
  };
  CompositeEncoder.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'CompositeEncoder',
    interfaces: []
  };
  function Decoder() {
  }
  Decoder.prototype.decodeSerializableValue_w63s0f$ = function (deserializer) {
    return deserializer.deserialize_nts5qn$(this);
  };
  Decoder.prototype.decodeNullableSerializableValue_aae3ea$ = function (deserializer) {
    return this.decodeNotNullMark() ? this.decodeSerializableValue_w63s0f$(deserializer) : this.decodeNull();
  };
  Decoder.prototype.updateSerializableValue_19c8k5$ = function (deserializer, old) {
    var tmp$;
    switch (this.updateMode.name) {
      case 'BANNED':
        throw new UpdateNotSupportedException(deserializer.descriptor.name);
      case 'OVERWRITE':
        tmp$ = this.decodeSerializableValue_w63s0f$(deserializer);
        break;
      case 'UPDATE':
        tmp$ = deserializer.patch_mynpiu$(this, old);
        break;
      default:tmp$ = Kotlin.noWhenBranchMatched();
        break;
    }
    return tmp$;
  };
  Decoder.prototype.updateNullableSerializableValue_exmlbs$ = function (deserializer, old) {
    var tmp$;
    if (this.updateMode === UpdateMode$BANNED_getInstance())
      throw new UpdateNotSupportedException(deserializer.descriptor.name);
    else if (this.updateMode === UpdateMode$OVERWRITE_getInstance() || old == null)
      tmp$ = this.decodeNullableSerializableValue_aae3ea$(deserializer);
    else if (this.decodeNotNullMark())
      tmp$ = deserializer.patch_mynpiu$(this, old);
    else {
      this.decodeNull();
      tmp$ = old;
    }
    return tmp$;
  };
  Decoder.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'Decoder',
    interfaces: []
  };
  function CompositeDecoder() {
    CompositeDecoder$Companion_getInstance();
  }
  CompositeDecoder.prototype.endStructure_qatsm0$ = function (desc) {
  };
  function CompositeDecoder$Companion() {
    CompositeDecoder$Companion_instance = this;
    this.READ_DONE = -1;
    this.READ_ALL = -2;
    this.UNKNOWN_NAME = -3;
  }
  CompositeDecoder$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var CompositeDecoder$Companion_instance = null;
  function CompositeDecoder$Companion_getInstance() {
    if (CompositeDecoder$Companion_instance === null) {
      new CompositeDecoder$Companion();
    }
    return CompositeDecoder$Companion_instance;
  }
  CompositeDecoder.prototype.decodeCollectionSize_qatsm0$ = function (desc) {
    return -1;
  };
  CompositeDecoder.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'CompositeDecoder',
    interfaces: []
  };
  function ContextSerializer(serializableClass) {
    this.serializableClass = serializableClass;
    this.descriptor_f98ejb$_0 = new ContextSerializer$descriptor$ObjectLiteral('CONTEXT');
  }
  ContextSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var s = getByValueOrDefault(encoder.context, obj);
    encoder.encodeSerializableValue_tf03ej$(s, obj);
  };
  ContextSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var s = getOrDefault(decoder.context, this.serializableClass);
    return decoder.decodeSerializableValue_w63s0f$(s);
  };
  Object.defineProperty(ContextSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_f98ejb$_0;
    }
  });
  function ContextSerializer$descriptor$ObjectLiteral(name, generatedSerializer) {
    SerialClassDescImpl.call(this, name, generatedSerializer);
  }
  ContextSerializer$descriptor$ObjectLiteral.$metadata$ = {
    kind: Kind_CLASS,
    interfaces: [SerialClassDescImpl]
  };
  ContextSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ContextSerializer',
    interfaces: [KSerializer]
  };
  function SerialDescriptor() {
  }
  SerialDescriptor.prototype.getEntityAnnotations = function () {
    return emptyList();
  };
  SerialDescriptor.prototype.getElementAnnotations_za3lpa$ = function (index) {
    return emptyList();
  };
  Object.defineProperty(SerialDescriptor.prototype, 'elementsCount', {
    get: function () {
      return 0;
    }
  });
  var NotImplementedError_init = Kotlin.kotlin.NotImplementedError;
  SerialDescriptor.prototype.getElementDescriptor_za3lpa$ = function (index) {
    throw new NotImplementedError_init();
  };
  Object.defineProperty(SerialDescriptor.prototype, 'isNullable', {
    get: function () {
      return false;
    }
  });
  SerialDescriptor.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'SerialDescriptor',
    interfaces: []
  };
  function SerializationStrategy() {
  }
  SerializationStrategy.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'SerializationStrategy',
    interfaces: []
  };
  function DeserializationStrategy() {
  }
  DeserializationStrategy.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'DeserializationStrategy',
    interfaces: []
  };
  function UpdateMode(name, ordinal) {
    Enum.call(this);
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function UpdateMode_initFields() {
    UpdateMode_initFields = function () {
    };
    UpdateMode$BANNED_instance = new UpdateMode('BANNED', 0);
    UpdateMode$OVERWRITE_instance = new UpdateMode('OVERWRITE', 1);
    UpdateMode$UPDATE_instance = new UpdateMode('UPDATE', 2);
  }
  var UpdateMode$BANNED_instance;
  function UpdateMode$BANNED_getInstance() {
    UpdateMode_initFields();
    return UpdateMode$BANNED_instance;
  }
  var UpdateMode$OVERWRITE_instance;
  function UpdateMode$OVERWRITE_getInstance() {
    UpdateMode_initFields();
    return UpdateMode$OVERWRITE_instance;
  }
  var UpdateMode$UPDATE_instance;
  function UpdateMode$UPDATE_getInstance() {
    UpdateMode_initFields();
    return UpdateMode$UPDATE_instance;
  }
  UpdateMode.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UpdateMode',
    interfaces: [Enum]
  };
  function UpdateMode$values() {
    return [UpdateMode$BANNED_getInstance(), UpdateMode$OVERWRITE_getInstance(), UpdateMode$UPDATE_getInstance()];
  }
  UpdateMode.values = UpdateMode$values;
  function UpdateMode$valueOf(name) {
    switch (name) {
      case 'BANNED':
        return UpdateMode$BANNED_getInstance();
      case 'OVERWRITE':
        return UpdateMode$OVERWRITE_getInstance();
      case 'UPDATE':
        return UpdateMode$UPDATE_getInstance();
      default:throwISE('No enum constant kotlinx.serialization.UpdateMode.' + name);
    }
  }
  UpdateMode.valueOf_61zpoe$ = UpdateMode$valueOf;
  function KSerializer() {
  }
  KSerializer.prototype.patch_mynpiu$ = function (decoder, old) {
    throw new UpdateNotSupportedException(this.descriptor.name);
  };
  KSerializer.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'KSerializer',
    interfaces: [DeserializationStrategy, SerializationStrategy]
  };
  function SerializationConstructorMarker() {
  }
  SerializationConstructorMarker.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerializationConstructorMarker',
    interfaces: []
  };
  var encode = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.encode_w79e6d$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var serializer = _.kotlinx.serialization.serializer_1yb8b7$;
    var encode = _.kotlinx.serialization.encode_dt3ugd$;
    return function (T_0, isT, $receiver, obj) {
      encode($receiver, serializer(getKClass(T_0)), obj);
    };
  }));
  function encode_0($receiver, strategy, obj) {
    strategy.serialize_awe97i$($receiver, obj);
  }
  function encodeNullable($receiver, strategy, obj) {
    if (obj == null) {
      $receiver.encodeNull();
    }
     else {
      $receiver.encodeNotNullMark();
      strategy.serialize_awe97i$($receiver, obj);
    }
  }
  var decode = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.decode_q4riyv$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var serializer = _.kotlinx.serialization.serializer_1yb8b7$;
    var decode = _.kotlinx.serialization.decode_cmswi7$;
    return function (T_0, isT, $receiver) {
      return decode($receiver, serializer(getKClass(T_0)));
    };
  }));
  function decode_0($receiver, deserializer) {
    return deserializer.deserialize_nts5qn$($receiver);
  }
  function decodeNullable($receiver, deserializer) {
    return $receiver.decodeNotNullMark() ? decode_0($receiver, deserializer) : $receiver.decodeNull();
  }
  var deprecationText;
  function SerialKind() {
  }
  SerialKind.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialKind',
    interfaces: []
  };
  function PrimitiveKind() {
    SerialKind.call(this);
  }
  function PrimitiveKind$INT() {
    PrimitiveKind$INT_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$INT.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'INT',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$INT_instance = null;
  function PrimitiveKind$INT_getInstance() {
    if (PrimitiveKind$INT_instance === null) {
      new PrimitiveKind$INT();
    }
    return PrimitiveKind$INT_instance;
  }
  function PrimitiveKind$UNIT() {
    PrimitiveKind$UNIT_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$UNIT.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'UNIT',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$UNIT_instance = null;
  function PrimitiveKind$UNIT_getInstance() {
    if (PrimitiveKind$UNIT_instance === null) {
      new PrimitiveKind$UNIT();
    }
    return PrimitiveKind$UNIT_instance;
  }
  function PrimitiveKind$BOOLEAN() {
    PrimitiveKind$BOOLEAN_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$BOOLEAN.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BOOLEAN',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$BOOLEAN_instance = null;
  function PrimitiveKind$BOOLEAN_getInstance() {
    if (PrimitiveKind$BOOLEAN_instance === null) {
      new PrimitiveKind$BOOLEAN();
    }
    return PrimitiveKind$BOOLEAN_instance;
  }
  function PrimitiveKind$BYTE() {
    PrimitiveKind$BYTE_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$BYTE.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BYTE',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$BYTE_instance = null;
  function PrimitiveKind$BYTE_getInstance() {
    if (PrimitiveKind$BYTE_instance === null) {
      new PrimitiveKind$BYTE();
    }
    return PrimitiveKind$BYTE_instance;
  }
  function PrimitiveKind$SHORT() {
    PrimitiveKind$SHORT_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$SHORT.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'SHORT',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$SHORT_instance = null;
  function PrimitiveKind$SHORT_getInstance() {
    if (PrimitiveKind$SHORT_instance === null) {
      new PrimitiveKind$SHORT();
    }
    return PrimitiveKind$SHORT_instance;
  }
  function PrimitiveKind$LONG() {
    PrimitiveKind$LONG_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$LONG.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'LONG',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$LONG_instance = null;
  function PrimitiveKind$LONG_getInstance() {
    if (PrimitiveKind$LONG_instance === null) {
      new PrimitiveKind$LONG();
    }
    return PrimitiveKind$LONG_instance;
  }
  function PrimitiveKind$FLOAT() {
    PrimitiveKind$FLOAT_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$FLOAT.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'FLOAT',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$FLOAT_instance = null;
  function PrimitiveKind$FLOAT_getInstance() {
    if (PrimitiveKind$FLOAT_instance === null) {
      new PrimitiveKind$FLOAT();
    }
    return PrimitiveKind$FLOAT_instance;
  }
  function PrimitiveKind$DOUBLE() {
    PrimitiveKind$DOUBLE_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$DOUBLE.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DOUBLE',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$DOUBLE_instance = null;
  function PrimitiveKind$DOUBLE_getInstance() {
    if (PrimitiveKind$DOUBLE_instance === null) {
      new PrimitiveKind$DOUBLE();
    }
    return PrimitiveKind$DOUBLE_instance;
  }
  function PrimitiveKind$CHAR() {
    PrimitiveKind$CHAR_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$CHAR.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'CHAR',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$CHAR_instance = null;
  function PrimitiveKind$CHAR_getInstance() {
    if (PrimitiveKind$CHAR_instance === null) {
      new PrimitiveKind$CHAR();
    }
    return PrimitiveKind$CHAR_instance;
  }
  function PrimitiveKind$STRING() {
    PrimitiveKind$STRING_instance = this;
    PrimitiveKind.call(this);
  }
  PrimitiveKind$STRING.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'STRING',
    interfaces: [PrimitiveKind]
  };
  var PrimitiveKind$STRING_instance = null;
  function PrimitiveKind$STRING_getInstance() {
    if (PrimitiveKind$STRING_instance === null) {
      new PrimitiveKind$STRING();
    }
    return PrimitiveKind$STRING_instance;
  }
  PrimitiveKind.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PrimitiveKind',
    interfaces: [SerialKind]
  };
  function StructureKind() {
    SerialKind.call(this);
  }
  function StructureKind$CLASS() {
    StructureKind$CLASS_instance = this;
    StructureKind.call(this);
  }
  StructureKind$CLASS.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'CLASS',
    interfaces: [StructureKind]
  };
  var StructureKind$CLASS_instance = null;
  function StructureKind$CLASS_getInstance() {
    if (StructureKind$CLASS_instance === null) {
      new StructureKind$CLASS();
    }
    return StructureKind$CLASS_instance;
  }
  function StructureKind$LIST() {
    StructureKind$LIST_instance = this;
    StructureKind.call(this);
  }
  StructureKind$LIST.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'LIST',
    interfaces: [StructureKind]
  };
  var StructureKind$LIST_instance = null;
  function StructureKind$LIST_getInstance() {
    if (StructureKind$LIST_instance === null) {
      new StructureKind$LIST();
    }
    return StructureKind$LIST_instance;
  }
  function StructureKind$MAP() {
    StructureKind$MAP_instance = this;
    StructureKind.call(this);
  }
  StructureKind$MAP.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'MAP',
    interfaces: [StructureKind]
  };
  var StructureKind$MAP_instance = null;
  function StructureKind$MAP_getInstance() {
    if (StructureKind$MAP_instance === null) {
      new StructureKind$MAP();
    }
    return StructureKind$MAP_instance;
  }
  StructureKind.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StructureKind',
    interfaces: [SerialKind]
  };
  function UnionKind() {
    SerialKind.call(this);
  }
  function UnionKind$OBJECT() {
    UnionKind$OBJECT_instance = this;
    UnionKind.call(this);
  }
  UnionKind$OBJECT.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'OBJECT',
    interfaces: [UnionKind]
  };
  var UnionKind$OBJECT_instance = null;
  function UnionKind$OBJECT_getInstance() {
    if (UnionKind$OBJECT_instance === null) {
      new UnionKind$OBJECT();
    }
    return UnionKind$OBJECT_instance;
  }
  function UnionKind$ENUM_KIND() {
    UnionKind$ENUM_KIND_instance = this;
    UnionKind.call(this);
  }
  UnionKind$ENUM_KIND.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ENUM_KIND',
    interfaces: [UnionKind]
  };
  var UnionKind$ENUM_KIND_instance = null;
  function UnionKind$ENUM_KIND_getInstance() {
    if (UnionKind$ENUM_KIND_instance === null) {
      new UnionKind$ENUM_KIND();
    }
    return UnionKind$ENUM_KIND_instance;
  }
  function UnionKind$SEALED() {
    UnionKind$SEALED_instance = this;
    UnionKind.call(this);
  }
  UnionKind$SEALED.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'SEALED',
    interfaces: [UnionKind]
  };
  var UnionKind$SEALED_instance = null;
  function UnionKind$SEALED_getInstance() {
    if (UnionKind$SEALED_instance === null) {
      new UnionKind$SEALED();
    }
    return UnionKind$SEALED_instance;
  }
  function UnionKind$POLYMORPHIC() {
    UnionKind$POLYMORPHIC_instance = this;
    UnionKind.call(this);
  }
  UnionKind$POLYMORPHIC.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'POLYMORPHIC',
    interfaces: [UnionKind]
  };
  var UnionKind$POLYMORPHIC_instance = null;
  function UnionKind$POLYMORPHIC_getInstance() {
    if (UnionKind$POLYMORPHIC_instance === null) {
      new UnionKind$POLYMORPHIC();
    }
    return UnionKind$POLYMORPHIC_instance;
  }
  UnionKind.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UnionKind',
    interfaces: [SerialKind]
  };
  function PrimitiveDescriptorWithName(name, original) {
    this.name_8ltsgd$_0 = name;
    this.original = original;
  }
  Object.defineProperty(PrimitiveDescriptorWithName.prototype, 'name', {
    get: function () {
      return this.name_8ltsgd$_0;
    }
  });
  Object.defineProperty(PrimitiveDescriptorWithName.prototype, 'elementsCount', {
    get: function () {
      return this.original.elementsCount;
    }
  });
  Object.defineProperty(PrimitiveDescriptorWithName.prototype, 'isNullable', {
    get: function () {
      return this.original.isNullable;
    }
  });
  Object.defineProperty(PrimitiveDescriptorWithName.prototype, 'kind', {
    get: function () {
      return this.original.kind;
    }
  });
  PrimitiveDescriptorWithName.prototype.getElementAnnotations_za3lpa$ = function (index) {
    return this.original.getElementAnnotations_za3lpa$(index);
  };
  PrimitiveDescriptorWithName.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return this.original.getElementDescriptor_za3lpa$(index);
  };
  PrimitiveDescriptorWithName.prototype.getElementIndex_61zpoe$ = function (name) {
    return this.original.getElementIndex_61zpoe$(name);
  };
  PrimitiveDescriptorWithName.prototype.getElementName_za3lpa$ = function (index) {
    return this.original.getElementName_za3lpa$(index);
  };
  PrimitiveDescriptorWithName.prototype.getEntityAnnotations = function () {
    return this.original.getEntityAnnotations();
  };
  PrimitiveDescriptorWithName.prototype.isElementOptional_za3lpa$ = function (index) {
    return this.original.isElementOptional_za3lpa$(index);
  };
  PrimitiveDescriptorWithName.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PrimitiveDescriptorWithName',
    interfaces: [SerialDescriptor]
  };
  function withName($receiver, name) {
    return new PrimitiveDescriptorWithName(name, $receiver);
  }
  function ElementValueEncoder() {
    this.context_p94q9z$_0 = EmptyContext_getInstance();
  }
  Object.defineProperty(ElementValueEncoder.prototype, 'context', {
    get: function () {
      return this.context_p94q9z$_0;
    },
    set: function (context) {
      this.context_p94q9z$_0 = context;
    }
  });
  ElementValueEncoder.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    return this;
  };
  ElementValueEncoder.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    return true;
  };
  ElementValueEncoder.prototype.encodeNotNullMark = function () {
  };
  ElementValueEncoder.prototype.encodeValue_za3rmp$ = function (value) {
    throw new SerializationException('Non-serializable ' + Kotlin.getKClassFromExpression(value) + ' is not supported by ' + Kotlin.getKClassFromExpression(this) + ' encoder');
  };
  ElementValueEncoder.prototype.encodeNull = function () {
    throw new SerializationException('null is not supported');
  };
  ElementValueEncoder.prototype.encodeUnit = function () {
    var encoder = this.beginStructure_r0sa6z$(UnitSerializer_getInstance().descriptor, []);
    encoder.endStructure_qatsm0$(UnitSerializer_getInstance().descriptor);
  };
  ElementValueEncoder.prototype.encodeBoolean_6taknv$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeByte_s8j3t7$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeShort_mq22fl$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeInt_za3lpa$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeLong_s8cxhz$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeFloat_mx4ult$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeDouble_14dthe$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeChar_s8itvh$ = function (value) {
    this.encodeValue_za3rmp$(toBoxedChar(value));
  };
  ElementValueEncoder.prototype.encodeString_61zpoe$ = function (value) {
    this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeEnum_39yahq$ = function (enumDescription, ordinal) {
    this.encodeValue_za3rmp$(ordinal);
  };
  ElementValueEncoder.prototype.encodeNonSerializableElement_4wpkd1$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeValue_za3rmp$(value);
  };
  ElementValueEncoder.prototype.encodeUnitElement_3zr2iy$ = function (desc, index) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeUnit();
  };
  ElementValueEncoder.prototype.encodeBooleanElement_w1b0nl$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeBoolean_6taknv$(value);
  };
  ElementValueEncoder.prototype.encodeByteElement_a3tadb$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeByte_s8j3t7$(value);
  };
  ElementValueEncoder.prototype.encodeShortElement_tet9k5$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeShort_mq22fl$(value);
  };
  ElementValueEncoder.prototype.encodeIntElement_4wpqag$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeInt_za3lpa$(value);
  };
  ElementValueEncoder.prototype.encodeLongElement_a3zgoj$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeLong_s8cxhz$(value);
  };
  ElementValueEncoder.prototype.encodeFloatElement_t7qhdx$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeFloat_mx4ult$(value);
  };
  ElementValueEncoder.prototype.encodeDoubleElement_imzr5k$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeDouble_14dthe$(value);
  };
  ElementValueEncoder.prototype.encodeCharElement_a3tkb1$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeChar_s8itvh$(value);
  };
  ElementValueEncoder.prototype.encodeStringElement_bgm7zs$ = function (desc, index, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeString_61zpoe$(value);
  };
  ElementValueEncoder.prototype.encodeSerializableElement_blecud$ = function (desc, index, serializer, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeSerializableValue_tf03ej$(serializer, value);
  };
  ElementValueEncoder.prototype.encodeNullableSerializableElement_orpvvi$ = function (desc, index, serializer, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeNullableSerializableValue_f4686g$(serializer, value);
  };
  ElementValueEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ElementValueEncoder',
    interfaces: [CompositeEncoder, Encoder]
  };
  function ElementValueDecoder() {
    this.context_meet3z$_0 = EmptyContext_getInstance();
    this.updateMode_fmb1ae$_0 = UpdateMode$UPDATE_getInstance();
  }
  Object.defineProperty(ElementValueDecoder.prototype, 'context', {
    get: function () {
      return this.context_meet3z$_0;
    },
    set: function (context) {
      this.context_meet3z$_0 = context;
    }
  });
  Object.defineProperty(ElementValueDecoder.prototype, 'updateMode', {
    get: function () {
      return this.updateMode_fmb1ae$_0;
    }
  });
  ElementValueDecoder.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    return -2;
  };
  ElementValueDecoder.prototype.decodeNotNullMark = function () {
    return true;
  };
  ElementValueDecoder.prototype.decodeNull = function () {
    return null;
  };
  ElementValueDecoder.prototype.decodeValue = function () {
    throw new SerializationException(Kotlin.getKClassFromExpression(this).toString() + " can't retrieve untyped values");
  };
  ElementValueDecoder.prototype.decodeUnit = function () {
    var reader = this.beginStructure_r0sa6z$(UnitSerializer_getInstance().descriptor, []);
    reader.endStructure_qatsm0$(UnitSerializer_getInstance().descriptor);
  };
  ElementValueDecoder.prototype.decodeBoolean = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'boolean' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeByte = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeShort = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeInt = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeLong = function () {
    var tmp$;
    return Kotlin.isType(tmp$ = this.decodeValue(), Kotlin.Long) ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeFloat = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeDouble = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeChar = function () {
    var tmp$;
    return Kotlin.isChar(tmp$ = this.decodeValue()) ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeString = function () {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'string' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.decodeEnum_w849qs$ = function (enumDescription) {
    var tmp$;
    return typeof (tmp$ = this.decodeValue()) === 'number' ? tmp$ : throwCCE();
  };
  ElementValueDecoder.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    return this;
  };
  ElementValueDecoder.prototype.decodeUnitElement_3zr2iy$ = function (desc, index) {
    this.decodeUnit();
  };
  ElementValueDecoder.prototype.decodeBooleanElement_3zr2iy$ = function (desc, index) {
    return this.decodeBoolean();
  };
  ElementValueDecoder.prototype.decodeByteElement_3zr2iy$ = function (desc, index) {
    return this.decodeByte();
  };
  ElementValueDecoder.prototype.decodeShortElement_3zr2iy$ = function (desc, index) {
    return this.decodeShort();
  };
  ElementValueDecoder.prototype.decodeIntElement_3zr2iy$ = function (desc, index) {
    return this.decodeInt();
  };
  ElementValueDecoder.prototype.decodeLongElement_3zr2iy$ = function (desc, index) {
    return this.decodeLong();
  };
  ElementValueDecoder.prototype.decodeFloatElement_3zr2iy$ = function (desc, index) {
    return this.decodeFloat();
  };
  ElementValueDecoder.prototype.decodeDoubleElement_3zr2iy$ = function (desc, index) {
    return this.decodeDouble();
  };
  ElementValueDecoder.prototype.decodeCharElement_3zr2iy$ = function (desc, index) {
    return this.decodeChar();
  };
  ElementValueDecoder.prototype.decodeStringElement_3zr2iy$ = function (desc, index) {
    return this.decodeString();
  };
  ElementValueDecoder.prototype.decodeSerializableElement_s44l7r$ = function (desc, index, deserializer) {
    return this.decodeSerializableValue_w63s0f$(deserializer);
  };
  ElementValueDecoder.prototype.decodeNullableSerializableElement_cwlm4k$ = function (desc, index, deserializer) {
    return this.decodeNullableSerializableValue_aae3ea$(deserializer);
  };
  ElementValueDecoder.prototype.updateSerializableElement_ehubvl$ = function (desc, index, deserializer, old) {
    return this.updateSerializableValue_19c8k5$(deserializer, old);
  };
  ElementValueDecoder.prototype.updateNullableSerializableElement_u33s02$ = function (desc, index, deserializer, old) {
    return this.updateNullableSerializableValue_exmlbs$(deserializer, old);
  };
  ElementValueDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ElementValueDecoder',
    interfaces: [CompositeDecoder, Decoder]
  };
  function SerializationException(message, cause) {
    if (cause === void 0)
      cause = null;
    RuntimeException.call(this, message, cause);
    this.name = 'SerializationException';
  }
  SerializationException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerializationException',
    interfaces: [RuntimeException]
  };
  function MissingFieldException(fieldName) {
    SerializationException.call(this, "Field '" + fieldName + "' is required, but it was missing");
    this.name = 'MissingFieldException';
  }
  MissingFieldException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MissingFieldException',
    interfaces: [SerializationException]
  };
  function UnknownFieldException(index) {
    SerializationException.call(this, 'Unknown field for index ' + index);
    this.name = 'UnknownFieldException';
  }
  UnknownFieldException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UnknownFieldException',
    interfaces: [SerializationException]
  };
  function UpdateNotSupportedException(className) {
    SerializationException.call(this, 'Update is not supported for ' + className);
    this.name = 'UpdateNotSupportedException';
  }
  UpdateNotSupportedException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UpdateNotSupportedException',
    interfaces: [SerializationException]
  };
  function Mapper() {
    Mapper$Companion_getInstance();
    AbstractSerialFormat.call(this);
  }
  function Mapper$OutMapper($outer) {
    this.$outer = $outer;
    NamedValueEncoder.call(this);
    this.context = this.$outer.context;
    this._map_0 = LinkedHashMap_init();
  }
  Mapper$OutMapper.prototype.beginCollection_gly1x5$ = function (desc, collectionSize, typeParams) {
    this.encodeTaggedInt_dpg1yx$(this.nested_61zpoe$('size'), collectionSize);
    return this;
  };
  Object.defineProperty(Mapper$OutMapper.prototype, 'map', {
    get: function () {
      return this._map_0;
    }
  });
  Mapper$OutMapper.prototype.encodeTaggedValue_dpg7wc$ = function (tag, value) {
    this._map_0.put_xwzc9p$(tag, value);
  };
  Mapper$OutMapper.prototype.encodeTaggedNull_11rb$ = function (tag) {
    throw new SerializationException('null is not supported. use Mapper.mapNullable()/OutNullableMapper instead');
  };
  Mapper$OutMapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'OutMapper',
    interfaces: [NamedValueEncoder]
  };
  function Mapper$OutNullableMapper($outer) {
    this.$outer = $outer;
    NamedValueEncoder.call(this);
    this.context = this.$outer.context;
    this._map_0 = LinkedHashMap_init();
  }
  Object.defineProperty(Mapper$OutNullableMapper.prototype, 'map', {
    get: function () {
      return this._map_0;
    }
  });
  Mapper$OutNullableMapper.prototype.beginCollection_gly1x5$ = function (desc, collectionSize, typeParams) {
    this.encodeTaggedInt_dpg1yx$(this.nested_61zpoe$('size'), collectionSize);
    return this;
  };
  Mapper$OutNullableMapper.prototype.encodeTaggedValue_dpg7wc$ = function (tag, value) {
    this._map_0.put_xwzc9p$(tag, value);
  };
  Mapper$OutNullableMapper.prototype.encodeTaggedNull_11rb$ = function (tag) {
    this._map_0.put_xwzc9p$(tag, null);
  };
  Mapper$OutNullableMapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'OutNullableMapper',
    interfaces: [NamedValueEncoder]
  };
  function Mapper$InMapper($outer, map) {
    this.$outer = $outer;
    NamedValueDecoder.call(this);
    this.map = map;
    this.context = this.$outer.context;
  }
  Mapper$InMapper.prototype.decodeCollectionSize_qatsm0$ = function (desc) {
    return this.decodeTaggedInt_11rb$(this.nested_61zpoe$('size'));
  };
  Mapper$InMapper.prototype.decodeTaggedValue_11rb$ = function (tag) {
    return getValue(this.map, tag);
  };
  Mapper$InMapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'InMapper',
    interfaces: [NamedValueDecoder]
  };
  function Mapper$InNullableMapper($outer, map) {
    this.$outer = $outer;
    NamedValueDecoder.call(this);
    this.map = map;
    this.context = this.$outer.context;
  }
  Mapper$InNullableMapper.prototype.decodeCollectionSize_qatsm0$ = function (desc) {
    return this.decodeTaggedInt_11rb$(this.nested_61zpoe$('size'));
  };
  Mapper$InNullableMapper.prototype.decodeTaggedValue_11rb$ = function (tag) {
    return ensureNotNull(getValue(this.map, tag));
  };
  Mapper$InNullableMapper.prototype.decodeTaggedNotNullMark_11rb$ = function (tag) {
    var $receiver = this.map;
    var tmp$;
    return !(Kotlin.isType(tmp$ = $receiver, Map) ? tmp$ : throwCCE()).containsKey_11rb$(tag) || getValue(this.map, tag) != null;
  };
  Mapper$InNullableMapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'InNullableMapper',
    interfaces: [NamedValueDecoder]
  };
  Mapper.prototype.map_tf03ej$ = function (strategy, obj) {
    var m = new Mapper$OutMapper(this);
    encode_0(m, strategy, obj);
    return m.map;
  };
  Mapper.prototype.mapNullable_tf03ej$ = function (strategy, obj) {
    var m = new Mapper$OutNullableMapper(this);
    encode_0(m, strategy, obj);
    return m.map;
  };
  Mapper.prototype.unmap_3ps4yb$ = function (strategy, map) {
    var m = new Mapper$InMapper(this, map);
    return decode_0(m, strategy);
  };
  Mapper.prototype.unmapNullable_qfajvo$ = function (strategy, map) {
    var m = new Mapper$InNullableMapper(this, map);
    return decode_0(m, strategy);
  };
  Mapper.prototype.map_issdgt$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.map_issdgt$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, obj) {
      return this.map_tf03ej$(getOrDefault(this.context, getKClass(T_0)), obj);
    };
  }));
  Mapper.prototype.mapNullable_issdgt$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.mapNullable_issdgt$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, obj) {
      return this.mapNullable_tf03ej$(getOrDefault(this.context, getKClass(T_0)), obj);
    };
  }));
  Mapper.prototype.unmap_67iyj5$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.unmap_67iyj5$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, map) {
      return this.unmap_3ps4yb$(getOrDefault(this.context, getKClass(T_0)), map);
    };
  }));
  Mapper.prototype.unmapNullable_mez6f0$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.unmapNullable_mez6f0$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, map) {
      return this.unmapNullable_qfajvo$(getOrDefault(this.context, getKClass(T_0)), map);
    };
  }));
  function Mapper$Companion() {
    Mapper$Companion_instance = this;
    this.default = new Mapper();
  }
  Mapper$Companion.prototype.map_tf03ej$ = function (strategy, obj) {
    return this.default.map_tf03ej$(strategy, obj);
  };
  Mapper$Companion.prototype.mapNullable_tf03ej$ = function (strategy, obj) {
    return this.default.mapNullable_tf03ej$(strategy, obj);
  };
  Mapper$Companion.prototype.unmap_3ps4yb$ = function (strategy, map) {
    return this.default.unmap_3ps4yb$(strategy, map);
  };
  Mapper$Companion.prototype.unmapNullable_qfajvo$ = function (strategy, map) {
    return this.default.unmapNullable_qfajvo$(strategy, map);
  };
  Mapper$Companion.prototype.map_issdgt$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.Companion.map_issdgt$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, obj) {
      var $this = this.default;
      return $this.map_tf03ej$(getOrDefault($this.context, getKClass(T_0)), obj);
    };
  }));
  Mapper$Companion.prototype.mapNullable_issdgt$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.Companion.mapNullable_issdgt$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, obj) {
      var $this = this.default;
      return $this.mapNullable_tf03ej$(getOrDefault($this.context, getKClass(T_0)), obj);
    };
  }));
  Mapper$Companion.prototype.unmap_67iyj5$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.Companion.unmap_67iyj5$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, map) {
      var $this = this.default;
      return $this.unmap_3ps4yb$(getOrDefault($this.context, getKClass(T_0)), map);
    };
  }));
  Mapper$Companion.prototype.unmapNullable_mez6f0$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.Mapper.Companion.unmapNullable_mez6f0$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, map) {
      var $this = this.default;
      return $this.unmapNullable_qfajvo$(getOrDefault($this.context, getKClass(T_0)), map);
    };
  }));
  Mapper$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Mapper$Companion_instance = null;
  function Mapper$Companion_getInstance() {
    if (Mapper$Companion_instance === null) {
      new Mapper$Companion();
    }
    return Mapper$Companion_instance;
  }
  Mapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Mapper',
    interfaces: [AbstractSerialFormat]
  };
  function serializer($receiver) {
    var tmp$, tmp$_0;
    tmp$_0 = (tmp$ = compiledSerializer($receiver)) != null ? tmp$ : defaultSerializer($receiver);
    if (tmp$_0 == null) {
      throw new SerializationException("Can't locate argument-less serializer for " + $receiver + '. For generic classes, such as lists, please provide serializer explicitly.');
    }
    return tmp$_0;
  }
  function SerialFormat() {
  }
  SerialFormat.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'SerialFormat',
    interfaces: []
  };
  function AbstractSerialFormat() {
    this.mutableContext = new MutableSerialContextImpl();
  }
  AbstractSerialFormat.prototype.install_7fck8k$ = function (module_0) {
    module_0.registerIn_slu7av$(this.mutableContext);
  };
  Object.defineProperty(AbstractSerialFormat.prototype, 'context', {
    get: function () {
      return this.mutableContext;
    }
  });
  AbstractSerialFormat.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractSerialFormat',
    interfaces: [SerialFormat]
  };
  function BinaryFormat() {
  }
  BinaryFormat.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'BinaryFormat',
    interfaces: [SerialFormat]
  };
  function dumps($receiver, serializer, obj) {
    return HexConverter_getInstance().printHexBinary_1fhb37$($receiver.dump_tf03ej$(serializer, obj), true);
  }
  function loads($receiver, deserializer, hex) {
    return $receiver.load_dntfbn$(deserializer, HexConverter_getInstance().parseHexBinary_61zpoe$(hex));
  }
  function StringFormat() {
  }
  StringFormat.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'StringFormat',
    interfaces: [SerialFormat]
  };
  function ImplicitReflectionSerializer() {
  }
  ImplicitReflectionSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ImplicitReflectionSerializer',
    interfaces: [Annotation]
  };
  var dump = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.dump_nz3mh7$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, obj) {
      return $receiver.dump_tf03ej$(getOrDefault($receiver.context, getKClass(T_0)), obj);
    };
  }));
  var dumps_0 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.dumps_nz3mh7$', wrapFunction(function () {
    var internal = _.kotlinx.serialization.internal;
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, obj) {
      return internal.HexConverter.printHexBinary_1fhb37$($receiver.dump_tf03ej$(getOrDefault($receiver.context, getKClass(T_0)), obj), true);
    };
  }));
  var load = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.load_716s99$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, raw) {
      return $receiver.load_dntfbn$(getOrDefault($receiver.context, getKClass(T_0)), raw);
    };
  }));
  var loads_0 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.loads_nps2g3$', wrapFunction(function () {
    var internal = _.kotlinx.serialization.internal;
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, hex) {
      var raw = internal.HexConverter.parseHexBinary_61zpoe$(hex);
      return $receiver.load_dntfbn$(getOrDefault($receiver.context, getKClass(T_0)), raw);
    };
  }));
  var stringify = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.stringify_f0yoh1$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, obj) {
      return $receiver.stringify_tf03ej$(getOrDefault($receiver.context, getKClass(T_0)), obj);
    };
  }));
  var stringify_0 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.stringify_y3khs0$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    var get_list = _.kotlinx.serialization.get_list_gekvwj$;
    return function (T_0, isT, $receiver, objects) {
      return $receiver.stringify_tf03ej$(get_list(getOrDefault($receiver.context, getKClass(T_0))), objects);
    };
  }));
  var stringify_1 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.stringify_yz7s7b$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    var to = Kotlin.kotlin.to_ujzrz7$;
    var get_map = _.kotlinx.serialization.get_map_kgqhr1$;
    return function (K_0, isK, V_0, isV, $receiver, map) {
      return $receiver.stringify_tf03ej$(get_map(to(getOrDefault($receiver.context, getKClass(K_0)), getOrDefault($receiver.context, getKClass(V_0)))), map);
    };
  }));
  var parse = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.parse_rw0txp$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, $receiver, str) {
      return $receiver.parse_awif5v$(getOrDefault($receiver.context, getKClass(T_0)), str);
    };
  }));
  var parseList = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.parseList_rw0txp$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    var get_list = _.kotlinx.serialization.get_list_gekvwj$;
    return function (T_0, isT, $receiver, objects) {
      return $receiver.parse_awif5v$(get_list(getOrDefault($receiver.context, getKClass(T_0))), objects);
    };
  }));
  var parseMap = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.parseMap_egzuvf$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    var to = Kotlin.kotlin.to_ujzrz7$;
    var get_map = _.kotlinx.serialization.get_map_kgqhr1$;
    return function (K_0, isK, V_0, isV, $receiver, map) {
      return $receiver.parse_awif5v$(get_map(to(getOrDefault($receiver.context, getKClass(K_0)), getOrDefault($receiver.context, getKClass(V_0)))), map);
    };
  }));
  function get_list($receiver) {
    return new ArrayListSerializer($receiver);
  }
  function get_set($receiver) {
    return new LinkedHashSetSerializer($receiver);
  }
  function get_map($receiver) {
    return new LinkedHashMapSerializer($receiver.first, $receiver.second);
  }
  function serializer_0($receiver) {
    return StringSerializer_getInstance();
  }
  function serializer_1($receiver) {
    return CharSerializer_getInstance();
  }
  function serializer_2($receiver) {
    return ByteSerializer_getInstance();
  }
  function serializer_3($receiver) {
    return ShortSerializer_getInstance();
  }
  function serializer_4($receiver) {
    return IntSerializer_getInstance();
  }
  function serializer_5($receiver) {
    return LongSerializer_getInstance();
  }
  function serializer_6($receiver) {
    return FloatSerializer_getInstance();
  }
  function serializer_7($receiver) {
    return DoubleSerializer_getInstance();
  }
  function serializer_8($receiver) {
    return BooleanSerializer_getInstance();
  }
  var collectionSizeOrDefault = Kotlin.kotlin.collections.collectionSizeOrDefault_ba2ldo$;
  var ArrayList_init_1 = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  function elementDescriptors($receiver) {
    var $receiver_0 = until(0, $receiver.elementsCount);
    var destination = ArrayList_init_1(collectionSizeOrDefault($receiver_0, 10));
    var tmp$;
    tmp$ = $receiver_0.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      destination.add_11rb$($receiver.getElementDescriptor_za3lpa$(item));
    }
    return destination;
  }
  function getElementIndexOrThrow($receiver, name) {
    var i = $receiver.getElementIndex_61zpoe$(name);
    if (i === -3)
      throw new SerializationException("Unknown name '" + name + "'");
    return i;
  }
  function get_associatedFieldsCount($receiver) {
    return $receiver.elementsCount;
  }
  function SerialId(id) {
    this.id = id;
  }
  function SerialId$Impl() {
  }
  SerialId$Impl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Impl',
    interfaces: [SerialId]
  };
  SerialId.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialId',
    interfaces: [Annotation]
  };
  function SerialTag(tag) {
    this.tag = tag;
  }
  function SerialTag$Impl() {
  }
  SerialTag$Impl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Impl',
    interfaces: [SerialTag]
  };
  SerialTag.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialTag',
    interfaces: [Annotation]
  };
  function TaggedEncoder() {
    this.context_9ehmea$_0 = EmptyContext_getInstance();
    this.tagStack_s9w57d$_0 = ArrayList_init_0();
  }
  Object.defineProperty(TaggedEncoder.prototype, 'context', {
    get: function () {
      return this.context_9ehmea$_0;
    },
    set: function (context) {
      this.context_9ehmea$_0 = context;
    }
  });
  TaggedEncoder.prototype.encodeTaggedValue_dpg7wc$ = function (tag, value) {
    throw new SerializationException('Non-serializable ' + Kotlin.getKClassFromExpression(value) + ' is not supported by ' + Kotlin.getKClassFromExpression(this) + ' encoder');
  };
  TaggedEncoder.prototype.encodeTaggedNotNullMark_11rb$ = function (tag) {
  };
  TaggedEncoder.prototype.encodeTaggedNull_11rb$ = function (tag) {
    throw new SerializationException('null is not supported');
  };
  TaggedEncoder.prototype.encodeTaggedNullable_vhmgtl$_0 = function (tag, value) {
    if (value == null) {
      this.encodeTaggedNull_11rb$(tag);
    }
     else {
      this.encodeTaggedNotNullMark_11rb$(tag);
      this.encodeTaggedValue_dpg7wc$(tag, value);
    }
  };
  TaggedEncoder.prototype.encodeTaggedUnit_11rb$ = function (tag) {
    this.encodeTaggedValue_dpg7wc$(tag, Unit);
  };
  TaggedEncoder.prototype.encodeTaggedInt_dpg1yx$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedByte_19qe40$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedShort_veccj0$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedLong_19wkf8$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedFloat_vlf4p8$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedDouble_e37ph5$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedBoolean_iuyhfk$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedChar_19qo1q$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, toBoxedChar(value));
  };
  TaggedEncoder.prototype.encodeTaggedString_l9l8mx$ = function (tag, value) {
    this.encodeTaggedValue_dpg7wc$(tag, value);
  };
  TaggedEncoder.prototype.encodeTaggedEnum_g3arax$ = function (tag, enumDescription, ordinal) {
    this.encodeTaggedValue_dpg7wc$(tag, ordinal);
  };
  TaggedEncoder.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    var tag = this.getTag_m47q6f$(desc, index);
    var shouldWriteElement = this.shouldWriteElement_a5qihn$(desc, tag, index);
    if (shouldWriteElement) {
      this.pushTag_b54poa$_0(tag);
    }
    return shouldWriteElement;
  };
  TaggedEncoder.prototype.shouldWriteElement_a5qihn$ = function (desc, tag, index) {
    return true;
  };
  TaggedEncoder.prototype.encodeNotNullMark = function () {
    this.encodeTaggedNotNullMark_11rb$(this.currentTag);
  };
  TaggedEncoder.prototype.encodeNull = function () {
    this.encodeTaggedNull_11rb$(this.popTag_hzle9u$_0());
  };
  TaggedEncoder.prototype.encodeUnit = function () {
    this.encodeTaggedUnit_11rb$(this.popTag_hzle9u$_0());
  };
  TaggedEncoder.prototype.encodeBoolean_6taknv$ = function (value) {
    this.encodeTaggedBoolean_iuyhfk$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeByte_s8j3t7$ = function (value) {
    this.encodeTaggedByte_19qe40$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeShort_mq22fl$ = function (value) {
    this.encodeTaggedShort_veccj0$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeInt_za3lpa$ = function (value) {
    this.encodeTaggedInt_dpg1yx$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeLong_s8cxhz$ = function (value) {
    this.encodeTaggedLong_19wkf8$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeFloat_mx4ult$ = function (value) {
    this.encodeTaggedFloat_vlf4p8$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeDouble_14dthe$ = function (value) {
    this.encodeTaggedDouble_e37ph5$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeChar_s8itvh$ = function (value) {
    this.encodeTaggedChar_19qo1q$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeString_61zpoe$ = function (value) {
    this.encodeTaggedString_l9l8mx$(this.popTag_hzle9u$_0(), value);
  };
  TaggedEncoder.prototype.encodeEnum_39yahq$ = function (enumDescription, ordinal) {
    this.encodeTaggedEnum_g3arax$(this.popTag_hzle9u$_0(), enumDescription, ordinal);
  };
  TaggedEncoder.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    return this;
  };
  TaggedEncoder.prototype.endStructure_qatsm0$ = function (desc) {
    if (!this.tagStack_s9w57d$_0.isEmpty())
      this.popTag_hzle9u$_0();
    this.endEncode_qatsm0$(desc);
  };
  TaggedEncoder.prototype.endEncode_qatsm0$ = function (desc) {
  };
  TaggedEncoder.prototype.encodeNonSerializableElement_4wpkd1$ = function (desc, index, value) {
    this.encodeTaggedValue_dpg7wc$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeUnitElement_3zr2iy$ = function (desc, index) {
    this.encodeTaggedUnit_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedEncoder.prototype.encodeBooleanElement_w1b0nl$ = function (desc, index, value) {
    this.encodeTaggedBoolean_iuyhfk$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeByteElement_a3tadb$ = function (desc, index, value) {
    this.encodeTaggedByte_19qe40$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeShortElement_tet9k5$ = function (desc, index, value) {
    this.encodeTaggedShort_veccj0$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeIntElement_4wpqag$ = function (desc, index, value) {
    this.encodeTaggedInt_dpg1yx$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeLongElement_a3zgoj$ = function (desc, index, value) {
    this.encodeTaggedLong_19wkf8$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeFloatElement_t7qhdx$ = function (desc, index, value) {
    this.encodeTaggedFloat_vlf4p8$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeDoubleElement_imzr5k$ = function (desc, index, value) {
    this.encodeTaggedDouble_e37ph5$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeCharElement_a3tkb1$ = function (desc, index, value) {
    this.encodeTaggedChar_19qo1q$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeStringElement_bgm7zs$ = function (desc, index, value) {
    this.encodeTaggedString_l9l8mx$(this.getTag_m47q6f$(desc, index), value);
  };
  TaggedEncoder.prototype.encodeSerializableElement_blecud$ = function (desc, index, serializer, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeSerializableValue_tf03ej$(serializer, value);
  };
  TaggedEncoder.prototype.encodeNullableSerializableElement_orpvvi$ = function (desc, index, serializer, value) {
    if (this.encodeElement_3zr2iy$(desc, index))
      this.encodeNullableSerializableValue_f4686g$(serializer, value);
  };
  Object.defineProperty(TaggedEncoder.prototype, 'currentTag', {
    get: function () {
      return last(this.tagStack_s9w57d$_0);
    }
  });
  Object.defineProperty(TaggedEncoder.prototype, 'currentTagOrNull', {
    get: function () {
      return lastOrNull(this.tagStack_s9w57d$_0);
    }
  });
  TaggedEncoder.prototype.pushTag_b54poa$_0 = function (name) {
    this.tagStack_s9w57d$_0.add_11rb$(name);
  };
  TaggedEncoder.prototype.popTag_hzle9u$_0 = function () {
    if (!this.tagStack_s9w57d$_0.isEmpty())
      return this.tagStack_s9w57d$_0.removeAt_za3lpa$(get_lastIndex(this.tagStack_s9w57d$_0));
    else
      throw new SerializationException('No tag in stack for requested element');
  };
  TaggedEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'TaggedEncoder',
    interfaces: [CompositeEncoder, Encoder]
  };
  function IntTaggedEncoder() {
    TaggedEncoder.call(this);
  }
  IntTaggedEncoder.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return getSerialId($receiver, index);
  };
  IntTaggedEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'IntTaggedEncoder',
    interfaces: [TaggedEncoder]
  };
  function NamedValueEncoder(rootName) {
    if (rootName === void 0)
      rootName = '';
    TaggedEncoder.call(this);
    this.rootName = rootName;
  }
  NamedValueEncoder.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return this.nested_61zpoe$(this.elementName_3zr2iy$($receiver, index));
  };
  NamedValueEncoder.prototype.nested_61zpoe$ = function (nestedName) {
    var tmp$;
    return this.composeName_puj7f4$((tmp$ = this.currentTagOrNull) != null ? tmp$ : this.rootName, nestedName);
  };
  NamedValueEncoder.prototype.elementName_3zr2iy$ = function (desc, index) {
    return desc.getElementName_za3lpa$(index);
  };
  NamedValueEncoder.prototype.composeName_puj7f4$ = function (parentName, childName) {
    return parentName.length === 0 ? childName : parentName + '.' + childName;
  };
  NamedValueEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NamedValueEncoder',
    interfaces: [TaggedEncoder]
  };
  function getSerialId(desc, index) {
    var tmp$;
    var $receiver = desc.getElementAnnotations_za3lpa$(index);
    var destination = ArrayList_init_0();
    var tmp$_0;
    tmp$_0 = $receiver.iterator();
    while (tmp$_0.hasNext()) {
      var element = tmp$_0.next();
      if (Kotlin.isType(element, SerialId))
        destination.add_11rb$(element);
    }
    return (tmp$ = singleOrNull(destination)) != null ? tmp$.id : null;
  }
  function getSerialTag(desc, index) {
    var tmp$;
    var $receiver = desc.getElementAnnotations_za3lpa$(index);
    var destination = ArrayList_init_0();
    var tmp$_0;
    tmp$_0 = $receiver.iterator();
    while (tmp$_0.hasNext()) {
      var element = tmp$_0.next();
      if (Kotlin.isType(element, SerialTag))
        destination.add_11rb$(element);
    }
    return (tmp$ = singleOrNull(destination)) != null ? tmp$.tag : null;
  }
  function TaggedDecoder() {
    this.context_c97jka$_0 = EmptyContext_getInstance();
    this.updateMode_mc39q5$_0 = UpdateMode$UPDATE_getInstance();
    this.tagStack_auon0h$_0 = ArrayList_init_0();
    this.flag_10a271$_0 = false;
  }
  Object.defineProperty(TaggedDecoder.prototype, 'context', {
    get: function () {
      return this.context_c97jka$_0;
    },
    set: function (context) {
      this.context_c97jka$_0 = context;
    }
  });
  Object.defineProperty(TaggedDecoder.prototype, 'updateMode', {
    get: function () {
      return this.updateMode_mc39q5$_0;
    }
  });
  TaggedDecoder.prototype.decodeTaggedValue_11rb$ = function (tag) {
    throw new SerializationException(Kotlin.getKClassFromExpression(this).toString() + " can't retrieve untyped values");
  };
  TaggedDecoder.prototype.decodeTaggedNotNullMark_11rb$ = function (tag) {
    return true;
  };
  TaggedDecoder.prototype.decodeTaggedNull_11rb$ = function (tag) {
    return null;
  };
  TaggedDecoder.prototype.decodeTaggedNullable_rd70r1$_0 = function (tag) {
    var tmp$;
    if (this.decodeTaggedNotNullMark_11rb$(tag)) {
      tmp$ = this.decodeTaggedValue_11rb$(tag);
    }
     else {
      tmp$ = this.decodeTaggedNull_11rb$(tag);
    }
    return tmp$;
  };
  TaggedDecoder.prototype.decodeTaggedUnit_11rb$ = function (tag) {
    var tmp$;
    Kotlin.isType(tmp$ = this.decodeTaggedValue_11rb$(tag), Object.getPrototypeOf(kotlin.Unit).constructor) ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedBoolean_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'boolean' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedByte_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedShort_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedInt_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedLong_11rb$ = function (tag) {
    var tmp$;
    return Kotlin.isType(tmp$ = this.decodeTaggedValue_11rb$(tag), Kotlin.Long) ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedFloat_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedDouble_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedChar_11rb$ = function (tag) {
    var tmp$;
    return Kotlin.isChar(tmp$ = this.decodeTaggedValue_11rb$(tag)) ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedString_11rb$ = function (tag) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'string' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeTaggedEnum_wc8hrb$ = function (tag, enumDescription) {
    var tmp$;
    return typeof (tmp$ = this.decodeTaggedValue_11rb$(tag)) === 'number' ? tmp$ : throwCCE();
  };
  TaggedDecoder.prototype.decodeNotNullMark = function () {
    return this.decodeTaggedNotNullMark_11rb$(this.currentTag);
  };
  TaggedDecoder.prototype.decodeNull = function () {
    return null;
  };
  TaggedDecoder.prototype.decodeUnit = function () {
    this.decodeTaggedUnit_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeBoolean = function () {
    return this.decodeTaggedBoolean_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeByte = function () {
    return this.decodeTaggedByte_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeShort = function () {
    return this.decodeTaggedShort_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeInt = function () {
    return this.decodeTaggedInt_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeLong = function () {
    return this.decodeTaggedLong_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeFloat = function () {
    return this.decodeTaggedFloat_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeDouble = function () {
    return this.decodeTaggedDouble_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeChar = function () {
    return this.decodeTaggedChar_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeString = function () {
    return this.decodeTaggedString_11rb$(this.popTag_wbtf3a$_0());
  };
  TaggedDecoder.prototype.decodeEnum_w849qs$ = function (enumDescription) {
    return this.decodeTaggedEnum_wc8hrb$(this.popTag_wbtf3a$_0(), enumDescription);
  };
  TaggedDecoder.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    return this;
  };
  TaggedDecoder.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    return -2;
  };
  TaggedDecoder.prototype.decodeUnitElement_3zr2iy$ = function (desc, index) {
    this.decodeTaggedUnit_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeBooleanElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedBoolean_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeByteElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedByte_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeShortElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedShort_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeIntElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedInt_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeLongElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedLong_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeFloatElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedFloat_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeDoubleElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedDouble_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeCharElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedChar_11rb$(this.getTag_m47q6f$(desc, index));
  };
  TaggedDecoder.prototype.decodeStringElement_3zr2iy$ = function (desc, index) {
    return this.decodeTaggedString_11rb$(this.getTag_m47q6f$(desc, index));
  };
  function TaggedDecoder$decodeSerializableElement$lambda(closure$deserializer, this$TaggedDecoder) {
    return function () {
      return this$TaggedDecoder.decodeSerializableValue_w63s0f$(closure$deserializer);
    };
  }
  TaggedDecoder.prototype.decodeSerializableElement_s44l7r$ = function (desc, index, deserializer) {
    return this.tagBlock_6d26t9$_0(this.getTag_m47q6f$(desc, index), TaggedDecoder$decodeSerializableElement$lambda(deserializer, this));
  };
  function TaggedDecoder$decodeNullableSerializableElement$lambda(closure$deserializer, this$TaggedDecoder) {
    return function () {
      return this$TaggedDecoder.decodeNullableSerializableValue_aae3ea$(closure$deserializer);
    };
  }
  TaggedDecoder.prototype.decodeNullableSerializableElement_cwlm4k$ = function (desc, index, deserializer) {
    return this.tagBlock_6d26t9$_0(this.getTag_m47q6f$(desc, index), TaggedDecoder$decodeNullableSerializableElement$lambda(deserializer, this));
  };
  function TaggedDecoder$updateSerializableElement$lambda(closure$deserializer, closure$old, this$TaggedDecoder) {
    return function () {
      return this$TaggedDecoder.updateSerializableValue_19c8k5$(closure$deserializer, closure$old);
    };
  }
  TaggedDecoder.prototype.updateSerializableElement_ehubvl$ = function (desc, index, deserializer, old) {
    return this.tagBlock_6d26t9$_0(this.getTag_m47q6f$(desc, index), TaggedDecoder$updateSerializableElement$lambda(deserializer, old, this));
  };
  function TaggedDecoder$updateNullableSerializableElement$lambda(closure$deserializer, closure$old, this$TaggedDecoder) {
    return function () {
      return this$TaggedDecoder.updateNullableSerializableValue_exmlbs$(closure$deserializer, closure$old);
    };
  }
  TaggedDecoder.prototype.updateNullableSerializableElement_u33s02$ = function (desc, index, deserializer, old) {
    return this.tagBlock_6d26t9$_0(this.getTag_m47q6f$(desc, index), TaggedDecoder$updateNullableSerializableElement$lambda(deserializer, old, this));
  };
  TaggedDecoder.prototype.tagBlock_6d26t9$_0 = function (tag, block) {
    this.pushTag_11rb$(tag);
    var r = block();
    if (!this.flag_10a271$_0) {
      this.popTag_wbtf3a$_0();
    }
    this.flag_10a271$_0 = false;
    return r;
  };
  Object.defineProperty(TaggedDecoder.prototype, 'currentTag', {
    get: function () {
      return last(this.tagStack_auon0h$_0);
    }
  });
  Object.defineProperty(TaggedDecoder.prototype, 'currentTagOrNull', {
    get: function () {
      return lastOrNull(this.tagStack_auon0h$_0);
    }
  });
  TaggedDecoder.prototype.pushTag_11rb$ = function (name) {
    this.tagStack_auon0h$_0.add_11rb$(name);
  };
  TaggedDecoder.prototype.popTag_wbtf3a$_0 = function () {
    var r = this.tagStack_auon0h$_0.removeAt_za3lpa$(get_lastIndex(this.tagStack_auon0h$_0));
    this.flag_10a271$_0 = true;
    return r;
  };
  TaggedDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'TaggedDecoder',
    interfaces: [CompositeDecoder, Decoder]
  };
  function IntTaggedDecoder() {
    TaggedDecoder.call(this);
  }
  IntTaggedDecoder.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return getSerialId($receiver, index);
  };
  IntTaggedDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'IntTaggedDecoder',
    interfaces: [TaggedDecoder]
  };
  function StringTaggedDecoder() {
    TaggedDecoder.call(this);
  }
  StringTaggedDecoder.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return getSerialTag($receiver, index);
  };
  StringTaggedDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StringTaggedDecoder',
    interfaces: [TaggedDecoder]
  };
  function NamedValueDecoder(rootName) {
    if (rootName === void 0)
      rootName = '';
    TaggedDecoder.call(this);
    this.rootName = rootName;
  }
  NamedValueDecoder.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return this.nested_61zpoe$(this.elementName_3zr2iy$($receiver, index));
  };
  NamedValueDecoder.prototype.nested_61zpoe$ = function (nestedName) {
    var tmp$;
    return this.composeName_puj7f4$((tmp$ = this.currentTagOrNull) != null ? tmp$ : this.rootName, nestedName);
  };
  NamedValueDecoder.prototype.elementName_3zr2iy$ = function (desc, index) {
    return desc.getElementName_za3lpa$(index);
  };
  NamedValueDecoder.prototype.composeName_puj7f4$ = function (parentName, childName) {
    return parentName.length === 0 ? childName : parentName + '.' + childName;
  };
  NamedValueDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NamedValueDecoder',
    interfaces: [TaggedDecoder]
  };
  function Cbor(updateMode, encodeDefaults) {
    Cbor$Companion_getInstance();
    if (updateMode === void 0)
      updateMode = UpdateMode$BANNED_getInstance();
    if (encodeDefaults === void 0)
      encodeDefaults = true;
    AbstractSerialFormat.call(this);
    this.updateMode = updateMode;
    this.encodeDefaults = encodeDefaults;
  }
  function Cbor$CborEntryWriter($outer, encoder) {
    this.$outer = $outer;
    Cbor$CborWriter.call(this, this.$outer, encoder);
  }
  Cbor$CborEntryWriter.prototype.writeBeginToken = function () {
  };
  Cbor$CborEntryWriter.prototype.endStructure_qatsm0$ = function (desc) {
  };
  Cbor$CborEntryWriter.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    return true;
  };
  Cbor$CborEntryWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborEntryWriter',
    interfaces: [Cbor$CborWriter]
  };
  function Cbor$CborMapWriter($outer, encoder) {
    this.$outer = $outer;
    Cbor$CborListWriter.call(this, this.$outer, encoder);
  }
  Cbor$CborMapWriter.prototype.writeBeginToken = function () {
    this.encoder.startMap();
  };
  Cbor$CborMapWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborMapWriter',
    interfaces: [Cbor$CborListWriter]
  };
  function Cbor$CborListWriter($outer, encoder) {
    this.$outer = $outer;
    Cbor$CborWriter.call(this, this.$outer, encoder);
  }
  Cbor$CborListWriter.prototype.writeBeginToken = function () {
    this.encoder.startArray();
  };
  Cbor$CborListWriter.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    return true;
  };
  Cbor$CborListWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborListWriter',
    interfaces: [Cbor$CborWriter]
  };
  function Cbor$CborWriter($outer, encoder) {
    this.$outer = $outer;
    ElementValueEncoder.call(this);
    this.encoder = encoder;
    this.context = this.$outer.context;
  }
  Cbor$CborWriter.prototype.shouldEncodeElementDefault_3zr2iy$ = function (desc, index) {
    return this.$outer.encodeDefaults;
  };
  Cbor$CborWriter.prototype.writeBeginToken = function () {
    this.encoder.startMap();
  };
  Cbor$CborWriter.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$, tmp$_0;
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance()))
      tmp$_0 = new Cbor$CborListWriter(this.$outer, this.encoder);
    else if (equals(tmp$, StructureKind$MAP_getInstance()))
      tmp$_0 = new Cbor$CborMapWriter(this.$outer, this.encoder);
    else
      tmp$_0 = new Cbor$CborWriter(this.$outer, this.encoder);
    var writer = tmp$_0;
    writer.writeBeginToken();
    return writer;
  };
  Cbor$CborWriter.prototype.endStructure_qatsm0$ = function (desc) {
    this.encoder.end();
  };
  Cbor$CborWriter.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    var name = desc.getElementName_za3lpa$(index);
    this.encoder.encodeString_61zpoe$(name);
    return true;
  };
  Cbor$CborWriter.prototype.encodeString_61zpoe$ = function (value) {
    this.encoder.encodeString_61zpoe$(value);
  };
  Cbor$CborWriter.prototype.encodeFloat_mx4ult$ = function (value) {
    this.encoder.encodeFloat_mx4ult$(value);
  };
  Cbor$CborWriter.prototype.encodeDouble_14dthe$ = function (value) {
    this.encoder.encodeDouble_14dthe$(value);
  };
  Cbor$CborWriter.prototype.encodeChar_s8itvh$ = function (value) {
    this.encoder.encodeNumber_s8cxhz$(Kotlin.Long.fromInt(value | 0));
  };
  Cbor$CborWriter.prototype.encodeByte_s8j3t7$ = function (value) {
    this.encoder.encodeNumber_s8cxhz$(Kotlin.Long.fromInt(value));
  };
  Cbor$CborWriter.prototype.encodeShort_mq22fl$ = function (value) {
    this.encoder.encodeNumber_s8cxhz$(Kotlin.Long.fromInt(value));
  };
  Cbor$CborWriter.prototype.encodeInt_za3lpa$ = function (value) {
    this.encoder.encodeNumber_s8cxhz$(Kotlin.Long.fromInt(value));
  };
  Cbor$CborWriter.prototype.encodeLong_s8cxhz$ = function (value) {
    this.encoder.encodeNumber_s8cxhz$(value);
  };
  Cbor$CborWriter.prototype.encodeBoolean_6taknv$ = function (value) {
    this.encoder.encodeBoolean_6taknv$(value);
  };
  Cbor$CborWriter.prototype.encodeNull = function () {
    this.encoder.encodeNull();
  };
  Cbor$CborWriter.prototype.encodeEnum_39yahq$ = function (enumDescription, ordinal) {
    this.encoder.encodeString_61zpoe$(enumDescription.getElementName_za3lpa$(ordinal));
  };
  Cbor$CborWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborWriter',
    interfaces: [ElementValueEncoder]
  };
  function Cbor$CborEncoder(output) {
    this.output = output;
  }
  Cbor$CborEncoder.prototype.startArray = function () {
    this.output.write_za3lpa$(159);
  };
  Cbor$CborEncoder.prototype.startMap = function () {
    this.output.write_za3lpa$(191);
  };
  Cbor$CborEncoder.prototype.end = function () {
    this.output.write_za3lpa$(255);
  };
  Cbor$CborEncoder.prototype.encodeNull = function () {
    this.output.write_za3lpa$(246);
  };
  Cbor$CborEncoder.prototype.encodeBoolean_6taknv$ = function (value) {
    this.output.write_za3lpa$(value ? 245 : 244);
  };
  Cbor$CborEncoder.prototype.encodeNumber_s8cxhz$ = function (value) {
    this.output.write_fqrh44$(this.composeNumber_0(value));
  };
  Cbor$CborEncoder.prototype.encodeString_61zpoe$ = function (value) {
    var data = toUtf8Bytes(value);
    var header = this.composeNumber_0(Kotlin.Long.fromInt(data.length));
    header[0] = toByte(header[0] | Cbor$Companion_getInstance().HEADER_STRING_0);
    this.output.write_fqrh44$(header);
    this.output.write_fqrh44$(data);
  };
  Cbor$CborEncoder.prototype.encodeFloat_mx4ult$ = function (value) {
    var data = ByteBuffer$Companion_getInstance().allocate_za3lpa$(5).put_s8j3t7$(toByte(250)).putFloat_mx4ult$(value).array();
    this.output.write_fqrh44$(data);
  };
  Cbor$CborEncoder.prototype.encodeDouble_14dthe$ = function (value) {
    var data = ByteBuffer$Companion_getInstance().allocate_za3lpa$(9).put_s8j3t7$(toByte(251)).putDouble_14dthe$(value).array();
    this.output.write_fqrh44$(data);
  };
  Cbor$CborEncoder.prototype.composeNumber_0 = function (value) {
    return value.toNumber() >= 0 ? this.composePositive_0(value) : this.composeNegative_0(value);
  };
  Cbor$CborEncoder.prototype.composePositive_0 = function (value) {
    if (contains(new IntRange(0, 23), value))
      return new Int8Array([toByte(value.toInt())]);
    else if (contains(new IntRange(24, kotlin_js_internal_ByteCompanionObject.MAX_VALUE), value))
      return new Int8Array([24, toByte(value.toInt())]);
    else if (contains(new IntRange(128, kotlin_js_internal_ShortCompanionObject.MAX_VALUE), value))
      return ByteBuffer$Companion_getInstance().allocate_za3lpa$(3).put_s8j3t7$(toByte(25)).putShort_mq22fl$(toShort(value.toInt())).array();
    else if (contains(new IntRange(32768, 2147483647), value))
      return ByteBuffer$Companion_getInstance().allocate_za3lpa$(5).put_s8j3t7$(toByte(26)).putInt_za3lpa$(value.toInt()).array();
    else if (L2147483648.lessThanOrEqual(value) && value.lessThanOrEqual(Long$Companion$MAX_VALUE))
      return ByteBuffer$Companion_getInstance().allocate_za3lpa$(9).put_s8j3t7$(toByte(27)).putLong_s8cxhz$(value).array();
    else
      throw AssertionError_init(value.toString() + ' should be positive');
  };
  Cbor$CborEncoder.prototype.composeNegative_0 = function (value) {
    var aVal = equals(value, Long$Companion$MIN_VALUE) ? Long$Companion$MAX_VALUE : Kotlin.Long.fromInt(-1).subtract(value);
    var data = this.composePositive_0(aVal);
    data[0] = toByte(data[0] | Cbor$Companion_getInstance().HEADER_NEGATIVE_0);
    return data;
  };
  Cbor$CborEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborEncoder',
    interfaces: []
  };
  function Cbor$CborEntryReader($outer, decoder) {
    this.$outer = $outer;
    Cbor$CborReader.call(this, this.$outer, decoder);
    this.ind_0 = 0;
  }
  Cbor$CborEntryReader.prototype.skipBeginToken = function () {
  };
  Cbor$CborEntryReader.prototype.endStructure_qatsm0$ = function (desc) {
  };
  Cbor$CborEntryReader.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    var tmp$;
    switch (tmp$ = this.ind_0, this.ind_0 = tmp$ + 1 | 0, tmp$) {
      case 0:
        return 0;
      case 1:
        return 1;
      default:return -1;
    }
  };
  Cbor$CborEntryReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborEntryReader',
    interfaces: [Cbor$CborReader]
  };
  function Cbor$CborMapReader($outer, decoder) {
    this.$outer = $outer;
    Cbor$CborListReader.call(this, this.$outer, decoder);
  }
  Cbor$CborMapReader.prototype.skipBeginToken = function () {
    this.decoder.startMap();
  };
  Cbor$CborMapReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborMapReader',
    interfaces: [Cbor$CborListReader]
  };
  function Cbor$CborListReader($outer, decoder) {
    this.$outer = $outer;
    Cbor$CborReader.call(this, this.$outer, decoder);
    this.ind_0 = -1;
    this.size_0 = -1;
    this.finiteMode_0 = false;
  }
  Cbor$CborListReader.prototype.skipBeginToken = function () {
    var len = this.decoder.startArray();
    if (len !== -1) {
      this.finiteMode_0 = true;
      this.size_0 = len;
    }
  };
  Cbor$CborListReader.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    return !this.finiteMode_0 && this.decoder.isEnd() || (this.finiteMode_0 && this.ind_0 >= (this.size_0 - 1 | 0)) ? -1 : (this.ind_0 = this.ind_0 + 1 | 0, this.ind_0);
  };
  Cbor$CborListReader.prototype.endStructure_qatsm0$ = function (desc) {
    if (!this.finiteMode_0)
      this.decoder.end();
  };
  Cbor$CborListReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborListReader',
    interfaces: [Cbor$CborReader]
  };
  function Cbor$CborReader($outer, decoder) {
    this.$outer = $outer;
    ElementValueDecoder.call(this);
    this.decoder = decoder;
    this.context = this.$outer.context;
  }
  Object.defineProperty(Cbor$CborReader.prototype, 'updateMode', {
    get: function () {
      return this.$outer.updateMode;
    }
  });
  Cbor$CborReader.prototype.skipBeginToken = function () {
    this.decoder.startMap();
  };
  Cbor$CborReader.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$, tmp$_0;
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance()))
      tmp$_0 = new Cbor$CborListReader(this.$outer, this.decoder);
    else if (equals(tmp$, StructureKind$MAP_getInstance()))
      tmp$_0 = new Cbor$CborMapReader(this.$outer, this.decoder);
    else
      tmp$_0 = new Cbor$CborReader(this.$outer, this.decoder);
    var re = tmp$_0;
    re.skipBeginToken();
    return re;
  };
  Cbor$CborReader.prototype.endStructure_qatsm0$ = function (desc) {
    this.decoder.end();
  };
  Cbor$CborReader.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    if (this.decoder.isEnd())
      return -1;
    var elemName = this.decoder.nextString();
    return getElementIndexOrThrow(desc, elemName);
  };
  Cbor$CborReader.prototype.decodeString = function () {
    return this.decoder.nextString();
  };
  Cbor$CborReader.prototype.decodeNotNullMark = function () {
    return !this.decoder.isNull();
  };
  Cbor$CborReader.prototype.decodeDouble = function () {
    return this.decoder.nextDouble();
  };
  Cbor$CborReader.prototype.decodeFloat = function () {
    return this.decoder.nextFloat();
  };
  Cbor$CborReader.prototype.decodeBoolean = function () {
    return this.decoder.nextBoolean();
  };
  Cbor$CborReader.prototype.decodeByte = function () {
    return toByte(this.decoder.nextNumber().toInt());
  };
  Cbor$CborReader.prototype.decodeShort = function () {
    return toShort(this.decoder.nextNumber().toInt());
  };
  Cbor$CborReader.prototype.decodeChar = function () {
    return toBoxedChar(toChar(this.decoder.nextNumber().toInt()));
  };
  Cbor$CborReader.prototype.decodeInt = function () {
    return this.decoder.nextNumber().toInt();
  };
  Cbor$CborReader.prototype.decodeLong = function () {
    return this.decoder.nextNumber();
  };
  Cbor$CborReader.prototype.decodeNull = function () {
    return this.decoder.nextNull();
  };
  Cbor$CborReader.prototype.decodeEnum_w849qs$ = function (enumDescription) {
    return enumDescription.getElementIndex_61zpoe$(this.decoder.nextString());
  };
  Cbor$CborReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborReader',
    interfaces: [ElementValueDecoder]
  };
  function Cbor$CborDecoder(input) {
    this.input = input;
    this.curByte_0 = -1;
    this.readByte_0();
  }
  Cbor$CborDecoder.prototype.readByte_0 = function () {
    this.curByte_0 = this.input.read();
    return this.curByte_0;
  };
  Cbor$CborDecoder.prototype.skipByte_0 = function (expected) {
    if (this.curByte_0 !== expected)
      throw new CborDecodingException('byte ' + HexConverter_getInstance().toHexString_za3lpa$(expected), this.curByte_0);
    this.readByte_0();
  };
  Cbor$CborDecoder.prototype.isNull = function () {
    return this.curByte_0 === 246;
  };
  Cbor$CborDecoder.prototype.nextNull = function () {
    this.skipByte_0(246);
    return null;
  };
  Cbor$CborDecoder.prototype.nextBoolean = function () {
    var tmp$;
    switch (this.curByte_0) {
      case 245:
        tmp$ = true;
        break;
      case 244:
        tmp$ = false;
        break;
      default:throw new CborDecodingException('boolean value', this.curByte_0);
    }
    var ans = tmp$;
    this.readByte_0();
    return ans;
  };
  Cbor$CborDecoder.prototype.startArray = function () {
    if (this.curByte_0 === 159) {
      this.skipByte_0(159);
      return -1;
    }
    if ((this.curByte_0 & 224) !== 128)
      throw new CborDecodingException('start of array', this.curByte_0);
    var arrayLen = this.readNumber_0().toInt();
    this.readByte_0();
    return arrayLen;
  };
  Cbor$CborDecoder.prototype.startMap = function () {
    this.skipByte_0(191);
  };
  Cbor$CborDecoder.prototype.isEnd = function () {
    return this.curByte_0 === 255;
  };
  Cbor$CborDecoder.prototype.end = function () {
    this.skipByte_0(255);
  };
  Cbor$CborDecoder.prototype.nextString = function () {
    if ((this.curByte_0 & 224) !== 96)
      throw new CborDecodingException('start of string', this.curByte_0);
    var strLen = this.readNumber_0().toInt();
    var arr = readExactNBytes(this.input, strLen);
    var ans = stringFromUtf8Bytes(arr);
    this.readByte_0();
    return ans;
  };
  Cbor$CborDecoder.prototype.nextNumber = function () {
    var res = this.readNumber_0();
    this.readByte_0();
    return res;
  };
  Cbor$CborDecoder.prototype.readNumber_0 = function () {
    var tmp$, tmp$_0;
    var value = this.curByte_0 & 31;
    var negative = (this.curByte_0 & 224) === 32;
    switch (value) {
      case 24:
        tmp$ = 1;
        break;
      case 25:
        tmp$ = 2;
        break;
      case 26:
        tmp$ = 4;
        break;
      case 27:
        tmp$ = 8;
        break;
      default:tmp$ = 0;
        break;
    }
    var bytesToRead = tmp$;
    if (bytesToRead === 0) {
      if (negative)
        return Kotlin.Long.fromInt(value + 1 | 0).unaryMinus();
      else
        return Kotlin.Long.fromInt(value);
    }
    var buf = readToByteBuffer(this.input, bytesToRead);
    switch (bytesToRead) {
      case 1:
        tmp$_0 = Kotlin.Long.fromInt(getUnsignedByte(buf));
        break;
      case 2:
        tmp$_0 = Kotlin.Long.fromInt(getUnsignedShort(buf));
        break;
      case 4:
        tmp$_0 = getUnsignedInt(buf);
        break;
      case 8:
        tmp$_0 = buf.getLong();
        break;
      default:throw AssertionError_init_0();
    }
    var res = tmp$_0;
    return negative ? res.add(Kotlin.Long.fromInt(1)).unaryMinus() : res;
  };
  Cbor$CborDecoder.prototype.nextFloat = function () {
    if (this.curByte_0 !== 250)
      throw new CborDecodingException('float header', this.curByte_0);
    var res = readToByteBuffer(this.input, 4).getFloat();
    this.readByte_0();
    return res;
  };
  Cbor$CborDecoder.prototype.nextDouble = function () {
    if (this.curByte_0 !== 251)
      throw new CborDecodingException('double header', this.curByte_0);
    var res = readToByteBuffer(this.input, 8).getDouble();
    this.readByte_0();
    return res;
  };
  Cbor$CborDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborDecoder',
    interfaces: []
  };
  function Cbor$Companion() {
    Cbor$Companion_instance = this;
    this.FALSE_0 = 244;
    this.TRUE_0 = 245;
    this.NULL_0 = 246;
    this.NEXT_FLOAT_0 = 250;
    this.NEXT_DOUBLE_0 = 251;
    this.BEGIN_ARRAY_0 = 159;
    this.BEGIN_MAP_0 = 191;
    this.BREAK_0 = 255;
    this.HEADER_STRING_0 = 96;
    this.HEADER_NEGATIVE_0 = 32;
    this.HEADER_ARRAY_0 = 128;
    this.plain = new Cbor();
  }
  Cbor$Companion.prototype.dump_tf03ej$ = function (serializer, obj) {
    return this.plain.dump_tf03ej$(serializer, obj);
  };
  Cbor$Companion.prototype.load_dntfbn$ = function (deserializer, bytes) {
    return this.plain.load_dntfbn$(deserializer, bytes);
  };
  Cbor$Companion.prototype.install_7fck8k$ = function (module_0) {
    this.plain.install_7fck8k$(module_0);
  };
  Object.defineProperty(Cbor$Companion.prototype, 'context', {
    get: function () {
      return this.plain.context;
    }
  });
  Cbor$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: [BinaryFormat]
  };
  var Cbor$Companion_instance = null;
  function Cbor$Companion_getInstance() {
    if (Cbor$Companion_instance === null) {
      new Cbor$Companion();
    }
    return Cbor$Companion_instance;
  }
  Cbor.prototype.dump_tf03ej$ = function (serializer, obj) {
    var output = ByteArrayOutputStream_init();
    var dumper = new Cbor$CborWriter(this, new Cbor$CborEncoder(output));
    encode_0(dumper, serializer, obj);
    return output.toByteArray();
  };
  Cbor.prototype.load_dntfbn$ = function (deserializer, bytes) {
    var stream = ByteArrayInputStream_init(bytes);
    var reader = new Cbor$CborReader(this, new Cbor$CborDecoder(stream));
    return decode_0(reader, deserializer);
  };
  Cbor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Cbor',
    interfaces: [BinaryFormat, AbstractSerialFormat]
  };
  function CborDecodingException(expected, foundByte) {
    SerializationException.call(this, 'Expected ' + expected + ', but found ' + HexConverter_getInstance().toHexString_za3lpa$(foundByte));
    this.name = 'CborDecodingException';
  }
  CborDecodingException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CborDecodingException',
    interfaces: [SerializationException]
  };
  function SerialContext() {
  }
  SerialContext.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'SerialContext',
    interfaces: []
  };
  var get_0 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.context.get_7pmn69$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    return function (T_0, isT, $receiver) {
      return $receiver.get_lmshww$(getKClass(T_0));
    };
  }));
  function MutableSerialContext() {
  }
  MutableSerialContext.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'MutableSerialContext',
    interfaces: [SerialContext]
  };
  function MutableSerialContextImpl(parentContext) {
    if (parentContext === void 0)
      parentContext = null;
    this.parentContext_0 = parentContext;
    this.classMap_0 = HashMap_init();
  }
  MutableSerialContextImpl.prototype.registerSerializer_cfhkba$ = function (forClass, serializer) {
    this.classMap_0.put_xwzc9p$(forClass, serializer);
  };
  MutableSerialContextImpl.prototype.getByValue_issdgt$ = function (value) {
    var tmp$;
    var t = value;
    var klass = Kotlin.getKClassFromExpression(t);
    return Kotlin.isType(tmp$ = this.get_lmshww$(klass), KSerializer) ? tmp$ : null;
  };
  MutableSerialContextImpl.prototype.get_lmshww$ = function (kclass) {
    var tmp$, tmp$_0, tmp$_1;
    return (tmp$_1 = Kotlin.isType(tmp$ = this.classMap_0.get_11rb$(kclass), KSerializer) ? tmp$ : null) != null ? tmp$_1 : (tmp$_0 = this.parentContext_0) != null ? tmp$_0.get_lmshww$(kclass) : null;
  };
  MutableSerialContextImpl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MutableSerialContextImpl',
    interfaces: [MutableSerialContext]
  };
  function getOrDefault($receiver, klass) {
    var tmp$;
    return (tmp$ = $receiver != null ? $receiver.get_lmshww$(klass) : null) != null ? tmp$ : serializer(klass);
  }
  function getByValueOrDefault($receiver, value) {
    var tmp$, tmp$_0;
    return (tmp$_0 = $receiver != null ? $receiver.getByValue_issdgt$(value) : null) != null ? tmp$_0 : Kotlin.isType(tmp$ = serializer(Kotlin.getKClassFromExpression(value)), KSerializer) ? tmp$ : throwCCE();
  }
  function EmptyContext() {
    EmptyContext_instance = this;
  }
  EmptyContext.prototype.get_lmshww$ = function (kclass) {
    return null;
  };
  EmptyContext.prototype.getByValue_issdgt$ = function (value) {
    return null;
  };
  EmptyContext.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'EmptyContext',
    interfaces: [SerialContext]
  };
  var EmptyContext_instance = null;
  function EmptyContext_getInstance() {
    if (EmptyContext_instance === null) {
      new EmptyContext();
    }
    return EmptyContext_instance;
  }
  function SerialModule() {
  }
  SerialModule.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'SerialModule',
    interfaces: []
  };
  function SimpleModule(kClass, kSerializer) {
    this.kClass = kClass;
    this.kSerializer = kSerializer;
  }
  SimpleModule.prototype.registerIn_slu7av$ = function (context) {
    context.registerSerializer_cfhkba$(this.kClass, this.kSerializer);
  };
  SimpleModule.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SimpleModule',
    interfaces: [SerialModule]
  };
  function MapModule(map) {
    this.map = map;
  }
  MapModule.prototype.registerIn_slu7av$ = function (context) {
    var tmp$;
    tmp$ = this.map.entries.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      var k = element.key;
      var s = element.value;
      var tmp$_0, tmp$_1;
      context.registerSerializer_cfhkba$(Kotlin.isType(tmp$_0 = k, KClass) ? tmp$_0 : throwCCE(), Kotlin.isType(tmp$_1 = s, KSerializer) ? tmp$_1 : throwCCE());
    }
  };
  MapModule.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapModule',
    interfaces: [SerialModule]
  };
  function CompositeModule(modules) {
    if (modules === void 0) {
      modules = emptyList();
    }
    this.modules_0 = toMutableList(modules);
  }
  CompositeModule.prototype.registerIn_slu7av$ = function (context) {
    var tmp$;
    tmp$ = this.modules_0.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      element.registerIn_slu7av$(context);
    }
  };
  CompositeModule.prototype.plusAssign_7fck8k$ = function (module_0) {
    this.modules_0.add_11rb$(module_0);
  };
  CompositeModule.prototype.addModule_7fck8k$ = function (module_0) {
    this.plusAssign_7fck8k$(module_0);
  };
  CompositeModule.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CompositeModule',
    interfaces: [SerialModule]
  };
  function ListLikeDescriptor(elementDesc) {
    this.elementDesc = elementDesc;
    this.elementsCount_axr0xc$_0 = 1;
  }
  Object.defineProperty(ListLikeDescriptor.prototype, 'kind', {
    get: function () {
      return StructureKind$LIST_getInstance();
    }
  });
  Object.defineProperty(ListLikeDescriptor.prototype, 'elementsCount', {
    get: function () {
      return this.elementsCount_axr0xc$_0;
    }
  });
  ListLikeDescriptor.prototype.getElementName_za3lpa$ = function (index) {
    return index.toString();
  };
  ListLikeDescriptor.prototype.getElementIndex_61zpoe$ = function (name) {
    var tmp$;
    tmp$ = toIntOrNull(name);
    if (tmp$ == null) {
      throw IllegalArgumentException_init(name + ' is not a valid list index');
    }
    return tmp$;
  };
  ListLikeDescriptor.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return this.elementDesc;
  };
  ListLikeDescriptor.prototype.isElementOptional_za3lpa$ = function (index) {
    return false;
  };
  ListLikeDescriptor.prototype.equals = function (other) {
    if (this === other)
      return true;
    if (!Kotlin.isType(other, ListLikeDescriptor))
      return false;
    if (equals(this.elementDesc, other.elementDesc) && equals(this.name, other.name))
      return true;
    return false;
  };
  ListLikeDescriptor.prototype.hashCode = function () {
    return (hashCode(this.elementDesc) * 31 | 0) + hashCode(this.name) | 0;
  };
  ListLikeDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ListLikeDescriptor',
    interfaces: [SerialDescriptor]
  };
  function MapLikeDescriptor(name, keyDescriptor, valueDescriptor) {
    this.name_eko8nt$_0 = name;
    this.keyDescriptor = keyDescriptor;
    this.valueDescriptor = valueDescriptor;
    this.elementsCount_qp2ocq$_0 = 2;
  }
  Object.defineProperty(MapLikeDescriptor.prototype, 'name', {
    get: function () {
      return this.name_eko8nt$_0;
    }
  });
  Object.defineProperty(MapLikeDescriptor.prototype, 'kind', {
    get: function () {
      return StructureKind$MAP_getInstance();
    }
  });
  Object.defineProperty(MapLikeDescriptor.prototype, 'elementsCount', {
    get: function () {
      return this.elementsCount_qp2ocq$_0;
    }
  });
  MapLikeDescriptor.prototype.getElementName_za3lpa$ = function (index) {
    return index.toString();
  };
  MapLikeDescriptor.prototype.getElementIndex_61zpoe$ = function (name) {
    var tmp$;
    tmp$ = toIntOrNull(name);
    if (tmp$ == null) {
      throw IllegalArgumentException_init(name + ' is not a valid map index');
    }
    return tmp$;
  };
  MapLikeDescriptor.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return index % 2 === 0 ? this.keyDescriptor : this.valueDescriptor;
  };
  MapLikeDescriptor.prototype.isElementOptional_za3lpa$ = function (index) {
    return false;
  };
  MapLikeDescriptor.prototype.equals = function (other) {
    if (this === other)
      return true;
    if (!Kotlin.isType(other, MapLikeDescriptor))
      return false;
    if (!equals(this.name, other.name))
      return false;
    if (!equals(this.keyDescriptor, other.keyDescriptor))
      return false;
    if (!equals(this.valueDescriptor, other.valueDescriptor))
      return false;
    return true;
  };
  MapLikeDescriptor.prototype.hashCode = function () {
    var result = hashCode(this.name);
    result = (31 * result | 0) + hashCode(this.keyDescriptor) | 0;
    result = (31 * result | 0) + hashCode(this.valueDescriptor) | 0;
    return result;
  };
  MapLikeDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapLikeDescriptor',
    interfaces: [SerialDescriptor]
  };
  var ARRAY_NAME;
  var ARRAY_LIST_NAME;
  var LINKED_HASH_SET_NAME;
  var HASH_SET_NAME;
  var LINKED_HASH_MAP_NAME;
  var HASH_MAP_NAME;
  function ArrayClassDesc(elementDesc) {
    ListLikeDescriptor.call(this, elementDesc);
  }
  Object.defineProperty(ArrayClassDesc.prototype, 'name', {
    get: function () {
      return ARRAY_NAME;
    }
  });
  ArrayClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ArrayClassDesc',
    interfaces: [ListLikeDescriptor]
  };
  function ArrayListClassDesc(elementDesc) {
    ListLikeDescriptor.call(this, elementDesc);
  }
  Object.defineProperty(ArrayListClassDesc.prototype, 'name', {
    get: function () {
      return ARRAY_LIST_NAME;
    }
  });
  ArrayListClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ArrayListClassDesc',
    interfaces: [ListLikeDescriptor]
  };
  function NamedListClassDescriptor(name, elementDescriptor) {
    ListLikeDescriptor.call(this, elementDescriptor);
    this.name_3zrur7$_0 = name;
  }
  Object.defineProperty(NamedListClassDescriptor.prototype, 'name', {
    get: function () {
      return this.name_3zrur7$_0;
    }
  });
  NamedListClassDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NamedListClassDescriptor',
    interfaces: [ListLikeDescriptor]
  };
  function LinkedHashSetClassDesc(elementDesc) {
    ListLikeDescriptor.call(this, elementDesc);
  }
  Object.defineProperty(LinkedHashSetClassDesc.prototype, 'name', {
    get: function () {
      return LINKED_HASH_SET_NAME;
    }
  });
  LinkedHashSetClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LinkedHashSetClassDesc',
    interfaces: [ListLikeDescriptor]
  };
  function HashSetClassDesc(elementDesc) {
    ListLikeDescriptor.call(this, elementDesc);
  }
  Object.defineProperty(HashSetClassDesc.prototype, 'name', {
    get: function () {
      return HASH_SET_NAME;
    }
  });
  HashSetClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'HashSetClassDesc',
    interfaces: [ListLikeDescriptor]
  };
  function NamedMapClassDescriptor(name, keyDescriptor, valueDescriptor) {
    MapLikeDescriptor.call(this, name, keyDescriptor, valueDescriptor);
  }
  NamedMapClassDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NamedMapClassDescriptor',
    interfaces: [MapLikeDescriptor]
  };
  function LinkedHashMapClassDesc(keyDesc, valueDesc) {
    MapLikeDescriptor.call(this, LINKED_HASH_MAP_NAME, keyDesc, valueDesc);
  }
  LinkedHashMapClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LinkedHashMapClassDesc',
    interfaces: [MapLikeDescriptor]
  };
  function HashMapClassDesc(keyDesc, valueDesc) {
    MapLikeDescriptor.call(this, HASH_MAP_NAME, keyDesc, valueDesc);
  }
  HashMapClassDesc.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'HashMapClassDesc',
    interfaces: [MapLikeDescriptor]
  };
  function AbstractCollectionSerializer() {
  }
  AbstractCollectionSerializer.prototype.patch_mynpiu$ = function (decoder, old) {
    var builder = this.toBuilder_wikn$(old);
    var startIndex = this.builderSize_wili$(builder);
    var decoder_0 = decoder.beginStructure_r0sa6z$(this.descriptor, this.typeParams.slice());
    var size = this.readSize_mes5ce$_0(decoder_0, builder);
    mainLoop: while (true) {
      var index = decoder_0.decodeElementIndex_qatsm0$(this.descriptor);
      switch (index) {
        case -2:
          this.readAll_4xfz2a$_0(decoder_0, builder, startIndex, size);
          break mainLoop;
        case -1:
          break mainLoop;
        default:this.readItem_ind1ny$(decoder_0, startIndex + index | 0, builder);
          break;
      }
    }
    decoder_0.endStructure_qatsm0$(this.descriptor);
    return this.toResult_wili$(builder);
  };
  AbstractCollectionSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var builder = this.builder();
    return this.patch_mynpiu$(decoder, this.toResult_wili$(builder));
  };
  AbstractCollectionSerializer.prototype.readSize_mes5ce$_0 = function (decoder, builder) {
    var size = decoder.decodeCollectionSize_qatsm0$(this.descriptor);
    this.checkCapacity_rk7bw8$(builder, size);
    return size;
  };
  AbstractCollectionSerializer.prototype.readItem_ind1ny$ = function (decoder, index, builder, checkIndex, callback$default) {
    if (checkIndex === void 0)
      checkIndex = true;
    callback$default ? callback$default(decoder, index, builder, checkIndex) : this.readItem_ind1ny$$default(decoder, index, builder, checkIndex);
  };
  AbstractCollectionSerializer.prototype.readAll_4xfz2a$_0 = function (decoder, builder, startIndex, size) {
    if (!(size >= 0)) {
      var message = 'Size must be known in advance when using READ_ALL';
      throw IllegalArgumentException_init(message.toString());
    }
    for (var index = 0; index < size; index++)
      this.readItem_ind1ny$(decoder, startIndex + index | 0, builder, false);
  };
  AbstractCollectionSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractCollectionSerializer',
    interfaces: [KSerializer]
  };
  function ListLikeSerializer(elementSerializer) {
    AbstractCollectionSerializer.call(this);
    this.elementSerializer = elementSerializer;
    this.typeParams_thbhbl$_0 = [this.elementSerializer];
  }
  Object.defineProperty(ListLikeSerializer.prototype, 'typeParams', {
    get: function () {
      return this.typeParams_thbhbl$_0;
    }
  });
  ListLikeSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var size = this.objSize_wikn$(obj);
    var encoder_0 = encoder.beginCollection_gly1x5$(this.descriptor, size, this.typeParams.slice());
    var iterator = this.objIterator_wikn$(obj);
    for (var index = 0; index < size; index++)
      encoder_0.encodeSerializableElement_blecud$(this.descriptor, index, this.elementSerializer, iterator.next());
    encoder_0.endStructure_qatsm0$(this.descriptor);
  };
  ListLikeSerializer.prototype.readItem_ind1ny$$default = function (decoder, index, builder, checkIndex) {
    this.insert_p422l$(builder, index, decoder.decodeSerializableElement_s44l7r$(this.descriptor, index, this.elementSerializer));
  };
  ListLikeSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ListLikeSerializer',
    interfaces: [AbstractCollectionSerializer]
  };
  function MapLikeSerializer(keySerializer, valueSerializer) {
    AbstractCollectionSerializer.call(this);
    this.keySerializer = keySerializer;
    this.valueSerializer = valueSerializer;
    this.typeParams_jdi5pn$_0 = [this.keySerializer, this.valueSerializer];
  }
  Object.defineProperty(MapLikeSerializer.prototype, 'typeParams', {
    get: function () {
      return this.typeParams_jdi5pn$_0;
    }
  });
  MapLikeSerializer.prototype.readItem_ind1ny$$default = function (decoder, index, builder, checkIndex) {
    var tmp$, tmp$_0;
    var key = decoder.decodeSerializableElement_s44l7r$(this.descriptor, index, this.keySerializer);
    if (checkIndex) {
      var $receiver = decoder.decodeElementIndex_qatsm0$(this.descriptor);
      if (!($receiver === (index + 1 | 0))) {
        var message = 'Value must follow key in a map, index for key: ' + index + ', returned index for value: ' + $receiver;
        throw IllegalArgumentException_init(message.toString());
      }
      tmp$ = $receiver;
    }
     else {
      tmp$ = index + 1 | 0;
    }
    var vIndex = tmp$;
    if (builder.containsKey_11rb$(key) && !Kotlin.isType(this.valueSerializer.descriptor.kind, PrimitiveKind)) {
      tmp$_0 = decoder.updateSerializableElement_ehubvl$(this.descriptor, vIndex, this.valueSerializer, getValue(builder, key));
    }
     else {
      tmp$_0 = decoder.decodeSerializableElement_s44l7r$(this.descriptor, vIndex, this.valueSerializer);
    }
    var value = tmp$_0;
    builder.put_xwzc9p$(key, value);
  };
  MapLikeSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var size = this.objSize_wikn$(obj);
    var encoder_0 = encoder.beginCollection_gly1x5$(this.descriptor, size, this.typeParams.slice());
    var iterator = this.objIterator_wikn$(obj);
    var index = {v: 0};
    while (iterator.hasNext()) {
      var element = iterator.next();
      var k = element.key;
      var v = element.value;
      var tmp$, tmp$_0;
      encoder_0.encodeSerializableElement_blecud$(this.descriptor, (tmp$ = index.v, index.v = tmp$ + 1 | 0, tmp$), this.keySerializer, k);
      encoder_0.encodeSerializableElement_blecud$(this.descriptor, (tmp$_0 = index.v, index.v = tmp$_0 + 1 | 0, tmp$_0), this.valueSerializer, v);
    }
    encoder_0.endStructure_qatsm0$(this.descriptor);
  };
  MapLikeSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapLikeSerializer',
    interfaces: [AbstractCollectionSerializer]
  };
  function ReferenceArraySerializer(kClass, eSerializer) {
    ListLikeSerializer.call(this, eSerializer);
    this.kClass_0 = kClass;
    this.descriptor_8482jr$_0 = new ArrayClassDesc(eSerializer.descriptor);
  }
  Object.defineProperty(ReferenceArraySerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_8482jr$_0;
    }
  });
  ReferenceArraySerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.length;
  };
  ReferenceArraySerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return Kotlin.arrayIterator($receiver);
  };
  ReferenceArraySerializer.prototype.builder = function () {
    return ArrayList_init_0();
  };
  ReferenceArraySerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  ReferenceArraySerializer.prototype.toResult_wili$ = function ($receiver) {
    return toNativeArray($receiver, this.kClass_0);
  };
  ReferenceArraySerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    return ArrayList_init(asList($receiver));
  };
  ReferenceArraySerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
    $receiver.ensureCapacity_za3lpa$(size);
  };
  ReferenceArraySerializer.prototype.insert_p422l$ = function ($receiver, index, element) {
    $receiver.add_wxm5ur$(index, element);
  };
  ReferenceArraySerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ReferenceArraySerializer',
    interfaces: [ListLikeSerializer]
  };
  function ArrayListSerializer(element) {
    ListLikeSerializer.call(this, element);
    this.descriptor_7uwoa2$_0 = new ArrayListClassDesc(element.descriptor);
  }
  Object.defineProperty(ArrayListSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_7uwoa2$_0;
    }
  });
  ArrayListSerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.size;
  };
  ArrayListSerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return $receiver.iterator();
  };
  ArrayListSerializer.prototype.builder = function () {
    return ArrayList_init_0();
  };
  ArrayListSerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  ArrayListSerializer.prototype.toResult_wili$ = function ($receiver) {
    return $receiver;
  };
  ArrayListSerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = $receiver, ArrayList) ? tmp$ : null) != null ? tmp$_0 : ArrayList_init($receiver);
  };
  ArrayListSerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
    $receiver.ensureCapacity_za3lpa$(size);
  };
  ArrayListSerializer.prototype.insert_p422l$ = function ($receiver, index, element) {
    $receiver.add_wxm5ur$(index, element);
  };
  ArrayListSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ArrayListSerializer',
    interfaces: [ListLikeSerializer]
  };
  function LinkedHashSetSerializer(eSerializer) {
    ListLikeSerializer.call(this, eSerializer);
    this.descriptor_vnfc7m$_0 = new LinkedHashSetClassDesc(eSerializer.descriptor);
  }
  Object.defineProperty(LinkedHashSetSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_vnfc7m$_0;
    }
  });
  LinkedHashSetSerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.size;
  };
  LinkedHashSetSerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return $receiver.iterator();
  };
  var LinkedHashSet_init_0 = Kotlin.kotlin.collections.LinkedHashSet_init_287e2$;
  LinkedHashSetSerializer.prototype.builder = function () {
    return LinkedHashSet_init_0();
  };
  LinkedHashSetSerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  LinkedHashSetSerializer.prototype.toResult_wili$ = function ($receiver) {
    return $receiver;
  };
  LinkedHashSetSerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = $receiver, LinkedHashSet) ? tmp$ : null) != null ? tmp$_0 : LinkedHashSet_init($receiver);
  };
  LinkedHashSetSerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
  };
  LinkedHashSetSerializer.prototype.insert_p422l$ = function ($receiver, index, element) {
    $receiver.add_11rb$(element);
  };
  LinkedHashSetSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LinkedHashSetSerializer',
    interfaces: [ListLikeSerializer]
  };
  function HashSetSerializer(eSerializer) {
    ListLikeSerializer.call(this, eSerializer);
    this.descriptor_yqpz47$_0 = new HashSetClassDesc(eSerializer.descriptor);
  }
  Object.defineProperty(HashSetSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_yqpz47$_0;
    }
  });
  HashSetSerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.size;
  };
  HashSetSerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return $receiver.iterator();
  };
  HashSetSerializer.prototype.builder = function () {
    return HashSet_init();
  };
  HashSetSerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  HashSetSerializer.prototype.toResult_wili$ = function ($receiver) {
    return $receiver;
  };
  HashSetSerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = $receiver, HashSet) ? tmp$ : null) != null ? tmp$_0 : HashSet_init_0($receiver);
  };
  HashSetSerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
  };
  HashSetSerializer.prototype.insert_p422l$ = function ($receiver, index, element) {
    $receiver.add_11rb$(element);
  };
  HashSetSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'HashSetSerializer',
    interfaces: [ListLikeSerializer]
  };
  function LinkedHashMapSerializer(kSerializer, vSerializer) {
    MapLikeSerializer.call(this, kSerializer, vSerializer);
    this.descriptor_pixp0o$_0 = new LinkedHashMapClassDesc(kSerializer.descriptor, vSerializer.descriptor);
  }
  Object.defineProperty(LinkedHashMapSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_pixp0o$_0;
    }
  });
  LinkedHashMapSerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.size;
  };
  LinkedHashMapSerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return $receiver.entries.iterator();
  };
  LinkedHashMapSerializer.prototype.builder = function () {
    return LinkedHashMap_init();
  };
  LinkedHashMapSerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  LinkedHashMapSerializer.prototype.toResult_wili$ = function ($receiver) {
    return $receiver;
  };
  LinkedHashMapSerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = $receiver, LinkedHashMap) ? tmp$ : null) != null ? tmp$_0 : LinkedHashMap_init_0($receiver);
  };
  LinkedHashMapSerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
  };
  LinkedHashMapSerializer.prototype.insertKeyValuePair_fbr58l$ = function ($receiver, index, key, value) {
    $receiver.put_xwzc9p$(key, value);
  };
  LinkedHashMapSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LinkedHashMapSerializer',
    interfaces: [MapLikeSerializer]
  };
  function HashMapSerializer(kSerializer, vSerializer) {
    MapLikeSerializer.call(this, kSerializer, vSerializer);
    this.descriptor_kvyydd$_0 = new HashMapClassDesc(kSerializer.descriptor, vSerializer.descriptor);
  }
  Object.defineProperty(HashMapSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_kvyydd$_0;
    }
  });
  HashMapSerializer.prototype.objSize_wikn$ = function ($receiver) {
    return $receiver.size;
  };
  HashMapSerializer.prototype.objIterator_wikn$ = function ($receiver) {
    return $receiver.entries.iterator();
  };
  HashMapSerializer.prototype.builder = function () {
    return HashMap_init();
  };
  HashMapSerializer.prototype.builderSize_wili$ = function ($receiver) {
    return $receiver.size;
  };
  HashMapSerializer.prototype.toResult_wili$ = function ($receiver) {
    return $receiver;
  };
  HashMapSerializer.prototype.toBuilder_wikn$ = function ($receiver) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = $receiver, HashMap) ? tmp$ : null) != null ? tmp$_0 : HashMap_init_0($receiver);
  };
  HashMapSerializer.prototype.checkCapacity_rk7bw8$ = function ($receiver, size) {
  };
  HashMapSerializer.prototype.insertKeyValuePair_fbr58l$ = function ($receiver, index, key, value) {
    $receiver.put_xwzc9p$(key, value);
  };
  HashMapSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'HashMapSerializer',
    interfaces: [MapLikeSerializer]
  };
  function EnumDescriptor(name, choices) {
    SerialClassDescImpl.call(this, name);
    this.name_895kfn$_0 = name;
    this.choices_52wm16$_0 = choices;
    this.kind_8antlo$_0 = UnionKind$ENUM_KIND_getInstance();
    var $receiver = this.choices_52wm16$_0;
    var tmp$;
    for (tmp$ = 0; tmp$ !== $receiver.length; ++tmp$) {
      var element = $receiver[tmp$];
      this.addElement_ivxn3r$(element);
    }
  }
  Object.defineProperty(EnumDescriptor.prototype, 'name', {
    get: function () {
      return this.name_895kfn$_0;
    }
  });
  Object.defineProperty(EnumDescriptor.prototype, 'kind', {
    get: function () {
      return this.kind_8antlo$_0;
    }
  });
  EnumDescriptor.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return this;
  };
  EnumDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'EnumDescriptor',
    interfaces: [SerialClassDescImpl]
  };
  function CommonEnumSerializer(serialName, choices, choicesNames) {
    this.serialName = serialName;
    this.choices = choices;
    this.descriptor_j2zgdl$_0 = new EnumDescriptor(this.serialName, choicesNames);
  }
  Object.defineProperty(CommonEnumSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_j2zgdl$_0;
    }
  });
  CommonEnumSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var $receiver = indexOf(this.choices, obj);
    if (!($receiver !== -1)) {
      var message = obj.toString() + ' is not a valid enum ' + this.serialName + ', choices are ' + this.choices;
      throw IllegalStateException_init(message.toString());
    }
    var index = $receiver;
    encoder.encodeEnum_39yahq$(this.descriptor, index);
  };
  CommonEnumSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var index = decoder.decodeEnum_w849qs$(this.descriptor);
    if (!get_indices(this.choices).contains_mef7kx$(index)) {
      var message = index.toString() + ' is not among valid ' + this.serialName + ' choices, choices size is ' + this.choices.length;
      throw IllegalStateException_init(message.toString());
    }
    return this.choices[index];
  };
  CommonEnumSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CommonEnumSerializer',
    interfaces: [KSerializer]
  };
  var copyToArray = Kotlin.kotlin.collections.copyToArray;
  function EnumSerializer(serializableClass) {
    var tmp$ = enumClassName(serializableClass);
    var tmp$_0 = enumMembers(serializableClass);
    var $receiver = enumMembers(serializableClass);
    var destination = ArrayList_init_1($receiver.length);
    var tmp$_1;
    for (tmp$_1 = 0; tmp$_1 !== $receiver.length; ++tmp$_1) {
      var item = $receiver[tmp$_1];
      destination.add_11rb$(item.name);
    }
    CommonEnumSerializer.call(this, tmp$, tmp$_0, copyToArray(destination));
  }
  EnumSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'EnumSerializer',
    interfaces: [CommonEnumSerializer]
  };
  function GeneratedSerializer() {
  }
  GeneratedSerializer.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'GeneratedSerializer',
    interfaces: [KSerializer]
  };
  function LongAsStringSerializer() {
    LongAsStringSerializer_instance = this;
    this.descriptor_9ax8ui$_0 = StringDescriptor_getInstance();
  }
  LongAsStringSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeString_61zpoe$(obj.toString());
  };
  LongAsStringSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return toLong(decoder.decodeString());
  };
  Object.defineProperty(LongAsStringSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_9ax8ui$_0;
    }
  });
  LongAsStringSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'LongAsStringSerializer',
    interfaces: [KSerializer]
  };
  var LongAsStringSerializer_instance = null;
  function LongAsStringSerializer_getInstance() {
    if (LongAsStringSerializer_instance === null) {
      new LongAsStringSerializer();
    }
    return LongAsStringSerializer_instance;
  }
  function makeNullable(element) {
    return new NullableSerializer(element);
  }
  function NullableSerializer(element) {
    this.element_0 = element;
    this.descriptor_kbvl2k$_0 = new NullableSerializer$SerialDescriptorForNullable(this.element_0.descriptor);
  }
  function NullableSerializer$SerialDescriptorForNullable(original) {
    this.original = original;
  }
  Object.defineProperty(NullableSerializer$SerialDescriptorForNullable.prototype, 'isNullable', {
    get: function () {
      return true;
    }
  });
  NullableSerializer$SerialDescriptorForNullable.prototype.equals = function (other) {
    if (this === other)
      return true;
    if (!Kotlin.isType(other, NullableSerializer$SerialDescriptorForNullable))
      return false;
    if (!equals(this.original, other.original))
      return false;
    return true;
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.hashCode = function () {
    return hashCode(this.original) * 31 | 0;
  };
  Object.defineProperty(NullableSerializer$SerialDescriptorForNullable.prototype, 'elementsCount', {
    get: function () {
      return this.original.elementsCount;
    }
  });
  Object.defineProperty(NullableSerializer$SerialDescriptorForNullable.prototype, 'kind', {
    get: function () {
      return this.original.kind;
    }
  });
  Object.defineProperty(NullableSerializer$SerialDescriptorForNullable.prototype, 'name', {
    get: function () {
      return this.original.name;
    }
  });
  NullableSerializer$SerialDescriptorForNullable.prototype.getElementAnnotations_za3lpa$ = function (index) {
    return this.original.getElementAnnotations_za3lpa$(index);
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return this.original.getElementDescriptor_za3lpa$(index);
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.getElementIndex_61zpoe$ = function (name) {
    return this.original.getElementIndex_61zpoe$(name);
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.getElementName_za3lpa$ = function (index) {
    return this.original.getElementName_za3lpa$(index);
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.getEntityAnnotations = function () {
    return this.original.getEntityAnnotations();
  };
  NullableSerializer$SerialDescriptorForNullable.prototype.isElementOptional_za3lpa$ = function (index) {
    return this.original.isElementOptional_za3lpa$(index);
  };
  NullableSerializer$SerialDescriptorForNullable.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialDescriptorForNullable',
    interfaces: [SerialDescriptor]
  };
  Object.defineProperty(NullableSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_kbvl2k$_0;
    }
  });
  NullableSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    if (obj != null) {
      encoder.encodeNotNullMark();
      this.element_0.serialize_awe97i$(encoder, obj);
    }
     else {
      encoder.encodeNull();
    }
  };
  NullableSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeNotNullMark() ? this.element_0.deserialize_nts5qn$(decoder) : decoder.decodeNull();
  };
  NullableSerializer.prototype.patch_mynpiu$ = function (decoder, old) {
    var tmp$;
    if (old == null)
      tmp$ = this.deserialize_nts5qn$(decoder);
    else if (decoder.decodeNotNullMark())
      tmp$ = this.element_0.patch_mynpiu$(decoder, old);
    else {
      decoder.decodeNull();
      tmp$ = old;
    }
    return tmp$;
  };
  NullableSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NullableSerializer',
    interfaces: [KSerializer]
  };
  function PrimitiveDescriptor(name, kind) {
    this.name_r9ht6j$_0 = name;
    this.kind_r7zk0i$_0 = kind;
  }
  Object.defineProperty(PrimitiveDescriptor.prototype, 'name', {
    get: function () {
      return this.name_r9ht6j$_0;
    }
  });
  Object.defineProperty(PrimitiveDescriptor.prototype, 'kind', {
    get: function () {
      return this.kind_r7zk0i$_0;
    }
  });
  PrimitiveDescriptor.prototype.error_b6z6t6$_0 = function () {
    throw IllegalStateException_init('Primitives does not have elements');
  };
  PrimitiveDescriptor.prototype.getElementName_za3lpa$ = function (index) {
    return this.error_b6z6t6$_0();
  };
  PrimitiveDescriptor.prototype.getElementIndex_61zpoe$ = function (name) {
    return this.error_b6z6t6$_0();
  };
  PrimitiveDescriptor.prototype.isElementOptional_za3lpa$ = function (index) {
    return this.error_b6z6t6$_0();
  };
  PrimitiveDescriptor.prototype.getElementDescriptor_za3lpa$ = function (index) {
    return this.error_b6z6t6$_0();
  };
  PrimitiveDescriptor.prototype.toString = function () {
    return this.name;
  };
  PrimitiveDescriptor.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PrimitiveDescriptor',
    interfaces: [SerialDescriptor]
  };
  function IntDescriptor() {
    IntDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Int', PrimitiveKind$INT_getInstance());
  }
  IntDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'IntDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var IntDescriptor_instance = null;
  function IntDescriptor_getInstance() {
    if (IntDescriptor_instance === null) {
      new IntDescriptor();
    }
    return IntDescriptor_instance;
  }
  function UnitDescriptor() {
    UnitDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Unit', PrimitiveKind$UNIT_getInstance());
  }
  UnitDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'UnitDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var UnitDescriptor_instance = null;
  function UnitDescriptor_getInstance() {
    if (UnitDescriptor_instance === null) {
      new UnitDescriptor();
    }
    return UnitDescriptor_instance;
  }
  function BooleanDescriptor() {
    BooleanDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Boolean', PrimitiveKind$BOOLEAN_getInstance());
  }
  BooleanDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BooleanDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var BooleanDescriptor_instance = null;
  function BooleanDescriptor_getInstance() {
    if (BooleanDescriptor_instance === null) {
      new BooleanDescriptor();
    }
    return BooleanDescriptor_instance;
  }
  function ByteDescriptor() {
    ByteDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Byte', PrimitiveKind$BYTE_getInstance());
  }
  ByteDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ByteDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var ByteDescriptor_instance = null;
  function ByteDescriptor_getInstance() {
    if (ByteDescriptor_instance === null) {
      new ByteDescriptor();
    }
    return ByteDescriptor_instance;
  }
  function ShortDescriptor() {
    ShortDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Short', PrimitiveKind$SHORT_getInstance());
  }
  ShortDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ShortDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var ShortDescriptor_instance = null;
  function ShortDescriptor_getInstance() {
    if (ShortDescriptor_instance === null) {
      new ShortDescriptor();
    }
    return ShortDescriptor_instance;
  }
  function LongDescriptor() {
    LongDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Long', PrimitiveKind$LONG_getInstance());
  }
  LongDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'LongDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var LongDescriptor_instance = null;
  function LongDescriptor_getInstance() {
    if (LongDescriptor_instance === null) {
      new LongDescriptor();
    }
    return LongDescriptor_instance;
  }
  function FloatDescriptor() {
    FloatDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Float', PrimitiveKind$FLOAT_getInstance());
  }
  FloatDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'FloatDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var FloatDescriptor_instance = null;
  function FloatDescriptor_getInstance() {
    if (FloatDescriptor_instance === null) {
      new FloatDescriptor();
    }
    return FloatDescriptor_instance;
  }
  function DoubleDescriptor() {
    DoubleDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Double', PrimitiveKind$DOUBLE_getInstance());
  }
  DoubleDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DoubleDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var DoubleDescriptor_instance = null;
  function DoubleDescriptor_getInstance() {
    if (DoubleDescriptor_instance === null) {
      new DoubleDescriptor();
    }
    return DoubleDescriptor_instance;
  }
  function CharDescriptor() {
    CharDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.Char', PrimitiveKind$CHAR_getInstance());
  }
  CharDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'CharDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var CharDescriptor_instance = null;
  function CharDescriptor_getInstance() {
    if (CharDescriptor_instance === null) {
      new CharDescriptor();
    }
    return CharDescriptor_instance;
  }
  function StringDescriptor() {
    StringDescriptor_instance = this;
    PrimitiveDescriptor.call(this, 'kotlin.String', PrimitiveKind$STRING_getInstance());
  }
  StringDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StringDescriptor',
    interfaces: [PrimitiveDescriptor]
  };
  var StringDescriptor_instance = null;
  function StringDescriptor_getInstance() {
    if (StringDescriptor_instance === null) {
      new StringDescriptor();
    }
    return StringDescriptor_instance;
  }
  function UnitSerializer() {
    UnitSerializer_instance = this;
    this.descriptor_gvvi5t$_0 = UnitDescriptor_getInstance();
  }
  Object.defineProperty(UnitSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_gvvi5t$_0;
    }
  });
  UnitSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeUnit();
  };
  UnitSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    decoder.decodeUnit();
  };
  UnitSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'UnitSerializer',
    interfaces: [KSerializer]
  };
  var UnitSerializer_instance = null;
  function UnitSerializer_getInstance() {
    if (UnitSerializer_instance === null) {
      new UnitSerializer();
    }
    return UnitSerializer_instance;
  }
  function BooleanSerializer() {
    BooleanSerializer_instance = this;
    this.descriptor_vdtvaz$_0 = BooleanDescriptor_getInstance();
  }
  Object.defineProperty(BooleanSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_vdtvaz$_0;
    }
  });
  BooleanSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeBoolean_6taknv$(obj);
  };
  BooleanSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeBoolean();
  };
  BooleanSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BooleanSerializer',
    interfaces: [KSerializer]
  };
  var BooleanSerializer_instance = null;
  function BooleanSerializer_getInstance() {
    if (BooleanSerializer_instance === null) {
      new BooleanSerializer();
    }
    return BooleanSerializer_instance;
  }
  function ByteSerializer() {
    ByteSerializer_instance = this;
    this.descriptor_f6vlf1$_0 = ByteDescriptor_getInstance();
  }
  Object.defineProperty(ByteSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_f6vlf1$_0;
    }
  });
  ByteSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeByte_s8j3t7$(obj);
  };
  ByteSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeByte();
  };
  ByteSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ByteSerializer',
    interfaces: [KSerializer]
  };
  var ByteSerializer_instance = null;
  function ByteSerializer_getInstance() {
    if (ByteSerializer_instance === null) {
      new ByteSerializer();
    }
    return ByteSerializer_instance;
  }
  function ShortSerializer() {
    ShortSerializer_instance = this;
    this.descriptor_yvjeup$_0 = ShortDescriptor_getInstance();
  }
  Object.defineProperty(ShortSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_yvjeup$_0;
    }
  });
  ShortSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeShort_mq22fl$(obj);
  };
  ShortSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeShort();
  };
  ShortSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ShortSerializer',
    interfaces: [KSerializer]
  };
  var ShortSerializer_instance = null;
  function ShortSerializer_getInstance() {
    if (ShortSerializer_instance === null) {
      new ShortSerializer();
    }
    return ShortSerializer_instance;
  }
  function IntSerializer() {
    IntSerializer_instance = this;
    this.descriptor_xrjflq$_0 = IntDescriptor_getInstance();
  }
  Object.defineProperty(IntSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_xrjflq$_0;
    }
  });
  IntSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeInt_za3lpa$(obj);
  };
  IntSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeInt();
  };
  IntSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'IntSerializer',
    interfaces: [KSerializer]
  };
  var IntSerializer_instance = null;
  function IntSerializer_getInstance() {
    if (IntSerializer_instance === null) {
      new IntSerializer();
    }
    return IntSerializer_instance;
  }
  function LongSerializer() {
    LongSerializer_instance = this;
    this.descriptor_q4z687$_0 = LongDescriptor_getInstance();
  }
  Object.defineProperty(LongSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_q4z687$_0;
    }
  });
  LongSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeLong_s8cxhz$(obj);
  };
  LongSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeLong();
  };
  LongSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'LongSerializer',
    interfaces: [KSerializer]
  };
  var LongSerializer_instance = null;
  function LongSerializer_getInstance() {
    if (LongSerializer_instance === null) {
      new LongSerializer();
    }
    return LongSerializer_instance;
  }
  function FloatSerializer() {
    FloatSerializer_instance = this;
    this.descriptor_7mw1sh$_0 = FloatDescriptor_getInstance();
  }
  Object.defineProperty(FloatSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_7mw1sh$_0;
    }
  });
  FloatSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeFloat_mx4ult$(obj);
  };
  FloatSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeFloat();
  };
  FloatSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'FloatSerializer',
    interfaces: [KSerializer]
  };
  var FloatSerializer_instance = null;
  function FloatSerializer_getInstance() {
    if (FloatSerializer_instance === null) {
      new FloatSerializer();
    }
    return FloatSerializer_instance;
  }
  function DoubleSerializer() {
    DoubleSerializer_instance = this;
    this.descriptor_2hn2sc$_0 = DoubleDescriptor_getInstance();
  }
  Object.defineProperty(DoubleSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_2hn2sc$_0;
    }
  });
  DoubleSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeDouble_14dthe$(obj);
  };
  DoubleSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeDouble();
  };
  DoubleSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DoubleSerializer',
    interfaces: [KSerializer]
  };
  var DoubleSerializer_instance = null;
  function DoubleSerializer_getInstance() {
    if (DoubleSerializer_instance === null) {
      new DoubleSerializer();
    }
    return DoubleSerializer_instance;
  }
  function CharSerializer() {
    CharSerializer_instance = this;
    this.descriptor_5mpy8x$_0 = CharDescriptor_getInstance();
  }
  Object.defineProperty(CharSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_5mpy8x$_0;
    }
  });
  CharSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeChar_s8itvh$(obj);
  };
  CharSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeChar();
  };
  CharSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'CharSerializer',
    interfaces: [KSerializer]
  };
  var CharSerializer_instance = null;
  function CharSerializer_getInstance() {
    if (CharSerializer_instance === null) {
      new CharSerializer();
    }
    return CharSerializer_instance;
  }
  function StringSerializer() {
    StringSerializer_instance = this;
    this.descriptor_sum718$_0 = StringDescriptor_getInstance();
  }
  Object.defineProperty(StringSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_sum718$_0;
    }
  });
  StringSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeString_61zpoe$(obj);
  };
  StringSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeString();
  };
  StringSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StringSerializer',
    interfaces: [KSerializer]
  };
  var StringSerializer_instance = null;
  function StringSerializer_getInstance() {
    if (StringSerializer_instance === null) {
      new StringSerializer();
    }
    return StringSerializer_instance;
  }
  function defaultSerializer($receiver) {
    var tmp$, tmp$_0;
    if (equals($receiver, PrimitiveClasses$stringClass))
      tmp$ = StringSerializer_getInstance();
    else if (equals($receiver, getKClass(Char)))
      tmp$ = CharSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$doubleClass))
      tmp$ = DoubleSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$floatClass))
      tmp$ = FloatSerializer_getInstance();
    else if (equals($receiver, getKClass(Long)))
      tmp$ = LongSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$intClass))
      tmp$ = IntSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$shortClass))
      tmp$ = ShortSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$byteClass))
      tmp$ = ByteSerializer_getInstance();
    else if (equals($receiver, PrimitiveClasses$booleanClass))
      tmp$ = BooleanSerializer_getInstance();
    else if (equals($receiver, getKClass(Object.getPrototypeOf(kotlin.Unit).constructor)))
      tmp$ = UnitSerializer_getInstance();
    else
      tmp$ = null;
    return (tmp$_0 = tmp$) == null || Kotlin.isType(tmp$_0, KSerializer) ? tmp$_0 : throwCCE();
  }
  function MissingDescriptorException(index, origin) {
    SerializationException.call(this, 'Element descriptor at index ' + index + ' has not been found in ' + origin);
    this.name = 'MissingDescriptorException';
  }
  MissingDescriptorException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MissingDescriptorException',
    interfaces: [SerializationException]
  };
  function SerialClassDescImpl(name, generatedSerializer) {
    if (generatedSerializer === void 0)
      generatedSerializer = null;
    this.name_l5inc6$_0 = name;
    this.generatedSerializer_1vyey6$_0 = generatedSerializer;
    this.names_gh1kah$_0 = ArrayList_init_0();
    this.annotations_4jiga3$_0 = ArrayList_init_0();
    this.classAnnotations_3clm9z$_0 = ArrayList_init_0();
    this.flags_k3kfa0$_0 = Kotlin.booleanArray(4);
    this.descriptors_ve6swl$_0 = ArrayList_init_0();
    this._indices_onkk0z$_0 = null;
    this.indices_jm5tq0$_7drv5o$_0 = lazy(SerialClassDescImpl$indices$lambda(this));
  }
  Object.defineProperty(SerialClassDescImpl.prototype, 'name', {
    get: function () {
      return this.name_l5inc6$_0;
    }
  });
  Object.defineProperty(SerialClassDescImpl.prototype, 'kind', {
    get: function () {
      return StructureKind$CLASS_getInstance();
    }
  });
  Object.defineProperty(SerialClassDescImpl.prototype, 'indices_jm5tq0$_0', {
    get: function () {
      return this.indices_jm5tq0$_7drv5o$_0.value;
    }
  });
  SerialClassDescImpl.prototype.addElement_ivxn3r$ = function (name, isOptional) {
    if (isOptional === void 0)
      isOptional = false;
    this.names_gh1kah$_0.add_11rb$(name);
    var idx = this.names_gh1kah$_0.size - 1 | 0;
    this.ensureFlagsCapacity_qhtrim$_0(idx);
    this.flags_k3kfa0$_0[idx] = isOptional;
    this.annotations_4jiga3$_0.add_11rb$(ArrayList_init_0());
  };
  SerialClassDescImpl.prototype.pushAnnotation_yj921w$ = function (a) {
    last(this.annotations_4jiga3$_0).add_11rb$(a);
  };
  SerialClassDescImpl.prototype.pushDescriptor_qatsm0$ = function (desc) {
    this.descriptors_ve6swl$_0.add_11rb$(desc);
  };
  SerialClassDescImpl.prototype.getElementDescriptor_za3lpa$ = function (index) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2, tmp$_3;
    tmp$_3 = (tmp$_2 = (tmp$_1 = (tmp$_0 = (tmp$ = this.generatedSerializer_1vyey6$_0) != null ? tmp$.childSerializers() : null) != null ? getOrNull(tmp$_0, index) : null) != null ? tmp$_1.descriptor : null) != null ? tmp$_2 : getOrNull_0(this.descriptors_ve6swl$_0, index);
    if (tmp$_3 == null) {
      throw new MissingDescriptorException(index, this);
    }
    return tmp$_3;
  };
  SerialClassDescImpl.prototype.isElementOptional_za3lpa$ = function (index) {
    return this.flags_k3kfa0$_0[index];
  };
  SerialClassDescImpl.prototype.pushClassAnnotation_yj921w$ = function (a) {
    this.classAnnotations_3clm9z$_0.add_11rb$(a);
  };
  SerialClassDescImpl.prototype.getEntityAnnotations = function () {
    return this.classAnnotations_3clm9z$_0;
  };
  SerialClassDescImpl.prototype.getElementAnnotations_za3lpa$ = function (index) {
    return this.annotations_4jiga3$_0.get_za3lpa$(index);
  };
  Object.defineProperty(SerialClassDescImpl.prototype, 'elementsCount', {
    get: function () {
      return this.annotations_4jiga3$_0.size;
    }
  });
  SerialClassDescImpl.prototype.getElementName_za3lpa$ = function (index) {
    return this.names_gh1kah$_0.get_za3lpa$(index);
  };
  SerialClassDescImpl.prototype.getElementIndex_61zpoe$ = function (name) {
    var tmp$;
    return (tmp$ = this.indices_jm5tq0$_0.get_11rb$(name)) != null ? tmp$ : -3;
  };
  SerialClassDescImpl.prototype.ensureFlagsCapacity_qhtrim$_0 = function (i) {
    if (this.flags_k3kfa0$_0.length <= i)
      this.flags_k3kfa0$_0 = copyOf(this.flags_k3kfa0$_0, this.flags_k3kfa0$_0.length * 2 | 0);
  };
  SerialClassDescImpl.prototype.buildIndices_585r2k$_0 = function () {
    var tmp$;
    var indices = HashMap_init();
    tmp$ = this.names_gh1kah$_0.size - 1 | 0;
    for (var i = 0; i <= tmp$; i++)
      indices.put_xwzc9p$(this.names_gh1kah$_0.get_za3lpa$(i), i);
    return indices;
  };
  SerialClassDescImpl.prototype.equals = function (other) {
    if (this === other)
      return true;
    if (!Kotlin.isType(other, SerialClassDescImpl))
      return false;
    if (!equals(this.name, other.name))
      return false;
    if (!equals(elementDescriptors(this), elementDescriptors(other)))
      return false;
    return true;
  };
  SerialClassDescImpl.prototype.hashCode = function () {
    var result = hashCode(this.name);
    result = (31 * result | 0) + hashCode(elementDescriptors(this)) | 0;
    return result;
  };
  SerialClassDescImpl.prototype.toString = function () {
    return this.name + this.names_gh1kah$_0;
  };
  function SerialClassDescImpl$indices$lambda(this$SerialClassDescImpl) {
    return function () {
      return this$SerialClassDescImpl.buildIndices_585r2k$_0();
    };
  }
  SerialClassDescImpl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SerialClassDescImpl',
    interfaces: [SerialDescriptor]
  };
  var KEY_INDEX;
  var VALUE_INDEX;
  function KeyValueSerializer(kSerializer, vSerializer) {
    this.kSerializer = kSerializer;
    this.vSerializer = vSerializer;
  }
  KeyValueSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var encoder_0 = encoder.beginStructure_r0sa6z$(this.descriptor, [this.kSerializer, this.vSerializer]);
    encoder_0.encodeSerializableElement_blecud$(this.descriptor, 0, this.kSerializer, this.get_key_wili$(obj));
    encoder_0.encodeSerializableElement_blecud$(this.descriptor, 1, this.vSerializer, this.get_value_wili$(obj));
    encoder_0.endStructure_qatsm0$(this.descriptor);
  };
  KeyValueSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var tmp$, tmp$_0;
    var input = decoder.beginStructure_r0sa6z$(this.descriptor, [this.kSerializer, this.vSerializer]);
    var kSet = false;
    var vSet = false;
    var k = null;
    var v = null;
    mainLoop: while (true) {
      switch (input.decodeElementIndex_qatsm0$(this.descriptor)) {
        case -2:
          k = this.readKey_ej6kb6$(input);
          kSet = true;
          v = this.readValue_gqyu7$(input, k, kSet);
          vSet = true;
          break mainLoop;
        case -1:
          break mainLoop;
        case 0:
          k = this.readKey_ej6kb6$(input);
          kSet = true;
          break;
        case 1:
          v = this.readValue_gqyu7$(input, k, kSet);
          vSet = true;
          break;
        default:throw new SerializationException('Invalid index');
      }
    }
    input.endStructure_qatsm0$(this.descriptor);
    if (!kSet)
      throw new SerializationException('Required key is missing');
    if (!vSet)
      throw new SerializationException('Required value is missing');
    return this.toResult_xwzc9p$((tmp$ = k) == null || Kotlin.isType(tmp$, Any) ? tmp$ : throwCCE(), (tmp$_0 = v) == null || Kotlin.isType(tmp$_0, Any) ? tmp$_0 : throwCCE());
  };
  KeyValueSerializer.prototype.readKey_ej6kb6$ = function (decoder) {
    return decoder.decodeSerializableElement_s44l7r$(this.descriptor, 0, this.kSerializer);
  };
  KeyValueSerializer.prototype.readValue_gqyu7$ = function (decoder, k, kSet) {
    return decoder.decodeSerializableElement_s44l7r$(this.descriptor, 1, this.vSerializer);
  };
  KeyValueSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'KeyValueSerializer',
    interfaces: [KSerializer]
  };
  function MapEntryUpdatingSerializer(mSerializer, mapBuilder) {
    KeyValueSerializer.call(this, mSerializer.kSerializer, mSerializer.vSerializer);
    this.mapBuilder_0 = mapBuilder;
    this.descriptor_vte9bb$_0 = MapEntryClassDesc_getInstance();
  }
  Object.defineProperty(MapEntryUpdatingSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_vte9bb$_0;
    }
  });
  MapEntryUpdatingSerializer.prototype.toResult_xwzc9p$ = function (key, value) {
    return new MapEntry(key, value);
  };
  MapEntryUpdatingSerializer.prototype.readValue_gqyu7$ = function (decoder, k, kSet) {
    var tmp$, tmp$_0;
    if (!kSet)
      throw new SerializationException('Key must be before value in serialization stream');
    var key = (tmp$ = k) == null || Kotlin.isType(tmp$, Any) ? tmp$ : throwCCE();
    if (this.mapBuilder_0.containsKey_11rb$(key) && !Kotlin.isType(this.vSerializer.descriptor.kind, PrimitiveKind)) {
      tmp$_0 = decoder.updateSerializableElement_ehubvl$(this.descriptor, 1, this.vSerializer, getValue(this.mapBuilder_0, key));
    }
     else {
      tmp$_0 = decoder.decodeSerializableElement_s44l7r$(this.descriptor, 1, this.vSerializer);
    }
    var v = tmp$_0;
    this.mapBuilder_0.put_xwzc9p$(key, v);
    return v;
  };
  MapEntryUpdatingSerializer.prototype.get_key_wili$ = function ($receiver) {
    return $receiver.key;
  };
  MapEntryUpdatingSerializer.prototype.get_value_wili$ = function ($receiver) {
    return $receiver.value;
  };
  MapEntryUpdatingSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapEntryUpdatingSerializer',
    interfaces: [KeyValueSerializer]
  };
  function MapEntrySerializer(kSerializer, vSerializer) {
    KeyValueSerializer.call(this, kSerializer, vSerializer);
    this.descriptor_cnmk75$_0 = MapEntryClassDesc_getInstance();
  }
  Object.defineProperty(MapEntrySerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_cnmk75$_0;
    }
  });
  MapEntrySerializer.prototype.toResult_xwzc9p$ = function (key, value) {
    return new MapEntry(key, value);
  };
  MapEntrySerializer.prototype.get_key_wili$ = function ($receiver) {
    return $receiver.key;
  };
  MapEntrySerializer.prototype.get_value_wili$ = function ($receiver) {
    return $receiver.value;
  };
  MapEntrySerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapEntrySerializer',
    interfaces: [KeyValueSerializer]
  };
  function PairSerializer(kSerializer, vSerializer) {
    KeyValueSerializer.call(this, kSerializer, vSerializer);
    this.descriptor_utc4rp$_0 = PairClassDesc_getInstance();
  }
  Object.defineProperty(PairSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_utc4rp$_0;
    }
  });
  PairSerializer.prototype.toResult_xwzc9p$ = function (key, value) {
    return to(key, value);
  };
  PairSerializer.prototype.get_key_wili$ = function ($receiver) {
    return $receiver.first;
  };
  PairSerializer.prototype.get_value_wili$ = function ($receiver) {
    return $receiver.second;
  };
  PairSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PairSerializer',
    interfaces: [KeyValueSerializer]
  };
  function MapEntry(key, value) {
    this.key_qf615j$_0 = key;
    this.value_x17797$_0 = value;
  }
  Object.defineProperty(MapEntry.prototype, 'key', {
    get: function () {
      return this.key_qf615j$_0;
    }
  });
  Object.defineProperty(MapEntry.prototype, 'value', {
    get: function () {
      return this.value_x17797$_0;
    }
  });
  MapEntry.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapEntry',
    interfaces: [Map$Entry]
  };
  MapEntry.prototype.component1 = function () {
    return this.key;
  };
  MapEntry.prototype.component2 = function () {
    return this.value;
  };
  MapEntry.prototype.copy_xwzc9p$ = function (key, value) {
    return new MapEntry(key === void 0 ? this.key : key, value === void 0 ? this.value : value);
  };
  MapEntry.prototype.toString = function () {
    return 'MapEntry(key=' + Kotlin.toString(this.key) + (', value=' + Kotlin.toString(this.value)) + ')';
  };
  MapEntry.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.key) | 0;
    result = result * 31 + Kotlin.hashCode(this.value) | 0;
    return result;
  };
  MapEntry.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.key, other.key) && Kotlin.equals(this.value, other.value)))));
  };
  function MapEntryClassDesc() {
    MapEntryClassDesc_instance = this;
    SerialClassDescImpl.call(this, 'kotlin.collections.Map.Entry');
    this.kind_6o02kx$_0 = StructureKind$MAP_getInstance();
    this.addElement_ivxn3r$('key');
    this.addElement_ivxn3r$('value');
  }
  Object.defineProperty(MapEntryClassDesc.prototype, 'kind', {
    get: function () {
      return this.kind_6o02kx$_0;
    }
  });
  MapEntryClassDesc.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'MapEntryClassDesc',
    interfaces: [SerialClassDescImpl]
  };
  var MapEntryClassDesc_instance = null;
  function MapEntryClassDesc_getInstance() {
    if (MapEntryClassDesc_instance === null) {
      new MapEntryClassDesc();
    }
    return MapEntryClassDesc_instance;
  }
  function PairClassDesc() {
    PairClassDesc_instance = this;
    SerialClassDescImpl.call(this, 'kotlin.Pair');
    this.addElement_ivxn3r$('first');
    this.addElement_ivxn3r$('second');
  }
  PairClassDesc.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'PairClassDesc',
    interfaces: [SerialClassDescImpl]
  };
  var PairClassDesc_instance = null;
  function PairClassDesc_getInstance() {
    if (PairClassDesc_instance === null) {
      new PairClassDesc();
    }
    return PairClassDesc_instance;
  }
  function TripleSerializer(aSerializer, bSerializer, cSerializer) {
    this.aSerializer_0 = aSerializer;
    this.bSerializer_0 = bSerializer;
    this.cSerializer_0 = cSerializer;
    this.descriptor_73a6vr$_0 = TripleSerializer$TripleDesc_getInstance();
  }
  function TripleSerializer$TripleDesc() {
    TripleSerializer$TripleDesc_instance = this;
    SerialClassDescImpl.call(this, 'kotlin.Triple');
    this.addElement_ivxn3r$('first');
    this.addElement_ivxn3r$('second');
    this.addElement_ivxn3r$('third');
  }
  TripleSerializer$TripleDesc.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'TripleDesc',
    interfaces: [SerialClassDescImpl]
  };
  var TripleSerializer$TripleDesc_instance = null;
  function TripleSerializer$TripleDesc_getInstance() {
    if (TripleSerializer$TripleDesc_instance === null) {
      new TripleSerializer$TripleDesc();
    }
    return TripleSerializer$TripleDesc_instance;
  }
  Object.defineProperty(TripleSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_73a6vr$_0;
    }
  });
  TripleSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var encoder_0 = encoder.beginStructure_r0sa6z$(this.descriptor, [this.aSerializer_0, this.bSerializer_0, this.cSerializer_0]);
    encoder_0.encodeSerializableElement_blecud$(this.descriptor, 0, this.aSerializer_0, obj.first);
    encoder_0.encodeSerializableElement_blecud$(this.descriptor, 1, this.bSerializer_0, obj.second);
    encoder_0.encodeSerializableElement_blecud$(this.descriptor, 2, this.cSerializer_0, obj.third);
    encoder_0.endStructure_qatsm0$(this.descriptor);
  };
  TripleSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var tmp$, tmp$_0, tmp$_1;
    var input = decoder.beginStructure_r0sa6z$(this.descriptor, [this.aSerializer_0, this.bSerializer_0, this.cSerializer_0]);
    var aSet = false;
    var bSet = false;
    var cSet = false;
    var a = null;
    var b = null;
    var c = null;
    mainLoop: while (true) {
      switch (input.decodeElementIndex_qatsm0$(this.descriptor)) {
        case -2:
          a = input.decodeSerializableElement_s44l7r$(this.descriptor, 0, this.aSerializer_0);
          aSet = true;
          b = input.decodeSerializableElement_s44l7r$(this.descriptor, 1, this.bSerializer_0);
          bSet = true;
          c = input.decodeSerializableElement_s44l7r$(this.descriptor, 2, this.cSerializer_0);
          cSet = true;
          break mainLoop;
        case -1:
          break mainLoop;
        case 0:
          a = input.decodeSerializableElement_s44l7r$(this.descriptor, 0, this.aSerializer_0);
          aSet = true;
          break;
        case 1:
          b = input.decodeSerializableElement_s44l7r$(this.descriptor, 1, this.bSerializer_0);
          bSet = true;
          break;
        case 2:
          c = input.decodeSerializableElement_s44l7r$(this.descriptor, 2, this.cSerializer_0);
          cSet = true;
          break;
        default:throw new SerializationException('Invalid index');
      }
    }
    input.endStructure_qatsm0$(this.descriptor);
    if (!aSet)
      throw new SerializationException('Required first is missing');
    if (!bSet)
      throw new SerializationException('Required second is missing');
    if (!cSet)
      throw new SerializationException('Required third is missing');
    return new Triple((tmp$ = a) == null || Kotlin.isType(tmp$, Any) ? tmp$ : throwCCE(), (tmp$_0 = b) == null || Kotlin.isType(tmp$_0, Any) ? tmp$_0 : throwCCE(), (tmp$_1 = c) == null || Kotlin.isType(tmp$_1, Any) ? tmp$_1 : throwCCE());
  };
  TripleSerializer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'TripleSerializer',
    interfaces: [KSerializer]
  };
  function onlySingleOrNull($receiver) {
    switch ($receiver.size) {
      case 0:
        return null;
      case 1:
        return $receiver.get_za3lpa$(0);
      default:throw IllegalStateException_init('Too much arguments in list');
    }
  }
  function readExactNBytes($receiver, bytes) {
    var array = new Int8Array(bytes);
    var read = 0;
    while (read < bytes) {
      var i = $receiver.read_mj6st8$(array, read, bytes - read | 0);
      if (i === -1)
        throw new IOException('Unexpected EOF');
      read = read + i | 0;
    }
    return array;
  }
  function readToByteBuffer($receiver, bytes) {
    var arr = readExactNBytes($receiver, bytes);
    var buf = ByteBuffer$Companion_getInstance().allocate_za3lpa$(bytes);
    buf.put_fqrh44$(arr).flip();
    return buf;
  }
  function HexConverter() {
    HexConverter_instance = this;
    this.hexCode_0 = '0123456789ABCDEF';
  }
  HexConverter.prototype.parseHexBinary_61zpoe$ = function (s) {
    var len = s.length;
    if (len % 2 !== 0) {
      throw IllegalArgumentException_init('HexBinary string must be even length');
    }
    var bytes = new Int8Array(len / 2 | 0);
    var i = 0;
    while (i < len) {
      var h = this.hexToInt_0(s.charCodeAt(i));
      var l = this.hexToInt_0(s.charCodeAt(i + 1 | 0));
      if (h === -1 || l === -1) {
        throw IllegalArgumentException_init('Invalid hex chars: ' + String.fromCharCode(s.charCodeAt(i)) + String.fromCharCode(s.charCodeAt(i + 1 | 0)));
      }
      bytes[i / 2 | 0] = toByte((h << 4) + l | 0);
      i = i + 2 | 0;
    }
    return bytes;
  };
  HexConverter.prototype.hexToInt_0 = function (ch) {
    if ((new CharRange(48, 57)).contains_mef7kx$(ch))
      return ch - 48;
    else if ((new CharRange(65, 70)).contains_mef7kx$(ch))
      return ch - 65 + 10 | 0;
    else if ((new CharRange(97, 102)).contains_mef7kx$(ch))
      return ch - 97 + 10 | 0;
    else
      return -1;
  };
  HexConverter.prototype.printHexBinary_1fhb37$ = function (data, lowerCase) {
    if (lowerCase === void 0)
      lowerCase = false;
    var tmp$;
    var r = StringBuilder_init(data.length * 2 | 0);
    for (tmp$ = 0; tmp$ !== data.length; ++tmp$) {
      var b = data[tmp$];
      r.append_s8itvh$(this.hexCode_0.charCodeAt(b >> 4 & 15));
      r.append_s8itvh$(this.hexCode_0.charCodeAt(b & 15));
    }
    return lowerCase ? r.toString().toLowerCase() : r.toString();
  };
  HexConverter.prototype.toHexString_za3lpa$ = function (n) {
    var tmp$;
    var $receiver = trimStart(this.printHexBinary_1fhb37$(ByteBuffer$Companion_getInstance().allocate_za3lpa$(4).putInt_za3lpa$(n).flip().array(), true), Kotlin.charArrayOf(48));
    return (tmp$ = $receiver.length > 0 ? $receiver : null) != null ? tmp$ : '0';
  };
  HexConverter.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'HexConverter',
    interfaces: []
  };
  var HexConverter_instance = null;
  function HexConverter_getInstance() {
    if (HexConverter_instance === null) {
      new HexConverter();
    }
    return HexConverter_instance;
  }
  function getUnsignedByte($receiver) {
    return $receiver.get() & 255;
  }
  function getUnsignedShort($receiver) {
    return $receiver.getShort() & 65535;
  }
  function getUnsignedInt($receiver) {
    return Kotlin.Long.fromInt($receiver.getInt()).and(L4294967295);
  }
  function Json(unquoted, indented, indent, strictMode, updateMode, encodeDefaults) {
    Json$Companion_getInstance();
    if (unquoted === void 0)
      unquoted = false;
    if (indented === void 0)
      indented = false;
    if (indent === void 0)
      indent = '    ';
    if (strictMode === void 0)
      strictMode = true;
    if (updateMode === void 0)
      updateMode = UpdateMode$OVERWRITE_getInstance();
    if (encodeDefaults === void 0)
      encodeDefaults = true;
    AbstractSerialFormat.call(this);
    this.unquoted_8be2vx$ = unquoted;
    this.indented_8be2vx$ = indented;
    this.indent_8be2vx$ = indent;
    this.strictMode_8be2vx$ = strictMode;
    this.updateMode = updateMode;
    this.encodeDefaults = encodeDefaults;
    var module_0 = new Json_init$ObjectLiteral();
    this.install_7fck8k$(module_0);
  }
  Json.prototype.stringify_tf03ej$ = function (serializer, obj) {
    var result = StringBuilder_init_0();
    var encoder = StreamingJsonOutput_init(result, this, WriteMode$OBJ_getInstance(), Kotlin.newArray(WriteMode$values().length, null));
    encode_0(encoder, serializer, obj);
    return result.toString();
  };
  Json.prototype.toJson_tf03ej$ = function (serializer, value) {
    return writeJson(this, value, serializer);
  };
  Json.prototype.toJson_issdgt$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.Json.toJson_issdgt$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, value) {
      return this.toJson_tf03ej$(getOrDefault(this.context, getKClass(T_0)), value);
    };
  }));
  Json.prototype.parse_awif5v$ = function (deserializer, string) {
    var reader = new JsonReader(string);
    var input = new StreamingJsonInput(this, WriteMode$OBJ_getInstance(), reader);
    var result = decode_0(input, deserializer);
    if (!reader.isDone) {
      throw IllegalStateException_init(('Reader has not consumed the whole input: ' + reader).toString());
    }
    return result;
  };
  Json.prototype.parseJson_61zpoe$ = function (string) {
    return this.parse_awif5v$(JsonElementSerializer_getInstance(), string);
  };
  Json.prototype.fromJson_htt2tq$ = function (deserializer, json) {
    return readJson(this, json, deserializer);
  };
  Json.prototype.fromJson_65rf1y$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.Json.fromJson_65rf1y$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, tree) {
      return this.fromJson_htt2tq$(getOrDefault(this.context, getKClass(T_0)), tree);
    };
  }));
  function Json$Companion() {
    Json$Companion_instance = this;
    this.plain = new Json();
    this.unquoted = new Json(true);
    this.indented = new Json(void 0, true);
    this.nonstrict = new Json(void 0, void 0, void 0, false);
  }
  Json$Companion.prototype.install_7fck8k$ = function (module_0) {
    this.plain.install_7fck8k$(module_0);
  };
  Object.defineProperty(Json$Companion.prototype, 'context', {
    get: function () {
      return this.plain.context;
    }
  });
  Json$Companion.prototype.stringify_tf03ej$ = function (serializer, obj) {
    return this.plain.stringify_tf03ej$(serializer, obj);
  };
  Json$Companion.prototype.parse_awif5v$ = function (deserializer, string) {
    return this.plain.parse_awif5v$(deserializer, string);
  };
  Json$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: [StringFormat]
  };
  var Json$Companion_instance = null;
  function Json$Companion_getInstance() {
    if (Json$Companion_instance === null) {
      new Json$Companion();
    }
    return Json$Companion_instance;
  }
  function Json_init$ObjectLiteral() {
  }
  Json_init$ObjectLiteral.prototype.registerIn_slu7av$ = function (context) {
    context.registerSerializer_cfhkba$(getKClass(JsonElement), JsonElementSerializer_getInstance());
    context.registerSerializer_cfhkba$(getKClass(JsonPrimitive), JsonPrimitiveSerializer_getInstance());
    context.registerSerializer_cfhkba$(getKClass(JsonLiteral), JsonLiteralSerializer_getInstance());
    context.registerSerializer_cfhkba$(getKClass(JsonNull), JsonNullSerializer_getInstance());
    context.registerSerializer_cfhkba$(getKClass(JsonObject), JsonObjectSerializer_getInstance());
    context.registerSerializer_cfhkba$(getKClass(JsonArray), JsonArraySerializer_getInstance());
  };
  Json_init$ObjectLiteral.$metadata$ = {
    kind: Kind_CLASS,
    interfaces: [SerialModule]
  };
  Json.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Json',
    interfaces: [StringFormat, AbstractSerialFormat]
  };
  function json(init) {
    var builder = new JsonObjectBuilder();
    init(builder);
    return new JsonObject(builder.content_8be2vx$);
  }
  function jsonArray(init) {
    var builder = new JsonArrayBuilder();
    init(builder);
    return new JsonArray(builder.content_8be2vx$);
  }
  function JsonArrayBuilder() {
    this.content_8be2vx$ = ArrayList_init_0();
  }
  JsonArrayBuilder.prototype.unaryPlus_5cw0du$ = function ($receiver) {
    this.content_8be2vx$.add_11rb$(JsonPrimitive_2($receiver));
  };
  JsonArrayBuilder.prototype.unaryPlus_4sdtmu$ = function ($receiver) {
    this.content_8be2vx$.add_11rb$(JsonPrimitive_1($receiver));
  };
  JsonArrayBuilder.prototype.unaryPlus_d4wkrv$ = function ($receiver) {
    this.content_8be2vx$.add_11rb$(JsonPrimitive_0($receiver));
  };
  JsonArrayBuilder.prototype.unaryPlus_u3sd3g$ = function ($receiver) {
    this.content_8be2vx$.add_11rb$($receiver);
  };
  JsonArrayBuilder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonArrayBuilder',
    interfaces: []
  };
  function JsonObjectBuilder() {
    this.content_8be2vx$ = LinkedHashMap_init();
  }
  JsonObjectBuilder.prototype.to_ahl3kc$ = function ($receiver, value) {
    if (!(this.content_8be2vx$.get_11rb$($receiver) == null)) {
      var message = 'Key ' + $receiver + ' is already registered in builder';
      throw IllegalArgumentException_init(message.toString());
    }
    this.content_8be2vx$.put_xwzc9p$($receiver, value);
  };
  JsonObjectBuilder.prototype.to_lr5kl6$ = function ($receiver, value) {
    if (!(this.content_8be2vx$.get_11rb$($receiver) == null)) {
      var message = 'Key ' + $receiver + ' is already registered in builder';
      throw IllegalArgumentException_init(message.toString());
    }
    var $receiver_0 = this.content_8be2vx$;
    var value_0 = JsonPrimitive_1(value);
    $receiver_0.put_xwzc9p$($receiver, value_0);
  };
  JsonObjectBuilder.prototype.to_sg61ir$ = function ($receiver, value) {
    if (!(this.content_8be2vx$.get_11rb$($receiver) == null)) {
      var message = 'Key ' + $receiver + ' is already registered in builder';
      throw IllegalArgumentException_init(message.toString());
    }
    var $receiver_0 = this.content_8be2vx$;
    var value_0 = JsonPrimitive_0(value);
    $receiver_0.put_xwzc9p$($receiver, value_0);
  };
  JsonObjectBuilder.prototype.to_npuxma$ = function ($receiver, value) {
    if (!(this.content_8be2vx$.get_11rb$($receiver) == null)) {
      var message = 'Key ' + $receiver + ' is already registered in builder';
      throw IllegalArgumentException_init(message.toString());
    }
    var $receiver_0 = this.content_8be2vx$;
    var value_0 = JsonPrimitive_2(value);
    $receiver_0.put_xwzc9p$($receiver, value_0);
  };
  JsonObjectBuilder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonObjectBuilder',
    interfaces: []
  };
  function JsonElement() {
  }
  Object.defineProperty(JsonElement.prototype, 'primitive', {
    get: function () {
      return this.error_azfyan$_0('JsonLiteral');
    }
  });
  Object.defineProperty(JsonElement.prototype, 'jsonObject', {
    get: function () {
      return this.error_azfyan$_0('JsonObject');
    }
  });
  Object.defineProperty(JsonElement.prototype, 'jsonArray', {
    get: function () {
      return this.error_azfyan$_0('JsonArray');
    }
  });
  Object.defineProperty(JsonElement.prototype, 'jsonNull', {
    get: function () {
      return this.error_azfyan$_0('JsonPrimitive');
    }
  });
  Object.defineProperty(JsonElement.prototype, 'isNull', {
    get: function () {
      return this === JsonNull_getInstance();
    }
  });
  JsonElement.prototype.error_azfyan$_0 = function (element) {
    throw new JsonElementTypeMismatchException(Kotlin.getKClassFromExpression(this).toString(), element);
  };
  JsonElement.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonElement',
    interfaces: []
  };
  function JsonPrimitive() {
    JsonElement.call(this);
    this.primitive_awfpe5$_0 = this;
  }
  Object.defineProperty(JsonPrimitive.prototype, 'primitive', {
    get: function () {
      return this.primitive_awfpe5$_0;
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'int', {
    get: function () {
      return toInt(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'intOrNull', {
    get: function () {
      return toIntOrNull(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'long', {
    get: function () {
      return toLong(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'longOrNull', {
    get: function () {
      return toLongOrNull(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'double', {
    get: function () {
      return toDouble(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'doubleOrNull', {
    get: function () {
      return toDoubleOrNull(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'float', {
    get: function () {
      return toDouble(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'floatOrNull', {
    get: function () {
      return toDoubleOrNull(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'boolean', {
    get: function () {
      return toBooleanStrict(this.content);
    }
  });
  Object.defineProperty(JsonPrimitive.prototype, 'booleanOrNull', {
    get: function () {
      return toBooleanStrictOrNull(this.content);
    }
  });
  JsonPrimitive.prototype.toString = function () {
    return this.content;
  };
  JsonPrimitive.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonPrimitive',
    interfaces: [JsonElement]
  };
  function JsonLiteral(body, isString) {
    JsonPrimitive.call(this);
    this.body = body;
    this.isString = isString;
    this.content_prrjtz$_0 = this.body.toString();
    this.contentOrNull_mx86gf$_0 = this.content;
  }
  Object.defineProperty(JsonLiteral.prototype, 'content', {
    get: function () {
      return this.content_prrjtz$_0;
    }
  });
  Object.defineProperty(JsonLiteral.prototype, 'contentOrNull', {
    get: function () {
      return this.contentOrNull_mx86gf$_0;
    }
  });
  JsonLiteral.prototype.toString = function () {
    var tmp$;
    if (this.isString) {
      var $receiver = StringBuilder_init_0();
      printQuoted($receiver, this.content);
      tmp$ = $receiver.toString();
    }
     else
      tmp$ = this.content;
    return tmp$;
  };
  JsonLiteral.prototype.equals = function (other) {
    var tmp$, tmp$_0;
    if (this === other)
      return true;
    if (other == null || !((tmp$ = Kotlin.getKClassFromExpression(this)) != null ? tmp$.equals(Kotlin.getKClassFromExpression(other)) : null))
      return false;
    Kotlin.isType(tmp$_0 = other, JsonLiteral) ? tmp$_0 : throwCCE();
    if (this.isString !== other.isString)
      return false;
    if (!equals(this.content, other.content))
      return false;
    return true;
  };
  JsonLiteral.prototype.hashCode = function () {
    var result = hashCode(this.isString);
    result = (31 * result | 0) + hashCode(this.content) | 0;
    return result;
  };
  JsonLiteral.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonLiteral',
    interfaces: [JsonPrimitive]
  };
  function JsonLiteral_init(number, $this) {
    $this = $this || Object.create(JsonLiteral.prototype);
    JsonLiteral.call($this, number, false);
    return $this;
  }
  function JsonLiteral_init_0(boolean, $this) {
    $this = $this || Object.create(JsonLiteral.prototype);
    JsonLiteral.call($this, boolean, false);
    return $this;
  }
  function JsonLiteral_init_1(string, $this) {
    $this = $this || Object.create(JsonLiteral.prototype);
    JsonLiteral.call($this, string, true);
    return $this;
  }
  function JsonNull() {
    JsonNull_instance = this;
    JsonPrimitive.call(this);
    this.jsonNull_c8yjib$_0 = this;
    this.content_w1vkof$_0 = 'null';
    this.contentOrNull_egvcud$_0 = null;
  }
  Object.defineProperty(JsonNull.prototype, 'jsonNull', {
    get: function () {
      return this.jsonNull_c8yjib$_0;
    }
  });
  Object.defineProperty(JsonNull.prototype, 'content', {
    get: function () {
      return this.content_w1vkof$_0;
    }
  });
  Object.defineProperty(JsonNull.prototype, 'contentOrNull', {
    get: function () {
      return this.contentOrNull_egvcud$_0;
    }
  });
  JsonNull.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonNull',
    interfaces: [JsonPrimitive]
  };
  var JsonNull_instance = null;
  function JsonNull_getInstance() {
    if (JsonNull_instance === null) {
      new JsonNull();
    }
    return JsonNull_instance;
  }
  function JsonObject(content) {
    JsonElement.call(this);
    this.content = content;
    this.jsonObject_js4yrn$_0 = this;
  }
  Object.defineProperty(JsonObject.prototype, 'jsonObject', {
    get: function () {
      return this.jsonObject_js4yrn$_0;
    }
  });
  JsonObject.prototype.get_11rb$ = function (key) {
    var tmp$;
    tmp$ = this.content.get_11rb$(key);
    if (tmp$ == null) {
      throw new NoSuchElementException('Element ' + key + ' is missing');
    }
    return tmp$;
  };
  JsonObject.prototype.getOrNull_61zpoe$ = function (key) {
    return this.content.get_11rb$(key);
  };
  JsonObject.prototype.getPrimitive_61zpoe$ = function (key) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.get_11rb$(key), JsonPrimitive) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson(key, 'JsonPrimitive');
  };
  JsonObject.prototype.getObject_61zpoe$ = function (key) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.get_11rb$(key), JsonObject) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson(key, 'JsonObject');
  };
  JsonObject.prototype.getArray_61zpoe$ = function (key) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.get_11rb$(key), JsonArray) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson(key, 'JsonArray');
  };
  JsonObject.prototype.getPrimitiveOrNull_61zpoe$ = function (key) {
    var tmp$;
    return Kotlin.isType(tmp$ = this.content.get_11rb$(key), JsonPrimitive) ? tmp$ : null;
  };
  JsonObject.prototype.getObjectOrNull_61zpoe$ = function (key) {
    var tmp$;
    return Kotlin.isType(tmp$ = this.content.get_11rb$(key), JsonObject) ? tmp$ : null;
  };
  JsonObject.prototype.getArrayOrNull_61zpoe$ = function (key) {
    var tmp$;
    return Kotlin.isType(tmp$ = this.content.get_11rb$(key), JsonArray) ? tmp$ : null;
  };
  JsonObject.prototype.getAs_j069p3$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.JsonObject.getAs_j069p3$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var unexpectedJson = _.kotlinx.serialization.json.unexpectedJson_puj7f4$;
    return function (J_0, isJ, key) {
      var tmp$, tmp$_0;
      return (tmp$_0 = isJ(tmp$ = this.get_11rb$(key)) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson(key, getKClass(J_0).toString());
    };
  }));
  JsonObject.prototype.lookup_j069p3$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.JsonObject.lookup_j069p3$', function (J_0, isJ, key) {
    var tmp$;
    return isJ(tmp$ = this.content.get_11rb$(key)) ? tmp$ : null;
  });
  function JsonObject$toString$lambda(f) {
    var k = f.key;
    var v = f.value;
    return '"' + k + '"' + ':' + v;
  }
  JsonObject.prototype.toString = function () {
    return joinToString(this.content.entries, ',', '{', '}', void 0, void 0, JsonObject$toString$lambda);
  };
  JsonObject.prototype.equals = function (other) {
    return equals(this.content, other);
  };
  JsonObject.prototype.hashCode = function () {
    return hashCode(this.content);
  };
  Object.defineProperty(JsonObject.prototype, 'entries', {
    get: function () {
      return this.content.entries;
    }
  });
  Object.defineProperty(JsonObject.prototype, 'keys', {
    get: function () {
      return this.content.keys;
    }
  });
  Object.defineProperty(JsonObject.prototype, 'size', {
    get: function () {
      return this.content.size;
    }
  });
  Object.defineProperty(JsonObject.prototype, 'values', {
    get: function () {
      return this.content.values;
    }
  });
  JsonObject.prototype.containsKey_11rb$ = function (key) {
    return this.content.containsKey_11rb$(key);
  };
  JsonObject.prototype.containsValue_11rc$ = function (value) {
    return this.content.containsValue_11rc$(value);
  };
  JsonObject.prototype.isEmpty = function () {
    return this.content.isEmpty();
  };
  JsonObject.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonObject',
    interfaces: [Map, JsonElement]
  };
  JsonObject.prototype.component1 = function () {
    return this.content;
  };
  JsonObject.prototype.copy_fnd918$ = function (content) {
    return new JsonObject(content === void 0 ? this.content : content);
  };
  function JsonArray(content) {
    JsonElement.call(this);
    this.content = content;
    this.jsonArray_u1gsrt$_0 = this;
  }
  Object.defineProperty(JsonArray.prototype, 'jsonArray', {
    get: function () {
      return this.jsonArray_u1gsrt$_0;
    }
  });
  JsonArray.prototype.getPrimitive_za3lpa$ = function (index) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.content.get_za3lpa$(index), JsonPrimitive) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson('at ' + index, 'JsonPrimitive');
  };
  JsonArray.prototype.getObject_za3lpa$ = function (index) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.content.get_za3lpa$(index), JsonObject) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson('at ' + index, 'JsonObject');
  };
  JsonArray.prototype.getArray_za3lpa$ = function (index) {
    var tmp$, tmp$_0;
    return (tmp$_0 = Kotlin.isType(tmp$ = this.content.get_za3lpa$(index), JsonArray) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson('at ' + index, 'JsonArray');
  };
  JsonArray.prototype.getPrimitiveOrNull_za3lpa$ = function (index) {
    var tmp$;
    return Kotlin.isType(tmp$ = getOrNull_0(this.content, index), JsonPrimitive) ? tmp$ : null;
  };
  JsonArray.prototype.getObjectOrNull_za3lpa$ = function (index) {
    var tmp$;
    return Kotlin.isType(tmp$ = getOrNull_0(this.content, index), JsonObject) ? tmp$ : null;
  };
  JsonArray.prototype.getArrayOrNull_za3lpa$ = function (index) {
    var tmp$;
    return Kotlin.isType(tmp$ = getOrNull_0(this.content, index), JsonArray) ? tmp$ : null;
  };
  JsonArray.prototype.getAs_n86q5$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.JsonArray.getAs_n86q5$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var unexpectedJson = _.kotlinx.serialization.json.unexpectedJson_puj7f4$;
    return function (J_0, isJ, index) {
      var tmp$, tmp$_0;
      return (tmp$_0 = isJ(tmp$ = this.content.get_za3lpa$(index)) ? tmp$ : null) != null ? tmp$_0 : unexpectedJson('at ' + index, getKClass(J_0).toString());
    };
  }));
  JsonArray.prototype.getAsOrNull_n86q5$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.JsonArray.getAsOrNull_n86q5$', wrapFunction(function () {
    var getOrNull = Kotlin.kotlin.collections.getOrNull_yzln2o$;
    return function (J_0, isJ, index) {
      var tmp$;
      return isJ(tmp$ = getOrNull(this.content, index)) ? tmp$ : null;
    };
  }));
  JsonArray.prototype.toString = function () {
    return joinToString(this.content, ',', '[', ']');
  };
  JsonArray.prototype.equals = function (other) {
    return equals(this.content, other);
  };
  JsonArray.prototype.hashCode = function () {
    return hashCode(this.content);
  };
  Object.defineProperty(JsonArray.prototype, 'size', {
    get: function () {
      return this.content.size;
    }
  });
  JsonArray.prototype.contains_11rb$ = function (element) {
    return this.content.contains_11rb$(element);
  };
  JsonArray.prototype.containsAll_brywnq$ = function (elements) {
    return this.content.containsAll_brywnq$(elements);
  };
  JsonArray.prototype.get_za3lpa$ = function (index) {
    return this.content.get_za3lpa$(index);
  };
  JsonArray.prototype.indexOf_11rb$ = function (element) {
    return this.content.indexOf_11rb$(element);
  };
  JsonArray.prototype.isEmpty = function () {
    return this.content.isEmpty();
  };
  JsonArray.prototype.iterator = function () {
    return this.content.iterator();
  };
  JsonArray.prototype.lastIndexOf_11rb$ = function (element) {
    return this.content.lastIndexOf_11rb$(element);
  };
  JsonArray.prototype.listIterator = function () {
    return this.content.listIterator();
  };
  JsonArray.prototype.listIterator_za3lpa$ = function (index) {
    return this.content.listIterator_za3lpa$(index);
  };
  JsonArray.prototype.subList_vux9f0$ = function (fromIndex, toIndex) {
    return this.content.subList_vux9f0$(fromIndex, toIndex);
  };
  JsonArray.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonArray',
    interfaces: [List, JsonElement]
  };
  JsonArray.prototype.component1 = function () {
    return this.content;
  };
  JsonArray.prototype.copy_adp4jc$ = function (content) {
    return new JsonArray(content === void 0 ? this.content : content);
  };
  function unexpectedJson(key, expected) {
    throw new JsonElementTypeMismatchException(key, expected);
  }
  function JsonPrimitive_0(value) {
    if (value == null)
      return JsonNull_getInstance();
    return JsonLiteral_init_0(value);
  }
  function JsonPrimitive_1(value) {
    if (value == null)
      return JsonNull_getInstance();
    return JsonLiteral_init(value);
  }
  function JsonPrimitive_2(value) {
    if (value == null)
      return JsonNull_getInstance();
    return JsonLiteral_init_1(value);
  }
  function get_int($receiver) {
    return $receiver.primitive.int;
  }
  function get_intOrNull($receiver) {
    return $receiver.primitive.intOrNull;
  }
  function get_long($receiver) {
    return $receiver.primitive.long;
  }
  function get_longOrNull($receiver) {
    return $receiver.primitive.longOrNull;
  }
  function get_double($receiver) {
    return $receiver.primitive.double;
  }
  function get_doubleOrNull($receiver) {
    return $receiver.primitive.doubleOrNull;
  }
  function get_float($receiver) {
    return $receiver.primitive.float;
  }
  function get_floatOrNull($receiver) {
    return $receiver.primitive.floatOrNull;
  }
  function get_boolean($receiver) {
    return $receiver.primitive.boolean;
  }
  function get_booleanOrNull($receiver) {
    return $receiver.primitive.booleanOrNull;
  }
  function get_content($receiver) {
    return $receiver.primitive.content;
  }
  function get_contentOrNull($receiver) {
    return $receiver.primitive.contentOrNull;
  }
  function JsonException(message) {
    SerializationException.call(this, message);
    this.name = 'JsonException';
  }
  JsonException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonException',
    interfaces: [SerializationException]
  };
  function JsonInvalidValueInStrictModeException(value, valueDescription) {
    JsonException.call(this, value.toString() + ' is not a valid ' + valueDescription + ' as per JSON spec.' + '\n' + 'You can disable strict mode to serialize such values');
    this.name = 'JsonInvalidValueInStrictModeException';
  }
  JsonInvalidValueInStrictModeException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonInvalidValueInStrictModeException',
    interfaces: [JsonException]
  };
  function JsonInvalidValueInStrictModeException_init(floatValue, $this) {
    $this = $this || Object.create(JsonInvalidValueInStrictModeException.prototype);
    JsonInvalidValueInStrictModeException.call($this, floatValue, 'float');
    return $this;
  }
  function JsonInvalidValueInStrictModeException_init_0(doubleValue, $this) {
    $this = $this || Object.create(JsonInvalidValueInStrictModeException.prototype);
    JsonInvalidValueInStrictModeException.call($this, doubleValue, 'double');
    return $this;
  }
  function JsonUnknownKeyException(key) {
    JsonException.call(this, 'Strict JSON encountered unknown key: ' + key + '\n' + 'You can disable strict mode to skip unknown keys');
    this.name = 'JsonUnknownKeyException';
  }
  JsonUnknownKeyException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonUnknownKeyException',
    interfaces: [JsonException]
  };
  function JsonParsingException(position, message) {
    JsonException.call(this, 'Invalid JSON at ' + position + ': ' + message);
    this.name = 'JsonParsingException';
  }
  JsonParsingException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonParsingException',
    interfaces: [JsonException]
  };
  function JsonElementTypeMismatchException(key, expected) {
    JsonException.call(this, 'Element ' + key + ' is not a ' + expected);
    this.name = 'JsonElementTypeMismatchException';
  }
  JsonElementTypeMismatchException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonElementTypeMismatchException',
    interfaces: [JsonException]
  };
  function JsonInput() {
  }
  JsonInput.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'JsonInput',
    interfaces: [CompositeDecoder, Decoder]
  };
  function JsonOutput() {
  }
  JsonOutput.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'JsonOutput',
    interfaces: [CompositeEncoder, Encoder]
  };
  function JsonTreeMapper(encodeDefaults) {
    if (encodeDefaults === void 0)
      encodeDefaults = true;
    AbstractSerialFormat.call(this);
    this.encodeDefaults = encodeDefaults;
  }
  JsonTreeMapper.prototype.readTree_65rf1y$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.JsonTreeMapper.readTree_65rf1y$', wrapFunction(function () {
    var Json = _.kotlinx.serialization.json.Json;
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, tree) {
      var $this = Json.Companion.plain;
      return $this.fromJson_htt2tq$(getOrDefault($this.context, getKClass(T_0)), tree);
    };
  }));
  JsonTreeMapper.prototype.readTree_tnyk1m$ = function (obj, deserializer) {
    return Json$Companion_getInstance().plain.fromJson_htt2tq$(deserializer, obj);
  };
  JsonTreeMapper.prototype.writeTree_ps82x1$ = function (obj, serializer) {
    return Json$Companion_getInstance().plain.toJson_tf03ej$(serializer, obj);
  };
  JsonTreeMapper.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeMapper',
    interfaces: [AbstractSerialFormat]
  };
  function JsonTreeParser(input) {
    JsonTreeParser$Companion_getInstance();
    this.input_0 = input;
  }
  function JsonTreeParser$Companion() {
    JsonTreeParser$Companion_instance = this;
  }
  JsonTreeParser$Companion.prototype.parse_61zpoe$ = function (input) {
    var tmp$;
    return Kotlin.isType(tmp$ = Json$Companion_getInstance().plain.parseJson_61zpoe$(input), JsonObject) ? tmp$ : throwCCE();
  };
  JsonTreeParser$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var JsonTreeParser$Companion_instance = null;
  function JsonTreeParser$Companion_getInstance() {
    if (JsonTreeParser$Companion_instance === null) {
      new JsonTreeParser$Companion();
    }
    return JsonTreeParser$Companion_instance;
  }
  JsonTreeParser.prototype.readFully = function () {
    return Json$Companion_getInstance().plain.parseJson_61zpoe$(this.input_0);
  };
  JsonTreeParser.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeParser',
    interfaces: []
  };
  function JsonElementSerializer() {
    JsonElementSerializer_instance = this;
    this.descriptor_jqxmgz$_0 = new JsonElementSerializer$descriptor$ObjectLiteral('JsonElementSerializer');
  }
  Object.defineProperty(JsonElementSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_jqxmgz$_0;
    }
  });
  JsonElementSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    if (Kotlin.isType(obj, JsonPrimitive))
      JsonPrimitiveSerializer_getInstance().serialize_awe97i$(encoder, obj);
    else if (Kotlin.isType(obj, JsonObject))
      JsonObjectSerializer_getInstance().serialize_awe97i$(encoder, obj);
    else if (Kotlin.isType(obj, JsonArray))
      JsonArraySerializer_getInstance().serialize_awe97i$(encoder, obj);
  };
  JsonElementSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    var tmp$, tmp$_0;
    var tmp$_1;
    if ((tmp$_0 = Kotlin.isType(tmp$ = decoder, JsonInput) ? tmp$ : null) != null)
      tmp$_1 = tmp$_0;
    else {
      throw IllegalStateException_init('JsonElement is deserializable only when used by Json'.toString());
    }
    var input = tmp$_1;
    return input.decodeJson();
  };
  function JsonElementSerializer$descriptor$ObjectLiteral(name, generatedSerializer) {
    SerialClassDescImpl.call(this, name, generatedSerializer);
    this.addElement_ivxn3r$('JsonElement');
  }
  Object.defineProperty(JsonElementSerializer$descriptor$ObjectLiteral.prototype, 'kind', {
    get: function () {
      return UnionKind$SEALED_getInstance();
    }
  });
  JsonElementSerializer$descriptor$ObjectLiteral.$metadata$ = {
    kind: Kind_CLASS,
    interfaces: [SerialClassDescImpl]
  };
  JsonElementSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonElementSerializer',
    interfaces: [KSerializer]
  };
  var JsonElementSerializer_instance = null;
  function JsonElementSerializer_getInstance() {
    if (JsonElementSerializer_instance === null) {
      new JsonElementSerializer();
    }
    return JsonElementSerializer_instance;
  }
  function JsonPrimitiveSerializer() {
    JsonPrimitiveSerializer_instance = this;
    this.descriptor_ldo432$_0 = JsonPrimitiveSerializer$JsonPrimitiveDescriptor_getInstance();
  }
  Object.defineProperty(JsonPrimitiveSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_ldo432$_0;
    }
  });
  JsonPrimitiveSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    var tmp$, tmp$_0;
    if (Kotlin.isType(obj, JsonNull)) {
      tmp$_0 = JsonNullSerializer_getInstance().serialize_awe97i$(encoder, JsonNull_getInstance());
    }
     else {
      tmp$_0 = JsonLiteralSerializer_getInstance().serialize_awe97i$(encoder, Kotlin.isType(tmp$ = obj, JsonLiteral) ? tmp$ : throwCCE());
    }
    return tmp$_0;
  };
  JsonPrimitiveSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return decoder.decodeNotNullMark() ? JsonPrimitive_2(decoder.decodeString()) : JsonNullSerializer_getInstance().deserialize_nts5qn$(decoder);
  };
  function JsonPrimitiveSerializer$JsonPrimitiveDescriptor() {
    JsonPrimitiveSerializer$JsonPrimitiveDescriptor_instance = this;
    SerialClassDescImpl.call(this, 'JsonPrimitive');
    this.addElement_ivxn3r$('JsonPrimitive');
  }
  Object.defineProperty(JsonPrimitiveSerializer$JsonPrimitiveDescriptor.prototype, 'kind', {
    get: function () {
      return PrimitiveKind$STRING_getInstance();
    }
  });
  Object.defineProperty(JsonPrimitiveSerializer$JsonPrimitiveDescriptor.prototype, 'isNullable', {
    get: function () {
      return true;
    }
  });
  JsonPrimitiveSerializer$JsonPrimitiveDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonPrimitiveDescriptor',
    interfaces: [SerialClassDescImpl]
  };
  var JsonPrimitiveSerializer$JsonPrimitiveDescriptor_instance = null;
  function JsonPrimitiveSerializer$JsonPrimitiveDescriptor_getInstance() {
    if (JsonPrimitiveSerializer$JsonPrimitiveDescriptor_instance === null) {
      new JsonPrimitiveSerializer$JsonPrimitiveDescriptor();
    }
    return JsonPrimitiveSerializer$JsonPrimitiveDescriptor_instance;
  }
  JsonPrimitiveSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonPrimitiveSerializer',
    interfaces: [KSerializer]
  };
  var JsonPrimitiveSerializer_instance = null;
  function JsonPrimitiveSerializer_getInstance() {
    if (JsonPrimitiveSerializer_instance === null) {
      new JsonPrimitiveSerializer();
    }
    return JsonPrimitiveSerializer_instance;
  }
  function JsonNullSerializer() {
    JsonNullSerializer_instance = this;
    this.descriptor_222uqm$_0 = JsonNullSerializer$JsonNullDescriptor_getInstance();
  }
  Object.defineProperty(JsonNullSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_222uqm$_0;
    }
  });
  JsonNullSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    encoder.encodeNull();
  };
  JsonNullSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    decoder.decodeNull();
    return JsonNull_getInstance();
  };
  function JsonNullSerializer$JsonNullDescriptor() {
    JsonNullSerializer$JsonNullDescriptor_instance = this;
    SerialClassDescImpl.call(this, 'JsonNull');
    this.addElement_ivxn3r$('JsonNull');
  }
  Object.defineProperty(JsonNullSerializer$JsonNullDescriptor.prototype, 'kind', {
    get: function () {
      return UnionKind$OBJECT_getInstance();
    }
  });
  Object.defineProperty(JsonNullSerializer$JsonNullDescriptor.prototype, 'isNullable', {
    get: function () {
      return true;
    }
  });
  JsonNullSerializer$JsonNullDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonNullDescriptor',
    interfaces: [SerialClassDescImpl]
  };
  var JsonNullSerializer$JsonNullDescriptor_instance = null;
  function JsonNullSerializer$JsonNullDescriptor_getInstance() {
    if (JsonNullSerializer$JsonNullDescriptor_instance === null) {
      new JsonNullSerializer$JsonNullDescriptor();
    }
    return JsonNullSerializer$JsonNullDescriptor_instance;
  }
  JsonNullSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonNullSerializer',
    interfaces: [KSerializer]
  };
  var JsonNullSerializer_instance = null;
  function JsonNullSerializer_getInstance() {
    if (JsonNullSerializer_instance === null) {
      new JsonNullSerializer();
    }
    return JsonNullSerializer_instance;
  }
  function JsonLiteralSerializer() {
    JsonLiteralSerializer_instance = this;
    this.descriptor_ybii5y$_0 = JsonLiteralSerializer$JsonLiteralDescriptor_getInstance();
  }
  Object.defineProperty(JsonLiteralSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_ybii5y$_0;
    }
  });
  JsonLiteralSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    if (obj.isString) {
      return encoder.encodeString_61zpoe$(obj.content);
    }
    var integer = obj.intOrNull;
    if (integer != null) {
      return encoder.encodeInt_za3lpa$(integer);
    }
    var double = obj.doubleOrNull;
    if (double != null) {
      return encoder.encodeDouble_14dthe$(double);
    }
    var boolean = obj.booleanOrNull;
    if (boolean != null) {
      return encoder.encodeBoolean_6taknv$(boolean);
    }
    encoder.encodeString_61zpoe$(obj.content);
  };
  JsonLiteralSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return JsonLiteral_init_1(decoder.decodeString());
  };
  function JsonLiteralSerializer$JsonLiteralDescriptor() {
    JsonLiteralSerializer$JsonLiteralDescriptor_instance = this;
    SerialClassDescImpl.call(this, 'JsonLiteral');
    this.addElement_ivxn3r$('JsonLiteral');
  }
  Object.defineProperty(JsonLiteralSerializer$JsonLiteralDescriptor.prototype, 'kind', {
    get: function () {
      return PrimitiveKind$STRING_getInstance();
    }
  });
  JsonLiteralSerializer$JsonLiteralDescriptor.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonLiteralDescriptor',
    interfaces: [SerialClassDescImpl]
  };
  var JsonLiteralSerializer$JsonLiteralDescriptor_instance = null;
  function JsonLiteralSerializer$JsonLiteralDescriptor_getInstance() {
    if (JsonLiteralSerializer$JsonLiteralDescriptor_instance === null) {
      new JsonLiteralSerializer$JsonLiteralDescriptor();
    }
    return JsonLiteralSerializer$JsonLiteralDescriptor_instance;
  }
  JsonLiteralSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonLiteralSerializer',
    interfaces: [KSerializer]
  };
  var JsonLiteralSerializer_instance = null;
  function JsonLiteralSerializer_getInstance() {
    if (JsonLiteralSerializer_instance === null) {
      new JsonLiteralSerializer();
    }
    return JsonLiteralSerializer_instance;
  }
  function JsonObjectSerializer() {
    JsonObjectSerializer_instance = this;
    this.descriptor_b1ko4q$_0 = new NamedMapClassDescriptor('JsonObject', StringSerializer_getInstance().descriptor, JsonElementSerializer_getInstance().descriptor);
  }
  Object.defineProperty(JsonObjectSerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_b1ko4q$_0;
    }
  });
  JsonObjectSerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    (new LinkedHashMapSerializer(StringSerializer_getInstance(), JsonElementSerializer_getInstance())).serialize_awe97i$(encoder, obj.content);
  };
  JsonObjectSerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return new JsonObject((new LinkedHashMapSerializer(StringSerializer_getInstance(), JsonElementSerializer_getInstance())).deserialize_nts5qn$(decoder));
  };
  JsonObjectSerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonObjectSerializer',
    interfaces: [KSerializer]
  };
  var JsonObjectSerializer_instance = null;
  function JsonObjectSerializer_getInstance() {
    if (JsonObjectSerializer_instance === null) {
      new JsonObjectSerializer();
    }
    return JsonObjectSerializer_instance;
  }
  function JsonArraySerializer() {
    JsonArraySerializer_instance = this;
    this.descriptor_5cia8w$_0 = new NamedListClassDescriptor('JsonArray', JsonElementSerializer_getInstance().descriptor);
  }
  Object.defineProperty(JsonArraySerializer.prototype, 'descriptor', {
    get: function () {
      return this.descriptor_5cia8w$_0;
    }
  });
  JsonArraySerializer.prototype.serialize_awe97i$ = function (encoder, obj) {
    (new ArrayListSerializer(JsonElementSerializer_getInstance())).serialize_awe97i$(encoder, obj);
  };
  JsonArraySerializer.prototype.deserialize_nts5qn$ = function (decoder) {
    return new JsonArray((new ArrayListSerializer(JsonElementSerializer_getInstance())).deserialize_nts5qn$(decoder));
  };
  JsonArraySerializer.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'JsonArraySerializer',
    interfaces: [KSerializer]
  };
  var JsonArraySerializer_instance = null;
  function JsonArraySerializer_getInstance() {
    if (JsonArraySerializer_instance === null) {
      new JsonArraySerializer();
    }
    return JsonArraySerializer_instance;
  }
  function JsonParser(reader) {
    this.reader_0 = reader;
  }
  JsonParser.prototype.readObject_0 = function () {
    var $this = this.reader_0;
    if ($this.tokenClass !== TC_BEGIN_OBJ) {
      throw new JsonParsingException($this.tokenPosition_0, 'Expected start of object');
    }
    this.reader_0.nextToken();
    var result = LinkedHashMap_init();
    while (true) {
      if (this.reader_0.tokenClass === TC_COMMA)
        this.reader_0.nextToken();
      if (!this.reader_0.canBeginValue)
        break;
      var key = this.reader_0.takeString();
      var $this_0 = this.reader_0;
      if ($this_0.tokenClass !== TC_COLON) {
        throw new JsonParsingException($this_0.tokenPosition_0, "Expected ':'");
      }
      this.reader_0.nextToken();
      var elem = this.read();
      result.put_xwzc9p$(key, elem);
    }
    var $this_1 = this.reader_0;
    if ($this_1.tokenClass !== TC_END_OBJ) {
      throw new JsonParsingException($this_1.tokenPosition_0, 'Expected end of object');
    }
    this.reader_0.nextToken();
    return new JsonObject(result);
  };
  JsonParser.prototype.readValue_0 = function (isString) {
    var str = this.reader_0.takeString();
    return new JsonLiteral(str, isString);
  };
  JsonParser.prototype.readArray_0 = function () {
    var $this = this.reader_0;
    if ($this.tokenClass !== TC_BEGIN_LIST) {
      throw new JsonParsingException($this.tokenPosition_0, 'Expected start of array');
    }
    this.reader_0.nextToken();
    var result = ArrayList_init_0();
    while (true) {
      if (this.reader_0.tokenClass === TC_COMMA)
        this.reader_0.nextToken();
      if (!this.reader_0.canBeginValue)
        break;
      var elem = this.read();
      result.add_11rb$(elem);
    }
    var $this_0 = this.reader_0;
    if ($this_0.tokenClass !== TC_END_LIST) {
      throw new JsonParsingException($this_0.tokenPosition_0, 'Expected end of array');
    }
    this.reader_0.nextToken();
    return new JsonArray(result);
  };
  JsonParser.prototype.read = function () {
    var tmp$;
    if (!this.reader_0.canBeginValue) {
      throw new JsonParsingException(this.reader_0.currentPosition, "Can't begin reading value from here");
    }
    var tc = this.reader_0.tokenClass;
    switch (tc) {
      case 10:
        var $receiver = JsonNull_getInstance();
        this.reader_0.nextToken();
        tmp$ = $receiver;
        break;
      case 1:
        tmp$ = this.readValue_0(true);
        break;
      case 0:
        tmp$ = this.readValue_0(false);
        break;
      case 6:
        tmp$ = this.readObject_0();
        break;
      case 8:
        tmp$ = this.readArray_0();
        break;
      default:throw new JsonParsingException(this.reader_0.currentPosition, "Can't begin reading element");
    }
    return tmp$;
  };
  JsonParser.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonParser',
    interfaces: []
  };
  var NULL;
  var COMMA;
  var COLON;
  var BEGIN_OBJ;
  var END_OBJ;
  var BEGIN_LIST;
  var END_LIST;
  var STRING;
  var STRING_ESC;
  var INVALID;
  var UNICODE_ESC;
  var TC_OTHER;
  var TC_STRING;
  var TC_STRING_ESC;
  var TC_WS;
  var TC_COMMA;
  var TC_COLON;
  var TC_BEGIN_OBJ;
  var TC_END_OBJ;
  var TC_BEGIN_LIST;
  var TC_END_LIST;
  var TC_NULL;
  var TC_INVALID;
  var TC_EOF;
  var CTC_MAX;
  var ESC2C_MAX;
  var C2TC;
  function EscapeCharMappings() {
    EscapeCharMappings_instance = this;
    this.ESCAPE_2_CHAR = Kotlin.charArray(117);
    for (var i = 0; i <= 31; i++) {
      this.initC2ESC_0(i, UNICODE_ESC);
    }
    this.initC2ESC_0(8, 98);
    this.initC2ESC_0(9, 116);
    this.initC2ESC_0(10, 110);
    this.initC2ESC_0(12, 102);
    this.initC2ESC_0(13, 114);
    this.initC2ESC_1(47, 47);
    this.initC2ESC_1(STRING, STRING);
    this.initC2ESC_1(STRING_ESC, STRING_ESC);
  }
  EscapeCharMappings.prototype.initC2ESC_0 = function (c, esc) {
    if (esc !== UNICODE_ESC)
      this.ESCAPE_2_CHAR[esc | 0] = toChar(c);
  };
  EscapeCharMappings.prototype.initC2ESC_1 = function (c, esc) {
    this.initC2ESC_0(c | 0, esc);
  };
  EscapeCharMappings.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'EscapeCharMappings',
    interfaces: []
  };
  var EscapeCharMappings_instance = null;
  function EscapeCharMappings_getInstance() {
    if (EscapeCharMappings_instance === null) {
      new EscapeCharMappings();
    }
    return EscapeCharMappings_instance;
  }
  function initC2TC($receiver, c, cl) {
    $receiver[c] = cl;
  }
  function initC2TC_0($receiver, c, cl) {
    initC2TC($receiver, c | 0, cl);
  }
  function charToTokenClass(c) {
    return (c | 0) < 126 ? C2TC[c | 0] : TC_OTHER;
  }
  function escapeToChar(c) {
    return unboxChar(c < 117 ? EscapeCharMappings_getInstance().ESCAPE_2_CHAR[c] : INVALID);
  }
  function JsonReader(source) {
    this.source_0 = source;
    this.currentPosition = 0;
    this.tokenClass = TC_EOF;
    this.tokenPosition_0 = 0;
    this.offset_0 = -1;
    this.length_0 = 0;
    this.buf_0 = Kotlin.charArray(16);
    this.nextToken();
  }
  Object.defineProperty(JsonReader.prototype, 'isDone', {
    get: function () {
      return this.tokenClass === TC_EOF;
    }
  });
  Object.defineProperty(JsonReader.prototype, 'canBeginValue', {
    get: function () {
      switch (this.tokenClass) {
        case 8:
        case 6:
        case 0:
        case 1:
        case 10:
          return true;
        default:return false;
      }
    }
  });
  JsonReader.prototype.requireTokenClass_hrh3e6$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.internal.JsonReader.requireTokenClass_hrh3e6$', wrapFunction(function () {
    var JsonParsingException_init = _.kotlinx.serialization.json.JsonParsingException;
    return function (expected, lazyErrorMsg) {
      if (this.tokenClass !== expected) {
        throw new JsonParsingException_init(this.tokenPosition_0, lazyErrorMsg());
      }
    };
  }));
  JsonReader.prototype.takeString = function () {
    if (this.tokenClass !== TC_OTHER && this.tokenClass !== TC_STRING) {
      throw new JsonParsingException(this.tokenPosition_0, 'Expected string or non-null literal');
    }
    var tmp$;
    if (this.offset_0 < 0)
      tmp$ = String_0(this.buf_0, 0, this.length_0);
    else {
      var $receiver = this.source_0;
      var startIndex = this.offset_0;
      var endIndex = this.offset_0 + this.length_0 | 0;
      tmp$ = $receiver.substring(startIndex, endIndex);
    }
    var prevStr = tmp$;
    this.nextToken();
    return prevStr;
  };
  JsonReader.prototype.append_0 = function (ch) {
    var tmp$;
    if (this.length_0 >= this.buf_0.length)
      this.buf_0 = copyOf_0(this.buf_0, 2 * this.buf_0.length | 0);
    this.buf_0[tmp$ = this.length_0, this.length_0 = tmp$ + 1 | 0, tmp$] = ch;
  };
  JsonReader.prototype.appendRange_0 = function (source, fromIndex, toIndex) {
    var addLen = toIndex - fromIndex | 0;
    var oldLen = this.length_0;
    var newLen = oldLen + addLen | 0;
    if (newLen > this.buf_0.length)
      this.buf_0 = copyOf_0(this.buf_0, coerceAtLeast(newLen, 2 * this.buf_0.length | 0));
    for (var i = 0; i < addLen; i++)
      this.buf_0[oldLen + i | 0] = source.charCodeAt(fromIndex + i | 0);
    this.length_0 = this.length_0 + addLen | 0;
  };
  JsonReader.prototype.nextToken = function () {
    var source = this.source_0;
    var curPos = this.currentPosition;
    var maxLen = source.length;
    while (true) {
      if (curPos >= maxLen) {
        this.tokenPosition_0 = curPos;
        this.tokenClass = TC_EOF;
        return;
      }
      var ch = source.charCodeAt(curPos);
      var tc = charToTokenClass(ch);
      switch (tc) {
        case 3:
          curPos = curPos + 1 | 0;
          break;
        case 0:
          this.nextLiteral_0(source, curPos);
          return;
        case 1:
          this.nextString_0(source, curPos);
          return;
        default:this.tokenPosition_0 = curPos;
          this.tokenClass = tc;
          this.currentPosition = curPos + 1 | 0;
          return;
      }
    }
  };
  JsonReader.prototype.nextLiteral_0 = function (source, startPos) {
    this.tokenPosition_0 = startPos;
    this.offset_0 = startPos;
    var curPos = startPos;
    var maxLen = source.length;
    while (true) {
      curPos = curPos + 1 | 0;
      if (curPos >= maxLen || charToTokenClass(source.charCodeAt(curPos)) !== TC_OTHER)
        break;
    }
    this.currentPosition = curPos;
    this.length_0 = curPos - this.offset_0 | 0;
    this.tokenClass = rangeEquals(source, this.offset_0, this.length_0, NULL) ? TC_NULL : TC_OTHER;
  };
  JsonReader.prototype.nextString_0 = function (source, startPos) {
    this.tokenPosition_0 = startPos;
    this.length_0 = 0;
    var curPos = startPos + 1 | 0;
    var lastPos = curPos;
    var maxLen = source.length;
    parse: while (true) {
      if (curPos >= maxLen) {
        throw new JsonParsingException(curPos, 'Unexpected end in string');
      }
      if (source.charCodeAt(curPos) === STRING) {
        break parse;
      }
       else if (source.charCodeAt(curPos) === STRING_ESC) {
        this.appendRange_0(source, lastPos, curPos);
        var newPos = this.appendEsc_0(source, curPos + 1 | 0);
        curPos = newPos;
        lastPos = newPos;
      }
       else {
        curPos = curPos + 1 | 0;
      }
    }
    if (lastPos === (startPos + 1 | 0)) {
      this.offset_0 = lastPos;
      this.length_0 = curPos - lastPos | 0;
    }
     else {
      this.appendRange_0(source, lastPos, curPos);
      this.offset_0 = -1;
    }
    this.currentPosition = curPos + 1 | 0;
    this.tokenClass = TC_STRING;
  };
  JsonReader.prototype.appendEsc_0 = function (source, startPos) {
    var tmp$;
    var curPos = startPos;
    var condition = curPos < source.length;
    var pos = curPos;
    if (!condition) {
      throw new JsonParsingException(pos, 'Unexpected end after escape char');
    }
    var curChar = source.charCodeAt((tmp$ = curPos, curPos = tmp$ + 1 | 0, tmp$));
    if (curChar === UNICODE_ESC) {
      curPos = this.appendHex_0(source, curPos);
    }
     else {
      var c = escapeToChar(curChar | 0);
      var condition_0 = c !== INVALID;
      var pos_0 = curPos;
      if (!condition_0) {
        throw new JsonParsingException(pos_0, "Invalid escaped char '" + String.fromCharCode(curChar) + "'");
      }
      this.append_0(c);
    }
    return curPos;
  };
  JsonReader.prototype.appendHex_0 = function (source, startPos) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2;
    var curPos = startPos;
    this.append_0(toChar((fromHexChar(source, (tmp$ = curPos, curPos = tmp$ + 1 | 0, tmp$)) << 12) + (fromHexChar(source, (tmp$_0 = curPos, curPos = tmp$_0 + 1 | 0, tmp$_0)) << 8) + (fromHexChar(source, (tmp$_1 = curPos, curPos = tmp$_1 + 1 | 0, tmp$_1)) << 4) + fromHexChar(source, (tmp$_2 = curPos, curPos = tmp$_2 + 1 | 0, tmp$_2)) | 0));
    return curPos;
  };
  JsonReader.prototype.skipElement = function () {
    if (this.tokenClass !== TC_BEGIN_OBJ && this.tokenClass !== TC_BEGIN_LIST) {
      this.nextToken();
      return;
    }
    var tokenStack = ArrayList_init_0();
    do {
      switch (this.tokenClass) {
        case 8:
        case 6:
          tokenStack.add_11rb$(this.tokenClass);
          break;
        case 9:
          if (last(tokenStack) !== TC_BEGIN_LIST)
            throw new JsonParsingException(this.currentPosition, 'found ] instead of }');
          tokenStack.removeAt_za3lpa$(tokenStack.size - 1 | 0);
          break;
        case 7:
          if (last(tokenStack) !== TC_BEGIN_OBJ)
            throw new JsonParsingException(this.currentPosition, 'found } instead of ]');
          tokenStack.removeAt_za3lpa$(tokenStack.size - 1 | 0);
          break;
      }
      this.nextToken();
      var isNotEmpty$result;
      isNotEmpty$result = !tokenStack.isEmpty();
    }
     while (isNotEmpty$result);
  };
  JsonReader.prototype.toString = function () {
    return "JsonReader(source='" + this.source_0 + "', currentPosition=" + this.currentPosition + ', tokenClass=' + this.tokenClass + ', tokenPosition=' + this.tokenPosition_0 + ', offset=' + this.offset_0 + ')';
  };
  JsonReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonReader',
    interfaces: []
  };
  function fromHexChar(source, curPos) {
    var tmp$;
    if (!(curPos < source.length)) {
      throw new JsonParsingException(curPos, 'Unexpected end in unicode escape');
    }
    var curChar = source.charCodeAt(curPos);
    if ((new CharRange(48, 57)).contains_mef7kx$(curChar))
      tmp$ = (curChar | 0) - 48 | 0;
    else if ((new CharRange(97, 102)).contains_mef7kx$(curChar))
      tmp$ = (curChar | 0) - 97 + 10 | 0;
    else if ((new CharRange(65, 70)).contains_mef7kx$(curChar))
      tmp$ = (curChar | 0) - 65 + 10 | 0;
    else {
      throw new JsonParsingException(curPos, "Invalid toHexChar char '" + String.fromCharCode(curChar) + "' in unicode escape");
    }
    return tmp$;
  }
  function rangeEquals(source, start, length, str) {
    var n = str.length;
    if (length !== n)
      return false;
    for (var i = 0; i < n; i++)
      if (source.charCodeAt(start + i | 0) !== str.charCodeAt(i))
        return false;
    return true;
  }
  var require_0 = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.internal.require_wqn2ds$', wrapFunction(function () {
    var JsonParsingException_init = _.kotlinx.serialization.json.JsonParsingException;
    return function (condition, pos, msg) {
      if (!condition) {
        throw new JsonParsingException_init(pos, msg());
      }
    };
  }));
  var fail = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.internal.fail_f0n09d$', wrapFunction(function () {
    var JsonParsingException_init = _.kotlinx.serialization.json.JsonParsingException;
    return function (pos, msg) {
      throw new JsonParsingException_init(pos, msg);
    };
  }));
  function StreamingJsonInput(json, mode, reader) {
    ElementValueDecoder.call(this);
    this.json_2ev5c4$_0 = json;
    this.mode_0 = mode;
    this.reader_0 = reader;
    this.currentIndex_0 = -1;
    this.entryIndex_0 = 0;
    this.context = this.json.context;
  }
  Object.defineProperty(StreamingJsonInput.prototype, 'json', {
    get: function () {
      return this.json_2ev5c4$_0;
    }
  });
  StreamingJsonInput.prototype.decodeJson = function () {
    return (new JsonParser(this.reader_0)).read();
  };
  Object.defineProperty(StreamingJsonInput.prototype, 'updateMode', {
    get: function () {
      return this.json.updateMode;
    }
  });
  StreamingJsonInput.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$;
    var newMode = switchMode(desc, typeParams);
    if (unboxChar(newMode.begin) !== INVALID) {
      var $this = this.reader_0;
      if ($this.tokenClass !== newMode.beginTc) {
        throw new JsonParsingException($this.tokenPosition_0, "Expected '" + String.fromCharCode(unboxChar(newMode.begin)) + ', kind: ' + desc.kind + "'");
      }
      this.reader_0.nextToken();
    }
    switch (newMode.name) {
      case 'LIST':
      case 'MAP':
      case 'POLY_OBJ':
        tmp$ = new StreamingJsonInput(this.json, newMode, this.reader_0);
        break;
      default:tmp$ = this.mode_0 === newMode ? this : new StreamingJsonInput(this.json, newMode, this.reader_0);
        break;
    }
    return tmp$;
  };
  StreamingJsonInput.prototype.endStructure_qatsm0$ = function (desc) {
    if (unboxChar(this.mode_0.end) !== INVALID) {
      var $this = this.reader_0;
      if ($this.tokenClass !== this.mode_0.endTc) {
        throw new JsonParsingException($this.tokenPosition_0, "Expected '" + String.fromCharCode(unboxChar(this.mode_0.end)) + "'");
      }
      this.reader_0.nextToken();
    }
  };
  StreamingJsonInput.prototype.decodeNotNullMark = function () {
    return this.reader_0.tokenClass !== TC_NULL;
  };
  StreamingJsonInput.prototype.decodeNull = function () {
    var $this = this.reader_0;
    if ($this.tokenClass !== TC_NULL) {
      throw new JsonParsingException($this.tokenPosition_0, "Expected 'null' literal");
    }
    this.reader_0.nextToken();
    return null;
  };
  StreamingJsonInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    var tmp$, tmp$_0;
    while (true) {
      if (this.reader_0.tokenClass === TC_COMMA)
        this.reader_0.nextToken();
      switch (this.mode_0.name) {
        case 'LIST':
          return !this.reader_0.canBeginValue ? -1 : (this.currentIndex_0 = this.currentIndex_0 + 1 | 0, this.currentIndex_0);
        case 'MAP':
          if (this.currentIndex_0 % 2 === 0 && this.reader_0.tokenClass === TC_COLON)
            this.reader_0.nextToken();
          return !this.reader_0.canBeginValue ? -1 : (this.currentIndex_0 = this.currentIndex_0 + 1 | 0, this.currentIndex_0);
        case 'POLY_OBJ':
          switch (tmp$ = this.entryIndex_0, this.entryIndex_0 = tmp$ + 1 | 0, tmp$) {
            case 0:
              tmp$_0 = 0;
              break;
            case 1:
              tmp$_0 = 1;
              break;
            default:this.entryIndex_0 = 0;
              tmp$_0 = -1;
              break;
          }

          return tmp$_0;
        default:if (!this.reader_0.canBeginValue)
            return -1;
          var key = this.reader_0.takeString();
          var $this = this.reader_0;
          if ($this.tokenClass !== TC_COLON) {
            throw new JsonParsingException($this.tokenPosition_0, "Expected ':'");
          }

          this.reader_0.nextToken();
          var index = desc.getElementIndex_61zpoe$(key);
          if (index !== -3) {
            return index;
          }

          if (this.json.strictMode_8be2vx$)
            throw new JsonUnknownKeyException(key);
          else
            this.reader_0.skipElement();
          break;
      }
    }
  };
  StreamingJsonInput.prototype.decodeBoolean = function () {
    var $receiver = this.reader_0.takeString();
    return this.json.strictMode_8be2vx$ ? toBooleanStrict($receiver) : toBoolean($receiver);
  };
  StreamingJsonInput.prototype.decodeByte = function () {
    return toByte_0(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeShort = function () {
    return toShort_0(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeInt = function () {
    return toInt(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeLong = function () {
    return toLong(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeFloat = function () {
    return toDouble(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeDouble = function () {
    return toDouble(this.reader_0.takeString());
  };
  StreamingJsonInput.prototype.decodeChar = function () {
    return toBoxedChar(single(this.reader_0.takeString()));
  };
  StreamingJsonInput.prototype.decodeString = function () {
    return this.reader_0.takeString();
  };
  StreamingJsonInput.prototype.decodeEnum_w849qs$ = function (enumDescription) {
    return enumDescription.getElementIndex_61zpoe$(this.reader_0.takeString());
  };
  StreamingJsonInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StreamingJsonInput',
    interfaces: [ElementValueDecoder, JsonInput]
  };
  function StreamingJsonOutput(composer, json, mode, modeReuseCache) {
    ElementValueEncoder.call(this);
    this.composer_0 = composer;
    this.json_lpdodt$_0 = json;
    this.mode_0 = mode;
    this.modeReuseCache_0 = modeReuseCache;
    this.forceQuoting_0 = false;
    this.context = this.json.context;
    var i = this.mode_0.ordinal;
    if (this.modeReuseCache_0[i] !== null || this.modeReuseCache_0[i] !== this)
      this.modeReuseCache_0[i] = this;
  }
  Object.defineProperty(StreamingJsonOutput.prototype, 'json', {
    get: function () {
      return this.json_lpdodt$_0;
    }
  });
  StreamingJsonOutput.prototype.encodeJson_qiw0cd$ = function (element) {
    this.encodeSerializableValue_tf03ej$(JsonElementSerializer_getInstance(), element);
  };
  StreamingJsonOutput.prototype.shouldEncodeElementDefault_3zr2iy$ = function (desc, index) {
    return this.json.encodeDefaults;
  };
  StreamingJsonOutput.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$;
    var newMode = switchMode(desc, typeParams);
    if (unboxChar(newMode.begin) !== INVALID) {
      this.composer_0.print_s8itvh$(unboxChar(newMode.begin));
      this.composer_0.indent();
    }
    if (this.mode_0 === newMode) {
      return this;
    }
    return (tmp$ = this.modeReuseCache_0[newMode.ordinal]) != null ? tmp$ : new StreamingJsonOutput(this.composer_0, this.json, newMode, this.modeReuseCache_0);
  };
  StreamingJsonOutput.prototype.endStructure_qatsm0$ = function (desc) {
    if (unboxChar(this.mode_0.end) !== INVALID) {
      this.composer_0.unIndent();
      this.composer_0.nextItem();
      this.composer_0.print_s8itvh$(unboxChar(this.mode_0.end));
    }
  };
  StreamingJsonOutput.prototype.encodeElement_3zr2iy$ = function (desc, index) {
    switch (this.mode_0.name) {
      case 'LIST':
        if (!this.composer_0.writingFirst)
          this.composer_0.print_s8itvh$(COMMA);
        this.composer_0.nextItem();
        break;
      case 'MAP':
        if (!this.composer_0.writingFirst) {
          if (index % 2 === 0) {
            this.composer_0.print_s8itvh$(COMMA);
            this.composer_0.nextItem();
          }
           else {
            this.composer_0.print_s8itvh$(COLON);
            this.composer_0.space();
          }
        }
         else {
          this.composer_0.nextItem();
        }

        break;
      case 'POLY_OBJ':
        if (index === 0)
          this.forceQuoting_0 = true;
        if (index === 1) {
          this.composer_0.print_s8itvh$(COMMA);
          this.composer_0.space();
          this.forceQuoting_0 = false;
        }

        break;
      default:if (!this.composer_0.writingFirst)
          this.composer_0.print_s8itvh$(COMMA);
        this.composer_0.nextItem();
        this.encodeString_61zpoe$(desc.getElementName_za3lpa$(index));
        this.composer_0.print_s8itvh$(COLON);
        this.composer_0.space();
        break;
    }
    return true;
  };
  StreamingJsonOutput.prototype.encodeNull = function () {
    this.composer_0.print_61zpoe$(NULL);
  };
  StreamingJsonOutput.prototype.encodeBoolean_6taknv$ = function (value) {
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_6taknv$(value);
  };
  StreamingJsonOutput.prototype.encodeByte_s8j3t7$ = function (value) {
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_s8j3t7$(value);
  };
  StreamingJsonOutput.prototype.encodeShort_mq22fl$ = function (value) {
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_mq22fl$(value);
  };
  StreamingJsonOutput.prototype.encodeInt_za3lpa$ = function (value) {
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_za3lpa$(value);
  };
  StreamingJsonOutput.prototype.encodeLong_s8cxhz$ = function (value) {
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_s8cxhz$(value);
  };
  StreamingJsonOutput.prototype.encodeFloat_mx4ult$ = function (value) {
    if (this.json.strictMode_8be2vx$ && !isFinite(value)) {
      throw JsonInvalidValueInStrictModeException_init(value);
    }
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_mx4ult$(value);
  };
  StreamingJsonOutput.prototype.encodeDouble_14dthe$ = function (value) {
    if (this.json.strictMode_8be2vx$ && !isFinite_0(value)) {
      throw JsonInvalidValueInStrictModeException_init_0(value);
    }
    if (this.forceQuoting_0)
      this.encodeString_61zpoe$(value.toString());
    else
      this.composer_0.print_14dthe$(value);
  };
  StreamingJsonOutput.prototype.encodeChar_s8itvh$ = function (value) {
    this.encodeString_61zpoe$(String.fromCharCode(value));
  };
  StreamingJsonOutput.prototype.encodeString_61zpoe$ = function (value) {
    if (this.json.unquoted_8be2vx$ && !shouldBeQuoted(value)) {
      this.composer_0.print_61zpoe$(value);
    }
     else {
      this.composer_0.printQuoted_61zpoe$(value);
    }
  };
  StreamingJsonOutput.prototype.encodeEnum_39yahq$ = function (enumDescription, ordinal) {
    this.encodeString_61zpoe$(enumDescription.getElementName_za3lpa$(ordinal));
  };
  StreamingJsonOutput.prototype.encodeValue_za3rmp$ = function (value) {
    if (this.json.strictMode_8be2vx$)
      ElementValueEncoder.prototype.encodeValue_za3rmp$.call(this, value);
    else
      this.encodeString_61zpoe$(value.toString());
  };
  function StreamingJsonOutput$Composer(sb, json) {
    this.sb_8be2vx$ = sb;
    this.json_0 = json;
    this.level_0 = 0;
    this.writingFirst_uw5fqz$_0 = true;
  }
  Object.defineProperty(StreamingJsonOutput$Composer.prototype, 'writingFirst', {
    get: function () {
      return this.writingFirst_uw5fqz$_0;
    },
    set: function (writingFirst) {
      this.writingFirst_uw5fqz$_0 = writingFirst;
    }
  });
  StreamingJsonOutput$Composer.prototype.indent = function () {
    this.writingFirst = true;
    this.level_0 = this.level_0 + 1 | 0;
  };
  StreamingJsonOutput$Composer.prototype.unIndent = function () {
    this.level_0 = this.level_0 - 1 | 0;
  };
  StreamingJsonOutput$Composer.prototype.nextItem = function () {
    this.writingFirst = false;
    if (this.json_0.indented_8be2vx$) {
      this.print_61zpoe$('\n');
      var times = this.level_0;
      for (var index = 0; index < times; index++) {
        this.print_61zpoe$(this.json_0.indent_8be2vx$);
      }
    }
  };
  StreamingJsonOutput$Composer.prototype.space = function () {
    if (this.json_0.indented_8be2vx$)
      this.print_s8itvh$(32);
  };
  StreamingJsonOutput$Composer.prototype.print_s8itvh$ = function (v) {
    return this.sb_8be2vx$.append_s8itvh$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_61zpoe$ = function (v) {
    return this.sb_8be2vx$.append_gw00v9$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_mx4ult$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_14dthe$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_s8j3t7$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_mq22fl$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_za3lpa$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_s8cxhz$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.print_6taknv$ = function (v) {
    return this.sb_8be2vx$.append_s8jyv4$(v);
  };
  StreamingJsonOutput$Composer.prototype.printQuoted_61zpoe$ = function (value) {
    printQuoted(this.sb_8be2vx$, value);
  };
  StreamingJsonOutput$Composer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Composer',
    interfaces: []
  };
  StreamingJsonOutput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StreamingJsonOutput',
    interfaces: [ElementValueEncoder, JsonOutput]
  };
  function StreamingJsonOutput_init(output, json, mode, modeReuseCache, $this) {
    $this = $this || Object.create(StreamingJsonOutput.prototype);
    StreamingJsonOutput.call($this, new StreamingJsonOutput$Composer(output, json), json, mode, modeReuseCache);
    return $this;
  }
  function toHexChar(i) {
    var d = i & 15;
    return d < 10 ? toChar(d + 48 | 0) : toChar(d - 10 + 97 | 0);
  }
  var ESCAPE_CHARS;
  function printQuoted($receiver, value) {
    var tmp$;
    $receiver.append_s8itvh$(STRING);
    var lastPos = 0;
    var length = value.length;
    for (var i = 0; i < length; i++) {
      var c = value.charCodeAt(i) | 0;
      if (c >= ESCAPE_CHARS.length)
        continue;
      tmp$ = ESCAPE_CHARS[c];
      if (tmp$ == null) {
        continue;
      }
      var esc = tmp$;
      $receiver.append_ezbsdh$(value, lastPos, i);
      $receiver.append_gw00v9$(esc);
      lastPos = i + 1 | 0;
    }
    $receiver.append_ezbsdh$(value, lastPos, length);
    $receiver.append_s8itvh$(STRING);
  }
  function toBooleanStrict($receiver) {
    var tmp$;
    tmp$ = toBooleanStrictOrNull($receiver);
    if (tmp$ == null) {
      throw IllegalStateException_init($receiver + ' does not represent a Boolean');
    }
    return tmp$;
  }
  function toBooleanStrictOrNull($receiver) {
    if (equals_0($receiver, 'true', true))
      return true;
    else if (equals_0($receiver, 'false', true))
      return false;
    else
      return null;
  }
  function shouldBeQuoted(str) {
    var tmp$;
    if (equals(str, NULL))
      return true;
    tmp$ = iterator(str);
    while (tmp$.hasNext()) {
      var ch = unboxChar(tmp$.next());
      if (charToTokenClass(ch) !== TC_OTHER)
        return true;
    }
    return false;
  }
  function readJson($receiver, element, deserializer) {
    var tmp$, tmp$_0;
    var descriptor = deserializer.descriptor;
    if (Kotlin.isType(element, JsonNull)) {
      if (!descriptor.isNullable) {
        var message = 'Read JsonNull and expected nullable descriptor, but has ' + descriptor;
        throw IllegalArgumentException_init(message.toString());
      }
      return null;
    }
    tmp$ = descriptor.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance())) {
      var tmp$_1;
      if (!Kotlin.isType(element, JsonArray)) {
        var message_0 = 'Expected ' + getKClass(JsonArray) + ' but found ' + Kotlin.getKClassFromExpression(element);
        throw IllegalStateException_init(message_0.toString());
      }
      tmp$_0 = new JsonTreeListInput($receiver, Kotlin.isType(tmp$_1 = element, JsonArray) ? tmp$_1 : throwCCE());
    }
     else if (equals(tmp$, StructureKind$MAP_getInstance())) {
      var tmp$_2;
      if (!Kotlin.isType(element, JsonObject)) {
        var message_1 = 'Expected ' + getKClass(JsonObject) + ' but found ' + Kotlin.getKClassFromExpression(element);
        throw IllegalStateException_init(message_1.toString());
      }
      tmp$_0 = new JsonTreeMapInput($receiver, Kotlin.isType(tmp$_2 = element, JsonObject) ? tmp$_2 : throwCCE());
    }
     else if (Kotlin.isType(tmp$, PrimitiveKind)) {
      var tmp$_3;
      if (!Kotlin.isType(element, JsonPrimitive)) {
        var message_2 = 'Expected ' + getKClass(JsonPrimitive) + ' but found ' + Kotlin.getKClassFromExpression(element);
        throw IllegalStateException_init(message_2.toString());
      }
      tmp$_0 = new JsonPrimitiveInput($receiver, Kotlin.isType(tmp$_3 = element, JsonPrimitive) ? tmp$_3 : throwCCE());
    }
     else {
      var tmp$_4;
      if (!Kotlin.isType(element, JsonObject)) {
        var message_3 = 'Expected ' + getKClass(JsonObject) + ' but found ' + Kotlin.getKClassFromExpression(element);
        throw IllegalStateException_init(message_3.toString());
      }
      tmp$_0 = new JsonTreeInput($receiver, Kotlin.isType(tmp$_4 = element, JsonObject) ? tmp$_4 : throwCCE());
    }
    var input = tmp$_0;
    return decode_0(input, deserializer);
  }
  function AbstractJsonTreeInput(json, obj) {
    NamedValueDecoder.call(this);
    this.json_sa61ty$_0 = json;
    this.obj_gyc2sv$_0 = obj;
    this.context = this.json.context;
  }
  Object.defineProperty(AbstractJsonTreeInput.prototype, 'json', {
    get: function () {
      return this.json_sa61ty$_0;
    }
  });
  Object.defineProperty(AbstractJsonTreeInput.prototype, 'obj', {
    get: function () {
      return this.obj_gyc2sv$_0;
    }
  });
  AbstractJsonTreeInput.prototype.currentObject_0 = function () {
    var tmp$, tmp$_0;
    return (tmp$_0 = (tmp$ = this.currentTagOrNull) != null ? this.currentElement_61zpoe$(tmp$) : null) != null ? tmp$_0 : this.obj;
  };
  AbstractJsonTreeInput.prototype.decodeJson = function () {
    return this.currentObject_0();
  };
  Object.defineProperty(AbstractJsonTreeInput.prototype, 'updateMode', {
    get: function () {
      return this.json.updateMode;
    }
  });
  AbstractJsonTreeInput.prototype.composeName_puj7f4$ = function (parentName, childName) {
    return childName;
  };
  AbstractJsonTreeInput.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$, tmp$_0;
    var currentObject = this.currentObject_0();
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance())) {
      var tmp$_1 = this.json;
      var tmp$_2;
      if (!Kotlin.isType(currentObject, JsonArray)) {
        var message = 'Expected ' + getKClass(JsonArray) + ' but found ' + Kotlin.getKClassFromExpression(currentObject);
        throw IllegalStateException_init(message.toString());
      }
      tmp$_0 = new JsonTreeListInput(tmp$_1, Kotlin.isType(tmp$_2 = currentObject, JsonArray) ? tmp$_2 : throwCCE());
    }
     else if (equals(tmp$, StructureKind$MAP_getInstance())) {
      var tmp$_3 = this.json;
      var tmp$_4;
      if (!Kotlin.isType(currentObject, JsonObject)) {
        var message_0 = 'Expected ' + getKClass(JsonObject) + ' but found ' + Kotlin.getKClassFromExpression(currentObject);
        throw IllegalStateException_init(message_0.toString());
      }
      tmp$_0 = new JsonTreeMapInput(tmp$_3, Kotlin.isType(tmp$_4 = currentObject, JsonObject) ? tmp$_4 : throwCCE());
    }
     else {
      var tmp$_5 = this.json;
      var tmp$_6;
      if (!Kotlin.isType(currentObject, JsonObject)) {
        var message_1 = 'Expected ' + getKClass(JsonObject) + ' but found ' + Kotlin.getKClassFromExpression(currentObject);
        throw IllegalStateException_init(message_1.toString());
      }
      tmp$_0 = new JsonTreeInput(tmp$_5, Kotlin.isType(tmp$_6 = currentObject, JsonObject) ? tmp$_6 : throwCCE());
    }
    return tmp$_0;
  };
  AbstractJsonTreeInput.prototype.getValue_61zpoe$ = function (tag) {
    var tmp$, tmp$_0;
    var currentElement = this.currentElement_61zpoe$(tag);
    tmp$_0 = Kotlin.isType(tmp$ = currentElement, JsonPrimitive) ? tmp$ : null;
    if (tmp$_0 == null) {
      throw new JsonElementTypeMismatchException(currentElement.toString() + ' at ' + tag, 'JsonPrimitive');
    }
    return tmp$_0;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedChar_11rb$ = function (tag) {
    var tmp$;
    var o = this.getValue_61zpoe$(tag);
    if (o.content.length === 1)
      tmp$ = o.content.charCodeAt(0);
    else
      throw new SerializationException(o.toString() + " can't be represented as Char");
    return toBoxedChar(tmp$);
  };
  AbstractJsonTreeInput.prototype.decodeTaggedEnum_wc8hrb$ = function (tag, enumDescription) {
    return enumDescription.getElementIndex_61zpoe$(this.getValue_61zpoe$(tag).content);
  };
  AbstractJsonTreeInput.prototype.decodeTaggedNull_11rb$ = function (tag) {
    return null;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedNotNullMark_11rb$ = function (tag) {
    return this.currentElement_61zpoe$(tag) !== JsonNull_getInstance();
  };
  AbstractJsonTreeInput.prototype.decodeTaggedUnit_11rb$ = function (tag) {
    return;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedBoolean_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).boolean;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedByte_11rb$ = function (tag) {
    return toByte(this.getValue_61zpoe$(tag).int);
  };
  AbstractJsonTreeInput.prototype.decodeTaggedShort_11rb$ = function (tag) {
    return toShort(this.getValue_61zpoe$(tag).int);
  };
  AbstractJsonTreeInput.prototype.decodeTaggedInt_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).int;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedLong_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).long;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedFloat_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).float;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedDouble_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).double;
  };
  AbstractJsonTreeInput.prototype.decodeTaggedString_11rb$ = function (tag) {
    return this.getValue_61zpoe$(tag).content;
  };
  AbstractJsonTreeInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractJsonTreeInput',
    interfaces: [JsonInput, NamedValueDecoder]
  };
  function JsonPrimitiveInput(json, obj) {
    JsonPrimitiveInput$Companion_getInstance();
    AbstractJsonTreeInput.call(this, json, obj);
    this.obj_dqj0pm$_0 = obj;
    this.pushTag_11rb$(JsonPrimitiveInput$Companion_getInstance().primitive);
  }
  Object.defineProperty(JsonPrimitiveInput.prototype, 'obj', {
    get: function () {
      return this.obj_dqj0pm$_0;
    }
  });
  function JsonPrimitiveInput$Companion() {
    JsonPrimitiveInput$Companion_instance = this;
    this.primitive = 'primitive';
  }
  JsonPrimitiveInput$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var JsonPrimitiveInput$Companion_instance = null;
  function JsonPrimitiveInput$Companion_getInstance() {
    if (JsonPrimitiveInput$Companion_instance === null) {
      new JsonPrimitiveInput$Companion();
    }
    return JsonPrimitiveInput$Companion_instance;
  }
  JsonPrimitiveInput.prototype.currentElement_61zpoe$ = function (tag) {
    if (!equals(tag, JsonPrimitiveInput$Companion_getInstance().primitive)) {
      var message = 'Failed requirement.';
      throw IllegalArgumentException_init(message.toString());
    }
    return this.obj;
  };
  JsonPrimitiveInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonPrimitiveInput',
    interfaces: [AbstractJsonTreeInput]
  };
  function JsonTreeInput(json, obj) {
    AbstractJsonTreeInput.call(this, json, obj);
    this.obj_piko0j$_0 = obj;
    this.position_0 = 0;
  }
  Object.defineProperty(JsonTreeInput.prototype, 'obj', {
    get: function () {
      return this.obj_piko0j$_0;
    }
  });
  JsonTreeInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    var tmp$;
    while (this.position_0 < desc.elementsCount) {
      var name = this.getTag_m47q6f$(desc, (tmp$ = this.position_0, this.position_0 = tmp$ + 1 | 0, tmp$));
      var $receiver = this.obj;
      var tmp$_0;
      if ((Kotlin.isType(tmp$_0 = $receiver, Map) ? tmp$_0 : throwCCE()).containsKey_11rb$(name)) {
        return this.position_0 - 1 | 0;
      }
    }
    return -1;
  };
  JsonTreeInput.prototype.currentElement_61zpoe$ = function (tag) {
    return getValue(this.obj, tag);
  };
  JsonTreeInput.prototype.endStructure_qatsm0$ = function (desc) {
    var tmp$, tmp$_0;
    if (this.json.strictMode_8be2vx$) {
      var names = HashSet_init_1(desc.elementsCount);
      tmp$ = desc.elementsCount;
      for (var i = 0; i < tmp$; i++) {
        var element = desc.getElementName_za3lpa$(i);
        names.add_11rb$(element);
      }
      tmp$_0 = this.obj.keys.iterator();
      while (tmp$_0.hasNext()) {
        var key = tmp$_0.next();
        if (!names.contains_11rb$(key))
          throw new JsonUnknownKeyException("Encountered an unknown key '" + key + "'");
      }
    }
  };
  JsonTreeInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeInput',
    interfaces: [AbstractJsonTreeInput]
  };
  function JsonTreeMapInput(json, obj) {
    JsonTreeInput.call(this, json, obj);
    this.obj_reg7od$_0 = obj;
    this.keys_0 = toList(this.obj.keys);
    this.size_0 = this.keys_0.size * 2 | 0;
    this.position_1 = -1;
  }
  Object.defineProperty(JsonTreeMapInput.prototype, 'obj', {
    get: function () {
      return this.obj_reg7od$_0;
    }
  });
  JsonTreeMapInput.prototype.elementName_3zr2iy$ = function (desc, index) {
    var i = index / 2 | 0;
    return this.keys_0.get_za3lpa$(i);
  };
  JsonTreeMapInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    while (this.position_1 < (this.size_0 - 1 | 0)) {
      this.position_1 = this.position_1 + 1 | 0;
      return this.position_1;
    }
    return -1;
  };
  JsonTreeMapInput.prototype.currentElement_61zpoe$ = function (tag) {
    return this.position_1 % 2 === 0 ? JsonLiteral_init_1(tag) : this.obj.get_11rb$(tag);
  };
  JsonTreeMapInput.prototype.endStructure_qatsm0$ = function (desc) {
  };
  JsonTreeMapInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeMapInput',
    interfaces: [JsonTreeInput]
  };
  function JsonTreeListInput(json, obj) {
    AbstractJsonTreeInput.call(this, json, obj);
    this.obj_el7e51$_0 = obj;
    this.size_0 = this.obj.content.size;
    this.currentIndex_0 = -1;
  }
  Object.defineProperty(JsonTreeListInput.prototype, 'obj', {
    get: function () {
      return this.obj_el7e51$_0;
    }
  });
  JsonTreeListInput.prototype.elementName_3zr2iy$ = function (desc, index) {
    return index.toString();
  };
  JsonTreeListInput.prototype.currentElement_61zpoe$ = function (tag) {
    return this.obj.get_za3lpa$(toInt(tag));
  };
  JsonTreeListInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    while (this.currentIndex_0 < (this.size_0 - 1 | 0)) {
      this.currentIndex_0 = this.currentIndex_0 + 1 | 0;
      return this.currentIndex_0;
    }
    return -1;
  };
  JsonTreeListInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeListInput',
    interfaces: [AbstractJsonTreeInput]
  };
  function writeJson$lambda(closure$result) {
    return function (it) {
      closure$result.v = it;
      return Unit;
    };
  }
  function writeJson($receiver, value, serializer) {
    var result = {v: null};
    var encoder = new JsonTreeOutput($receiver, writeJson$lambda(result));
    encode_0(encoder, serializer, value);
    return result.v == null ? throwUPAE('result') : result.v;
  }
  function AbstractJsonTreeOutput(json, nodeConsumer) {
    NamedValueEncoder.call(this);
    this.json_138ar7$_0 = json;
    this.nodeConsumer = nodeConsumer;
  }
  Object.defineProperty(AbstractJsonTreeOutput.prototype, 'json', {
    get: function () {
      return this.json_138ar7$_0;
    }
  });
  AbstractJsonTreeOutput.prototype.encodeJson_qiw0cd$ = function (element) {
    this.encodeSerializableValue_tf03ej$(JsonElementSerializer_getInstance(), element);
  };
  AbstractJsonTreeOutput.prototype.shouldEncodeElementDefault_3zr2iy$ = function (desc, index) {
    return this.json.encodeDefaults;
  };
  AbstractJsonTreeOutput.prototype.composeName_puj7f4$ = function (parentName, childName) {
    return childName;
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedNull_11rb$ = function (tag) {
    this.putElement_zafu29$(tag, JsonNull_getInstance());
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedInt_dpg1yx$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedByte_19qe40$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedShort_veccj0$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedLong_19wkf8$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedFloat_vlf4p8$ = function (tag, value) {
    if (this.json.strictMode_8be2vx$ && !isFinite(value)) {
      throw JsonInvalidValueInStrictModeException_init(value);
    }
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedDouble_e37ph5$ = function (tag, value) {
    if (this.json.strictMode_8be2vx$ && !isFinite_0(value)) {
      throw JsonInvalidValueInStrictModeException_init_0(value);
    }
    this.putElement_zafu29$(tag, JsonLiteral_init(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedBoolean_iuyhfk$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init_0(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedChar_19qo1q$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init_1(String.fromCharCode(value)));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedString_l9l8mx$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init_1(value));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedEnum_g3arax$ = function (tag, enumDescription, ordinal) {
    this.putElement_zafu29$(tag, JsonLiteral_init_1(enumDescription.getElementName_za3lpa$(ordinal)));
  };
  AbstractJsonTreeOutput.prototype.encodeTaggedValue_dpg7wc$ = function (tag, value) {
    this.putElement_zafu29$(tag, JsonLiteral_init_1(value.toString()));
  };
  function AbstractJsonTreeOutput$beginStructure$lambda(this$AbstractJsonTreeOutput) {
    return function (node) {
      this$AbstractJsonTreeOutput.putElement_zafu29$(this$AbstractJsonTreeOutput.currentTag, node);
      return Unit;
    };
  }
  AbstractJsonTreeOutput.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$, tmp$_0;
    var consumer = this.currentTagOrNull == null ? this.nodeConsumer : AbstractJsonTreeOutput$beginStructure$lambda(this);
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance()))
      tmp$_0 = new JsonTreeListOutput(this.json, consumer);
    else if (equals(tmp$, StructureKind$MAP_getInstance()))
      tmp$_0 = new JsonTreeMapOutput(this.json, consumer);
    else
      tmp$_0 = new JsonTreeOutput(this.json, consumer);
    return tmp$_0;
  };
  AbstractJsonTreeOutput.prototype.endEncode_qatsm0$ = function (desc) {
    this.nodeConsumer(this.getCurrent());
  };
  AbstractJsonTreeOutput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractJsonTreeOutput',
    interfaces: [JsonOutput, NamedValueEncoder]
  };
  function JsonTreeOutput(json, nodeConsumer) {
    AbstractJsonTreeOutput.call(this, json, nodeConsumer);
    this.json_safeiz$_0 = json;
    this.context = this.json.context;
    this.content_0 = LinkedHashMap_init();
  }
  Object.defineProperty(JsonTreeOutput.prototype, 'json', {
    get: function () {
      return this.json_safeiz$_0;
    }
  });
  JsonTreeOutput.prototype.putElement_zafu29$ = function (key, element) {
    this.content_0.put_xwzc9p$(key, element);
  };
  JsonTreeOutput.prototype.getCurrent = function () {
    return new JsonObject(this.content_0);
  };
  JsonTreeOutput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeOutput',
    interfaces: [AbstractJsonTreeOutput]
  };
  function JsonTreeMapOutput(json, nodeConsumer) {
    JsonTreeOutput.call(this, json, nodeConsumer);
    this.tag_5cp6c7$_0 = this.tag_5cp6c7$_0;
  }
  Object.defineProperty(JsonTreeMapOutput.prototype, 'tag_0', {
    get: function () {
      if (this.tag_5cp6c7$_0 == null)
        return throwUPAE('tag');
      return this.tag_5cp6c7$_0;
    },
    set: function (tag) {
      this.tag_5cp6c7$_0 = tag;
    }
  });
  JsonTreeMapOutput.prototype.putElement_zafu29$ = function (key, element) {
    var idx = toInt(key);
    if (idx % 2 === 0) {
      if (!Kotlin.isType(element, JsonLiteral)) {
        var message = 'Expected JsonLiteral, but has ' + element;
        throw IllegalStateException_init(message.toString());
      }
      this.tag_0 = element.content;
    }
     else {
      var $receiver = this.content_0;
      var key_0 = this.tag_0;
      $receiver.put_xwzc9p$(key_0, element);
    }
  };
  JsonTreeMapOutput.prototype.getCurrent = function () {
    return new JsonObject(this.content_0);
  };
  JsonTreeMapOutput.prototype.shouldWriteElement_a5qihn$ = function (desc, tag, index) {
    return true;
  };
  JsonTreeMapOutput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeMapOutput',
    interfaces: [JsonTreeOutput]
  };
  function JsonTreeListOutput(json, nodeConsumer) {
    AbstractJsonTreeOutput.call(this, json, nodeConsumer);
    this.array_0 = ArrayList_init_0();
    this.context = json.context;
  }
  JsonTreeListOutput.prototype.shouldWriteElement_a5qihn$ = function (desc, tag, index) {
    return true;
  };
  JsonTreeListOutput.prototype.putElement_zafu29$ = function (key, element) {
    var idx = toInt(key);
    this.array_0.add_wxm5ur$(idx, element);
  };
  JsonTreeListOutput.prototype.getCurrent = function () {
    return new JsonArray(this.array_0);
  };
  JsonTreeListOutput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'JsonTreeListOutput',
    interfaces: [AbstractJsonTreeOutput]
  };
  var cast = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.json.internal.cast_5s6yet$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var throwCCE = Kotlin.throwCCE;
    var IllegalStateException_init = Kotlin.kotlin.IllegalStateException_init_pdl1vj$;
    return function (T_0, isT, obj) {
      var tmp$;
      if (!isT(obj)) {
        var message = 'Expected ' + getKClass(T_0) + ' but found ' + Kotlin.getKClassFromExpression(obj);
        throw IllegalStateException_init(message.toString());
      }
      return isT(tmp$ = obj) ? tmp$ : throwCCE();
    };
  }));
  function WriteMode(name, ordinal, begin, end) {
    Enum.call(this);
    this.begin = toBoxedChar(begin);
    this.end = toBoxedChar(end);
    this.name$ = name;
    this.ordinal$ = ordinal;
    this.beginTc = charToTokenClass(unboxChar(this.begin));
    this.endTc = charToTokenClass(unboxChar(this.end));
  }
  function WriteMode_initFields() {
    WriteMode_initFields = function () {
    };
    WriteMode$OBJ_instance = new WriteMode('OBJ', 0, BEGIN_OBJ, END_OBJ);
    WriteMode$LIST_instance = new WriteMode('LIST', 1, BEGIN_LIST, END_LIST);
    WriteMode$MAP_instance = new WriteMode('MAP', 2, BEGIN_OBJ, END_OBJ);
    WriteMode$POLY_OBJ_instance = new WriteMode('POLY_OBJ', 3, BEGIN_LIST, END_LIST);
  }
  var WriteMode$OBJ_instance;
  function WriteMode$OBJ_getInstance() {
    WriteMode_initFields();
    return WriteMode$OBJ_instance;
  }
  var WriteMode$LIST_instance;
  function WriteMode$LIST_getInstance() {
    WriteMode_initFields();
    return WriteMode$LIST_instance;
  }
  var WriteMode$MAP_instance;
  function WriteMode$MAP_getInstance() {
    WriteMode_initFields();
    return WriteMode$MAP_instance;
  }
  var WriteMode$POLY_OBJ_instance;
  function WriteMode$POLY_OBJ_getInstance() {
    WriteMode_initFields();
    return WriteMode$POLY_OBJ_instance;
  }
  WriteMode.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'WriteMode',
    interfaces: [Enum]
  };
  function WriteMode$values() {
    return [WriteMode$OBJ_getInstance(), WriteMode$LIST_getInstance(), WriteMode$MAP_getInstance(), WriteMode$POLY_OBJ_getInstance()];
  }
  WriteMode.values = WriteMode$values;
  function WriteMode$valueOf(name) {
    switch (name) {
      case 'OBJ':
        return WriteMode$OBJ_getInstance();
      case 'LIST':
        return WriteMode$LIST_getInstance();
      case 'MAP':
        return WriteMode$MAP_getInstance();
      case 'POLY_OBJ':
        return WriteMode$POLY_OBJ_getInstance();
      default:throwISE('No enum constant kotlinx.serialization.json.internal.WriteMode.' + name);
    }
  }
  WriteMode.valueOf_61zpoe$ = WriteMode$valueOf;
  function switchMode(desc, typeParams) {
    var tmp$;
    tmp$ = desc.kind;
    if (equals(tmp$, UnionKind$POLYMORPHIC_getInstance()))
      return WriteMode$POLY_OBJ_getInstance();
    else if (equals(tmp$, StructureKind$LIST_getInstance()))
      return WriteMode$LIST_getInstance();
    else if (equals(tmp$, StructureKind$MAP_getInstance())) {
      var keyKind = typeParams[0].descriptor.kind;
      return Kotlin.isType(keyKind, PrimitiveKind) || equals(keyKind, UnionKind$ENUM_KIND_getInstance()) ? WriteMode$MAP_getInstance() : WriteMode$LIST_getInstance();
    }
     else
      return WriteMode$OBJ_getInstance();
  }
  function ProtoBuf() {
    ProtoBuf$Companion_getInstance();
    AbstractSerialFormat.call(this);
  }
  function ProtoBuf$ProtobufWriter($outer, encoder) {
    this.$outer = $outer;
    TaggedEncoder.call(this);
    this.encoder = encoder;
    this.context = this.$outer.context;
  }
  ProtoBuf$ProtobufWriter.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$;
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance()))
      return new ProtoBuf$RepeatedWriter(this.$outer, this.encoder, this.currentTag);
    else if (equals(tmp$, StructureKind$CLASS_getInstance()) || equals(tmp$, UnionKind$OBJECT_getInstance()) || equals(tmp$, UnionKind$SEALED_getInstance()) || equals(tmp$, UnionKind$POLYMORPHIC_getInstance()))
      return new ProtoBuf$ObjectWriter(this.$outer, this.currentTagOrNull, this.encoder);
    else if (equals(tmp$, StructureKind$MAP_getInstance()))
      return new ProtoBuf$MapRepeatedWriter(this.$outer, this.currentTagOrNull, this.encoder);
    else
      throw new SerializationException('Primitives are not supported at top-level');
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedInt_dpg1yx$ = function (tag, value) {
    this.encoder.writeInt_hp6twd$(value, tag.first, tag.second);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedByte_19qe40$ = function (tag, value) {
    this.encoder.writeInt_hp6twd$(value, tag.first, tag.second);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedShort_veccj0$ = function (tag, value) {
    this.encoder.writeInt_hp6twd$(value, tag.first, tag.second);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedLong_19wkf8$ = function (tag, value) {
    this.encoder.writeLong_scxzc4$(value, tag.first, tag.second);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedFloat_vlf4p8$ = function (tag, value) {
    this.encoder.writeFloat_vjorfl$(value, tag.first);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedDouble_e37ph5$ = function (tag, value) {
    this.encoder.writeDouble_12fank$(value, tag.first);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedBoolean_iuyhfk$ = function (tag, value) {
    this.encoder.writeInt_hp6twd$(value ? 1 : 0, tag.first, ProtoNumberType$DEFAULT_getInstance());
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedChar_19qo1q$ = function (tag, value) {
    this.encoder.writeInt_hp6twd$(value | 0, tag.first, tag.second);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedString_l9l8mx$ = function (tag, value) {
    this.encoder.writeString_bm4lxs$(value, tag.first);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeTaggedEnum_g3arax$ = function (tag, enumDescription, ordinal) {
    this.encoder.writeInt_hp6twd$(ordinal, tag.first, ProtoNumberType$DEFAULT_getInstance());
  };
  ProtoBuf$ProtobufWriter.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return ProtoBuf$Companion_getInstance().getProtoDesc_0($receiver, index);
  };
  ProtoBuf$ProtobufWriter.prototype.encodeSerializableValue_tf03ej$ = function (serializer, value) {
    var tmp$, tmp$_0;
    if (Kotlin.isType(serializer.descriptor, MapLikeDescriptor)) {
      var serializer_0 = Kotlin.isType(tmp$ = serializer, MapLikeSerializer) ? tmp$ : throwCCE();
      var mapEntrySerial = new MapEntrySerializer(serializer_0.keySerializer, serializer_0.valueSerializer);
      (new HashSetSerializer(mapEntrySerial)).serialize_awe97i$(this, (Kotlin.isType(tmp$_0 = value, Map) ? tmp$_0 : throwCCE()).entries);
    }
     else {
      serializer.serialize_awe97i$(this, value);
    }
  };
  ProtoBuf$ProtobufWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtobufWriter',
    interfaces: [TaggedEncoder]
  };
  function ProtoBuf$ObjectWriter($outer, parentTag, parentEncoder, stream) {
    this.$outer = $outer;
    if (stream === void 0)
      stream = ByteArrayOutputStream_init();
    ProtoBuf$ProtobufWriter.call(this, this.$outer, new ProtoBuf$ProtobufEncoder(stream));
    this.parentTag = parentTag;
    this.parentEncoder_0 = parentEncoder;
    this.stream_0 = stream;
  }
  ProtoBuf$ObjectWriter.prototype.endEncode_qatsm0$ = function (desc) {
    if (this.parentTag != null) {
      this.parentEncoder_0.writeObject_ir89t6$(this.stream_0.toByteArray(), this.parentTag.first);
    }
     else {
      this.parentEncoder_0.out.write_fqrh44$(this.stream_0.toByteArray());
    }
  };
  ProtoBuf$ObjectWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ObjectWriter',
    interfaces: [ProtoBuf$ProtobufWriter]
  };
  function ProtoBuf$MapRepeatedWriter($outer, parentTag, parentEncoder) {
    this.$outer = $outer;
    ProtoBuf$ObjectWriter.call(this, this.$outer, parentTag, parentEncoder);
  }
  ProtoBuf$MapRepeatedWriter.prototype.getTag_m47q6f$ = function ($receiver, index) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2;
    if (index % 2 === 0) {
      return to(1, (tmp$_0 = (tmp$ = this.parentTag) != null ? tmp$.second : null) != null ? tmp$_0 : ProtoNumberType$DEFAULT_getInstance());
    }
     else {
      return to(2, (tmp$_2 = (tmp$_1 = this.parentTag) != null ? tmp$_1.second : null) != null ? tmp$_2 : ProtoNumberType$DEFAULT_getInstance());
    }
  };
  ProtoBuf$MapRepeatedWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapRepeatedWriter',
    interfaces: [ProtoBuf$ObjectWriter]
  };
  function ProtoBuf$RepeatedWriter($outer, encoder, curTag) {
    this.$outer = $outer;
    ProtoBuf$ProtobufWriter.call(this, this.$outer, encoder);
    this.curTag = curTag;
  }
  ProtoBuf$RepeatedWriter.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return this.curTag;
  };
  ProtoBuf$RepeatedWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'RepeatedWriter',
    interfaces: [ProtoBuf$ProtobufWriter]
  };
  function ProtoBuf$ProtobufEncoder(out) {
    this.out = out;
  }
  ProtoBuf$ProtobufEncoder.prototype.writeObject_ir89t6$ = function (bytes, tag) {
    var header = this.encode32_0(tag << 3 | 2);
    var len = this.encode32_0(bytes.length);
    this.out.write_fqrh44$(header);
    this.out.write_fqrh44$(len);
    this.out.write_fqrh44$(bytes);
  };
  ProtoBuf$ProtobufEncoder.prototype.writeInt_hp6twd$ = function (value, tag, format) {
    var wireType = format === ProtoNumberType$FIXED_getInstance() ? 5 : 0;
    var header = this.encode32_0(tag << 3 | wireType);
    var content = this.encode32_0(value, format);
    this.out.write_fqrh44$(header);
    this.out.write_fqrh44$(content);
  };
  ProtoBuf$ProtobufEncoder.prototype.writeLong_scxzc4$ = function (value, tag, format) {
    var wireType = format === ProtoNumberType$FIXED_getInstance() ? 1 : 0;
    var header = this.encode32_0(tag << 3 | wireType);
    var content = this.encode64_0(value, format);
    this.out.write_fqrh44$(header);
    this.out.write_fqrh44$(content);
  };
  ProtoBuf$ProtobufEncoder.prototype.writeString_bm4lxs$ = function (value, tag) {
    var bytes = toUtf8Bytes(value);
    this.writeObject_ir89t6$(bytes, tag);
  };
  ProtoBuf$ProtobufEncoder.prototype.writeDouble_12fank$ = function (value, tag) {
    var header = this.encode32_0(tag << 3 | 1);
    var content = ByteBuffer$Companion_getInstance().allocate_za3lpa$(8).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).putDouble_14dthe$(value).array();
    this.out.write_fqrh44$(header);
    this.out.write_fqrh44$(content);
  };
  ProtoBuf$ProtobufEncoder.prototype.writeFloat_vjorfl$ = function (value, tag) {
    var header = this.encode32_0(tag << 3 | 5);
    var content = ByteBuffer$Companion_getInstance().allocate_za3lpa$(4).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).putFloat_mx4ult$(value).array();
    this.out.write_fqrh44$(header);
    this.out.write_fqrh44$(content);
  };
  ProtoBuf$ProtobufEncoder.prototype.encode32_0 = function (number, format) {
    if (format === void 0)
      format = ProtoNumberType$DEFAULT_getInstance();
    switch (format.name) {
      case 'FIXED':
        return ByteBuffer$Companion_getInstance().allocate_za3lpa$(4).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).putInt_za3lpa$(number).array();
      case 'DEFAULT':
        return ProtoBuf$Varint_getInstance().encodeVarint_8e33dg$(Kotlin.Long.fromInt(number));
      case 'SIGNED':
        return ProtoBuf$Varint_getInstance().encodeVarint_kcn2v3$(number << 1 ^ number >> 31);
      default:return Kotlin.noWhenBranchMatched();
    }
  };
  ProtoBuf$ProtobufEncoder.prototype.encode64_0 = function (number, format) {
    if (format === void 0)
      format = ProtoNumberType$DEFAULT_getInstance();
    switch (format.name) {
      case 'FIXED':
        return ByteBuffer$Companion_getInstance().allocate_za3lpa$(8).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).putLong_s8cxhz$(number).array();
      case 'DEFAULT':
        return ProtoBuf$Varint_getInstance().encodeVarint_8e33dg$(number);
      case 'SIGNED':
        return ProtoBuf$Varint_getInstance().encodeVarint_8e33dg$(number.shiftLeft(1).xor(number.shiftRight(63)));
      default:return Kotlin.noWhenBranchMatched();
    }
  };
  ProtoBuf$ProtobufEncoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtobufEncoder',
    interfaces: []
  };
  function ProtoBuf$ProtobufReader($outer, decoder) {
    this.$outer = $outer;
    TaggedDecoder.call(this);
    this.decoder = decoder;
    this.context = this.$outer.context;
    this.indexByTag_0 = LinkedHashMap_init();
  }
  ProtoBuf$ProtobufReader.prototype.findIndexByTag_0 = function (desc, serialId) {
    var tmp$;
    var $receiver = until(0, desc.elementsCount);
    var firstOrNull$result;
    firstOrNull$break: do {
      var tmp$_0;
      tmp$_0 = $receiver.iterator();
      while (tmp$_0.hasNext()) {
        var element = tmp$_0.next();
        if (this.getTag_m47q6f$(desc, element).first === serialId) {
          firstOrNull$result = element;
          break firstOrNull$break;
        }
      }
      firstOrNull$result = null;
    }
     while (false);
    return (tmp$ = firstOrNull$result) != null ? tmp$ : -1;
  };
  ProtoBuf$ProtobufReader.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$;
    tmp$ = desc.kind;
    if (equals(tmp$, StructureKind$LIST_getInstance()))
      return new ProtoBuf$RepeatedReader(this.$outer, this.decoder, this.currentTag);
    else if (equals(tmp$, StructureKind$CLASS_getInstance()) || equals(tmp$, UnionKind$OBJECT_getInstance()) || equals(tmp$, UnionKind$SEALED_getInstance()) || equals(tmp$, UnionKind$POLYMORPHIC_getInstance()))
      return new ProtoBuf$ProtobufReader(this.$outer, ProtoBuf$Companion_getInstance().makeDelimited_0(this.decoder, this.currentTagOrNull));
    else if (equals(tmp$, StructureKind$MAP_getInstance()))
      return new ProtoBuf$MapEntryReader(this.$outer, ProtoBuf$Companion_getInstance().makeDelimited_0(this.decoder, this.currentTagOrNull), this.currentTagOrNull);
    else
      throw new SerializationException('Primitives are not supported at top-level');
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedBoolean_11rb$ = function (tag) {
    var i = this.decoder.nextInt_bmwen1$(ProtoNumberType$DEFAULT_getInstance());
    switch (i) {
      case 0:
        return false;
      case 1:
        return true;
      default:throw new ProtobufDecodingException('Expected boolean value (0 or 1), found ' + i);
    }
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedByte_11rb$ = function (tag) {
    return toByte(this.decoder.nextInt_bmwen1$(tag.second));
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedShort_11rb$ = function (tag) {
    return toShort(this.decoder.nextInt_bmwen1$(tag.second));
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedInt_11rb$ = function (tag) {
    return this.decoder.nextInt_bmwen1$(tag.second);
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedLong_11rb$ = function (tag) {
    return this.decoder.nextLong_bmwen1$(tag.second);
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedFloat_11rb$ = function (tag) {
    return this.decoder.nextFloat();
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedDouble_11rb$ = function (tag) {
    return this.decoder.nextDouble();
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedChar_11rb$ = function (tag) {
    return toBoxedChar(toChar(this.decoder.nextInt_bmwen1$(tag.second)));
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedString_11rb$ = function (tag) {
    return this.decoder.nextString();
  };
  ProtoBuf$ProtobufReader.prototype.decodeTaggedEnum_wc8hrb$ = function (tag, enumDescription) {
    return this.decoder.nextInt_bmwen1$(ProtoNumberType$DEFAULT_getInstance());
  };
  var mapCapacity = Kotlin.kotlin.collections.mapCapacity_za3lpa$;
  var LinkedHashMap_init_1 = Kotlin.kotlin.collections.LinkedHashMap_init_bwtc7$;
  ProtoBuf$ProtobufReader.prototype.decodeSerializableValue_w63s0f$ = function (deserializer) {
    var tmp$, tmp$_0, tmp$_1;
    if (Kotlin.isType(deserializer.descriptor, MapLikeDescriptor)) {
      var serializer = Kotlin.isType(tmp$ = deserializer, MapLikeSerializer) ? tmp$ : throwCCE();
      var mapEntrySerial = new MapEntrySerializer(serializer.keySerializer, serializer.valueSerializer);
      var setOfEntries = (new HashSetSerializer(mapEntrySerial)).deserialize_nts5qn$(this);
      var capacity = coerceAtLeast(mapCapacity(collectionSizeOrDefault(setOfEntries, 10)), 16);
      var destination = LinkedHashMap_init_1(capacity);
      var tmp$_2;
      tmp$_2 = setOfEntries.iterator();
      while (tmp$_2.hasNext()) {
        var element = tmp$_2.next();
        destination.put_xwzc9p$(element.key, element.value);
      }
      tmp$_1 = (tmp$_0 = destination) == null || Kotlin.isType(tmp$_0, Any) ? tmp$_0 : throwCCE();
    }
     else {
      tmp$_1 = deserializer.deserialize_nts5qn$(this);
    }
    return tmp$_1;
  };
  ProtoBuf$ProtobufReader.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return ProtoBuf$Companion_getInstance().getProtoDesc_0($receiver, index);
  };
  ProtoBuf$ProtobufReader.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    while (true) {
      if (this.decoder.curId === -1)
        return -1;
      var $receiver = this.indexByTag_0;
      var key = this.decoder.curId;
      var tmp$;
      var value = $receiver.get_11rb$(key);
      if (value == null) {
        var answer = this.findIndexByTag_0(desc, this.decoder.curId);
        $receiver.put_xwzc9p$(key, answer);
        tmp$ = answer;
      }
       else {
        tmp$ = value;
      }
      var ind = tmp$;
      if (ind === -1)
        this.decoder.skipElement();
      else
        return ind;
    }
  };
  ProtoBuf$ProtobufReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtobufReader',
    interfaces: [TaggedDecoder]
  };
  function ProtoBuf$RepeatedReader($outer, decoder, targetTag) {
    this.$outer = $outer;
    ProtoBuf$ProtobufReader.call(this, this.$outer, decoder);
    this.targetTag = targetTag;
    this.ind_0 = -1;
  }
  ProtoBuf$RepeatedReader.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    return this.decoder.curId === this.targetTag.first ? (this.ind_0 = this.ind_0 + 1 | 0, this.ind_0) : -1;
  };
  ProtoBuf$RepeatedReader.prototype.getTag_m47q6f$ = function ($receiver, index) {
    return this.targetTag;
  };
  ProtoBuf$RepeatedReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'RepeatedReader',
    interfaces: [ProtoBuf$ProtobufReader]
  };
  function ProtoBuf$MapEntryReader($outer, decoder, parentTag) {
    this.$outer = $outer;
    ProtoBuf$ProtobufReader.call(this, this.$outer, decoder);
    this.parentTag = parentTag;
  }
  ProtoBuf$MapEntryReader.prototype.getTag_m47q6f$ = function ($receiver, index) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2;
    if (index % 2 === 0) {
      return to(1, (tmp$_0 = (tmp$ = this.parentTag) != null ? tmp$.second : null) != null ? tmp$_0 : ProtoNumberType$DEFAULT_getInstance());
    }
     else {
      return to(2, (tmp$_2 = (tmp$_1 = this.parentTag) != null ? tmp$_1.second : null) != null ? tmp$_2 : ProtoNumberType$DEFAULT_getInstance());
    }
  };
  ProtoBuf$MapEntryReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'MapEntryReader',
    interfaces: [ProtoBuf$ProtobufReader]
  };
  function ProtoBuf$ProtobufDecoder(inp) {
    this.inp = inp;
    this.curTag_0 = to(-1, -1);
    this.readTag_0();
  }
  Object.defineProperty(ProtoBuf$ProtobufDecoder.prototype, 'curId', {
    get: function () {
      return this.curTag_0.first;
    }
  });
  ProtoBuf$ProtobufDecoder.prototype.readTag_0 = function () {
    var tmp$;
    var header = this.decode32_0(void 0, true);
    if (header === -1) {
      tmp$ = to(-1, -1);
    }
     else {
      var wireType = header & 7;
      var fieldId = header >>> 3;
      tmp$ = to(fieldId, wireType);
    }
    this.curTag_0 = tmp$;
    return this.curTag_0;
  };
  ProtoBuf$ProtobufDecoder.prototype.skipElement = function () {
    switch (this.curTag_0.second) {
      case 0:
        this.nextInt_bmwen1$(ProtoNumberType$DEFAULT_getInstance());
        break;
      case 1:
        this.nextLong_bmwen1$(ProtoNumberType$FIXED_getInstance());
        break;
      case 2:
        this.nextObject();
        break;
      case 5:
        this.nextInt_bmwen1$(ProtoNumberType$FIXED_getInstance());
        break;
    }
    this.readTag_0();
  };
  ProtoBuf$ProtobufDecoder.prototype.assertWireType_0 = function (expected) {
    if (this.curTag_0.second !== expected)
      throw new ProtobufDecodingException('Expected wire type ' + expected + ', but found ' + this.curTag_0.second);
  };
  ProtoBuf$ProtobufDecoder.prototype.nextObject = function () {
    if (this.curTag_0.second !== 2)
      throw new ProtobufDecodingException('Expected wire type ' + 2 + ', but found ' + this.curTag_0.second);
    var len = this.decode32_0();
    if (!(len >= 0)) {
      var message = 'Check failed.';
      throw IllegalStateException_init(message.toString());
    }
    var ans = readExactNBytes(this.inp, len);
    this.readTag_0();
    return ans;
  };
  ProtoBuf$ProtobufDecoder.prototype.nextInt_bmwen1$ = function (format) {
    var wireType = format === ProtoNumberType$FIXED_getInstance() ? 5 : 0;
    if (this.curTag_0.second !== wireType)
      throw new ProtobufDecodingException('Expected wire type ' + wireType + ', but found ' + this.curTag_0.second);
    var ans = this.decode32_0(format);
    this.readTag_0();
    return ans;
  };
  ProtoBuf$ProtobufDecoder.prototype.nextLong_bmwen1$ = function (format) {
    var wireType = format === ProtoNumberType$FIXED_getInstance() ? 1 : 0;
    if (this.curTag_0.second !== wireType)
      throw new ProtobufDecodingException('Expected wire type ' + wireType + ', but found ' + this.curTag_0.second);
    var ans = this.decode64_0(format);
    this.readTag_0();
    return ans;
  };
  ProtoBuf$ProtobufDecoder.prototype.nextFloat = function () {
    if (this.curTag_0.second !== 5)
      throw new ProtobufDecodingException('Expected wire type ' + 5 + ', but found ' + this.curTag_0.second);
    var ans = readToByteBuffer(this.inp, 4).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).getFloat();
    this.readTag_0();
    return ans;
  };
  ProtoBuf$ProtobufDecoder.prototype.nextDouble = function () {
    if (this.curTag_0.second !== 1)
      throw new ProtobufDecodingException('Expected wire type ' + 1 + ', but found ' + this.curTag_0.second);
    var ans = readToByteBuffer(this.inp, 8).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).getDouble();
    this.readTag_0();
    return ans;
  };
  ProtoBuf$ProtobufDecoder.prototype.nextString = function () {
    var bytes = this.nextObject();
    return stringFromUtf8Bytes(bytes);
  };
  ProtoBuf$ProtobufDecoder.prototype.decode32_0 = function (format, eofAllowed) {
    if (format === void 0)
      format = ProtoNumberType$DEFAULT_getInstance();
    if (eofAllowed === void 0)
      eofAllowed = false;
    switch (format.name) {
      case 'DEFAULT':
        return ProtoBuf$Varint_getInstance().decodeVarint_pwta7l$(this.inp, 64, eofAllowed).toInt();
      case 'SIGNED':
        return ProtoBuf$Varint_getInstance().decodeSignedVarintInt_wq5eom$(this.inp);
      case 'FIXED':
        return readToByteBuffer(this.inp, 4).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).getInt();
      default:return Kotlin.noWhenBranchMatched();
    }
  };
  ProtoBuf$ProtobufDecoder.prototype.decode64_0 = function (format) {
    if (format === void 0)
      format = ProtoNumberType$DEFAULT_getInstance();
    switch (format.name) {
      case 'DEFAULT':
        return ProtoBuf$Varint_getInstance().decodeVarint_pwta7l$(this.inp, 64);
      case 'SIGNED':
        return ProtoBuf$Varint_getInstance().decodeSignedVarintLong_wq5eom$(this.inp);
      case 'FIXED':
        return readToByteBuffer(this.inp, 8).order_w2g0y3$(ByteOrder$LITTLE_ENDIAN_getInstance()).getLong();
      default:return Kotlin.noWhenBranchMatched();
    }
  };
  ProtoBuf$ProtobufDecoder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtobufDecoder',
    interfaces: []
  };
  function ProtoBuf$Varint() {
    ProtoBuf$Varint_instance = this;
  }
  ProtoBuf$Varint.prototype.encodeVarint_kcn2v3$ = function (inp) {
    var tmp$;
    var value = inp;
    var byteArrayList = new Int8Array(10);
    var i = 0;
    while ((value & -128) !== 0) {
      byteArrayList[tmp$ = i, i = tmp$ + 1 | 0, tmp$] = toByte(value & 127 | 128);
      value = value >>> 7;
    }
    byteArrayList[i] = toByte(value & 127);
    var out = new Int8Array(i + 1 | 0);
    while (i >= 0) {
      out[i] = byteArrayList[i];
      i = i - 1 | 0;
    }
    return out;
  };
  ProtoBuf$Varint.prototype.encodeVarint_8e33dg$ = function (inp) {
    var tmp$;
    var value = inp;
    var byteArrayList = new Int8Array(10);
    var i = 0;
    while (!equals(value.and(L_128), L0)) {
      byteArrayList[tmp$ = i, i = tmp$ + 1 | 0, tmp$] = toByte(value.and(L127).or(L128).toInt());
      value = value.shiftRightUnsigned(7);
    }
    byteArrayList[i] = toByte(value.and(L127).toInt());
    var out = new Int8Array(i + 1 | 0);
    while (i >= 0) {
      out[i] = byteArrayList[i];
      i = i - 1 | 0;
    }
    return out;
  };
  ProtoBuf$Varint.prototype.decodeVarint_pwta7l$ = function (inp, bitLimit, eofOnStartAllowed) {
    if (bitLimit === void 0)
      bitLimit = 32;
    if (eofOnStartAllowed === void 0)
      eofOnStartAllowed = false;
    var result = L0;
    var shift = 0;
    var b;
    do {
      if (shift >= bitLimit) {
        throw new ProtobufDecodingException('Varint too long: exceeded ' + bitLimit + ' bits');
      }
      b = inp.read();
      if (b === -1) {
        if (eofOnStartAllowed && shift === 0)
          return L_1;
        else
          throw new IOException('Unexpected EOF');
      }
      result = result.or(Kotlin.Long.fromInt(b).and(L127).shiftLeft(shift));
      shift = shift + 7 | 0;
    }
     while ((b & 128) !== 0);
    return result;
  };
  ProtoBuf$Varint.prototype.decodeSignedVarintInt_wq5eom$ = function (inp) {
    var raw = this.decodeVarint_pwta7l$(inp, 32).toInt();
    var temp = (raw << 31 >> 31 ^ raw) >> 1;
    return temp ^ raw & -2147483648;
  };
  ProtoBuf$Varint.prototype.decodeSignedVarintLong_wq5eom$ = function (inp) {
    var raw = this.decodeVarint_pwta7l$(inp, 64);
    var temp = raw.shiftLeft(63).shiftRight(63).xor(raw).shiftRight(1);
    return temp.xor(raw.and(Long$Companion$MIN_VALUE));
  };
  ProtoBuf$Varint.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Varint',
    interfaces: []
  };
  var ProtoBuf$Varint_instance = null;
  function ProtoBuf$Varint_getInstance() {
    if (ProtoBuf$Varint_instance === null) {
      new ProtoBuf$Varint();
    }
    return ProtoBuf$Varint_instance;
  }
  function ProtoBuf$Companion() {
    ProtoBuf$Companion_instance = this;
    this.VARINT_0 = 0;
    this.i64_0 = 1;
    this.SIZE_DELIMITED_0 = 2;
    this.i32_0 = 5;
    this.plain = new ProtoBuf();
  }
  ProtoBuf$Companion.prototype.makeDelimited_0 = function (decoder, parentTag) {
    if (parentTag == null)
      return decoder;
    var bytes = decoder.nextObject();
    return new ProtoBuf$ProtobufDecoder(ByteArrayInputStream_init(bytes));
  };
  ProtoBuf$Companion.prototype.getProtoDesc_0 = function ($receiver, index) {
    return extractParameters($receiver, index);
  };
  ProtoBuf$Companion.prototype.dump_tf03ej$ = function (serializer, obj) {
    return this.plain.dump_tf03ej$(serializer, obj);
  };
  ProtoBuf$Companion.prototype.load_dntfbn$ = function (deserializer, bytes) {
    return this.plain.load_dntfbn$(deserializer, bytes);
  };
  ProtoBuf$Companion.prototype.install_7fck8k$ = function (module_0) {
    this.plain.install_7fck8k$(module_0);
  };
  Object.defineProperty(ProtoBuf$Companion.prototype, 'context', {
    get: function () {
      return this.plain.context;
    }
  });
  ProtoBuf$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: [BinaryFormat]
  };
  var ProtoBuf$Companion_instance = null;
  function ProtoBuf$Companion_getInstance() {
    if (ProtoBuf$Companion_instance === null) {
      new ProtoBuf$Companion();
    }
    return ProtoBuf$Companion_instance;
  }
  ProtoBuf.prototype.dump_tf03ej$ = function (serializer, obj) {
    var encoder = ByteArrayOutputStream_init();
    var dumper = new ProtoBuf$ProtobufWriter(this, new ProtoBuf$ProtobufEncoder(encoder));
    encode_0(dumper, serializer, obj);
    return encoder.toByteArray();
  };
  ProtoBuf.prototype.load_dntfbn$ = function (deserializer, bytes) {
    var stream = ByteArrayInputStream_init(bytes);
    var reader = new ProtoBuf$ProtobufReader(this, new ProtoBuf$ProtobufDecoder(stream));
    return decode_0(reader, deserializer);
  };
  ProtoBuf.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtoBuf',
    interfaces: [BinaryFormat, AbstractSerialFormat]
  };
  function ProtoNumberType(name, ordinal) {
    Enum.call(this);
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function ProtoNumberType_initFields() {
    ProtoNumberType_initFields = function () {
    };
    ProtoNumberType$DEFAULT_instance = new ProtoNumberType('DEFAULT', 0);
    ProtoNumberType$SIGNED_instance = new ProtoNumberType('SIGNED', 1);
    ProtoNumberType$FIXED_instance = new ProtoNumberType('FIXED', 2);
  }
  var ProtoNumberType$DEFAULT_instance;
  function ProtoNumberType$DEFAULT_getInstance() {
    ProtoNumberType_initFields();
    return ProtoNumberType$DEFAULT_instance;
  }
  var ProtoNumberType$SIGNED_instance;
  function ProtoNumberType$SIGNED_getInstance() {
    ProtoNumberType_initFields();
    return ProtoNumberType$SIGNED_instance;
  }
  var ProtoNumberType$FIXED_instance;
  function ProtoNumberType$FIXED_getInstance() {
    ProtoNumberType_initFields();
    return ProtoNumberType$FIXED_instance;
  }
  ProtoNumberType.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtoNumberType',
    interfaces: [Enum]
  };
  function ProtoNumberType$values() {
    return [ProtoNumberType$DEFAULT_getInstance(), ProtoNumberType$SIGNED_getInstance(), ProtoNumberType$FIXED_getInstance()];
  }
  ProtoNumberType.values = ProtoNumberType$values;
  function ProtoNumberType$valueOf(name) {
    switch (name) {
      case 'DEFAULT':
        return ProtoNumberType$DEFAULT_getInstance();
      case 'SIGNED':
        return ProtoNumberType$SIGNED_getInstance();
      case 'FIXED':
        return ProtoNumberType$FIXED_getInstance();
      default:throwISE('No enum constant kotlinx.serialization.protobuf.ProtoNumberType.' + name);
    }
  }
  ProtoNumberType.valueOf_61zpoe$ = ProtoNumberType$valueOf;
  function ProtoType(type) {
    this.type = type;
  }
  function ProtoType$Impl() {
  }
  ProtoType$Impl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Impl',
    interfaces: [ProtoType]
  };
  ProtoType.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtoType',
    interfaces: [Annotation]
  };
  function extractParameters(desc, index) {
    var tmp$, tmp$_0, tmp$_1;
    var idx = (tmp$ = getSerialId(desc, index)) != null ? tmp$ : index + 1 | 0;
    var $receiver = desc.getElementAnnotations_za3lpa$(index);
    var destination = ArrayList_init_0();
    var tmp$_2;
    tmp$_2 = $receiver.iterator();
    while (tmp$_2.hasNext()) {
      var element = tmp$_2.next();
      if (Kotlin.isType(element, ProtoType))
        destination.add_11rb$(element);
    }
    var format = (tmp$_1 = (tmp$_0 = onlySingleOrNull(destination)) != null ? tmp$_0.type : null) != null ? tmp$_1 : ProtoNumberType$DEFAULT_getInstance();
    return to(idx, format);
  }
  function ProtobufDecodingException(message) {
    SerializationException.call(this, message);
    this.name = 'ProtobufDecodingException';
  }
  ProtobufDecodingException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ProtobufDecodingException',
    interfaces: [SerializationException]
  };
  function ByteBuffer(capacity) {
    ByteBuffer$Companion_getInstance();
    this.capacity = capacity;
    if (!(this.capacity >= 0)) {
      var message = 'Failed requirement.';
      throw IllegalArgumentException_init(message.toString());
    }
    this.dw_0 = new DataView(new ArrayBuffer(this.capacity), 0, this.capacity);
    this.limit_62obw4$_0 = this.capacity;
    this.position_r0m5ac$_0 = 0;
    this.order = ByteOrder$BIG_ENDIAN_getInstance();
  }
  Object.defineProperty(ByteBuffer.prototype, 'limit', {
    get: function () {
      return this.limit_62obw4$_0;
    },
    set: function (value) {
      var tmp$;
      tmp$ = this.capacity;
      if (!(0 <= value && value <= tmp$)) {
        var message = 'Failed requirement.';
        throw IllegalArgumentException_init(message.toString());
      }
      this.limit_62obw4$_0 = value;
      if (this.position > value) {
        this.position = value;
      }
    }
  });
  Object.defineProperty(ByteBuffer.prototype, 'position', {
    get: function () {
      return this.position_r0m5ac$_0;
    },
    set: function (newPosition) {
      var tmp$;
      tmp$ = this.limit;
      if (!(0 <= newPosition && newPosition <= tmp$)) {
        var message = 'Failed requirement.';
        throw IllegalArgumentException_init(message.toString());
      }
      this.position_r0m5ac$_0 = newPosition;
    }
  });
  ByteBuffer.prototype.clear = function () {
    this.position = 0;
    this.limit = this.capacity;
    return this;
  };
  ByteBuffer.prototype.flip = function () {
    this.limit = this.position;
    this.position = 0;
    return this;
  };
  Object.defineProperty(ByteBuffer.prototype, 'hasRemaining', {
    get: function () {
      return this.position < this.limit;
    }
  });
  Object.defineProperty(ByteBuffer.prototype, 'remaining', {
    get: function () {
      return this.limit - this.position | 0;
    }
  });
  ByteBuffer.prototype.rewind = function () {
    this.position = 0;
    return this;
  };
  ByteBuffer.prototype.order_w2g0y3$ = function (order) {
    this.order = order;
    return this;
  };
  ByteBuffer.prototype.idx_0 = function (index, size) {
    var tmp$;
    if (index === -1) {
      this.position = this.position + size | 0;
      tmp$ = this.position - size | 0;
    }
     else
      tmp$ = index;
    var i = tmp$;
    if (i > this.limit)
      throw IllegalArgumentException_init_0();
    return i;
  };
  ByteBuffer.prototype.get = function () {
    return this.get_za3lpa$(-1);
  };
  ByteBuffer.prototype.get_za3lpa$ = function (index) {
    var i = this.idx_0(index, 1);
    return this.dw_0.getInt8(i);
  };
  ByteBuffer.prototype.get_mj6st8$ = function (dst, offset, cnt) {
    var pos = this.idx_0(-1, cnt);
    for (var i = 0; i < cnt; i++) {
      dst[offset + i | 0] = this.dw_0.getInt8(pos + i | 0);
    }
  };
  ByteBuffer.prototype.getChar = function () {
    return this.getChar_za3lpa$(-1);
  };
  ByteBuffer.prototype.getChar_za3lpa$ = function (index) {
    var i = this.idx_0(index, 2);
    return toBoxedChar(toChar(this.dw_0.getUint16(i, this.order === ByteOrder$LITTLE_ENDIAN_getInstance())));
  };
  ByteBuffer.prototype.getShort = function () {
    return this.getShort_za3lpa$(-1);
  };
  ByteBuffer.prototype.getShort_za3lpa$ = function (index) {
    var i = this.idx_0(index, 2);
    return this.dw_0.getInt16(i, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
  };
  ByteBuffer.prototype.getInt = function () {
    return this.getInt_za3lpa$(-1);
  };
  ByteBuffer.prototype.getInt_za3lpa$ = function (index) {
    var i = this.idx_0(index, 4);
    return this.dw_0.getInt32(i, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
  };
  ByteBuffer.prototype.getLong = function () {
    return this.getLong_za3lpa$(-1);
  };
  ByteBuffer.prototype.getLong_za3lpa$ = function (index) {
    var low;
    var high;
    var scndIdx = index === -1 ? -1 : index + 4 | 0;
    if (this.order === ByteOrder$LITTLE_ENDIAN_getInstance()) {
      low = this.getInt_za3lpa$(index);
      high = this.getInt_za3lpa$(scndIdx);
    }
     else {
      high = this.getInt_za3lpa$(index);
      low = this.getInt_za3lpa$(scndIdx);
    }
    return Kotlin.Long.fromInt(high).shiftLeft(32).or(Kotlin.Long.fromInt(low).and(L4294967295));
  };
  ByteBuffer.prototype.getFloat = function () {
    return this.getFloat_za3lpa$(-1);
  };
  ByteBuffer.prototype.getFloat_za3lpa$ = function (index) {
    var i = this.idx_0(index, 4);
    return this.dw_0.getFloat32(i, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
  };
  ByteBuffer.prototype.getDouble = function () {
    return this.getDouble_za3lpa$(-1);
  };
  ByteBuffer.prototype.getDouble_za3lpa$ = function (index) {
    var i = this.idx_0(index, 8);
    return this.dw_0.getFloat64(i, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
  };
  ByteBuffer.prototype.put_s8j3t7$ = function (value) {
    return this.put_pdp8qh$(value, -1);
  };
  ByteBuffer.prototype.put_pdp8qh$ = function (value, index) {
    var i = this.idx_0(index, 1);
    this.dw_0.setInt8(i, value);
    return this;
  };
  ByteBuffer.prototype.put_fqrh44$ = function (src) {
    return this.put_mj6st8$(src, 0, src.length);
  };
  ByteBuffer.prototype.put_mj6st8$ = function (src, offset, cnt) {
    var pos = this.idx_0(-1, cnt);
    for (var i = 0; i < cnt; i++) {
      this.dw_0.setInt8(pos + i | 0, src[offset + i | 0]);
    }
    return this;
  };
  ByteBuffer.prototype.putChar_s8itvh$ = function (value) {
    return this.putChar_s9u7hn$(value, -1);
  };
  ByteBuffer.prototype.putChar_s9u7hn$ = function (value, index) {
    var i = this.idx_0(index, 2);
    this.dw_0.setUint16(i, toShort(value | 0), this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
    return this;
  };
  ByteBuffer.prototype.putShort_mq22fl$ = function (value) {
    return this.putShort_vmjj7j$(value, -1);
  };
  ByteBuffer.prototype.putShort_vmjj7j$ = function (value, index) {
    var i = this.idx_0(index, 2);
    this.dw_0.setInt16(i, value, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
    return this;
  };
  ByteBuffer.prototype.putInt_za3lpa$ = function (value) {
    return this.putInt_vux9f0$(value, -1);
  };
  ByteBuffer.prototype.putInt_vux9f0$ = function (value, index) {
    var i = this.idx_0(index, 4);
    this.dw_0.setInt32(i, value, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
    return this;
  };
  ByteBuffer.prototype.putLong_s8cxhz$ = function (value) {
    return this.putLong_yhmem3$(value, -1);
  };
  ByteBuffer.prototype.putLong_yhmem3$ = function (value, index) {
    var high = value.shiftRight(32).toInt();
    var low = value.and(L4294967295).toInt();
    var scndIdx = index === -1 ? -1 : index + 4 | 0;
    if (this.order === ByteOrder$LITTLE_ENDIAN_getInstance()) {
      this.putInt_vux9f0$(low, index);
      this.putInt_vux9f0$(high, scndIdx);
    }
     else {
      this.putInt_vux9f0$(high, index);
      this.putInt_vux9f0$(low, scndIdx);
    }
    return this;
  };
  ByteBuffer.prototype.putFloat_mx4ult$ = function (value) {
    return this.putFloat_vjorfl$(value, -1);
  };
  ByteBuffer.prototype.putFloat_vjorfl$ = function (value, index) {
    var i = this.idx_0(index, 4);
    this.dw_0.setFloat32(i, value, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
    return this;
  };
  ByteBuffer.prototype.putDouble_14dthe$ = function (value) {
    return this.putDouble_12fank$(value, -1);
  };
  ByteBuffer.prototype.putDouble_12fank$ = function (value, index) {
    var i = this.idx_0(index, 8);
    this.dw_0.setFloat64(i, value, this.order === ByteOrder$LITTLE_ENDIAN_getInstance());
    return this;
  };
  ByteBuffer.prototype.array = function () {
    var tmp$;
    var out = new Int8Array(this.limit);
    tmp$ = this.limit;
    for (var i = 0; i < tmp$; i++) {
      out[i] = this.dw_0.getInt8(i);
    }
    return out;
  };
  function ByteBuffer$Companion() {
    ByteBuffer$Companion_instance = this;
  }
  ByteBuffer$Companion.prototype.allocate_za3lpa$ = function (capacity) {
    return new ByteBuffer(capacity);
  };
  ByteBuffer$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var ByteBuffer$Companion_instance = null;
  function ByteBuffer$Companion_getInstance() {
    if (ByteBuffer$Companion_instance === null) {
      new ByteBuffer$Companion();
    }
    return ByteBuffer$Companion_instance;
  }
  ByteBuffer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ByteBuffer',
    interfaces: []
  };
  function IOException(message) {
    Exception_init(message, this);
    this.name = 'IOException';
  }
  IOException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'IOException',
    interfaces: [Exception]
  };
  function IOException_init($this) {
    $this = $this || Object.create(IOException.prototype);
    IOException.call($this, 'IO Exception');
    return $this;
  }
  function InputStream() {
    InputStream$Companion_getInstance();
  }
  InputStream.prototype.available = function () {
    return 0;
  };
  InputStream.prototype.close = function () {
  };
  InputStream.prototype.read_fqrh44$ = function (b) {
    return this.read_mj6st8$(b, 0, b.length);
  };
  InputStream.prototype.read_mj6st8$ = function (b, offset, len) {
    var tmp$;
    if (offset > b.length || offset < 0) {
      throw IndexOutOfBoundsException_init();
    }
    if (len < 0 || len > (b.length - offset | 0)) {
      throw IndexOutOfBoundsException_init();
    }
    tmp$ = len - 1 | 0;
    for (var i = 0; i <= tmp$; i++) {
      var c;
      try {
        c = this.read();
        if (c === -1) {
          return i === 0 ? -1 : i;
        }
      }
       catch (e) {
        if (Kotlin.isType(e, IOException)) {
          if (i !== 0) {
            return i;
          }
          throw e;
        }
         else
          throw e;
      }
      b[offset + i | 0] = toByte(c);
    }
    return len;
  };
  InputStream.prototype.skip_s8cxhz$ = function (n) {
    if (n.toNumber() <= 0) {
      return L0;
    }
    var skipped = L0;
    var toRead = n.toNumber() < 4096 ? n.toInt() : 4096;
    var localBuf = InputStream$Companion_getInstance().skipBuf_0;
    if (localBuf == null || localBuf.length < toRead) {
      localBuf = new Int8Array(toRead);
      InputStream$Companion_getInstance().skipBuf_0 = localBuf;
    }
    while (skipped.compareTo_11rb$(n) < 0) {
      var read = this.read_mj6st8$(localBuf, 0, toRead);
      if (read === -1) {
        return skipped;
      }
      skipped = skipped.add(Kotlin.Long.fromInt(read));
      if (read < toRead) {
        return skipped;
      }
      if (n.subtract(skipped).toNumber() < toRead) {
        toRead = n.subtract(skipped).toInt();
      }
    }
    return skipped;
  };
  function InputStream$Companion() {
    InputStream$Companion_instance = this;
    this.skipBuf_0 = null;
  }
  InputStream$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var InputStream$Companion_instance = null;
  function InputStream$Companion_getInstance() {
    if (InputStream$Companion_instance === null) {
      new InputStream$Companion();
    }
    return InputStream$Companion_instance;
  }
  InputStream.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'InputStream',
    interfaces: []
  };
  function ByteArrayInputStream() {
    this.buf_0 = null;
    this.pos_0 = 0;
    this.mark_0 = 0;
    this.count_0 = 0;
  }
  ByteArrayInputStream.prototype.available = function () {
    return this.count_0 - this.pos_0 | 0;
  };
  ByteArrayInputStream.prototype.read = function () {
    var tmp$, tmp$_0;
    if (this.pos_0 < this.count_0) {
      tmp$_0 = this.buf_0[tmp$ = this.pos_0, this.pos_0 = tmp$ + 1 | 0, tmp$] & 255;
    }
     else
      tmp$_0 = -1;
    return tmp$_0;
  };
  ByteArrayInputStream.prototype.read_nzv2aj$ = function (b, offset, len) {
    if (b == null) {
      throw NullPointerException_init();
    }
    if (offset < 0 || offset > b.length || len < 0 || len > (b.length - offset | 0)) {
      throw IndexOutOfBoundsException_init();
    }
    if (this.pos_0 >= this.count_0) {
      return -1;
    }
    if (len === 0) {
      return 0;
    }
    var copylen = (this.count_0 - this.pos_0 | 0) < len ? this.count_0 - this.pos_0 | 0 : len;
    arraycopy(this.buf_0, this.pos_0, b, offset, copylen);
    this.pos_0 = this.pos_0 + copylen | 0;
    return copylen;
  };
  ByteArrayInputStream.prototype.skip_s8cxhz$ = function (n) {
    if (n.toNumber() <= 0) {
      return L0;
    }
    var temp = this.pos_0;
    this.pos_0 = (this.count_0 - this.pos_0 | 0) < n.toNumber() ? this.count_0 : Kotlin.Long.fromInt(this.pos_0).add(n).toInt();
    return Kotlin.Long.fromInt(this.pos_0 - temp | 0);
  };
  ByteArrayInputStream.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ByteArrayInputStream',
    interfaces: [InputStream]
  };
  function ByteArrayInputStream_init(buf, $this) {
    $this = $this || Object.create(ByteArrayInputStream.prototype);
    InputStream.call($this);
    ByteArrayInputStream.call($this);
    $this.mark_0 = 0;
    $this.buf_0 = buf;
    $this.count_0 = buf.length;
    return $this;
  }
  function ByteArrayInputStream_init_0(buf, offset, length, $this) {
    $this = $this || Object.create(ByteArrayInputStream.prototype);
    InputStream.call($this);
    ByteArrayInputStream.call($this);
    $this.buf_0 = buf;
    $this.pos_0 = offset;
    $this.mark_0 = offset;
    $this.count_0 = (offset + length | 0) > buf.length ? buf.length : offset + length | 0;
    return $this;
  }
  function OutputStream() {
  }
  OutputStream.prototype.close = function () {
  };
  OutputStream.prototype.flush = function () {
  };
  OutputStream.prototype.write_fqrh44$ = function (buffer) {
    this.write_mj6st8$(buffer, 0, buffer.length);
  };
  OutputStream.prototype.write_mj6st8$ = function (buffer, offset, count) {
    var tmp$;
    if (offset > buffer.length || offset < 0 || count < 0 || count > (buffer.length - offset | 0)) {
      throw IndexOutOfBoundsException_init();
    }
    tmp$ = offset + count - 1 | 0;
    for (var i = offset; i <= tmp$; i++) {
      this.write_za3lpa$(buffer[i]);
    }
  };
  OutputStream.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'OutputStream',
    interfaces: []
  };
  function ByteArrayOutputStream() {
    this.buf_0 = null;
    this.count_0 = 0;
  }
  ByteArrayOutputStream.prototype.expand_0 = function (i) {
    if ((this.count_0 + i | 0) <= this.buf_0.length) {
      return;
    }
    var newbuf = new Int8Array((this.count_0 + i | 0) * 2 | 0);
    arraycopy(this.buf_0, 0, newbuf, 0, this.count_0);
    this.buf_0 = newbuf;
  };
  ByteArrayOutputStream.prototype.size = function () {
    return this.count_0;
  };
  ByteArrayOutputStream.prototype.toByteArray = function () {
    var newArray = new Int8Array(this.count_0);
    arraycopy(this.buf_0, 0, newArray, 0, this.count_0);
    return newArray;
  };
  ByteArrayOutputStream.prototype.write_mj6st8$ = function (buffer, offset, count) {
    if (offset < 0 || offset > buffer.length || count < 0 || count > (buffer.length - offset | 0)) {
      throw IndexOutOfBoundsException_init();
    }
    if (count === 0) {
      return;
    }
    this.expand_0(count);
    arraycopy(buffer, offset, this.buf_0, this.count_0, count);
    this.count_0 = this.count_0 + count | 0;
  };
  ByteArrayOutputStream.prototype.write_za3lpa$ = function (oneByte) {
    var tmp$;
    if (this.count_0 === this.buf_0.length) {
      this.expand_0(1);
    }
    this.buf_0[tmp$ = this.count_0, this.count_0 = tmp$ + 1 | 0, tmp$] = toByte(oneByte);
  };
  ByteArrayOutputStream.prototype.writeTo_tkhtou$ = function (out) {
    out.write_mj6st8$(this.buf_0, 0, this.count_0);
  };
  ByteArrayOutputStream.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ByteArrayOutputStream',
    interfaces: [OutputStream]
  };
  function ByteArrayOutputStream_init($this) {
    $this = $this || Object.create(ByteArrayOutputStream.prototype);
    OutputStream.call($this);
    ByteArrayOutputStream.call($this);
    $this.buf_0 = new Int8Array(32);
    return $this;
  }
  function ByteArrayOutputStream_init_0(size, $this) {
    $this = $this || Object.create(ByteArrayOutputStream.prototype);
    OutputStream.call($this);
    ByteArrayOutputStream.call($this);
    if (size >= 0) {
      $this.buf_0 = new Int8Array(size);
    }
     else {
      throw IllegalArgumentException_init_0();
    }
    return $this;
  }
  function arraycopy(src, srcPos, dst, dstPos, len) {
    var tmp$;
    tmp$ = len - 1 | 0;
    for (var i = 0; i <= tmp$; i++) {
      dst[dstPos + i | 0] = src[srcPos + i | 0];
    }
  }
  function Writer() {
  }
  Writer.prototype.write_za3lpa$ = function (ch) {
    this.write_8chfmy$(Kotlin.charArrayOf(toChar(ch)), 0, 1);
  };
  Writer.prototype.write_61zpoe$ = function (str) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2;
    var buf = Kotlin.charArray(str.length);
    tmp$ = get_indices_0(str);
    tmp$_0 = tmp$.first;
    tmp$_1 = tmp$.last;
    tmp$_2 = tmp$.step;
    for (var i = tmp$_0; i <= tmp$_1; i += tmp$_2)
      buf[i] = str.charCodeAt(i);
    this.write_8chfmy$(buf, 0, buf.length);
  };
  Writer.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Writer',
    interfaces: []
  };
  function PrintWriter(w) {
    Writer.call(this);
    this.w = w;
  }
  PrintWriter.prototype.print_61zpoe$ = function (s) {
    this.w.write_61zpoe$(s);
  };
  PrintWriter.prototype.print_s8itvh$ = function (ch) {
    this.w.write_za3lpa$(ch | 0);
  };
  PrintWriter.prototype.print_mx4ult$ = function (value) {
    this.print_61zpoe$(value.toString());
  };
  PrintWriter.prototype.print_14dthe$ = function (value) {
    this.print_61zpoe$(value.toString());
  };
  PrintWriter.prototype.print_6taknv$ = function (value) {
    this.print_61zpoe$(value.toString());
  };
  PrintWriter.prototype.print_za3lpa$ = function (value) {
    this.print_61zpoe$(value.toString());
  };
  PrintWriter.prototype.print_s8cxhz$ = function (value) {
    this.print_61zpoe$(value.toString());
  };
  PrintWriter.prototype.print_s8jyv4$ = function (value) {
    this.print_61zpoe$(toString(value));
  };
  PrintWriter.prototype.println = function () {
    this.w.write_za3lpa$(10);
  };
  PrintWriter.prototype.println_61zpoe$ = function (s) {
    this.w.write_61zpoe$(s);
    this.println();
  };
  PrintWriter.prototype.println_s8itvh$ = function (ch) {
    this.w.write_za3lpa$(ch | 0);
    this.println();
  };
  PrintWriter.prototype.println_mx4ult$ = function (value) {
    this.println_61zpoe$(value.toString());
  };
  PrintWriter.prototype.println_14dthe$ = function (value) {
    this.println_61zpoe$(value.toString());
  };
  PrintWriter.prototype.println_6taknv$ = function (value) {
    this.println_61zpoe$(value.toString());
  };
  PrintWriter.prototype.println_za3lpa$ = function (value) {
    this.println_61zpoe$(value.toString());
  };
  PrintWriter.prototype.println_s8cxhz$ = function (value) {
    this.println_61zpoe$(value.toString());
  };
  PrintWriter.prototype.println_s8jyv4$ = function (value) {
    this.println_61zpoe$(toString(value));
  };
  PrintWriter.prototype.write_8chfmy$ = function (src, off, len) {
    this.w.write_8chfmy$(src, off, len);
  };
  PrintWriter.prototype.flush = function () {
  };
  PrintWriter.prototype.close = function () {
  };
  PrintWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PrintWriter',
    interfaces: [Writer]
  };
  function StringWriter() {
    Writer.call(this);
    this.sb_0 = StringBuilder_init_0();
  }
  StringWriter.prototype.toString = function () {
    return this.sb_0.toString();
  };
  StringWriter.prototype.write_8chfmy$ = function (src, off, len) {
    var tmp$;
    tmp$ = slice(src, until(off, off + len | 0)).iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      this.sb_0.append_s8itvh$(unboxChar(element));
    }
  };
  StringWriter.prototype.flush = function () {
  };
  StringWriter.prototype.close = function () {
  };
  StringWriter.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StringWriter',
    interfaces: [Writer]
  };
  function Reader() {
  }
  Reader.prototype.read = function () {
    var a = Kotlin.charArray(1);
    if (this.read_8chfmy$(a, 0, 1) < 1)
      return -1;
    return a[0] | 0;
  };
  Reader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Reader',
    interfaces: []
  };
  function StringReader(str) {
    Reader.call(this);
    this.str = str;
    this.position_0 = 0;
  }
  StringReader.prototype.read = function () {
    var tmp$;
    if (this.position_0 === this.str.length)
      return -1;
    else {
      return this.str.charCodeAt((tmp$ = this.position_0, this.position_0 = tmp$ + 1 | 0, tmp$)) | 0;
    }
  };
  StringReader.prototype.read_8chfmy$ = function (dst, off, len) {
    var tmp$;
    var cnt = 0;
    tmp$ = off + len | 0;
    for (var i = off; i < tmp$; i++) {
      var r = this.read();
      if (r === -1)
        return cnt;
      cnt = cnt + 1 | 0;
      dst[i] = toChar(r);
    }
    return len;
  };
  StringReader.prototype.close = function () {
  };
  StringReader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StringReader',
    interfaces: [Reader]
  };
  var MAX_SAFE_INTEGER;
  function DynamicObjectParser() {
    AbstractSerialFormat.call(this);
  }
  DynamicObjectParser.prototype.parse_pgxeca$ = defineInlineFunction('kotlinx-serialization-runtime-js.kotlinx.serialization.DynamicObjectParser.parse_pgxeca$', wrapFunction(function () {
    var getKClass = Kotlin.getKClass;
    var getOrDefault = _.kotlinx.serialization.context.getOrDefault_6qy6ah$;
    return function (T_0, isT, obj) {
      return this.parse_tf9272$(obj, getOrDefault(this.context, getKClass(T_0)));
    };
  }));
  DynamicObjectParser.prototype.parse_tf9272$ = function (obj, deserializer) {
    return decode_0(new DynamicObjectParser$DynamicInput(this, obj), deserializer);
  };
  function DynamicObjectParser$DynamicInput($outer, obj) {
    this.$outer = $outer;
    NamedValueDecoder.call(this);
    this.obj = obj;
    this.context = this.$outer.context;
    this.pos_0 = 0;
  }
  DynamicObjectParser$DynamicInput.prototype.composeName_puj7f4$ = function (parentName, childName) {
    return childName;
  };
  DynamicObjectParser$DynamicInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    var tmp$;
    while (this.pos_0 < desc.elementsCount) {
      var name = this.getTag_m47q6f$(desc, (tmp$ = this.pos_0, this.pos_0 = tmp$ + 1 | 0, tmp$));
      if (this.obj[name] !== undefined)
        return this.pos_0 - 1 | 0;
    }
    return -1;
  };
  DynamicObjectParser$DynamicInput.prototype.decodeTaggedEnum_wc8hrb$ = function (tag, enumDescription) {
    var tmp$;
    return enumDescription.getElementIndex_61zpoe$(typeof (tmp$ = this.getByTag_61zpoe$(tag)) === 'string' ? tmp$ : throwCCE());
  };
  DynamicObjectParser$DynamicInput.prototype.getByTag_61zpoe$ = function (tag) {
    return this.obj[tag];
  };
  DynamicObjectParser$DynamicInput.prototype.decodeTaggedChar_11rb$ = function (tag) {
    var tmp$;
    var o = this.getByTag_61zpoe$(tag);
    if (typeof o === 'string')
      if (o.length === 1)
        tmp$ = o.charCodeAt(0);
      else
        throw new SerializationException(o.toString() + " can't be represented as Char");
    else if (Kotlin.isNumber(o))
      tmp$ = numberToChar(o);
    else
      throw new SerializationException(o.toString() + " can't be represented as Char");
    return toBoxedChar(tmp$);
  };
  var Math_0 = Math;
  DynamicObjectParser$DynamicInput.prototype.decodeTaggedLong_11rb$ = function (tag) {
    var tmp$, tmp$_0;
    var obj = this.getByTag_61zpoe$(tag);
    tmp$_0 = typeof (tmp$ = obj) === 'number' ? tmp$ : null;
    if (tmp$_0 == null) {
      throw new SerializationException(obj.toString() + ' is not a Number');
    }
    var number = tmp$_0;
    var tmp$_1 = isFinite_0(number);
    if (tmp$_1) {
      tmp$_1 = Math_0.floor(number) === number;
    }
    var canBeConverted = tmp$_1;
    if (!canBeConverted)
      throw new SerializationException(number.toString() + " can't be represented as Long because it is not finite or has non-zero fractional part");
    var inBound = Math_0.abs(number) <= MAX_SAFE_INTEGER;
    if (!inBound)
      throw new SerializationException(number.toString() + " can't be deserialized to Long due to a potential precision loss");
    return Kotlin.Long.fromNumber(number);
  };
  DynamicObjectParser$DynamicInput.prototype.decodeTaggedValue_11rb$ = function (tag) {
    var tmp$;
    tmp$ = this.getByTag_61zpoe$(tag);
    if (tmp$ == null) {
      throw new MissingFieldException(tag);
    }
    var o = tmp$;
    return o;
  };
  DynamicObjectParser$DynamicInput.prototype.decodeTaggedNotNullMark_11rb$ = function (tag) {
    var o = this.getByTag_61zpoe$(tag);
    if (o === undefined)
      throw new MissingFieldException(tag);
    return o != null;
  };
  DynamicObjectParser$DynamicInput.prototype.beginStructure_r0sa6z$ = function (desc, typeParams) {
    var tmp$, tmp$_0, tmp$_1, tmp$_2;
    var curObj = (tmp$_0 = (tmp$ = this.currentTagOrNull) != null ? this.obj[tmp$] : null) != null ? tmp$_0 : this.obj;
    tmp$_1 = desc.kind;
    if (equals(tmp$_1, StructureKind$LIST_getInstance()))
      tmp$_2 = new DynamicObjectParser$DynamicListInput(this.$outer, curObj);
    else if (equals(tmp$_1, StructureKind$MAP_getInstance()))
      tmp$_2 = new DynamicObjectParser$DynamicMapInput(this.$outer, curObj);
    else
      tmp$_2 = new DynamicObjectParser$DynamicInput(this.$outer, curObj);
    return tmp$_2;
  };
  DynamicObjectParser$DynamicInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicInput',
    interfaces: [NamedValueDecoder]
  };
  function DynamicObjectParser$DynamicMapInput($outer, obj) {
    this.$outer = $outer;
    DynamicObjectParser$DynamicInput.call(this, this.$outer, obj);
    this.context = this.$outer.context;
    this.keys_0 = Object.keys(obj);
    var tmp$;
    this.size_0 = (typeof (tmp$ = this.keys_0.length) === 'number' ? tmp$ : throwCCE()) * 2 | 0;
    this.pos_1 = -1;
  }
  DynamicObjectParser$DynamicMapInput.prototype.elementName_3zr2iy$ = function (desc, index) {
    var tmp$;
    var i = index / 2 | 0;
    return typeof (tmp$ = this.keys_0[i]) === 'string' ? tmp$ : throwCCE();
  };
  DynamicObjectParser$DynamicMapInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    var tmp$, tmp$_0;
    while (this.pos_1 < (this.size_0 - 1 | 0)) {
      var i = (tmp$ = this.pos_1, this.pos_1 = tmp$ + 1 | 0, tmp$) / 2 | 0;
      var name = typeof (tmp$_0 = this.keys_0[i]) === 'string' ? tmp$_0 : throwCCE();
      if (this.obj[name] !== undefined)
        return this.pos_1;
    }
    return -1;
  };
  DynamicObjectParser$DynamicMapInput.prototype.getByTag_61zpoe$ = function (tag) {
    return this.pos_1 % 2 === 0 ? tag : this.obj[tag];
  };
  DynamicObjectParser$DynamicMapInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicMapInput',
    interfaces: [DynamicObjectParser$DynamicInput]
  };
  function DynamicObjectParser$DynamicListInput($outer, obj) {
    this.$outer = $outer;
    DynamicObjectParser$DynamicInput.call(this, this.$outer, obj);
    this.context = this.$outer.context;
    var tmp$;
    this.size_0 = typeof (tmp$ = obj.length) === 'number' ? tmp$ : throwCCE();
    this.pos_1 = -1;
  }
  DynamicObjectParser$DynamicListInput.prototype.elementName_3zr2iy$ = function (desc, index) {
    return index.toString();
  };
  DynamicObjectParser$DynamicListInput.prototype.decodeElementIndex_qatsm0$ = function (desc) {
    while (this.pos_1 < (this.size_0 - 1 | 0)) {
      var o = this.obj[this.pos_1 = this.pos_1 + 1 | 0, this.pos_1];
      if (o !== undefined)
        return this.pos_1;
    }
    return -1;
  };
  DynamicObjectParser$DynamicListInput.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicListInput',
    interfaces: [DynamicObjectParser$DynamicInput]
  };
  DynamicObjectParser.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicObjectParser',
    interfaces: [AbstractSerialFormat]
  };
  function compiledSerializer($receiver) {
    var tmp$, tmp$_0;
    return Kotlin.isType(tmp$_0 = (tmp$ = get_js($receiver).Companion) != null ? tmp$.serializer() : null, KSerializer) ? tmp$_0 : null;
  }
  function toUtf8Bytes($receiver) {
    var tmp$;
    var s = $receiver;
    var block = unescape(encodeURIComponent(s));
    var $receiver_0 = toList_0(typeof (tmp$ = block) === 'string' ? tmp$ : throwCCE());
    var destination = ArrayList_init_1(collectionSizeOrDefault($receiver_0, 10));
    var tmp$_0;
    tmp$_0 = $receiver_0.iterator();
    while (tmp$_0.hasNext()) {
      var item = tmp$_0.next();
      destination.add_11rb$(toByte(unboxChar(item) | 0));
    }
    return toByteArray(destination);
  }
  function stringFromUtf8Bytes(bytes) {
    var tmp$;
    var destination = ArrayList_init_1(bytes.length);
    var tmp$_0;
    for (tmp$_0 = 0; tmp$_0 !== bytes.length; ++tmp$_0) {
      var item = bytes[tmp$_0];
      destination.add_11rb$(toBoxedChar(toChar(item & 255)));
    }
    var s = joinToString(destination, '');
    var ans = decodeURIComponent(escape(s));
    return typeof (tmp$ = ans) === 'string' ? tmp$ : throwCCE();
  }
  function enumFromName(enumClass, value) {
    var tmp$;
    return Kotlin.isType(tmp$ = get_js(enumClass).valueOf_61zpoe$(value), Enum) ? tmp$ : throwCCE();
  }
  function enumFromOrdinal(enumClass, ordinal) {
    var tmp$;
    return (Kotlin.isArray(tmp$ = get_js(enumClass).values()) ? tmp$ : throwCCE())[ordinal];
  }
  function enumClassName($receiver) {
    return get_js($receiver).name;
  }
  function enumMembers($receiver) {
    var tmp$;
    return Kotlin.isArray(tmp$ = get_js($receiver).values()) ? tmp$ : throwCCE();
  }
  function toNativeArray($receiver, eClass) {
    return copyToArray($receiver);
  }
  Object.defineProperty(ByteOrder, 'LITTLE_ENDIAN', {
    get: ByteOrder$LITTLE_ENDIAN_getInstance
  });
  Object.defineProperty(ByteOrder, 'BIG_ENDIAN', {
    get: ByteOrder$BIG_ENDIAN_getInstance
  });
  var package$kotlinx = _.kotlinx || (_.kotlinx = {});
  var package$io = package$kotlinx.io || (package$kotlinx.io = {});
  package$io.ByteOrder = ByteOrder;
  var package$serialization = package$kotlinx.serialization || (package$kotlinx.serialization = {});
  package$serialization.Serializable = Serializable;
  package$serialization.Serializer = Serializer;
  package$serialization.SerialName = SerialName;
  package$serialization.Optional = Optional;
  package$serialization.Transient = Transient;
  package$serialization.SerialInfo = SerialInfo;
  package$serialization.ContextualSerialization = ContextualSerialization;
  package$serialization.UseSerializers = UseSerializers;
  package$serialization.Polymorphic = Polymorphic;
  package$serialization.Encoder = Encoder;
  package$serialization.CompositeEncoder = CompositeEncoder;
  package$serialization.Decoder = Decoder;
  Object.defineProperty(CompositeDecoder, 'Companion', {
    get: CompositeDecoder$Companion_getInstance
  });
  package$serialization.CompositeDecoder = CompositeDecoder;
  package$serialization.ContextSerializer = ContextSerializer;
  package$serialization.SerialDescriptor = SerialDescriptor;
  package$serialization.SerializationStrategy = SerializationStrategy;
  package$serialization.DeserializationStrategy = DeserializationStrategy;
  Object.defineProperty(UpdateMode, 'BANNED', {
    get: UpdateMode$BANNED_getInstance
  });
  Object.defineProperty(UpdateMode, 'OVERWRITE', {
    get: UpdateMode$OVERWRITE_getInstance
  });
  Object.defineProperty(UpdateMode, 'UPDATE', {
    get: UpdateMode$UPDATE_getInstance
  });
  package$serialization.UpdateMode = UpdateMode;
  package$serialization.KSerializer = KSerializer;
  package$serialization.SerializationConstructorMarker = SerializationConstructorMarker;
  package$serialization.serializer_1yb8b7$ = serializer;
  package$serialization.encode_dt3ugd$ = encode_0;
  package$serialization.encodeNullable_amaygg$ = encodeNullable;
  package$serialization.decode_cmswi7$ = decode_0;
  package$serialization.decodeNullable_8c9eia$ = decodeNullable;
  Object.defineProperty(package$serialization, 'deprecationText_8be2vx$', {
    get: function () {
      return deprecationText;
    }
  });
  package$serialization.SerialKind = SerialKind;
  Object.defineProperty(PrimitiveKind, 'INT', {
    get: PrimitiveKind$INT_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'UNIT', {
    get: PrimitiveKind$UNIT_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'BOOLEAN', {
    get: PrimitiveKind$BOOLEAN_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'BYTE', {
    get: PrimitiveKind$BYTE_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'SHORT', {
    get: PrimitiveKind$SHORT_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'LONG', {
    get: PrimitiveKind$LONG_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'FLOAT', {
    get: PrimitiveKind$FLOAT_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'DOUBLE', {
    get: PrimitiveKind$DOUBLE_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'CHAR', {
    get: PrimitiveKind$CHAR_getInstance
  });
  Object.defineProperty(PrimitiveKind, 'STRING', {
    get: PrimitiveKind$STRING_getInstance
  });
  package$serialization.PrimitiveKind = PrimitiveKind;
  Object.defineProperty(StructureKind, 'CLASS', {
    get: StructureKind$CLASS_getInstance
  });
  Object.defineProperty(StructureKind, 'LIST', {
    get: StructureKind$LIST_getInstance
  });
  Object.defineProperty(StructureKind, 'MAP', {
    get: StructureKind$MAP_getInstance
  });
  package$serialization.StructureKind = StructureKind;
  Object.defineProperty(UnionKind, 'OBJECT', {
    get: UnionKind$OBJECT_getInstance
  });
  Object.defineProperty(UnionKind, 'ENUM_KIND', {
    get: UnionKind$ENUM_KIND_getInstance
  });
  Object.defineProperty(UnionKind, 'SEALED', {
    get: UnionKind$SEALED_getInstance
  });
  Object.defineProperty(UnionKind, 'POLYMORPHIC', {
    get: UnionKind$POLYMORPHIC_getInstance
  });
  package$serialization.UnionKind = UnionKind;
  package$serialization.PrimitiveDescriptorWithName = PrimitiveDescriptorWithName;
  package$serialization.withName_8new1j$ = withName;
  package$serialization.ElementValueEncoder = ElementValueEncoder;
  package$serialization.ElementValueDecoder = ElementValueDecoder;
  package$serialization.SerializationException = SerializationException;
  package$serialization.MissingFieldException = MissingFieldException;
  package$serialization.UnknownFieldException = UnknownFieldException;
  package$serialization.UpdateNotSupportedException = UpdateNotSupportedException;
  Mapper.OutMapper = Mapper$OutMapper;
  Mapper.OutNullableMapper = Mapper$OutNullableMapper;
  Mapper.InMapper = Mapper$InMapper;
  Mapper.InNullableMapper = Mapper$InNullableMapper;
  var package$context = package$serialization.context || (package$serialization.context = {});
  package$context.getOrDefault_6qy6ah$ = getOrDefault;
  $$importsForInline$$['kotlinx-serialization-runtime-js'] = _;
  Object.defineProperty(Mapper, 'Companion', {
    get: Mapper$Companion_getInstance
  });
  package$serialization.Mapper = Mapper;
  package$serialization.SerialFormat = SerialFormat;
  package$serialization.AbstractSerialFormat = AbstractSerialFormat;
  package$serialization.BinaryFormat = BinaryFormat;
  package$serialization.dumps_4yxkwp$ = dumps;
  package$serialization.loads_f786sb$ = loads;
  package$serialization.StringFormat = StringFormat;
  package$serialization.ImplicitReflectionSerializer = ImplicitReflectionSerializer;
  var package$internal = package$serialization.internal || (package$serialization.internal = {});
  package$serialization.get_list_gekvwj$ = get_list;
  package$serialization.get_map_kgqhr1$ = get_map;
  package$serialization.get_set_gekvwj$ = get_set;
  package$serialization.serializer_6eet4j$ = serializer_0;
  package$serialization.serializer_n24eoe$ = serializer_1;
  package$serialization.serializer_k5zfx8$ = serializer_2;
  package$serialization.serializer_qetqea$ = serializer_3;
  package$serialization.serializer_qn7glr$ = serializer_4;
  package$serialization.serializer_vbrujs$ = serializer_5;
  package$serialization.serializer_y9phqa$ = serializer_6;
  package$serialization.serializer_6a53gt$ = serializer_7;
  package$serialization.serializer_jtjczu$ = serializer_8;
  package$serialization.elementDescriptors_xzf193$ = elementDescriptors;
  package$serialization.getElementIndexOrThrow_27vawp$ = getElementIndexOrThrow;
  package$serialization.get_associatedFieldsCount_xzf193$ = get_associatedFieldsCount;
  SerialId.Impl = SerialId$Impl;
  package$serialization.SerialId = SerialId;
  SerialTag.Impl = SerialTag$Impl;
  package$serialization.SerialTag = SerialTag;
  package$serialization.TaggedEncoder = TaggedEncoder;
  package$serialization.IntTaggedEncoder = IntTaggedEncoder;
  package$serialization.NamedValueEncoder = NamedValueEncoder;
  package$serialization.getSerialId_3zr2iy$ = getSerialId;
  package$serialization.getSerialTag_3zr2iy$ = getSerialTag;
  package$serialization.TaggedDecoder = TaggedDecoder;
  package$serialization.IntTaggedDecoder = IntTaggedDecoder;
  package$serialization.StringTaggedDecoder = StringTaggedDecoder;
  package$serialization.NamedValueDecoder = NamedValueDecoder;
  Cbor.CborEncoder = Cbor$CborEncoder;
  Cbor.CborDecoder = Cbor$CborDecoder;
  Object.defineProperty(Cbor, 'Companion', {
    get: Cbor$Companion_getInstance
  });
  var package$cbor = package$serialization.cbor || (package$serialization.cbor = {});
  package$cbor.Cbor = Cbor;
  package$cbor.CborDecodingException = CborDecodingException;
  package$context.SerialContext = SerialContext;
  package$context.MutableSerialContext = MutableSerialContext;
  package$context.MutableSerialContextImpl = MutableSerialContextImpl;
  package$context.getByValueOrDefault_dn4niu$ = getByValueOrDefault;
  Object.defineProperty(package$context, 'EmptyContext', {
    get: EmptyContext_getInstance
  });
  package$context.SerialModule = SerialModule;
  package$context.SimpleModule = SimpleModule;
  package$context.MapModule = MapModule;
  package$context.CompositeModule = CompositeModule;
  package$internal.ListLikeDescriptor = ListLikeDescriptor;
  package$internal.MapLikeDescriptor = MapLikeDescriptor;
  Object.defineProperty(package$internal, 'ARRAY_NAME_8be2vx$', {
    get: function () {
      return ARRAY_NAME;
    }
  });
  Object.defineProperty(package$internal, 'ARRAY_LIST_NAME_8be2vx$', {
    get: function () {
      return ARRAY_LIST_NAME;
    }
  });
  Object.defineProperty(package$internal, 'LINKED_HASH_SET_NAME_8be2vx$', {
    get: function () {
      return LINKED_HASH_SET_NAME;
    }
  });
  Object.defineProperty(package$internal, 'HASH_SET_NAME_8be2vx$', {
    get: function () {
      return HASH_SET_NAME;
    }
  });
  Object.defineProperty(package$internal, 'LINKED_HASH_MAP_NAME_8be2vx$', {
    get: function () {
      return LINKED_HASH_MAP_NAME;
    }
  });
  Object.defineProperty(package$internal, 'HASH_MAP_NAME_8be2vx$', {
    get: function () {
      return HASH_MAP_NAME;
    }
  });
  package$internal.ArrayClassDesc = ArrayClassDesc;
  package$internal.ArrayListClassDesc = ArrayListClassDesc;
  package$internal.NamedListClassDescriptor = NamedListClassDescriptor;
  package$internal.LinkedHashSetClassDesc = LinkedHashSetClassDesc;
  package$internal.HashSetClassDesc = HashSetClassDesc;
  package$internal.NamedMapClassDescriptor = NamedMapClassDescriptor;
  package$internal.LinkedHashMapClassDesc = LinkedHashMapClassDesc;
  package$internal.HashMapClassDesc = HashMapClassDesc;
  package$internal.AbstractCollectionSerializer = AbstractCollectionSerializer;
  package$internal.ListLikeSerializer = ListLikeSerializer;
  package$internal.MapLikeSerializer = MapLikeSerializer;
  package$internal.ReferenceArraySerializer = ReferenceArraySerializer;
  package$internal.ArrayListSerializer = ArrayListSerializer;
  package$internal.LinkedHashSetSerializer = LinkedHashSetSerializer;
  package$internal.HashSetSerializer = HashSetSerializer;
  package$internal.LinkedHashMapSerializer = LinkedHashMapSerializer;
  package$internal.HashMapSerializer = HashMapSerializer;
  package$internal.EnumDescriptor = EnumDescriptor;
  package$internal.CommonEnumSerializer = CommonEnumSerializer;
  package$internal.EnumSerializer = EnumSerializer;
  package$internal.GeneratedSerializer = GeneratedSerializer;
  Object.defineProperty(package$internal, 'LongAsStringSerializer', {
    get: LongAsStringSerializer_getInstance
  });
  package$internal.makeNullable_ewacr1$ = makeNullable;
  package$internal.NullableSerializer = NullableSerializer;
  package$internal.PrimitiveDescriptor = PrimitiveDescriptor;
  Object.defineProperty(package$internal, 'IntDescriptor', {
    get: IntDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'UnitDescriptor', {
    get: UnitDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'BooleanDescriptor', {
    get: BooleanDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'ByteDescriptor', {
    get: ByteDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'ShortDescriptor', {
    get: ShortDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'LongDescriptor', {
    get: LongDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'FloatDescriptor', {
    get: FloatDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'DoubleDescriptor', {
    get: DoubleDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'CharDescriptor', {
    get: CharDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'StringDescriptor', {
    get: StringDescriptor_getInstance
  });
  Object.defineProperty(package$internal, 'UnitSerializer', {
    get: UnitSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'BooleanSerializer', {
    get: BooleanSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'ByteSerializer', {
    get: ByteSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'ShortSerializer', {
    get: ShortSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'IntSerializer', {
    get: IntSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'LongSerializer', {
    get: LongSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'FloatSerializer', {
    get: FloatSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'DoubleSerializer', {
    get: DoubleSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'CharSerializer', {
    get: CharSerializer_getInstance
  });
  Object.defineProperty(package$internal, 'StringSerializer', {
    get: StringSerializer_getInstance
  });
  package$internal.defaultSerializer_1yb8b7$ = defaultSerializer;
  package$internal.MissingDescriptorException = MissingDescriptorException;
  package$internal.SerialClassDescImpl = SerialClassDescImpl;
  Object.defineProperty(package$internal, 'KEY_INDEX', {
    get: function () {
      return KEY_INDEX;
    }
  });
  Object.defineProperty(package$internal, 'VALUE_INDEX', {
    get: function () {
      return VALUE_INDEX;
    }
  });
  package$internal.KeyValueSerializer = KeyValueSerializer;
  package$internal.MapEntryUpdatingSerializer = MapEntryUpdatingSerializer;
  package$internal.MapEntrySerializer = MapEntrySerializer;
  package$internal.PairSerializer = PairSerializer;
  package$internal.MapEntry = MapEntry;
  Object.defineProperty(package$internal, 'MapEntryClassDesc', {
    get: MapEntryClassDesc_getInstance
  });
  Object.defineProperty(package$internal, 'PairClassDesc', {
    get: PairClassDesc_getInstance
  });
  Object.defineProperty(TripleSerializer, 'TripleDesc', {
    get: TripleSerializer$TripleDesc_getInstance
  });
  package$internal.TripleSerializer = TripleSerializer;
  package$internal.onlySingleOrNull_qzupvv$ = onlySingleOrNull;
  package$internal.readExactNBytes_lqpda3$ = readExactNBytes;
  package$internal.readToByteBuffer_lqpda3$ = readToByteBuffer;
  Object.defineProperty(package$internal, 'HexConverter', {
    get: HexConverter_getInstance
  });
  package$internal.getUnsignedByte_xvhwye$ = getUnsignedByte;
  package$internal.getUnsignedShort_xvhwye$ = getUnsignedShort;
  package$internal.getUnsignedInt_xvhwye$ = getUnsignedInt;
  Object.defineProperty(Json, 'Companion', {
    get: Json$Companion_getInstance
  });
  var package$json = package$serialization.json || (package$serialization.json = {});
  package$json.Json = Json;
  package$json.json_s5o6vg$ = json;
  package$json.jsonArray_mb52fq$ = jsonArray;
  package$json.JsonArrayBuilder = JsonArrayBuilder;
  package$json.JsonObjectBuilder = JsonObjectBuilder;
  package$json.JsonElement = JsonElement;
  package$json.JsonPrimitive = JsonPrimitive;
  package$json.JsonLiteral_init_3p81yu$ = JsonLiteral_init;
  package$json.JsonLiteral_init_6taknv$ = JsonLiteral_init_0;
  package$json.JsonLiteral_init_61zpoe$ = JsonLiteral_init_1;
  package$json.JsonLiteral = JsonLiteral;
  Object.defineProperty(package$json, 'JsonNull', {
    get: JsonNull_getInstance
  });
  package$json.unexpectedJson_puj7f4$ = unexpectedJson;
  package$json.JsonObject = JsonObject;
  package$json.JsonArray = JsonArray;
  package$json.JsonPrimitive_1v8dbw$ = JsonPrimitive_0;
  package$json.JsonPrimitive_rcaewn$ = JsonPrimitive_1;
  package$json.JsonPrimitive_pdl1vj$ = JsonPrimitive_2;
  package$json.get_int_u3sd3g$ = get_int;
  package$json.get_intOrNull_u3sd3g$ = get_intOrNull;
  package$json.get_long_u3sd3g$ = get_long;
  package$json.get_longOrNull_u3sd3g$ = get_longOrNull;
  package$json.get_double_u3sd3g$ = get_double;
  package$json.get_doubleOrNull_u3sd3g$ = get_doubleOrNull;
  package$json.get_float_u3sd3g$ = get_float;
  package$json.get_floatOrNull_u3sd3g$ = get_floatOrNull;
  package$json.get_boolean_u3sd3g$ = get_boolean;
  package$json.get_booleanOrNull_u3sd3g$ = get_booleanOrNull;
  package$json.get_content_u3sd3g$ = get_content;
  package$json.get_contentOrNull_u3sd3g$ = get_contentOrNull;
  package$json.JsonException = JsonException;
  package$json.JsonInvalidValueInStrictModeException_init_mx4ult$ = JsonInvalidValueInStrictModeException_init;
  package$json.JsonInvalidValueInStrictModeException_init_14dthe$ = JsonInvalidValueInStrictModeException_init_0;
  package$json.JsonInvalidValueInStrictModeException = JsonInvalidValueInStrictModeException;
  package$json.JsonUnknownKeyException = JsonUnknownKeyException;
  package$json.JsonParsingException = JsonParsingException;
  package$json.JsonElementTypeMismatchException = JsonElementTypeMismatchException;
  package$json.JsonInput = JsonInput;
  package$json.JsonOutput = JsonOutput;
  package$json.JsonTreeMapper = JsonTreeMapper;
  Object.defineProperty(JsonTreeParser, 'Companion', {
    get: JsonTreeParser$Companion_getInstance
  });
  package$json.JsonTreeParser = JsonTreeParser;
  var package$internal_0 = package$json.internal || (package$json.internal = {});
  Object.defineProperty(package$internal_0, 'JsonElementSerializer', {
    get: JsonElementSerializer_getInstance
  });
  Object.defineProperty(package$internal_0, 'JsonPrimitiveSerializer', {
    get: JsonPrimitiveSerializer_getInstance
  });
  Object.defineProperty(package$internal_0, 'JsonNullSerializer', {
    get: JsonNullSerializer_getInstance
  });
  Object.defineProperty(package$internal_0, 'JsonLiteralSerializer', {
    get: JsonLiteralSerializer_getInstance
  });
  Object.defineProperty(package$internal_0, 'JsonObjectSerializer', {
    get: JsonObjectSerializer_getInstance
  });
  Object.defineProperty(package$internal_0, 'JsonArraySerializer', {
    get: JsonArraySerializer_getInstance
  });
  package$internal_0.JsonParser = JsonParser;
  Object.defineProperty(package$internal_0, 'NULL_8be2vx$', {
    get: function () {
      return NULL;
    }
  });
  Object.defineProperty(package$internal_0, 'COMMA_8be2vx$', {
    get: function () {
      return COMMA;
    }
  });
  Object.defineProperty(package$internal_0, 'COLON_8be2vx$', {
    get: function () {
      return COLON;
    }
  });
  Object.defineProperty(package$internal_0, 'BEGIN_OBJ_8be2vx$', {
    get: function () {
      return BEGIN_OBJ;
    }
  });
  Object.defineProperty(package$internal_0, 'END_OBJ_8be2vx$', {
    get: function () {
      return END_OBJ;
    }
  });
  Object.defineProperty(package$internal_0, 'BEGIN_LIST_8be2vx$', {
    get: function () {
      return BEGIN_LIST;
    }
  });
  Object.defineProperty(package$internal_0, 'END_LIST_8be2vx$', {
    get: function () {
      return END_LIST;
    }
  });
  Object.defineProperty(package$internal_0, 'STRING_8be2vx$', {
    get: function () {
      return STRING;
    }
  });
  Object.defineProperty(package$internal_0, 'STRING_ESC_8be2vx$', {
    get: function () {
      return STRING_ESC;
    }
  });
  Object.defineProperty(package$internal_0, 'INVALID_8be2vx$', {
    get: function () {
      return INVALID;
    }
  });
  Object.defineProperty(package$internal_0, 'UNICODE_ESC_8be2vx$', {
    get: function () {
      return UNICODE_ESC;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_OTHER_8be2vx$', {
    get: function () {
      return TC_OTHER;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_STRING_8be2vx$', {
    get: function () {
      return TC_STRING;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_STRING_ESC_8be2vx$', {
    get: function () {
      return TC_STRING_ESC;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_WS_8be2vx$', {
    get: function () {
      return TC_WS;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_COMMA_8be2vx$', {
    get: function () {
      return TC_COMMA;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_COLON_8be2vx$', {
    get: function () {
      return TC_COLON;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_BEGIN_OBJ_8be2vx$', {
    get: function () {
      return TC_BEGIN_OBJ;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_END_OBJ_8be2vx$', {
    get: function () {
      return TC_END_OBJ;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_BEGIN_LIST_8be2vx$', {
    get: function () {
      return TC_BEGIN_LIST;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_END_LIST_8be2vx$', {
    get: function () {
      return TC_END_LIST;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_NULL_8be2vx$', {
    get: function () {
      return TC_NULL;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_INVALID_8be2vx$', {
    get: function () {
      return TC_INVALID;
    }
  });
  Object.defineProperty(package$internal_0, 'TC_EOF_8be2vx$', {
    get: function () {
      return TC_EOF;
    }
  });
  Object.defineProperty(package$internal_0, 'C2TC_8be2vx$', {
    get: function () {
      return C2TC;
    }
  });
  Object.defineProperty(package$internal_0, 'EscapeCharMappings', {
    get: EscapeCharMappings_getInstance
  });
  package$internal_0.charToTokenClass_8e8zqy$ = charToTokenClass;
  package$internal_0.escapeToChar_kcn2v3$ = escapeToChar;
  package$internal_0.fail_f0n09d$ = fail;
  package$internal_0.JsonReader = JsonReader;
  package$internal_0.require_wqn2ds$ = require_0;
  package$internal_0.StreamingJsonInput = StreamingJsonInput;
  StreamingJsonOutput.Composer = StreamingJsonOutput$Composer;
  package$internal_0.StreamingJsonOutput_init_ek5ogp$ = StreamingJsonOutput_init;
  package$internal_0.StreamingJsonOutput = StreamingJsonOutput;
  package$internal_0.printQuoted_jigvc$ = printQuoted;
  package$internal_0.toBooleanStrict_7efafi$ = toBooleanStrict;
  package$internal_0.toBooleanStrictOrNull_7efafi$ = toBooleanStrictOrNull;
  package$internal_0.shouldBeQuoted_y4putb$ = shouldBeQuoted;
  package$internal_0.readJson_ijhaef$ = readJson;
  package$internal_0.writeJson_4dixew$ = writeJson;
  Object.defineProperty(WriteMode, 'OBJ', {
    get: WriteMode$OBJ_getInstance
  });
  Object.defineProperty(WriteMode, 'LIST', {
    get: WriteMode$LIST_getInstance
  });
  Object.defineProperty(WriteMode, 'MAP', {
    get: WriteMode$MAP_getInstance
  });
  Object.defineProperty(WriteMode, 'POLY_OBJ', {
    get: WriteMode$POLY_OBJ_getInstance
  });
  package$internal_0.WriteMode = WriteMode;
  package$internal_0.switchMode_oelat8$ = switchMode;
  ProtoBuf.ProtobufWriter = ProtoBuf$ProtobufWriter;
  ProtoBuf.ObjectWriter = ProtoBuf$ObjectWriter;
  ProtoBuf.MapRepeatedWriter = ProtoBuf$MapRepeatedWriter;
  ProtoBuf.RepeatedWriter = ProtoBuf$RepeatedWriter;
  ProtoBuf.ProtobufEncoder = ProtoBuf$ProtobufEncoder;
  ProtoBuf.ProtobufDecoder = ProtoBuf$ProtobufDecoder;
  Object.defineProperty(ProtoBuf, 'Varint', {
    get: ProtoBuf$Varint_getInstance
  });
  Object.defineProperty(ProtoBuf, 'Companion', {
    get: ProtoBuf$Companion_getInstance
  });
  var package$protobuf = package$serialization.protobuf || (package$serialization.protobuf = {});
  package$protobuf.ProtoBuf = ProtoBuf;
  Object.defineProperty(ProtoNumberType, 'DEFAULT', {
    get: ProtoNumberType$DEFAULT_getInstance
  });
  Object.defineProperty(ProtoNumberType, 'SIGNED', {
    get: ProtoNumberType$SIGNED_getInstance
  });
  Object.defineProperty(ProtoNumberType, 'FIXED', {
    get: ProtoNumberType$FIXED_getInstance
  });
  package$protobuf.ProtoNumberType = ProtoNumberType;
  ProtoType.Impl = ProtoType$Impl;
  package$protobuf.ProtoType = ProtoType;
  package$protobuf.extractParameters_n0yjnr$ = extractParameters;
  package$protobuf.ProtobufDecodingException = ProtobufDecodingException;
  Object.defineProperty(ByteBuffer, 'Companion', {
    get: ByteBuffer$Companion_getInstance
  });
  package$io.ByteBuffer = ByteBuffer;
  package$io.IOException_init = IOException_init;
  package$io.IOException = IOException;
  Object.defineProperty(InputStream, 'Companion', {
    get: InputStream$Companion_getInstance
  });
  package$io.InputStream = InputStream;
  package$io.ByteArrayInputStream_init_fqrh44$ = ByteArrayInputStream_init;
  package$io.ByteArrayInputStream_init_mj6st8$ = ByteArrayInputStream_init_0;
  package$io.ByteArrayInputStream = ByteArrayInputStream;
  package$io.OutputStream = OutputStream;
  package$io.ByteArrayOutputStream_init = ByteArrayOutputStream_init;
  package$io.ByteArrayOutputStream_init_za3lpa$ = ByteArrayOutputStream_init_0;
  package$io.ByteArrayOutputStream = ByteArrayOutputStream;
  package$io.arraycopy_lwkm2r$ = arraycopy;
  package$io.Writer = Writer;
  package$io.PrintWriter = PrintWriter;
  package$io.StringWriter = StringWriter;
  package$io.Reader = Reader;
  package$io.StringReader = StringReader;
  Object.defineProperty(package$serialization, 'MAX_SAFE_INTEGER_8be2vx$', {
    get: function () {
      return MAX_SAFE_INTEGER;
    }
  });
  package$serialization.DynamicObjectParser = DynamicObjectParser;
  package$serialization.compiledSerializer_1yb8b7$ = compiledSerializer;
  package$serialization.toUtf8Bytes_pdl1vz$ = toUtf8Bytes;
  package$serialization.stringFromUtf8Bytes_fqrh44$ = stringFromUtf8Bytes;
  package$serialization.enumFromName_nim6t3$ = enumFromName;
  package$serialization.enumFromOrdinal_szifu5$ = enumFromOrdinal;
  package$serialization.enumClassName_49fzt8$ = enumClassName;
  package$serialization.enumMembers_49fzt8$ = enumMembers;
  package$serialization.toNativeArray_9mvb00$ = toNativeArray;
  Object.defineProperty(SerialClassDescImpl.prototype, 'isNullable', Object.getOwnPropertyDescriptor(SerialDescriptor.prototype, 'isNullable'));
  ContextSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  ElementValueEncoder.prototype.encodeSerializableValue_tf03ej$ = Encoder.prototype.encodeSerializableValue_tf03ej$;
  ElementValueEncoder.prototype.encodeNullableSerializableValue_f4686g$ = Encoder.prototype.encodeNullableSerializableValue_f4686g$;
  ElementValueEncoder.prototype.beginCollection_gly1x5$ = Encoder.prototype.beginCollection_gly1x5$;
  ElementValueEncoder.prototype.endStructure_qatsm0$ = CompositeEncoder.prototype.endStructure_qatsm0$;
  ElementValueEncoder.prototype.shouldEncodeElementDefault_3zr2iy$ = CompositeEncoder.prototype.shouldEncodeElementDefault_3zr2iy$;
  ElementValueDecoder.prototype.decodeSerializableValue_w63s0f$ = Decoder.prototype.decodeSerializableValue_w63s0f$;
  ElementValueDecoder.prototype.decodeNullableSerializableValue_aae3ea$ = Decoder.prototype.decodeNullableSerializableValue_aae3ea$;
  ElementValueDecoder.prototype.updateSerializableValue_19c8k5$ = Decoder.prototype.updateSerializableValue_19c8k5$;
  ElementValueDecoder.prototype.updateNullableSerializableValue_exmlbs$ = Decoder.prototype.updateNullableSerializableValue_exmlbs$;
  ElementValueDecoder.prototype.endStructure_qatsm0$ = CompositeDecoder.prototype.endStructure_qatsm0$;
  ElementValueDecoder.prototype.decodeCollectionSize_qatsm0$ = CompositeDecoder.prototype.decodeCollectionSize_qatsm0$;
  TaggedEncoder.prototype.encodeSerializableValue_tf03ej$ = Encoder.prototype.encodeSerializableValue_tf03ej$;
  TaggedEncoder.prototype.encodeNullableSerializableValue_f4686g$ = Encoder.prototype.encodeNullableSerializableValue_f4686g$;
  TaggedEncoder.prototype.beginCollection_gly1x5$ = Encoder.prototype.beginCollection_gly1x5$;
  TaggedEncoder.prototype.shouldEncodeElementDefault_3zr2iy$ = CompositeEncoder.prototype.shouldEncodeElementDefault_3zr2iy$;
  TaggedDecoder.prototype.decodeSerializableValue_w63s0f$ = Decoder.prototype.decodeSerializableValue_w63s0f$;
  TaggedDecoder.prototype.decodeNullableSerializableValue_aae3ea$ = Decoder.prototype.decodeNullableSerializableValue_aae3ea$;
  TaggedDecoder.prototype.updateSerializableValue_19c8k5$ = Decoder.prototype.updateSerializableValue_19c8k5$;
  TaggedDecoder.prototype.updateNullableSerializableValue_exmlbs$ = Decoder.prototype.updateNullableSerializableValue_exmlbs$;
  TaggedDecoder.prototype.endStructure_qatsm0$ = CompositeDecoder.prototype.endStructure_qatsm0$;
  TaggedDecoder.prototype.decodeCollectionSize_qatsm0$ = CompositeDecoder.prototype.decodeCollectionSize_qatsm0$;
  ListLikeDescriptor.prototype.getEntityAnnotations = SerialDescriptor.prototype.getEntityAnnotations;
  ListLikeDescriptor.prototype.getElementAnnotations_za3lpa$ = SerialDescriptor.prototype.getElementAnnotations_za3lpa$;
  Object.defineProperty(ListLikeDescriptor.prototype, 'isNullable', Object.getOwnPropertyDescriptor(SerialDescriptor.prototype, 'isNullable'));
  MapLikeDescriptor.prototype.getEntityAnnotations = SerialDescriptor.prototype.getEntityAnnotations;
  MapLikeDescriptor.prototype.getElementAnnotations_za3lpa$ = SerialDescriptor.prototype.getElementAnnotations_za3lpa$;
  Object.defineProperty(MapLikeDescriptor.prototype, 'isNullable', Object.getOwnPropertyDescriptor(SerialDescriptor.prototype, 'isNullable'));
  CommonEnumSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  GeneratedSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  LongAsStringSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  PrimitiveDescriptor.prototype.getEntityAnnotations = SerialDescriptor.prototype.getEntityAnnotations;
  PrimitiveDescriptor.prototype.getElementAnnotations_za3lpa$ = SerialDescriptor.prototype.getElementAnnotations_za3lpa$;
  Object.defineProperty(PrimitiveDescriptor.prototype, 'elementsCount', Object.getOwnPropertyDescriptor(SerialDescriptor.prototype, 'elementsCount'));
  Object.defineProperty(PrimitiveDescriptor.prototype, 'isNullable', Object.getOwnPropertyDescriptor(SerialDescriptor.prototype, 'isNullable'));
  UnitSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  BooleanSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  ByteSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  ShortSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  IntSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  LongSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  FloatSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  DoubleSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  CharSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  StringSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  KeyValueSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  TripleSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonInput.prototype.decodeSerializableValue_w63s0f$ = Decoder.prototype.decodeSerializableValue_w63s0f$;
  JsonInput.prototype.decodeNullableSerializableValue_aae3ea$ = Decoder.prototype.decodeNullableSerializableValue_aae3ea$;
  JsonInput.prototype.updateSerializableValue_19c8k5$ = Decoder.prototype.updateSerializableValue_19c8k5$;
  JsonInput.prototype.updateNullableSerializableValue_exmlbs$ = Decoder.prototype.updateNullableSerializableValue_exmlbs$;
  JsonInput.prototype.endStructure_qatsm0$ = CompositeDecoder.prototype.endStructure_qatsm0$;
  JsonInput.prototype.decodeCollectionSize_qatsm0$ = CompositeDecoder.prototype.decodeCollectionSize_qatsm0$;
  JsonOutput.prototype.encodeSerializableValue_tf03ej$ = Encoder.prototype.encodeSerializableValue_tf03ej$;
  JsonOutput.prototype.encodeNullableSerializableValue_f4686g$ = Encoder.prototype.encodeNullableSerializableValue_f4686g$;
  JsonOutput.prototype.beginCollection_gly1x5$ = Encoder.prototype.beginCollection_gly1x5$;
  JsonOutput.prototype.endStructure_qatsm0$ = CompositeEncoder.prototype.endStructure_qatsm0$;
  JsonOutput.prototype.shouldEncodeElementDefault_3zr2iy$ = CompositeEncoder.prototype.shouldEncodeElementDefault_3zr2iy$;
  JsonElementSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonPrimitiveSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonNullSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonLiteralSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonObjectSerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  JsonArraySerializer.prototype.patch_mynpiu$ = KSerializer.prototype.patch_mynpiu$;
  StreamingJsonInput.prototype.decodeSerializableValue_w63s0f$ = JsonInput.prototype.decodeSerializableValue_w63s0f$;
  StreamingJsonInput.prototype.decodeNullableSerializableValue_aae3ea$ = JsonInput.prototype.decodeNullableSerializableValue_aae3ea$;
  StreamingJsonInput.prototype.updateSerializableValue_19c8k5$ = JsonInput.prototype.updateSerializableValue_19c8k5$;
  StreamingJsonInput.prototype.updateNullableSerializableValue_exmlbs$ = JsonInput.prototype.updateNullableSerializableValue_exmlbs$;
  StreamingJsonInput.prototype.decodeCollectionSize_qatsm0$ = JsonInput.prototype.decodeCollectionSize_qatsm0$;
  StreamingJsonOutput.prototype.encodeSerializableValue_tf03ej$ = JsonOutput.prototype.encodeSerializableValue_tf03ej$;
  StreamingJsonOutput.prototype.encodeNullableSerializableValue_f4686g$ = JsonOutput.prototype.encodeNullableSerializableValue_f4686g$;
  StreamingJsonOutput.prototype.beginCollection_gly1x5$ = JsonOutput.prototype.beginCollection_gly1x5$;
  deprecationText = 'Obsolete name from the preview version of library.';
  ARRAY_NAME = 'kotlin.Array';
  ARRAY_LIST_NAME = 'kotlin.collections.ArrayList';
  LINKED_HASH_SET_NAME = 'kotlin.collections.LinkedHashSet';
  HASH_SET_NAME = 'kotlin.collections.HashSet';
  LINKED_HASH_MAP_NAME = 'kotlin.collections.LinkedHashMap';
  HASH_MAP_NAME = 'kotlin.collections.HashMap';
  KEY_INDEX = 0;
  VALUE_INDEX = 1;
  NULL = 'null';
  COMMA = 44;
  COLON = 58;
  BEGIN_OBJ = 123;
  END_OBJ = 125;
  BEGIN_LIST = 91;
  END_LIST = 93;
  STRING = 34;
  STRING_ESC = 92;
  INVALID = toChar(0);
  UNICODE_ESC = 117;
  TC_OTHER = 0;
  TC_STRING = 1;
  TC_STRING_ESC = 2;
  TC_WS = 3;
  TC_COMMA = 4;
  TC_COLON = 5;
  TC_BEGIN_OBJ = 6;
  TC_END_OBJ = 7;
  TC_BEGIN_LIST = 8;
  TC_END_LIST = 9;
  TC_NULL = 10;
  TC_INVALID = 11;
  TC_EOF = 12;
  CTC_MAX = 126;
  ESC2C_MAX = 117;
  var $receiver = new Int8Array(126);
  for (var i = 0; i <= 32; i++) {
    initC2TC($receiver, i, TC_INVALID);
  }
  initC2TC($receiver, 9, TC_WS);
  initC2TC($receiver, 10, TC_WS);
  initC2TC($receiver, 13, TC_WS);
  initC2TC($receiver, 32, TC_WS);
  initC2TC_0($receiver, COMMA, TC_COMMA);
  initC2TC_0($receiver, COLON, TC_COLON);
  initC2TC_0($receiver, BEGIN_OBJ, TC_BEGIN_OBJ);
  initC2TC_0($receiver, END_OBJ, TC_END_OBJ);
  initC2TC_0($receiver, BEGIN_LIST, TC_BEGIN_LIST);
  initC2TC_0($receiver, END_LIST, TC_END_LIST);
  initC2TC_0($receiver, STRING, TC_STRING);
  initC2TC_0($receiver, STRING_ESC, TC_STRING_ESC);
  C2TC = $receiver;
  var $receiver_0 = Kotlin.newArray(128, null);
  for (var c = 0; c <= 31; c++) {
    var c1 = toHexChar(c >> 12);
    var c2 = toHexChar(c >> 8);
    var c3 = toHexChar(c >> 4);
    var c4 = toHexChar(c);
    $receiver_0[c] = '\\' + 'u' + String.fromCharCode(c1) + String.fromCharCode(c2) + String.fromCharCode(c3) + String.fromCharCode(c4);
  }
  $receiver_0[34] = '\\"';
  $receiver_0[92] = '\\\\';
  $receiver_0[9] = '\\t';
  $receiver_0[8] = '\\b';
  $receiver_0[10] = '\\n';
  $receiver_0[13] = '\\r';
  $receiver_0[12] = '\\f';
  ESCAPE_CHARS = $receiver_0;
  MAX_SAFE_INTEGER = L9007199254740991.toNumber();
  Kotlin.defineModule('kotlinx-serialization-runtime-js', _);
  return _;
}));

//# sourceMappingURL=kotlinx-serialization-runtime-js.js.map
