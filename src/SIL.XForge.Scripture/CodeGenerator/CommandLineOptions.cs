using CommandLine;

namespace SIL.XForge.Scripture.CodeGenerator
{
    /// <summary>
    /// Command line options supported by the CodeGenerator
    /// </summary>
    class CommandLineOptions
    {
        /// <summary>
        /// Schema files used to generate the classes
        /// </summary>
        [Option('s', "schema", Required = false, HelpText = "Json-Schema output.")]
        public string Schema { get; set; }

        /// <summary>
        /// Output folder for typescript files
        /// </summary>
        [Option('t', "typescript", Required = true, HelpText = "Destination location for type script classes.")]
        public string Typescript { get; set; }

        /// <summary>
        /// Output folder for C# classes
        /// </summary>
        [Option('m', "model", Required = true, HelpText = "Fully qualified type name for C# class to generate TypeScript from")]
        public string Model { get; set; }

        /// <summary>
        /// File and full path to generate the json-api-service inclusion of TypeScript classes
        /// </summary>
        [Option('j', "jsonapi", Required = true, HelpText = "Fullpath and filename to generate file for json-api-service injection.")]
        public string JsonDomainModel { get; set; }

    }
}
