import { CosmosClient } from "@azure/cosmos";

const connectionString = process.env.COSMOS_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("COSMOS_CONNECTION_STRING environment variable is not set");
}

const client = new CosmosClient(connectionString);
const db = client.database(process.env.COSMOS_DB_NAME ?? "1on1db");

export const employeesContainer = db.container("employees");
export const meetingsContainer = db.container("meetings");
export const actionItemsContainer = db.container("actionItems");
