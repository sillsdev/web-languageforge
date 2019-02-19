using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using NUnit.Framework;

namespace SIL.XForge.Scripture.CodeGenerator.Tests
{
    class CodeGeneratorTests
    {
        [Test]
        public void ValidateTypeScript()
        {
            var excludedClassName = "ExcludedBaseClass";
            var excludedClassImportLoc = "faketypescriptmodulelocation";
            var excludedBaseClasses = new Dictionary<string, string>();
            var extraExcludedClassName = "ExtraExcludedBaseClass";
            excludedBaseClasses[excludedClassName] = excludedClassImportLoc;
            excludedBaseClasses[extraExcludedClassName] = null;
            var interfaces = new List<string> { "TestInterfaceClass", "TestInterfaceBaseClass" };
            var typeScriptFile = new MemoryStream();
            var jsonApiWriter = new MemoryStream();
            var runningFrom = Assembly.GetExecutingAssembly().Location;
            Console.WriteLine(runningFrom);
            CodeGeneratorApp.GenerateTypeScriptArtifactsFromCSharpType(typeof(TestClassResource), "SFProject.ts", excludedBaseClasses, interfaces,
                "../../../../../src/SIL.XForge.Scripture/CodeGenerator/Templates", typeScriptFile, jsonApiWriter, null);
            // Seek back to the beginning before reading into a string
            typeScriptFile.Position = 0;
            jsonApiWriter.Position = 0;
            using (var tsReader = new StreamReader(typeScriptFile))
            using (var jsonReader = new StreamReader(jsonApiWriter))
            {
                var tsFileContents = tsReader.ReadToEnd();
                var domainModelContents = jsonReader.ReadToEnd();
                // Validate the generated TypeScript
                // Check imports of handwritten base classes
                StringAssert.Contains($"import {{ {excludedClassName} }} from '{excludedClassImportLoc}';", tsFileContents, "generated import is missing.");
                StringAssert.DoesNotContain($"import {{extraExcludedClassName}}", tsFileContents, "No import should be generated if the path is null");
                // Check that classes were generated as expected
                StringAssert.Contains("export abstract class TestClassBase", tsFileContents, "TestClassBase should have been generated in TypeScript");
                StringAssert.Contains("export abstract class TestClassTwoBase", tsFileContents, "TestClassTwoBase should have been generated in TypeScript");
                // Check that the class we declared to be an interface in typescript actually is
                StringAssert.Contains("export interface TestInterfaceClass", tsFileContents, "The TestInterfaceClass was declared as an interface, and should have generated an interface");
                StringAssert.Contains("awesomeTestClassString", tsFileContents, "JsonProperty annotation should have generated customized TypeScript property name");
                StringAssert.Contains("TestClassTwoRef extends ExcludedBaseClassRef", tsFileContents, "Verify that generated Ref classes extend parent Ref classes");
                StringAssert.DoesNotContain("SFTestClassThree extends TestInterfaceClass", tsFileContents, "Verify that classes which we want to be typescript interfaces are used as interfaces");
                StringAssert.Contains("SFTestClassThreeBase implements TestInterfaceClass", tsFileContents, "Verify that classes which we want to be typescript interfaces are used as interfaces");
                StringAssert.DoesNotContain("TestInterfaceClassRef", tsFileContents, "No 'Ref' class or interface should be generated for an Interface");
                StringAssert.DoesNotContain("export class ExcludedBaseClass", tsFileContents, "The classes passed in as 'Hand Generated' should not be generated");
                StringAssert.DoesNotContain("export class TestInterfaceBaseClass", tsFileContents, "Interfaces that extend other interfaces should still be interfaces");
                // This regex will prove that classes which implement an interface declare members of the interface
                var regex = new Regex(".*export abstract class SFTestClassThreeBase implements TestInterfaceClass \\{(?<contentsBeforeMember>.*)InterfaceClassMember",
                    RegexOptions.IgnoreCase | RegexOptions.Singleline);
                var match = regex.Match(tsFileContents);
                Assert.IsTrue(match.Success, "No implementation of interface member was found");
                StringAssert.DoesNotContain("TYPE: string = 'testInterfaceClass'", tsFileContents, "Interfaces should not have a TYPE member generated");
                StringAssert.Contains("TYPE: string = 'testClassThree'", tsFileContents, "sf should have been dropped from the front and resource from the back.");
                StringAssert.Contains("TYPE: string = 'testClassTwo'", tsFileContents, "Resource should have dropped from testClassTwoResource in the TYPE string.");
                // Test that we don't have any classes between the one which needs the interface member and the place where we found the member
                StringAssert.DoesNotContain("export class", match.Groups["contentsBeforeMember"].Value, "The interface member should be found before the next class definition starts");
                // Verify that property references to resource classes are converted to ResourceRef
                StringAssert.Contains("?: TestClassTwoRef", tsFileContents, "Resource reference properties should be converted to ResourceRef types.");
                // Validate the generated domain model file
                StringAssert.Contains("TestClass", domainModelContents, "TestClass should be included in the generated domain model collection");
                StringAssert.Contains("TestClassRef", domainModelContents, "TestClassRef class should be included in the generated domain model collection");
                StringAssert.Contains("TestClassTwo", domainModelContents, "The classes passed in as 'Hand Generated' should not be generated");
                StringAssert.Contains("TestClassTwoRef", domainModelContents, "The classes passed in as 'Hand Generated' should not be generated");
                StringAssert.DoesNotContain("TestInterfaceClass", domainModelContents, "Interfaces should be left out of the domain model");
            }
        }
    }

    class TestClassResource
    {
        [Newtonsoft.Json.JsonProperty(PropertyName = "awesome-test-class-string")]
        public string TestClass_String { get; }
        public TestInterfaceClass TestClass_TestInterfaceClass { get; }
        public TestClassTwoResource TestClass_TestClassTwo { get; }
        public SFTestClassThreeResource TestClass_TestClassThree { get; }
    }

    class TestClassTwoResource : ExcludedBaseClass
    {
        public double TestClassTwo_Double { get; }
    }

    class SFTestClassThreeResource : TestInterfaceClass
    {
        public int TestClassThree_Int { get; }
    }

    internal class ExcludedBaseClass : ExtraExcludedBaseClass
    {

    }

    internal abstract class ExtraExcludedBaseClass
    {

    }

    /// <summary>
    /// A class in C# that we want to be an interface in TypeScript
    /// </summary>
    class TestInterfaceClass : TestInterfaceBaseClass
    {
        public string InterfaceClassMember { get; }
    }

    class TestInterfaceBaseClass
    {
    }
}
