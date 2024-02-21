import { awscdk } from "projen";
const project = new awscdk.AwsCdkTypeScriptApp({
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
  cdkVersion: "2.127.0",
  defaultReleaseBranch: "main",
  name: "cdk-app",
  projenrcTs: true,
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
    },
  },
  deps: [
    "@middy/core@5.2.4",
    "@middy/input-output-logger@5.2.4",
    "@aws-sdk/client-transcribe@3.515.0",
    "cdk-nag@2.28.39",
  ] /* Runtime dependencies of this module. */,
  devDeps: ["@types/aws-lambda@8.10.133"] /* Build dependencies for this module. */,
  context: {
    "@aws-cdk/customresources:installLatestAwsSdkDefault": false,
  },
});
project.synth();
