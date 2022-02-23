import { GqlSchemaDatasources } from "./datasource";
import { Stack } from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { CfnDataSource } from "aws-cdk-lib/aws-appsync";

export type AttachResolverProps = {
  graphqlApi: appsync.CfnGraphQLApi;
  gqlTypeName: string;
  gqlFieldName: string;
  datasource: CfnDataSource;
};

export function attachResolver(stack: Stack, props: AttachResolverProps) {
  const { graphqlApi, gqlTypeName, datasource, gqlFieldName } = props;

  const resolverName = `${gqlTypeName}${gqlFieldName}Resolver`;
  const resolver = new appsync.CfnResolver(stack, resolverName, {
    apiId: graphqlApi.attrApiId,
    typeName: gqlTypeName,
    fieldName: gqlFieldName,
    dataSourceName: datasource.name,
  });

  return resolver;
}

type AttachResolverFromSchemaProps = {
  gqlApi: appsync.CfnGraphQLApi;
  gqlSchemaDatasources: GqlSchemaDatasources;
};

export function attachResolverFromSchema(
  stack: Stack,
  props: AttachResolverFromSchemaProps
) {
  const { gqlApi, gqlSchemaDatasources } = props;

  Object.entries(gqlSchemaDatasources).forEach(([queryType, datasouces]) => {
    datasouces.forEach(({ datasource, fieldName }) => {
      attachResolver(stack, {
        datasource: datasource,
        gqlTypeName: queryType,
        gqlFieldName: fieldName,
        graphqlApi: gqlApi,
      });
    });
  });
}
