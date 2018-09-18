using ShareDB.RichText;
using System;
using System.Collections.Generic;

namespace ShareDB
{
    public static class OTTypes
    {
        private static readonly Dictionary<string, IOTType> _types = new Dictionary<string, IOTType>();
        private static readonly Dictionary<Type, IOTType> _dataTypes = new Dictionary<Type, IOTType>();

        static OTTypes()
        {
            Register(new RichTextOTType());
        }

        public static void Register(IOTType type)
        {
            _types[type.Name] = type;
            _types[type.Uri.ToString()] = type;
            _dataTypes[type.DataType] = type;
        }

        public static bool TryGetType(string id, out IOTType type)
        {
            return _types.TryGetValue(id, out type);
        }

        public static bool TryGetType(Type dataType, out IOTType type)
        {
            return _dataTypes.TryGetValue(dataType, out type);
        }

        public static IOTType GetType(string id)
        {
            return _types[id];
        }

        public static IOTType GetType(Type dataType)
        {
            return _dataTypes[dataType];
        }
    }
}
