import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";
const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function handler(event) {
  console.log(`sendMessage ${JSON.stringify(event)}`);

  const endpoint = process.env.ENDPOINT

  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

  // DynamoDBテーブルに保存する
  const result = await ddbDocClient
    .send(new ScanCommand({
      TableName: process.env.TABLE_NAME || "",
    }));
  
  for (const data of result.Items ?? []) {
    const params = {
      Data: "画像がアップロードされました",
      ConnectionId: data.connectionId,
    };

    try {
      const client = new ApiGatewayManagementApiClient({ 
        region: "ap-northeast-1",
        endpoint: endpoint,
      });
      const command = new PostToConnectionCommand(params);
      await client.send(command);
    } catch (err) {
      if (err.statusCode === 410) {
        console.log("Found stale connection, deleting " + data.connectionId);
        await client
          .delete({
            TableName: process.env.TABLE_NAME || "",
            Key: { [process.env.TABLE_KEY || ""]: data.connectionId },
          })
          .promise();
      } else {
        console.log("Failed to post. Error: " + JSON.stringify(err));
      }
    }
  }
}
