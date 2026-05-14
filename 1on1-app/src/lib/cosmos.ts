import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
const db = client.database(process.env.COSMOS_DB_NAME ?? "1on1db");

export const employeesContainer = db.container("employees");
export const meetingsContainer = db.container("meetings");
export const actionItemsContainer = db.container("actionItems");
