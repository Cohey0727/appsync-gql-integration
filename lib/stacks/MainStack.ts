import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { createResourceName } from "../modules";
import LambdaStack from "./LambdaStack";
import AppSyncStack from "./AppSyncStack";

const GRAPHQL_SCHEMA_PATH = "app/schema.graphql";

type BaseProps = StackProps;
type OwnProps = {};

type Props = BaseProps & OwnProps;

export default class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    const { ...rest } = props;
    super(scope, id, rest);
    const lambdaStackName = createResourceName("NomyLambda");
    const lambdaStack = new LambdaStack(scope, lambdaStackName, {});

    const appsyncStackName = createResourceName("NomyAppSycn");
    new AppSyncStack(scope, appsyncStackName, {
      resolverLambdas: lambdaStack.gqlReolverLambdas,
    });
  }
}
