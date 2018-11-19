using CommandLine;
using System;
using System.Collections.Generic;
using System.IO;
using NJsonSchema;
using NJsonSchema.CodeGeneration.TypeScript;
using System.Reflection;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace SIL.XForge.Scripture.CodeGenerator
{
    public class CodeGeneratorApp
    {
        /// <summary>
        /// This variable represents any model objects that we want to write by hand in typescript.
        /// The dictionary contains the type name and the import location relative to the generated model
        /// These types will not be generated (and any parent types will also be skipped) and an import will be
        /// added to resolve the type in the generated file.
        /// </summary>
        private static readonly Dictionary<string, string> HandWrittenBaseClasses = new Dictionary<string, string>();

        /// <summary>
        /// This list contains any types which we want to be interfaces in the generated typescript.
        /// In the json-schema which we generate from the C# they are marked as abstract classes but we convert
        /// them to interfaces in a post processing step.
        /// </summary>
        private static readonly List<string> TypeScriptInterfaces;

        static CodeGeneratorApp()
        {
            HandWrittenBaseClasses["IdentifiableOfString"] = null;
            HandWrittenBaseClasses["Resource"] = null;
            HandWrittenBaseClasses["UserResource"] = "../../../xforge-common/models/user";
            HandWrittenBaseClasses["UserResourceRef"] = "../../../xforge-common/models/user";
            HandWrittenBaseClasses["TextResource"] = "./text";
            HandWrittenBaseClasses["TextResourceRef"] = "./text";
            HandWrittenBaseClasses["ProjectResource"] = "../../../xforge-common/models/ProjectResource";
            HandWrittenBaseClasses["ProjectResourceRef"] = "../../../xforge-common/models/ProjectResource";
            HandWrittenBaseClasses["ProjectUserResource"] = "../../../xforge-common/models/project-user";
            HandWrittenBaseClasses["ProjectUserResourceRef"] = "../../../xforge-common/models/project-user";
            HandWrittenBaseClasses["ProjectDataResource"] = "../../../xforge-common/models/project-data";
            HandWrittenBaseClasses["ProjectDataResourceRef"] = "../../../xforge-common/models/project-data";

            TypeScriptInterfaces = new List<string>
            {
                "CheckingConfig",
                "TaskConfig",
                "TranslateConfig",
                "InputSystem",
                "TranslateMetrics",
                "TranslateProjectUserConfig"
            };
        }
        public static void Main(string[] args)
        {
            Parser.Default.ParseArguments<CommandLineOptions>(args)
                   .WithParsed<CommandLineOptions>(o =>
                   {
                       GenerateTypescriptFiles(o.Schema, o.Typescript, o.Model, o.JsonDomainModel);
                   });
        }

        private static void GenerateTypescriptFiles(string schema, string typescript, string model, string jsonDomainModel)
        {
            if (!string.IsNullOrEmpty(schema) && !Directory.Exists(Path.GetDirectoryName(schema)))
            {
                Console.WriteLine($"Schema destination directory: {schema} not found.");
                return;
            }
            if (!Directory.Exists(Path.GetDirectoryName(typescript)))
            {
                Console.WriteLine($"Typescript destination directory {typescript} not found.");
                return;
            }
            if (!Directory.Exists(Path.GetDirectoryName(jsonDomainModel)))
            {
                Console.WriteLine($"Directory {Path.GetDirectoryName(jsonDomainModel)} for jsonapi file not found.");
                return;
            }

            // Load the schema from the type
            var modelAssembly = Assembly.Load("SIL.XForge.Scripture");
            var modelType = modelAssembly.GetType(model);
            if (modelType == null)
            {
                Console.WriteLine($"Could not load type {model}");
                return;
            }

            using (var typeScriptFileStream = File.Create(typescript))
            using (var domainModelFileStream = File.Create(jsonDomainModel))
            {
                GenerateTypeScriptArtifactsFromCSharpType(modelType, typescript, HandWrittenBaseClasses,
                    TypeScriptInterfaces, "../../../Templates", typeScriptFileStream, domainModelFileStream, schema);
            }
        }


        public static void GenerateTypeScriptArtifactsFromCSharpType(Type csharpType, string typeScriptFileName,
            Dictionary<string, string> handWrittenBaseClasses,
            List<string> interfaces,
            string templateDirectory, Stream typeScriptFile, Stream jsonDomainModel, string jsonSchemaFile)
        {
            if (!Directory.Exists(templateDirectory))
                throw new ArgumentException($"{Assembly.GetExecutingAssembly().Location} || {templateDirectory}");
            var sourceSchema = JsonSchema4.FromTypeAsync(csharpType).Result;
            #region Generate Typescript model objects

            var typescriptSettings = new TypeScriptGeneratorSettings
            {
                //Namespace = "SIL.XForge.Scripture.Models", Skipping namespace in the typescript for now
                ExcludedTypeNames = new List<string>(handWrittenBaseClasses.Keys).ToArray(),
                ExtensionCode = GenerateBaseClassImports(handWrittenBaseClasses),
                TemplateDirectory = templateDirectory,
                ConvertConstructorInterfaceData = false,
                // skip generating interfaces for the defined types
                GenerateConstructorInterface = false,
                MarkOptionalProperties = true
            };
            GenerateInterfacesInSchema(interfaces, sourceSchema);
            if (!string.IsNullOrEmpty(jsonSchemaFile))
            {
                File.WriteAllText(jsonSchemaFile, sourceSchema.ToJson());
            }
            var tsGenerator = new TypeScriptGenerator(sourceSchema, typescriptSettings);
            var tsContents = tsGenerator.GenerateFile();
            // Two pass clean-up to the generated code to make interfaces work
            foreach (var i in interfaces)
            {
                //Regex remove any places where we generated a ref that 'extends' an interface
                var refclassPattern = $"(class .*Ref)( extends {i}Ref)";
                tsContents = Regex.Replace(tsContents, refclassPattern, "$1");
                //Regex replace any classes which extend interfaces to implement them instead of extending
                var classPattern = $"(class .*)( extends {i})";
                tsContents = Regex.Replace(tsContents, classPattern, $"$1 implements {i}");
            }
            // Drop Resource out of all base class names
            tsContents = RenameResourceClasses(tsContents);
            var streamWriter = new StreamWriter(typeScriptFile);
            streamWriter.Write(tsContents);
            streamWriter.Flush();
            #endregion

            // Get all the types defined in the schema
            var definedTypes = new List<string>();
            foreach (var type in sourceSchema.Definitions)
            {
                if (!handWrittenBaseClasses.ContainsKey(type.Key) && !interfaces.Contains(type.Key) && !type.Value.IsEnumeration)
                {
                    definedTypes.Add(RenameResourceClasses(type.Key));
                }
            }
            // Add the starting type from the schema
            definedTypes.Add(RenameResourceClasses(sourceSchema.Title));
            var nonRefTypes = new List<string>(handWrittenBaseClasses.Keys);
            nonRefTypes.AddRange(interfaces);
            // Get all the types defined in the schema
            GenerateJsonModelIncludeFile(csharpType.FullName, typeScriptFileName, definedTypes, jsonDomainModel);
        }

        private static string RenameResourceClasses(string tsContents)
        {
            foreach (var baseClassName in HandWrittenBaseClasses.Keys)
            {
                tsContents = Regex.Replace(tsContents, baseClassName,
                    baseClassName.Substring(0, baseClassName.Length - "Resource".Length));
            }

            return tsContents;
        }

        private static void GenerateInterfacesInSchema(List<string> interfaces, JsonSchema4 sourceSchema)
        {
            var interfaceSchemas = new List<JsonSchema4>();
            foreach (var jsonType in sourceSchema.Definitions)
            {
                // Mark types which we want to be TypeScript interfaces by appending to the description
                if (interfaces.Contains(jsonType.Key))
                {
                    interfaceSchemas.Add(jsonType.Value);
                    //jsonType.Value.ActualTypeSchema.Description =
                    //    $"{jsonType.Value.ActualTypeSchema.Description}{Environment.NewLine}--- Generated Interface";
                    jsonType.Value.Description =
                        $"{jsonType.Value.ActualTypeSchema.Description}{Environment.NewLine}--- Generated Interface";
                }
            }

            // implement interface members in classes
            foreach (var jsonType in sourceSchema.Definitions)
            {
                if (jsonType.Value.AllOf.Any())
                {
                    foreach (var contentPortion in jsonType.Value.AllOf)
                    {
                        if (contentPortion.ActualProperties.Any())
                            continue;
                        if (contentPortion.HasReference && interfaceSchemas.Contains(contentPortion.Reference))
                        {
                            foreach (var interfaceProp in contentPortion.Reference.ActualProperties)
                            {
                                jsonType.Value.Properties[interfaceProp.Key] = interfaceProp.Value;
                            }
                        }
                    }
                }
            }
        }

        private static string GenerateBaseClassImports(Dictionary<string, string> handWrittenBaseClasses)
        {
            // Exclude any handwritten classes where the import is set to null
            var importLines = handWrittenBaseClasses.Where(t => t.Value != null).Select(type => $"import {{{type.Key}}} from '{type.Value}';");
            return string.Join(Environment.NewLine, importLines);
        }

        /// <summary>
        /// Handmade file template for generating the model-config file based off the desired types
        /// </summary>
        /// <param name="schema"></param>
        /// <param name="typeScriptFileName"></param>
        /// <param name="importTypes"></param>
        /// <param name="domainModelFile"></param>
        private static void GenerateJsonModelIncludeFile(string schema, string typeScriptFileName, List<string> importTypes, Stream domainModelFile)
        {
            #region Generate domain model typescript file
            var classComment = $"// ----------------------{Environment.NewLine}" +
                               $"// <auto-generated>{Environment.NewLine}" +
                               $"//    Generated using {Assembly.GetExecutingAssembly().FullName} from {schema}{Environment.NewLine}" +
                               $"// </auto-generated>{Environment.NewLine}" +
                               $"// ----------------------{Environment.NewLine}" +
                               $"{Environment.NewLine}";
            var imports = "import { DomainModelConfig } from '@xforge-common/models/domain-model';" + Environment.NewLine;
            imports += "import { ";
            imports += string.Join(", ", from type in importTypes select $"{type}, {type}Ref");
            imports += $" }} from './{Path.GetFileName(typeScriptFileName.Substring(0, typeScriptFileName.Length - 3))}';{Environment.NewLine}";
            imports += $"import {{ TextData }} from './text-data';{Environment.NewLine}";

            var config = $"export const SFDOMAIN_MODEL_CONFIG: DomainModelConfig = {{{Environment.NewLine}"
                       + $" resources: [ {string.Join($",{Environment.NewLine}\t\t", importTypes.ToArray())} ],{Environment.NewLine}"
                       + $" resourceRefs: [ {string.Join($",{Environment.NewLine}\t\t", (from t in importTypes select t + "Ref").ToArray())} ],{Environment.NewLine}"
                       + " realtimeDocs: [ TextData ]" // TODO: Generate?
                       + "};";
            var fileContents = $"{classComment}{Environment.NewLine}" +
                               $"{imports}{Environment.NewLine}" +
                               $"// All resource, resource ref, and realtime doc types should be added to schema and generated into this config{Environment.NewLine}" +
                               $"{config}{Environment.NewLine}";

            var streamWriter = new StreamWriter(domainModelFile);
            streamWriter.Write(fileContents);
            streamWriter.Flush();
            #endregion
        }
    }
}
