import { createResourceName } from ".";
import { Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

type CreateUserTableProps = {};

export function createUserTable(stack: Stack, props: CreateUserTableProps) {
  const baseTableName = "UserProfile";
  const userTalbe = new dynamodb.Table(stack, baseTableName, {
    tableName: createResourceName(baseTableName),
    partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
  });
  return userTalbe;
}
