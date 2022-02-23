#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import MainStack from "../lib/stacks";
import { createResourceName } from "../lib/modules";

const app = new cdk.App();

const mainStackName = createResourceName("GqlIntegrationMain");
new MainStack(app, mainStackName, {});
