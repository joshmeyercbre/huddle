import { CosmosClient, Container } from "@azure/cosmos";

let _client: CosmosClient | undefined;

function getClient(): CosmosClient {
  if (!_client) {
    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("COSMOS_CONNECTION_STRING environment variable is not set");
    }
    _client = new CosmosClient(connectionString);
  }
  return _client;
}

function getDb() {
  return getClient().database(process.env.COSMOS_DB_NAME ?? "huddledb");
}

export function getEmployeesContainer(): Container {
  return getDb().container("employees");
}

export function getMeetingsContainer(): Container {
  return getDb().container("meetings");
}

export function getActionItemsContainer(): Container {
  return getDb().container("actionItems");
}

// Proxy objects that delegate to the lazy getters so existing import syntax keeps working.
// Each property access goes through the getter, deferring CosmosClient construction to request time.
function makeContainerProxy(getContainer: () => Container): Container {
  return new Proxy({} as Container, {
    get(_target, prop) {
      const container = getContainer();
      const value = (container as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return value.bind(container);
      }
      return value;
    },
  });
}

export const employeesContainer = makeContainerProxy(getEmployeesContainer);
export const meetingsContainer = makeContainerProxy(getMeetingsContainer);
export const actionItemsContainer = makeContainerProxy(getActionItemsContainer);
