import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  createGrapqlApi,
  createDatasourceFromSchema,
  createUserTable,
  createResourceName,
  GqlResolverLambdas,
  GqlSchemaDatasources,
  attachResolverFromSchema,
} from "../modules";
import { CfnGraphQLApi } from "aws-cdk-lib/aws-appsync";

const GRAPHQL_SCHEMA_PATH = "app/schema.graphql";

type BaseProps = StackProps;

type AppSyncStackProps = BaseProps & {
  resolverLambdas: GqlResolverLambdas;
};

export default class AppSyncStack extends Stack {
  public readonly gqlApi: CfnGraphQLApi;
  constructor(scope: Construct, id: string, props: AppSyncStackProps) {
    const { resolverLambdas, ...rest } = props;
    super(scope, id, rest);

    this.gqlApi = createGrapqlApi(this, {
      schemaPath: GRAPHQL_SCHEMA_PATH,
    });

    const userTalbe = createUserTable(this, {});
    const datasourceStackName = createResourceName(
      "GqlIntegrationAppSyncDatarsource"
    );
    const datasouceStack = new AppSyncDatarsourceStack(
      scope,
      datasourceStackName,
      { gqlApi: this.gqlApi, resolverLambdas }
    );
    const resolverStackName = createResourceName(
      "GqlIntegrationAppSyncResolver"
    );

    new AppSyncResolverStack(scope, resolverStackName, {
      gqlApi: this.gqlApi,
      gqlSchemaDatasources: datasouceStack.gqlSchemaDatasources,
    });
  }
}

type AppSyncDatarsourceProps = BaseProps & {
  gqlApi: CfnGraphQLApi;
  resolverLambdas: GqlResolverLambdas;
};

class AppSyncDatarsourceStack extends Stack {
  public readonly gqlSchemaDatasources: GqlSchemaDatasources;
  constructor(scope: Construct, id: string, props: AppSyncDatarsourceProps) {
    const { gqlApi, resolverLambdas, ...rest } = props;
    super(scope, id, rest);

    this.gqlSchemaDatasources = createDatasourceFromSchema(this, {
      gqlApi,
      gqlResolverLambdas: resolverLambdas,
    });
  }
}

type AppSyncResolverProps = BaseProps & {
  gqlApi: CfnGraphQLApi;
  gqlSchemaDatasources: GqlSchemaDatasources;
};

class AppSyncResolverStack extends Stack {
  constructor(scope: Construct, id: string, props: AppSyncResolverProps) {
    const { gqlApi, gqlSchemaDatasources, ...rest } = props;
    super(scope, id, rest);

    attachResolverFromSchema(this, {
      gqlApi,
      gqlSchemaDatasources,
    });
  }
}
