import { createResourceName } from ".";
import { Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { GqlResolverLambdas } from "./lambda";
import { CfnDataSource } from "aws-cdk-lib/aws-appsync";

type CreateLambdaResolverProps = {
  graphqlApi: appsync.CfnGraphQLApi;
  lambdaArn: string;
  gqlTypeName: string;
  gqlFieldName: string;
};

export function createDatasource(
  stack: Stack,
  props: CreateLambdaResolverProps
) {
  const { graphqlApi, lambdaArn, gqlTypeName, gqlFieldName } = props;
  const dataSourceName = `${gqlTypeName}${gqlFieldName}LambdaDatasource`;
  const role = createRole(stack);
  const dataSource = new appsync.CfnDataSource(stack, dataSourceName, {
    name: dataSourceName,
    apiId: graphqlApi.attrApiId,
    type: "AWS_LAMBDA",
    serviceRoleArn: role.roleArn,
    lambdaConfig: { lambdaFunctionArn: lambdaArn },
  });

  return dataSource;
}

const roleSingletonStore: { value: null | iam.Role } = {
  value: null,
};

function createRole(stack: Stack) {
  if (roleSingletonStore.value) return roleSingletonStore.value;
  const role = new iam.Role(stack, "AppSyncExecutionRole", {
    roleName: createResourceName("AppSyncExecutionRole"),
    assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
      iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess"),
    ],
  });

  const esPolicy = new iam.PolicyStatement();
  esPolicy.addAllResources();
  esPolicy.addActions("es:ESHttpPost", "es:ESHttpPut", "es:ESHttpDelete");
  role.addToPolicy(esPolicy);
  roleSingletonStore.value = role;
  return role;
}

export type CreateLambdaAndResolversFromSchemaProps = {
  gqlApi: appsync.CfnGraphQLApi;
  gqlResolverLambdas: GqlResolverLambdas;
};

export type GqlSchemaDatasources = {
  Query: {
    fieldName: string;
    datasource: CfnDataSource;
  }[];
  Mutation: {
    fieldName: string;
    datasource: CfnDataSource;
  }[];
  Subscription: {
    fieldName: string;
    datasource: CfnDataSource;
  }[];
};

export function createDatasourceFromSchema(
  stack: Stack,
  props: CreateLambdaAndResolversFromSchemaProps
) {
  const { gqlApi, gqlResolverLambdas } = props;
  const datasources: GqlSchemaDatasources = {
    Query: [],
    Mutation: [],
    Subscription: [],
  };
  Object.entries(gqlResolverLambdas).forEach(([queryType, lambdas]) => {
    lambdas.forEach(({ lambdaFunction, fieldName }) => {
      const datasource = createDatasource(stack, {
        lambdaArn: lambdaFunction.functionArn,
        gqlTypeName: queryType,
        gqlFieldName: fieldName,
        graphqlApi: gqlApi,
      });
      datasources[queryType as keyof GqlResolverLambdas].push({
        fieldName,
        datasource,
      });
    });
  });
  return datasources;
}
