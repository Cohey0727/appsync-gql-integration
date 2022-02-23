import { Stack } from "aws-cdk-lib";
import * as fs from "fs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { createLambda, createResourceName } from "../modules";

type CreateGrapqlApiProps = {
  schemaPath: string;
};

export function createGrapqlApi(stack: Stack, props: CreateGrapqlApiProps) {
  const { schemaPath } = props;
  const name = createResourceName("GraphQLApi");
  const lambdaAuthorizer = createLambda(stack, {
    functionName: "lambdaAuthorizer",
    filePath: "app/authorizer.ts",
  });
  const roleName = createResourceName("appsync-logs");
  const role = new iam.Role(stack, roleName, {
    roleName,
    assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
    managedPolicies: [
      { managedPolicyArn: "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess" },
    ],
  });
  const cfnGraphQLApi = new appsync.CfnGraphQLApi(stack, "CfnGraphQLApi", {
    name,
    authenticationType: "AWS_LAMBDA",
    lambdaAuthorizerConfig: {
      authorizerResultTtlInSeconds: 10,
      identityValidationExpression:
        "Bearer [A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$",
      authorizerUri: lambdaAuthorizer.functionArn,
    },
    logConfig: {
      cloudWatchLogsRoleArn: role.roleArn,
      excludeVerboseContent: false,
      fieldLogLevel: "ALL",
    },
    tags: [{ key: "name", value: name }],
  });
  const schema = fs.readFileSync(schemaPath, "utf8");
  const cfnGraphQLSchema = new appsync.CfnGraphQLSchema(
    stack,
    "CfnGraphQLSchema",
    {
      apiId: cfnGraphQLApi.attrApiId,
      definition: schema,
    }
  );
  return cfnGraphQLApi;
}
