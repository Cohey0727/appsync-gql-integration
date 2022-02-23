import { Duration, Stack } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as fs from "fs";
import { buildSchema } from "graphql";
import { createResourceName } from "./common";
import env from "./env";

export type CreatLambdaProps = {
  functionName: string;
  filePath: string;
  environment?: { [key: string]: string };
};

export function createLambda(stack: Stack, props: CreatLambdaProps) {
  const { functionName, filePath, environment } = props;
  const resorceFunctionName = createResourceName(functionName);
  const nodejsFunction = new lambdaNode.NodejsFunction(stack, functionName, {
    functionName: resorceFunctionName,
    entry: filePath,
    runtime: lambda.Runtime.NODEJS_14_X,
    environment: {
      NAME: resorceFunctionName,
      BASE_NAME: functionName,
      REGION: stack.region,
      STACL_STAGE: env.stackStage,
      STACK_NAME: env.stackName,
      ...environment,
    },
    tracing: lambda.Tracing.ACTIVE,
    timeout: Duration.minutes(15),
  });
  return nodejsFunction;
}

export type GqlResolverLambdas = {
  Query: {
    fieldName: string;
    lambdaFunction: NodejsFunction;
  }[];
  Mutation: {
    fieldName: string;
    lambdaFunction: NodejsFunction;
  }[];
  Subscription: {
    fieldName: string;
    lambdaFunction: NodejsFunction;
  }[];
};

export type CreateLambdaResoversProps = {
  schemaPath: string;
  functionRootDir: string;
};

export function createLambdaFromGqlSchema(
  stack: Stack,
  props: CreateLambdaResoversProps
) {
  const { schemaPath, functionRootDir } = props;
  const schemaFile = fs.readFileSync(schemaPath, "utf8");
  const schema = buildSchema(schemaFile);
  const query = schema.getQueryType();
  const mutation = schema.getMutationType();
  const subscription = schema.getSubscriptionType();

  const schemaFields = {
    Query: Object.values(query?.getFields() || {}),
    Mutation: Object.values(mutation?.getFields() || {}),
    Subscription: Object.values(subscription?.getFields() || {}),
  };
  const lambdas: GqlResolverLambdas = {
    Query: [],
    Mutation: [],
    Subscription: [],
  };
  Object.entries(schemaFields).forEach(([queryType, fields]) => {
    fields.forEach((field: any) => {
      const functionName = `Resolver-${queryType}-${field.name}`;
      const fileDir = `${functionRootDir}/${queryType.toLocaleLowerCase()}`;
      const filePath = `${fileDir}/${field.name}.ts`;
      const lambdaFunction = createLambda(stack, { functionName, filePath });
      lambdas[queryType as keyof GqlResolverLambdas].push({
        fieldName: field.name,
        lambdaFunction,
      });
    });
  });
  return lambdas;
}
