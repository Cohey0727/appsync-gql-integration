import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { createLambdaFromGqlSchema, GqlResolverLambdas } from "../modules";

const LAMBDA_RESOLVER_ROOT_DIR = "app/resolvers";
const GRAPHQL_SCHEMA_PATH = "app/schema.graphql";

export default class LambdaStack extends Stack {
  readonly accountNumber: number;
  readonly gqlReolverLambdas: GqlResolverLambdas;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.accountNumber = 100;
    this.gqlReolverLambdas = createLambdaFromGqlSchema(this, {
      schemaPath: GRAPHQL_SCHEMA_PATH,
      functionRootDir: LAMBDA_RESOLVER_ROOT_DIR,
    });
  }
}
