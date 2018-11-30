using System.Security.Cryptography;
using System.Text;

namespace SIL.XForge.Utils
{
    public static class Security
    {
        public static string GenerateKey()
        {
            char[] chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();
            byte[] data = new byte[1];
            using (var crypto = new RNGCryptoServiceProvider())
            {
                crypto.GetNonZeroBytes(data);
                data = new byte[16];
                crypto.GetNonZeroBytes(data);
            }
            var key = new StringBuilder(16);
            foreach (byte b in data)
            {
                key.Append(chars[b % (chars.Length)]);
            }
            return key.ToString();
        }
    }
}
